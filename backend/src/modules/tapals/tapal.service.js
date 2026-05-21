import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Tapal } from './tapal.model.js';
import { Trip } from '../trips/trip.model.js';
import { User } from '../users/user.model.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { Harvest } from '../harvests/harvest.model.js';
import { Product } from '../products/product.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { flowGuard } from '../../services/flowGuard.service.js';
import { mapsService } from '../../services/maps.service.js';
import { notificationService } from '../notifications/notification.service.js';
import { Farmer } from '../farmers/farmer.model.js';


class TapalService extends BaseService {
  constructor() {
    super(Tapal);
  }

  /**
   * Search and filter Tapals
   */
  async findTapalsWithFilters(queryParams) {
    const { page = 1, limit = 10, search, type, status } = queryParams;
    const filter = {};

    if (type) filter.type = type;
    if (status) filter.status = status;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { tapalNumber: searchRegex },
        { partyName: searchRegex },
        { driver: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit }, 'harvestId');
  }

  /**
   * Safe Transaction: Assigns a Driver & Vehicle to a Tapal, spawning a Trip
   */
  async assignDriver(tapalId, driverId, vehicleId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Validate Tapal
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);

      // Accept fresh tapals and harvest-linked assignments (ASSIGNED / CONFIRMED)
      const assignableStatuses = ['CREATED', 'ASSIGNED', 'CONFIRMED'];
      if (!assignableStatuses.includes(tapal.status)) {
        throw new AppError(`Driver assignment blocked: Tapal status is '${tapal.status}'. Must be CREATED or CONFIRMED.`, 400);
      }

      // 2. Validate Driver — driverId may be User._id or DriverProfile._id
      let driver = await User.findOne({ _id: driverId, role: 'DRIVER' }).session(session);
      if (!driver) {
        // Fallback: driverId might be DriverProfile._id — resolve via import
        const { DriverProfile } = await import('../drivers/driverProfile.model.js');
        const profile = await DriverProfile.findById(driverId).populate('userId').session(session);
        if (profile?.userId) driver = profile.userId;
      }
      if (!driver) throw new AppError('Driver not found or invalid role', 404);
      if (!driver.isActive) throw new AppError('Driver is currently inactive', 400);

      // 3. Validate Vehicle (Optional for seeded drivers without vehicles)
      let vehicle = null;
      if (vehicleId) {
        vehicle = await Vehicle.findById(vehicleId).session(session);
        if (!vehicle) throw new AppError('Vehicle not found', 404);
        if (vehicle.status !== 'AVAILABLE') {
          throw new AppError(`Vehicle is not available. Status: ${vehicle.status}`, 400);
        }
      }

      // 4. Resolve pickup/delivery locations
      let pickupLocation = 'WAREHOUSE';
      let deliveryLocation = 'BUYER';

      if (tapal.type === 'Purchase' && tapal.harvestId) {
        const harvest = await Harvest.findById(tapal.harvestId).session(session);
        if (harvest) {
          pickupLocation = harvest.pickupLocation;
        }
      }

      if (tapal.type === 'Sale') {
        deliveryLocation = tapal.unloadingPoint || tapal.destination || 'BUYER SITE';
      }

      if (tapal.pickupLocation) pickupLocation = tapal.pickupLocation;

      // 5. Spawn the Trip document
      const trip = new Trip({
        tapalId: tapal._id,
        driverId: driver._id,
        vehicleId: vehicle ? vehicle._id : null,
        status: 'ASSIGNED',
        pickupLocation,
        deliveryLocation,
        expectedQty: tapal.numericQty,
        timeline: [{ status: 'ASSIGNED', timestamp: new Date() }]
      });

      await trip.save({ session });

      // 6. Update Tapal
      tapal.status = 'DRIVER_ASSIGNED';
      tapal.driver = driver.fullName;
      tapal.driverId = driver._id;
      tapal.driverPhone = driver.phone || null;
      tapal.vehicleNumber = vehicle ? vehicle.vehicleNumber : null;
      await tapal.save({ session });

      // 7. Update Vehicle Status
      if (vehicle) {
        vehicle.status = 'ON_TRIP';
        await vehicle.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      const tripPayload = {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'ASSIGNED',
        driverName: driver.fullName,
        tapalNumber: tapal.tapalNumber
      };
      broadcastEvent('trip:status_change', tripPayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', tripPayload, 'role:BUYER');

      // 8. Emit explicitly to the specific driver's room
      broadcastEvent('trip:new_assignment', {
        tapalId: tapal._id,
        tapalNumber: tapal.tapalNumber,
        type: tapal.type,
        partyName: tapal.partyName,
        qty: tapal.qty,
        amount: tapal.amount,
        pickupLocation,
        deliveryLocation,
        products: tapal.products,
        assignedAt: new Date()
      }, `user:${driver._id}`);

      logger.info(`[Logistics Engine]: Driver ${driver.fullName} assigned to Tapal ${tapal.tapalNumber}. Trip ${trip.tripNumber} spawned.`);

      if (driver.phone) {
        notificationService
          .sendDriverTripAssigned({
            phone: driver.phone,
            vehicleNo: vehicle?.vehicleNumber || tapal.vehicleNumber,
            pickupAddr: pickupLocation,
            tapalNo: tapal.tapalNumber
          })
          .catch((e) => logger.warn(`[Notify] Driver SMS failed: ${e.message}`));
      }

      mapsService
        .resolveRoutePoints(pickupLocation, deliveryLocation)
        .then(async (route) => {
          if (route.pickup?.lat != null) {
            trip.pickupCoords = { lat: route.pickup.lat, lng: route.pickup.lng };
          }
          if (route.delivery?.lat != null) {
            trip.deliveryCoords = { lat: route.delivery.lat, lng: route.delivery.lng };
          }
          await trip.save();
        })
        .catch((e) => logger.warn(`[Maps] Route geocode skipped: ${e.message}`));

      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Driver accepts an assigned trip
   */
  async acceptTrip(tapalId, driverId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'DRIVER_ASSIGNED') {
        throw new AppError('Trip cannot be accepted. Driver has not been assigned.', 400);
      }

      if (tapal.driverId.toString() !== driverId.toString()) {
        throw new AppError('Access Denied: You are not the assigned driver for this trip', 403);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      if (!trip) throw new AppError('Trip registry not found', 404);

      trip.status = 'ACCEPTED';
      trip.timeline.push({ status: 'ACCEPTED', timestamp: new Date() });
      await trip.save({ session });

      tapal.status = 'DRIVER_ACCEPTED';
      await tapal.save({ session });

      await session.commitTransaction();
      session.endSession();

      const payload = {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'ACCEPTED',
        driverName: tapal.driver
      };
      broadcastEvent('trip:status_change', payload, 'dashboard:updates');
      broadcastEvent('trip:status_change', payload, 'buyer:updates');

      logger.info(`[Driver Flow]: Trip ${trip.tripNumber} accepted by driver.`);
      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Drivers flags Trip start
   */
  async startTrip(tapalId, driverId) {
    await flowGuard.assertTapalReadyForTripStart(tapalId, driverId);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);

      if (tapal.driverId.toString() !== driverId.toString()) {
        throw new AppError('Access Denied: You are not the assigned driver for this trip', 403);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      if (!trip) throw new AppError('Trip registry not found', 404);

      // Transition States
      trip.status = 'STARTED';
      trip.timeline.push({ status: 'STARTED', timestamp: new Date() });
      await trip.save({ session });

      tapal.status = 'TRIP_STARTED';
      await tapal.save({ session });

      await session.commitTransaction();
      session.endSession();

      const startPayload = { tripId: trip._id, tripNumber: trip.tripNumber, status: 'STARTED' };
      broadcastEvent('trip:status_change', startPayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', startPayload, 'role:BUYER');

      logger.info(`[Driver Flow]: Trip ${trip.tripNumber} has started.`);
      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Driver logs cargo pickup
   */
  async pickupCargo(tapalId, driverId, actualPickupQty) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'TRIP_STARTED') {
        throw new AppError('Pickup blocked: Trip must be in STARTED state', 400);
      }

      if (tapal.driverId.toString() !== driverId.toString()) {
        throw new AppError('Access Denied: You are not the assigned driver', 403);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      if (!trip) throw new AppError('Trip registry not found', 404);

      // Update pickup metrics
      trip.status = 'PICKED';
      trip.actualPickupQty = actualPickupQty;
      trip.timeline.push({ status: 'PICKED', timestamp: new Date() });
      await trip.save({ session });

      tapal.status = 'IN_TRANSIT';
      await tapal.save({ session });

      await session.commitTransaction();
      session.endSession();

      const pickupPayload = { tripId: trip._id, tripNumber: trip.tripNumber, status: 'PICKED', actualPickupQty };
      broadcastEvent('trip:status_change', pickupPayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', pickupPayload, 'buyer:updates');

      logger.info(`[Driver Flow]: Cargo picked up for trip ${trip.tripNumber}. Qty: ${actualPickupQty} KG.`);
      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Driver logs delivery with Proof of Delivery and Signature Url
   */
  async deliverCargo(tapalId, driverId, actualDeliveredQty, proofPhotoUrl, signatureUrl) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'PICKED_UP' && tapal.status !== 'IN_TRANSIT') {
        throw new AppError('Delivery blocked: Cargo must be PICKED_UP first', 400);
      }

      if (tapal.driverId.toString() !== driverId.toString()) {
        throw new AppError('Access Denied: You are not the assigned driver', 403);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      if (!trip) throw new AppError('Trip registry not found', 404);

      // Update delivery proof and actual delivered qty
      trip.status = 'DELIVERED';
      trip.actualDeliveredQty = actualDeliveredQty;
      trip.proofPhotoUrl = proofPhotoUrl || null;
      trip.signatureUrl = signatureUrl || null;
      trip.timeline.push({ status: 'DELIVERED', timestamp: new Date() });
      await trip.save({ session });

      tapal.status = 'DELIVERED';
      await tapal.save({ session });

      await session.commitTransaction();
      session.endSession();

      const deliverPayload = { tripId: trip._id, tripNumber: trip.tripNumber, status: 'DELIVERED', actualDeliveredQty };
      broadcastEvent('trip:status_change', deliverPayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', deliverPayload, 'buyer:updates');

      logger.info(`[Driver Flow]: Cargo delivered for trip ${trip.tripNumber}. Actual weight: ${actualDeliveredQty} KG.`);

      const notifyPhone = tapal.buyerPhone || tapal.consigneeContact;
      if (notifyPhone) {
        notificationService
          .sendBuyerDeliveryReady({
            phone: notifyPhone,
            tapalNo: tapal.tapalNumber,
            qty: `${actualDeliveredQty} KG`
          })
          .catch((e) => logger.warn(`[Notify] Buyer alert failed: ${e.message}`));
      }

      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Admin/Accountant closes trip, triggers automatic stock adjustments
   */
  async endTrip(tapalId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'DELIVERED') {
        throw new AppError('Closure blocked: Trip must be in DELIVERED state', 400);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      if (!trip) throw new AppError('Trip registry not found', 404);

      // Calculate quantity scaling ratio for inventory items
      const deliveredQty = trip.actualDeliveredQty || trip.expectedQty;
      const expectedTotalQty = trip.expectedQty;
      const scaleRatio = expectedTotalQty > 0 ? deliveredQty / expectedTotalQty : 1;

      // Inventory update removed from endTrip. 
      // Stock movements are handled by the Billing module (createInvoice) to ensure single deduction and proper ledger logging.

      // Close the Trip
      trip.status = 'CLOSED';
      trip.timeline.push({ status: 'CLOSED', timestamp: new Date() });
      await trip.save({ session });

      // Lock Tapal into Bill Pending State
      tapal.status = 'BILL_PENDING';
      tapal.qty = `${deliveredQty} KG`; // Finalize displaying weight with delivered value
      tapal.numericQty = deliveredQty;
      await tapal.save({ session });

      // Update Harvest State to COMPLETED if linked
      if (tapal.harvestId) {
        await Harvest.findByIdAndUpdate(tapal.harvestId, { status: 'COMPLETED' }, { session });
      }

      // Release Vehicle back to available fleet
      const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
      if (vehicle) {
        vehicle.status = 'AVAILABLE';
        await vehicle.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      const closePayload = { tripId: trip._id, tripNumber: trip.tripNumber, status: 'CLOSED' };
      broadcastEvent('trip:status_change', closePayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', closePayload, 'buyer:updates');

      logger.info(`[Logistics Engine]: Trip ${trip.tripNumber} closed. Inventory adjusted. Tapal status shifted to BILL_PENDING.`);
      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Driver log fuel/toll receipts
   */
  async logExpense(tripId, driverId, expenseData) {
    const trip = await Trip.findById(tripId);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.driverId.toString() !== driverId.toString()) {
      throw new AppError('Access Denied: You are not the assigned driver', 403);
    }

    if (trip.status === 'CLOSED') {
      throw new AppError('Logging Blocked: This trip has already been closed and audited', 400);
    }

    trip.expenses.push(expenseData);
    await trip.save();

    logger.info(`[Driver Flow]: Logged ${expenseData.expenseType} expense of ₹${expenseData.amount} on Trip ${trip.tripNumber}`);
    return trip;
  }

  /**
   * Driver submits detailed post-trip expenses form
   */
  async submitPostTripExpense(tripId, driverId, data) {
    const query = mongoose.Types.ObjectId.isValid(tripId)
      ? { $or: [{ _id: tripId }, { tapalId: tripId }] }
      : { tripNumber: tripId };

    const trip = await Trip.findOne(query);
    if (!trip) throw new AppError('Trip not found', 404);

    if (trip.driverId.toString() !== driverId.toString()) {
      throw new AppError('Access Denied: You are not the assigned driver', 403);
    }

    // Map rich fields to standard expenses array
    const mappedExpenses = [];
    if (parseFloat(data.driverBatta) > 0) {
      mappedExpenses.push({
        expenseType: 'FOOD',
        amount: parseFloat(data.driverBatta),
        remarks: 'Post-Trip: Driver Batta',
        status: 'PENDING'
      });
    }
    if (parseFloat(data.rtoPcRmc) > 0) {
      mappedExpenses.push({
        expenseType: 'OTHER',
        amount: parseFloat(data.rtoPcRmc),
        remarks: 'Post-Trip: RTO / PC / RMC',
        status: 'PENDING'
      });
    }
    if (parseFloat(data.maintenance) > 0) {
      mappedExpenses.push({
        expenseType: 'REPAIR',
        amount: parseFloat(data.maintenance),
        remarks: 'Post-Trip: Maintenance',
        status: 'PENDING'
      });
    }
    if (parseFloat(data.tollFastag) > 0) {
      mappedExpenses.push({
        expenseType: 'TOLL',
        amount: parseFloat(data.tollFastag),
        remarks: 'Post-Trip: Toll / Fastag',
        status: 'PENDING'
      });
    }
    if (parseFloat(data.halting) > 0) {
      mappedExpenses.push({
        expenseType: 'OTHER',
        amount: parseFloat(data.halting),
        remarks: 'Post-Trip: Halting',
        status: 'PENDING'
      });
    }
    if (parseFloat(data.diesel) > 0) {
      mappedExpenses.push({
        expenseType: 'FUEL',
        amount: parseFloat(data.diesel),
        remarks: 'Post-Trip: Diesel',
        status: 'PENDING'
      });
    }

    if (Array.isArray(data.pumps)) {
      for (const pump of data.pumps) {
        if (parseFloat(pump.amount) > 0) {
          mappedExpenses.push({
            expenseType: 'FUEL',
            amount: parseFloat(pump.amount),
            remarks: `Post-Trip Pump: ${pump.name} (${pump.litres}L)`,
            status: 'PENDING'
          });
        }
      }
    }

    // Add mapped expenses to trip's expenses list
    trip.expenses = mappedExpenses;

    // Save the detailed post-trip schema
    trip.postTripExpenses = {
      tripStartDate: data.tripStartDate,
      tripEndDate: data.tripEndDate,
      vehicleNumber: data.vehicleNumber,
      driverName: data.driverName,
      loadingPoint: data.loadingPoint,
      unloadingPoint: data.unloadingPoint,
      tapalNo: data.tapalNo,
      driverBatta: parseFloat(data.driverBatta) || 0,
      rtoPcRmc: parseFloat(data.rtoPcRmc) || 0,
      maintenance: parseFloat(data.maintenance) || 0,
      tollFastag: parseFloat(data.tollFastag) || 0,
      halting: parseFloat(data.halting) || 0,
      startingKms: parseFloat(data.startingKms) || 0,
      endingKms: parseFloat(data.endingKms) || 0,
      totalKms: parseFloat(data.totalKms) || 0,
      diesel: parseFloat(data.diesel) || 0,
      mileage: parseFloat(data.mileage) || 0,
      lessAdvance: parseFloat(data.lessAdvance) || 0,
      remarks: data.remarks || '',
      pumps: (data.pumps || []).map(p => ({
        name: p.name,
        litres: parseFloat(p.litres) || 0,
        amount: parseFloat(p.amount) || 0
      })),
      totalExpenses: parseFloat(data.totalExpenses) || 0,
      pumpTotal: parseFloat(data.pumpTotal) || 0,
      balancePayable: parseFloat(data.balancePayable) || 0,
      status: 'PENDING'
    };

    await trip.save();

    // Create matching consolidated Expense document so it appears in claims panel
    const ExpenseModel = mongoose.model('Expense');
    // Clean old ones if any
    await ExpenseModel.deleteMany({ linkedTripId: trip._id, remarks: { $regex: /Post-Trip/ } });

    const newExpense = new ExpenseModel({
      expenseType: 'OTHER',
      amount: parseFloat(data.balancePayable) || parseFloat(data.totalExpenses) || 0.01,
      status: 'PENDING',
      payee: data.driverName || 'Driver',
      linkedTripId: trip._id,
      createdBy: driverId,
      remarks: `Post-Trip Settlement for Trip ${trip.tripNumber}`
    });
    await newExpense.save();

    broadcastEvent('expense:new', {
      expenseId: newExpense._id,
      amount: newExpense.amount,
      tripNumber: trip.tripNumber,
      driverName: data.driverName
    }, 'dashboard:updates');

    logger.info(`[Driver Flow]: Rich post-trip expenses logged for Trip ${trip.tripNumber} with matching Expense entry.`);
    return trip;
  }

  /**
   * Admin/Accountant reviews post-trip expenses
   */
  async reviewPostTripExpense(tripId, reviewerId, status, rejectionReason = '') {
    const query = mongoose.Types.ObjectId.isValid(tripId)
      ? { $or: [{ _id: tripId }, { tapalId: tripId }] }
      : { tripNumber: tripId };

    const trip = await Trip.findOne(query);
    if (!trip) throw new AppError('Trip not found', 404);

    if (!trip.postTripExpenses) {
      throw new AppError('No post-trip expenses found on this trip', 400);
    }

    const upperStatus = status.toUpperCase(); // APPROVED or REJECTED
    trip.postTripExpenses.status = upperStatus;
    trip.postTripExpenses.reviewedBy = reviewerId;
    trip.postTripExpenses.reviewedAt = new Date();
    if (upperStatus === 'REJECTED') {
      trip.postTripExpenses.rejectionReason = rejectionReason;
    }

    // Update individual nested expenses status
    for (const exp of trip.expenses) {
      exp.status = upperStatus;
    }

    if (upperStatus === 'APPROVED' && trip.status === 'DELIVERED') {
      trip.status = 'CLOSED';
      trip.timeline.push({ status: 'CLOSED', timestamp: new Date() });

      // Lock Tapal into Bill Pending State
      const TapalModel = mongoose.model('Tapal');
      const tapal = await TapalModel.findById(trip.tapalId);
      if (tapal) {
        tapal.status = 'BILL_PENDING';
        const deliveredQty = trip.actualDeliveredQty || trip.expectedQty;
        tapal.qty = `${deliveredQty} KG`;
        tapal.numericQty = deliveredQty;
        await tapal.save();

        // Update Harvest State to COMPLETED if linked
        if (tapal.harvestId) {
          const HarvestModel = mongoose.model('Harvest');
          await HarvestModel.findByIdAndUpdate(tapal.harvestId, { status: 'COMPLETED' });
        }
      }

      // Release Vehicle back to available fleet
      const VehicleModel = mongoose.model('Vehicle');
      const vehicle = await VehicleModel.findById(trip.vehicleId);
      if (vehicle) {
        vehicle.status = 'AVAILABLE';
        await vehicle.save();
      }

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'CLOSED'
      }, 'dashboard:updates');
    }

    await trip.save();

    // Sync status of the linked standalone Expense document
    const ExpenseModel = mongoose.model('Expense');
    await ExpenseModel.updateMany(
      { linkedTripId: trip._id, remarks: { $regex: /Post-Trip/ } },
      { status: upperStatus, approvedBy: reviewerId }
    );

    logger.info(`[Admin Flow]: Post-trip expenses for Trip ${trip.tripNumber} marked as ${upperStatus} and trip status updated.`);
    return trip;
  }
}

export const tapalService = new TapalService();
export default tapalService;

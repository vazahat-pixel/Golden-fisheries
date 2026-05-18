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

      // Accept both CREATED (fresh) and CONFIRMED (converted from harvest) statuses
      const assignableStatuses = ['CREATED', 'CONFIRMED'];
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

      if (tapal.type === 'Sale' && tapal.buyerId) {
        deliveryLocation = tapal.deliveryAddress || 'BUYER SITE';
      }

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
      tapal.vehicleNumber = vehicle ? vehicle.plateNumber : null;
      await tapal.save({ session });

      // 7. Update Vehicle Status
      if (vehicle) {
        vehicle.status = 'ON_TRIP';
        await vehicle.save({ session });
      }

      await session.commitTransaction();
      session.endSession();

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'ASSIGNED',
        driverName: driver.fullName,
        tapalNumber: tapal.tapalNumber
      }, 'dashboard:updates');

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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'DRIVER_ASSIGNED') {
        throw new AppError('Trip cannot be started. Driver has not been assigned or trip already started', 400);
      }

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

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'STARTED'
      }, 'dashboard:updates');

      logger.info(`[Driver Flow]: Trip ${trip.tripNumber} has started.`);
      return { tapal, trip };

    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  /**
   * Safe Transaction: Driver rejects the trip
   */
  async rejectTrip(tapalId, driverId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tapal = await this.model.findById(tapalId).session(session);
      if (!tapal) throw new AppError('Tapal not found', 404);
      if (tapal.status !== 'DRIVER_ASSIGNED') {
        throw new AppError('Trip cannot be rejected. Invalid state.', 400);
      }

      if (tapal.driverId.toString() !== driverId.toString()) {
        throw new AppError('Access Denied: You are not the assigned driver for this trip', 403);
      }

      const trip = await Trip.findOne({ tapalId: tapal._id }).session(session);
      
      // Update Tapal back to unassigned state
      tapal.status = 'CREATED';
      tapal.driver = null;
      tapal.driverId = null;
      await tapal.save({ session });

      if (trip) {
        // If vehicle was assigned, make it available again
        if (trip.vehicleId) {
          const vehicle = await Vehicle.findById(trip.vehicleId).session(session);
          if (vehicle) {
            vehicle.status = 'AVAILABLE';
            await vehicle.save({ session });
          }
        }
        
        // Delete the trip document
        await Trip.findByIdAndDelete(trip._id).session(session);
      }

      await session.commitTransaction();
      session.endSession();

      broadcastEvent('trip:status_change', {
        tripId: trip ? trip._id : null,
        tripNumber: trip ? trip.tripNumber : null,
        status: 'REJECTED',
        tapalId: tapal._id
      }, 'dashboard:updates');

      logger.info(`[Driver Flow]: Driver rejected Trip for Tapal ${tapal.tapalNumber}. Reset to CREATED.`);
      return { tapal };

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

      tapal.status = 'PICKED_UP';
      await tapal.save({ session });

      await session.commitTransaction();
      session.endSession();

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'PICKED',
        actualPickupQty
      }, 'dashboard:updates');

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

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'DELIVERED',
        actualDeliveredQty
      }, 'dashboard:updates');

      logger.info(`[Driver Flow]: Cargo delivered for trip ${trip.tripNumber}. Actual weight: ${actualDeliveredQty} KG.`);
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

      // Inventory triggers based on actual delivered qty
      if (tapal.type === 'Purchase') {
        // Add actual delivered stock to inventory
        for (const line of tapal.products) {
          // Strip commas (Indian formatting) AND non-numeric characters before parsing
          const numericLineQty = parseFloat(line.qty.replace(/,/g, '').replace(/[^\d.]/g, ''));
          const actualLineQty = numericLineQty * scaleRatio;

          await Product.findOneAndUpdate(
            { name: line.name },
            { $inc: { quantity: actualLineQty } },
            { session, new: true }
          );
          logger.info(`[Inventory Trigger]: Added ${actualLineQty} KG to product stock: ${line.name}`);
        }
      } else if (tapal.type === 'Sale') {
        // Deduct delivered stock from inventory
        for (const line of tapal.products) {
          const numericLineQty = parseFloat(line.qty.replace(/,/g, '').replace(/[^\d.]/g, ''));
          const actualLineQty = numericLineQty * scaleRatio;

          // Check stock before deduction
          const dbProduct = await Product.findOne({ name: line.name }).session(session);
          if (dbProduct && dbProduct.quantity < actualLineQty) {
            // Log warning about negative inventory, but allowed for operational continuity in ERP if required
            logger.warn(`[Inventory Alarm]: Low stock for product ${line.name}. Attempting to deduct ${actualLineQty} but only ${dbProduct.quantity} remains.`);
          }

          await Product.findOneAndUpdate(
            { name: line.name },
            { $inc: { quantity: -actualLineQty } },
            { session, new: true }
          );
          logger.info(`[Inventory Trigger]: Deducted ${actualLineQty} KG from product stock: ${line.name}`);
        }
      }

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

      broadcastEvent('trip:status_change', {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        status: 'CLOSED'
      }, 'dashboard:updates');

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
}

export const tapalService = new TapalService();
export default tapalService;

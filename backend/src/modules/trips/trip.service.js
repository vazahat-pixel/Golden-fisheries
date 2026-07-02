import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Trip } from './trip.model.js';
import { Tapal } from '../tapals/tapal.model.js';
import { Harvest } from '../harvests/harvest.model.js';
import { User } from '../users/user.model.js';
import { Vehicle } from '../vehicles/vehicle.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { mapsService } from '../../services/maps.service.js';
import { notificationService } from '../notifications/notification.service.js';

const MIN_STOPS = 2;
const MAX_STOPS = 8;

class TripService extends BaseService {
  constructor() {
    super(Trip);
  }

  async createPlannedTrip({ stops = [], tripNotes = '' }, creatorUser) {
    if (!Array.isArray(stops) || stops.length < MIN_STOPS) {
      throw new AppError(`Add at least ${MIN_STOPS} stops for the trip route`, 400);
    }
    if (stops.length > MAX_STOPS) {
      throw new AppError(`Maximum ${MAX_STOPS} stops allowed per trip`, 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const normalizedStops = [];
      const tapalIds = new Set();
      const harvestIds = new Set();

      const sorted = [...stops].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

      for (let i = 0; i < sorted.length; i++) {
        const raw = sorted[i];
        const sequence = i + 1;
        const stopType = String(raw.stopType || '').toUpperCase();

        if (!['HARVEST_PICKUP', 'TAPAL_DELIVERY'].includes(stopType)) {
          throw new AppError(`Stop ${sequence}: invalid stop type`, 400);
        }

        let location = String(raw.location || '').trim();
        let expectedQty = parseFloat(raw.expectedQty) || 0;
        let label = String(raw.label || '').trim();
        let harvestId = raw.harvestId || null;
        let tapalId = raw.tapalId || null;

        if (stopType === 'HARVEST_PICKUP') {
          if (!harvestId) throw new AppError(`Stop ${sequence}: harvest slip is required`, 400);
          if (harvestIds.has(String(harvestId))) {
            throw new AppError(`Stop ${sequence}: harvest slip already used in this trip`, 400);
          }
          const harvest = await Harvest.findById(harvestId).populate('farmerId').session(session);
          if (!harvest) throw new AppError(`Stop ${sequence}: harvest slip not found`, 404);
          harvestIds.add(String(harvestId));
          if (!location) location = harvest.pickupLocation || harvest.farmerId?.location || 'FARM PICKUP';
          if (!expectedQty) {
            expectedQty =
              harvest.products?.reduce((s, p) => s + (p.estimatedQty || p.totalWeight || 0), 0) ||
              harvest.availableQty ||
              0;
          }
          if (!label) {
            label = `${harvest.harvestNumber || 'Harvest'} — ${harvest.farmerId?.fullName || harvest.farmerName || 'Farmer'}`;
          }
        }

        if (stopType === 'TAPAL_DELIVERY') {
          if (!tapalId) throw new AppError(`Stop ${sequence}: tapal is required`, 400);
          if (tapalIds.has(String(tapalId))) {
            throw new AppError(`Stop ${sequence}: tapal already used in this trip`, 400);
          }
          const tapal = await Tapal.findById(tapalId).session(session);
          if (!tapal) throw new AppError(`Stop ${sequence}: tapal not found`, 404);
          const assignable = ['CREATED', 'ASSIGNED', 'CONFIRMED'];
          if (!assignable.includes(tapal.status)) {
            throw new AppError(
              `Stop ${sequence}: tapal ${tapal.tapalNumber} cannot be added (status ${tapal.status})`,
              400
            );
          }
          const existingTrip = await Trip.findOne({
            status: { $in: ['PLANNED', 'ASSIGNED', 'STARTED', 'PICKED'] },
            $or: [{ tapalId }, { 'stops.tapalId': tapalId }],
          }).session(session);
          if (existingTrip) {
            throw new AppError(`Stop ${sequence}: tapal ${tapal.tapalNumber} is already on trip ${existingTrip.tripNumber}`, 400);
          }
          tapalIds.add(String(tapalId));
          if (!location) location = tapal.destination || tapal.unloadingPoint || 'DELIVERY';
          if (!expectedQty) expectedQty = tapal.numericQty || 0;
          if (!label) label = `${tapal.tapalNumber} — ${tapal.partyName || 'Buyer'}`;
        }

        normalizedStops.push({
          sequence,
          stopType,
          harvestId: harvestId || null,
          tapalId: tapalId || null,
          label,
          location,
          expectedQty,
          status: 'PENDING',
        });
      }

      const pickupLocation = normalizedStops[0].location;
      const deliveryLocation = normalizedStops[normalizedStops.length - 1].location;
      const expectedQty = normalizedStops.reduce((s, stop) => s + (stop.expectedQty || 0), 0);
      const primaryTapalStop = normalizedStops.find((s) => s.stopType === 'TAPAL_DELIVERY');

      const trip = new Trip({
        status: 'PLANNED',
        stops: normalizedStops,
        tripNotes: tripNotes || '',
        pickupLocation,
        deliveryLocation,
        expectedQty,
        tapalId: primaryTapalStop?.tapalId || null,
        timeline: [{ status: 'PLANNED', timestamp: new Date() }],
        createdBy: creatorUser?.phone || creatorUser?._id?.toString() || null,
      });

      await trip.save({ session });
      await session.commitTransaction();
      session.endSession();

      logger.info(`[Trip Engine]: Planned trip ${trip.tripNumber} with ${normalizedStops.length} stops`);
      return trip;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async assignDriverToTrip(tripId, driverId, vehicleId, driverName) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const trip = await Trip.findById(tripId).session(session);
      if (!trip) throw new AppError('Trip not found', 404);
      if (trip.status !== 'PLANNED' && trip.status !== 'ASSIGNED') {
        throw new AppError(`Cannot assign driver while trip status is ${trip.status}`, 400);
      }
      if (trip.driverId) {
        throw new AppError('Trip already has a driver assigned', 400);
      }

      const trimmedName = String(driverName || '').trim();

      if (!driverId && trimmedName) {
        trip.driverName = trimmedName.toUpperCase();
        trip.status = 'ASSIGNED';
        if (vehicleId) {
          const vehicle = await Vehicle.findById(vehicleId).session(session);
          if (vehicle) trip.vehicleNumber = vehicle.vehicleNumber || vehicle.plateNumber || null;
        }
        trip.timeline.push({ status: 'ASSIGNED', timestamp: new Date() });
        await trip.save({ session });
        await this._markLinkedTapalsAssigned(trip, trimmedName, null, trip.vehicleNumber, session);
        await session.commitTransaction();
        session.endSession();
        return { trip, nameOnly: true };
      }

      if (!driverId) throw new AppError('Driver ID or driver name is required', 400);

      let driver = await User.findOne({ _id: driverId, role: 'DRIVER' }).session(session);
      if (!driver) {
        const { DriverProfile } = await import('../drivers/driverProfile.model.js');
        const profile = await DriverProfile.findById(driverId).populate('userId').session(session);
        if (profile?.userId) driver = profile.userId;
      }
      if (!driver) throw new AppError('Driver not found or invalid role', 404);
      if (!driver.isActive) throw new AppError('Driver is currently inactive', 400);

      let vehicle = null;
      if (vehicleId) {
        vehicle = await Vehicle.findById(vehicleId).session(session);
        if (!vehicle) throw new AppError('Vehicle not found', 404);
        if (vehicle.status !== 'AVAILABLE') {
          throw new AppError(`Vehicle is not available. Status: ${vehicle.status}`, 400);
        }
      }

      trip.driverId = driver._id;
      trip.driverName = driver.fullName;
      trip.status = 'ASSIGNED';
      trip.vehicleId = vehicle ? vehicle._id : null;
      trip.vehicleNumber = vehicle ? vehicle.vehicleNumber || vehicle.plateNumber : null;
      trip.timeline.push({ status: 'ASSIGNED', timestamp: new Date() });

      await trip.save({ session });
      await this._markLinkedTapalsAssigned(trip, driver.fullName, driver._id, trip.vehicleNumber, session, driver.phone);

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
        stopsCount: trip.stops?.length || 0,
      };
      broadcastEvent('trip:status_change', tripPayload, 'dashboard:updates');
      broadcastEvent('trip:status_change', tripPayload, 'role:BUYER');

      const driverUserId = driver._id.toString();
      const assignmentPayload = {
        tripId: trip._id,
        tripNumber: trip.tripNumber,
        pickupLocation: trip.pickupLocation,
        deliveryLocation: trip.deliveryLocation,
        stops: trip.stops,
        assignedAt: new Date(),
      };
      broadcastEvent('trip:new_assignment', assignmentPayload, `user:${driverUserId}`);
      broadcastEvent('trip:new_assignment', assignmentPayload, 'drivers:updates');

      if (driver.phone) {
        notificationService
          .sendDriverTripAssigned({
            phone: driver.phone,
            vehicleNo: trip.vehicleNumber,
            pickupAddr: trip.pickupLocation,
            tapalNo: trip.tripNumber,
          })
          .catch((e) => logger.warn(`[Notify] Driver SMS failed: ${e.message}`));

        notificationService
          .createInAppNotification({
            userId: driver._id,
            title: 'New Trip Assigned',
            message: `Trip ${trip.tripNumber}: ${trip.pickupLocation} → ${trip.deliveryLocation} (${trip.stops?.length || 0} stops).`,
            type: 'ALERT',
            referenceId: trip._id,
            referenceModel: 'Trip',
          })
          .catch((e) => logger.warn(`[Notify] Driver InApp failed: ${e.message}`));
      }

      mapsService
        .resolveRoutePoints(trip.pickupLocation, trip.deliveryLocation)
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

      return { trip, driver };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async _markLinkedTapalsAssigned(trip, driverName, driverId, vehicleNumber, session, driverPhone = null) {
    const tapalIds = new Set();
    if (trip.tapalId) tapalIds.add(String(trip.tapalId));
    (trip.stops || []).forEach((s) => {
      if (s.tapalId) tapalIds.add(String(s.tapalId));
    });

    for (const id of tapalIds) {
      const tapal = await Tapal.findById(id).session(session);
      if (!tapal) continue;
      tapal.status = 'DRIVER_ASSIGNED';
      tapal.driver = driverName;
      if (driverId) tapal.driverId = driverId;
      if (driverPhone) tapal.driverPhone = driverPhone;
      if (vehicleNumber) tapal.vehicleNumber = vehicleNumber;
      await tapal.save({ session });
    }
  }

  async listPlannedTrips() {
    return Trip.find({ status: 'PLANNED' })
      .populate('stops.harvestId stops.tapalId')
      .sort({ createdAt: -1 });
  }

  async getTripById(tripId) {
    const trip = await Trip.findById(tripId)
      .populate('driverId vehicleId tapalId stops.harvestId stops.tapalId');
    if (!trip) throw new AppError('Trip not found', 404);
    return trip;
  }
}

export const tripService = new TripService();
export default tripService;

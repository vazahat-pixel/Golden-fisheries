import { Router } from 'express';
import { mapsService } from '../../services/maps.service.js';
import { Trip } from '../trips/trip.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import {
  protect,
  restrictTo,
  enforcePlatformPolicy,
} from '../../middleware/auth.middleware.js';
import {
  WEB_ERP,
  DRIVER_ROLES,
  BUYER_ROLES,
  PROCUREMENT,
} from '../../constants/roleGroups.js';
import { ROLES } from '../../constants/roles.js';
import { AppError } from '../../utils/appError.js';

const router = Router();

router.use(protect, enforcePlatformPolicy);

router.get(
  '/geocode',
  restrictTo(...WEB_ERP, ...DRIVER_ROLES, ...BUYER_ROLES, ...PROCUREMENT),
  asyncWrapper(async (req, res) => {
    const result = await mapsService.geocodeAddress(req.query.address);
    new ApiResponse(200, result, 'Address geocoded').send(res);
  })
);

router.get(
  '/trip/:tripId/track',
  restrictTo(...WEB_ERP, ...DRIVER_ROLES, ...BUYER_ROLES),
  asyncWrapper(async (req, res) => {
    const trip = await Trip.findById(req.params.tripId).populate('tapalId driverId');
    if (!trip) throw new AppError('Trip not found', 404);

    const tapal = trip.tapalId;
    const payload = {
      tripId: trip._id,
      tripNumber: trip.tripNumber,
      status: trip.status,
      lastLocation: trip.lastLocation || null,
      pickupLocation: trip.pickupLocation,
      deliveryLocation: trip.deliveryLocation,
      pickupCoords: trip.pickupCoords,
      deliveryCoords: trip.deliveryCoords,
      driver: trip.driverId
        ? { id: trip.driverId._id, name: trip.driverId.fullName, phone: trip.driverId.phone }
        : null,
      navigationUrl: mapsService.buildNavigationUrl({
        origin: trip.pickupLocation,
        destination: trip.deliveryLocation,
      }),
      staticMapUrl:
        trip.lastLocation?.latitude != null
          ? mapsService.buildStaticMapUrl({
              lat: trip.lastLocation.latitude,
              lng: trip.lastLocation.longitude,
            })
          : null,
    };

    if (tapal && req.userRole === ROLES.BUYER) {
      const allowed =
        tapal.buyerPhone === req.user.phone ||
        tapal.assignedBuyer?.toString() === req.user._id.toString();
      if (!allowed) throw new AppError('Access denied for this trip', 403);
    }

    if (trip.driverId?.toString() === req.user._id.toString() && trip.status === 'STARTED') {
      payload.role = 'driver';
    }

    new ApiResponse(200, payload, 'Trip tracking data').send(res);
  })
);

router.post(
  '/trip/:tripId/location',
  restrictTo(...DRIVER_ROLES),
  asyncWrapper(async (req, res) => {
    const { latitude, longitude, accuracy } = req.body;
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) throw new AppError('Trip not found', 404);
    if (trip.driverId.toString() !== req.user._id.toString()) {
      throw new AppError('Access denied', 403);
    }

    trip.lastLocation = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy != null ? parseFloat(accuracy) : null,
      updatedAt: new Date(),
    };
    await trip.save();

    new ApiResponse(200, { lastLocation: trip.lastLocation }, 'Location updated').send(res);
  })
);

export default router;

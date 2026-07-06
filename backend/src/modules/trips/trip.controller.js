import { tripService } from './trip.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { aliasTripResponse } from '../../utils/apiAliases.js';

export const tripController = {
  create: asyncWrapper(async (req, res) => {
    const { stops, tripNotes } = req.body;
    const trip = await tripService.createPlannedTrip({ stops, tripNotes }, req.user);
    new ApiResponse(201, { trip: aliasTripResponse(trip) }, 'Trip created — assign driver when ready').send(res);
  }),

  planned: asyncWrapper(async (req, res) => {
    const trips = await tripService.listPlannedTrips();
    new ApiResponse(
      200,
      trips.map((t) => aliasTripResponse(t)),
      'Planned trips fetched successfully'
    ).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const trip = await tripService.getTripById(req.params.id);
    new ApiResponse(200, { trip: aliasTripResponse(trip) }, 'Trip retrieved successfully').send(res);
  }),

  assignDriver: asyncWrapper(async (req, res) => {
    const { tripId, driverId, vehicleId, driverName } = req.body;
    const result = await tripService.assignDriverToTrip(tripId, driverId, vehicleId, driverName);
    if (result.trip) result.trip = aliasTripResponse(result.trip);
    new ApiResponse(200, result, 'Driver assigned to trip successfully').send(res);
  }),

  completeStop: asyncWrapper(async (req, res) => {
    const { sequence, actualQty, proofPhotoUrl, signatureUrl } = req.body;
    const trip = await tripService.completeStop(req.params.id, sequence, { actualQty, proofPhotoUrl, signatureUrl }, req.user);
    new ApiResponse(200, { trip: aliasTripResponse(trip) }, 'Stop marked as completed').send(res);
  }),
};

export default tripController;

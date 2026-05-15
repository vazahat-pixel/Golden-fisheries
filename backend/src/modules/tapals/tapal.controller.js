import { tapalService } from './tapal.service.js';
import { harvestService } from '../harvests/harvest.service.js';
import { Trip } from '../trips/trip.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';

export const tapalController = {
  // Convert Harvest slip to active purchase Tapal contract
  createFromHarvest: asyncWrapper(async (req, res) => {
    const { harvestId } = req.body;
    const tapal = await harvestService.convertToTapal(harvestId, req.user);
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('tapal:created', { tapal }, 'dashboard:updates');
    broadcastEvent('harvest:status_update', { 
      id: harvestId, 
      status: 'CONVERTED_TO_TAPAL' 
    }, 'dashboard:updates');

    new ApiResponse(201, { tapal }, 'Tapal created from harvest slip successfully').send(res);
  }),

  // Fetch all Tapals with filtering and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await tapalService.findTapalsWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Tapals fetched successfully', result.meta).send(res);
  }),

  // Get a single Tapal details by database ID
  getById: asyncWrapper(async (req, res) => {
    const tapal = await tapalService.findById(req.params.id, 'harvestId');
    new ApiResponse(200, { tapal }, 'Tapal retrieved successfully').send(res);
  }),

  // Admin assigns a Driver and Vehicle, creating a Trip
  assignDriver: asyncWrapper(async (req, res) => {
    const { tapalId, driverId, vehicleId } = req.body;
    const result = await tapalService.assignDriver(tapalId, driverId, vehicleId);
    new ApiResponse(200, result, 'Driver and Vehicle assigned. Trip spawned.').send(res);
  }),

  // Driver starts the trip journey
  startTrip: asyncWrapper(async (req, res) => {
    const { tapalId } = req.body;
    const result = await tapalService.startTrip(tapalId, req.user.id);
    new ApiResponse(200, result, 'Trip started successfully').send(res);
  }),

  // Driver rejects the trip assignment
  rejectTrip: asyncWrapper(async (req, res) => {
    const { tapalId } = req.body;
    const result = await tapalService.rejectTrip(tapalId, req.user.id);
    new ApiResponse(200, result, 'Trip rejected successfully').send(res);
  }),

  // Driver records cargo pickup scale weight
  pickup: asyncWrapper(async (req, res) => {
    const { tapalId, actualPickupQty } = req.body;
    const result = await tapalService.pickupCargo(tapalId, req.user.id, actualPickupQty);
    new ApiResponse(200, result, 'Cargo pickup recorded successfully').send(res);
  }),

  // Driver records final delivery scale weight with Proof uploads
  deliver: asyncWrapper(async (req, res) => {
    const { tapalId, actualDeliveredQty, proofPhotoUrl, signatureUrl } = req.body;
    const result = await tapalService.deliverCargo(tapalId, req.user.id, actualDeliveredQty, proofPhotoUrl, signatureUrl);
    new ApiResponse(200, result, 'Cargo delivery recorded. POD saved.').send(res);
  }),

  // Admin/Accountant closes the trip, updating inventory stock level
  endTrip: asyncWrapper(async (req, res) => {
    const { tapalId } = req.body;
    const result = await tapalService.endTrip(tapalId);
    new ApiResponse(200, result, 'Trip ended and closed. Inventory stock updated successfully.').send(res);
  }),

  // Driver logs fuel/toll expenses
  logExpense: asyncWrapper(async (req, res) => {
    const { tripId, expenseType, amount, receiptUrl, remarks } = req.body;
    const result = await tapalService.logExpense(tripId, req.user.id, {
      expenseType,
      amount,
      receiptUrl,
      remarks
    });
    new ApiResponse(200, { trip: result }, 'Expense logged successfully').send(res);
  }),

  // Get Trip Details by ID
  getTripById: asyncWrapper(async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('tapalId driverId vehicleId');
    new ApiResponse(200, { trip }, 'Trip retrieved successfully').send(res);
  })
};

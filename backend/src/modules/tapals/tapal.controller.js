import { tapalService } from './tapal.service.js';
import { harvestService } from '../harvests/harvest.service.js';
import { Trip } from '../trips/trip.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';

export const tapalController = {
  // Convert Harvest slip to active purchase Tapal contract
  createFromHarvest: asyncWrapper(async (req, res) => {
    const { harvestId, assignedTo } = req.body;
    const tapal = await harvestService.convertToTapal(harvestId, assignedTo, req.user);
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('tapal:created', { tapal }, 'dashboard:updates');
    broadcastEvent('harvest:status_update', { 
      id: harvestId, 
      status: 'CONVERTED_TO_TAPAL' 
    }, 'dashboard:updates');

    new ApiResponse(201, { tapal }, 'Tapal created from harvest slip successfully').send(res);
  }),

  // Driver fetches only their own trips (scoped by JWT identity — no data leakage)
  myTrips: asyncWrapper(async (req, res) => {
    const trips = await Trip.find({ driverId: req.user.id })
      .populate('tapalId vehicleId')
      .sort({ createdAt: -1 });
    new ApiResponse(200, trips, 'Your assigned trips fetched successfully').send(res);
  }),

  // Fetch all Tapals with filtering and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await tapalService.findTapalsWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Tapals fetched successfully', result.meta).send(res);
  }),

  // Fetch all Trips
  allTrips: asyncWrapper(async (req, res) => {
    const trips = await Trip.find().populate('tapalId driverId vehicleId').sort({ createdAt: -1 });
    new ApiResponse(200, trips, 'Trips fetched successfully').send(res);
  }),

  // Get a single Tapal details by database ID
  getById: asyncWrapper(async (req, res) => {
    const tapal = await tapalService.findById(req.params.id, 'harvestId farmerId assignedTo');
    new ApiResponse(200, { tapal }, 'Tapal retrieved successfully').send(res);
  }),

  // Update a Tapal (Channpa filling out the Tapal)
  update: asyncWrapper(async (req, res) => {
    const tapal = await tapalService.updateById(req.params.id, req.body);
    new ApiResponse(200, { tapal }, 'Tapal updated successfully').send(res);
  }),

  // Return Tapal
  returnTapal: asyncWrapper(async (req, res) => {
    const { tapalId, reason } = req.body;
    // Assuming updateById can handle status change, or we make a service method.
    // Let's just use updateById.
    const tapal = await tapalService.updateById(tapalId, { status: 'RETURNED', damageComplaint: reason });
    new ApiResponse(200, { tapal }, 'Tapal returned successfully').send(res);
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

  // Driver submits detailed post-trip expenses form
  submitPostTripExpense: asyncWrapper(async (req, res) => {
    const { tripId } = req.params;
    const result = await tapalService.submitPostTripExpense(tripId, req.user.id, req.body);
    new ApiResponse(200, { trip: result }, 'Post-trip expenses submitted successfully').send(res);
  }),

  // Admin/Accountant reviews post-trip expenses
  reviewPostTripExpense: asyncWrapper(async (req, res) => {
    const { tripId } = req.params;
    const { status, rejectionReason } = req.body;
    const result = await tapalService.reviewPostTripExpense(tripId, req.user.id, status, rejectionReason);
    new ApiResponse(200, { trip: result }, `Post-trip expenses ${status.toLowerCase()} successfully`).send(res);
  }),

  // Get Trip Details by ID
  getTripById: asyncWrapper(async (req, res) => {
    const trip = await Trip.findById(req.params.id).populate('tapalId driverId vehicleId');
    new ApiResponse(200, { trip }, 'Trip retrieved successfully').send(res);
  })
};

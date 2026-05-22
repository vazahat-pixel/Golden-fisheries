import mongoose from 'mongoose';
import { tapalService } from './tapal.service.js';
import { harvestService } from '../harvests/harvest.service.js';
import { Trip } from '../trips/trip.model.js';
import { Tapal } from './tapal.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { aliasTapalResponse, aliasTripResponse } from '../../utils/apiAliases.js';

function aliasTapalTripPair(result) {
  if (!result) return result;
  const o = { ...result };
  if (o.tapal) o.tapal = aliasTapalResponse(o.tapal);
  if (o.trip) o.trip = aliasTripResponse(o.trip);
  return o;
}

export const tapalController = {
  // Convert Harvest slip to active purchase Tapal contract
  createFromHarvest: asyncWrapper(async (req, res) => {
    const {
      harvestId,
      assignedTo,
      buyerPhone,
      buyerId,
      assignedBuyer,
      destination,
      logisticsNotes,
      vehicleNumber,
      driverName,
    } = req.body;
    const tapal = await harvestService.convertToTapal(harvestId, assignedTo, req.user, null, {
      buyerPhone,
      buyerId,
      assignedBuyer,
      destination,
      logisticsNotes,
      vehicleNumber,
      driverName,
    });
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('tapal:created', { tapal }, 'dashboard:updates');
    broadcastEvent('harvest:status_update', { 
      id: harvestId, 
      status: 'CONVERTED_TO_TAPAL' 
    }, 'dashboard:updates');

    new ApiResponse(201, { tapal: aliasTapalResponse(tapal) }, 'Tapal created from harvest slip successfully').send(res);
  }),

  // Driver fetches only their own trips (scoped by JWT identity — no data leakage)
  myTrips: asyncWrapper(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      Trip.find({ driverId: req.user.id })
        .populate('tapalId vehicleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Trip.countDocuments({ driverId: req.user.id })
    ]);

    const rows = trips.map((t) => aliasTripResponse(t));
    new ApiResponse(200, rows, 'Your assigned trips fetched successfully', {
      totalDocs: total,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }).send(res);
  }),

  // Fetch all Tapals with filtering and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await tapalService.findTapalsWithFilters(req.query);
    const rows = (result.docs || []).map((t) => aliasTapalResponse(t));
    new ApiResponse(200, rows, 'Tapals fetched successfully', result.meta).send(res);
  }),

  // Fetch all Trips
  allTrips: asyncWrapper(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const [trips, total] = await Promise.all([
      Trip.find()
        .populate('tapalId driverId vehicleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Trip.countDocuments()
    ]);

    const rows = trips.map((t) => aliasTripResponse(t));
    new ApiResponse(200, rows, 'Trips fetched successfully', {
      totalDocs: total,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }).send(res);
  }),

  // Get a single Tapal details by database ID
  getById: asyncWrapper(async (req, res) => {
    const tapal = await tapalService.findById(req.params.id, 'harvestId farmerId assignedTo');
    new ApiResponse(200, { tapal: aliasTapalResponse(tapal) }, 'Tapal retrieved successfully').send(res);
  }),

  // Update a Tapal (Channpa filling out the Tapal)
  update: asyncWrapper(async (req, res) => {
    const tapal = await tapalService.updateById(req.params.id, req.body);
    new ApiResponse(200, { tapal: aliasTapalResponse(tapal) }, 'Tapal updated successfully').send(res);
  }),

  // Return Tapal
  returnTapal: asyncWrapper(async (req, res) => {
    const { tapalId, reason } = req.body;
    // Assuming updateById can handle status change, or we make a service method.
    // Let's just use updateById.
    const tapal = await tapalService.updateById(tapalId, { status: 'RETURNED', damageComplaint: reason });
    new ApiResponse(200, { tapal: aliasTapalResponse(tapal) }, 'Tapal returned successfully').send(res);
  }),

  // Admin assigns a Driver and Vehicle, creating a Trip
  assignDriver: asyncWrapper(async (req, res) => {
    const { tapalId, driverId, vehicleId } = req.body;
    const result = await tapalService.assignDriver(tapalId, driverId, vehicleId);
    if (result.tapal) result.tapal = aliasTapalResponse(result.tapal);
    if (result.trip) result.trip = aliasTripResponse(result.trip);
    new ApiResponse(200, result, 'Driver and Vehicle assigned. Trip spawned.').send(res);
  }),

  // Buyer fetches only their own trips (scoped by JWT identity)
  myBuyerTrips: asyncWrapper(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const { Buyer } = await import('../buyers/buyer.model.js');
    const buyerMaster = await Buyer.findOne({ phone: req.user.phone });
    const or = [{ buyerPhone: req.user.phone }, { assignedBuyer: req.user._id }];
    if (buyerMaster) or.push({ buyerId: buyerMaster._id });

    const tapals = await Tapal.find({ $or: or, isDeleted: { $ne: true } }).select('_id');

    const tapalIds = tapals.map(t => t._id);

    const [trips, total] = await Promise.all([
      Trip.find({ tapalId: { $in: tapalIds } })
        .populate('tapalId driverId vehicleId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Trip.countDocuments({ tapalId: { $in: tapalIds } })
    ]);

    const rows = trips.map((t) => aliasTripResponse(t));
    new ApiResponse(200, rows, 'Your trips fetched successfully', {
      totalDocs: total,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }).send(res);
  }),

  // Driver starts the trip journey
  startTrip: asyncWrapper(async (req, res) => {
    const { tapalId } = req.body;
    const result = await tapalService.startTrip(tapalId, req.user.id);
    new ApiResponse(200, aliasTapalTripPair(result), 'Trip started successfully').send(res);
  }),

  // Driver records cargo pickup scale weight
  pickup: asyncWrapper(async (req, res) => {
    const { tapalId, actualPickupQty } = req.body;
    const result = await tapalService.pickupCargo(tapalId, req.user.id, actualPickupQty);
    new ApiResponse(200, aliasTapalTripPair(result), 'Cargo pickup recorded successfully').send(res);
  }),

  // Driver records final delivery scale weight with Proof uploads
  deliver: asyncWrapper(async (req, res) => {
    const { tapalId, actualDeliveredQty, proofPhotoUrl, signatureUrl } = req.body;
    const result = await tapalService.deliverCargo(tapalId, req.user.id, actualDeliveredQty, proofPhotoUrl, signatureUrl);
    new ApiResponse(200, aliasTapalTripPair(result), 'Cargo delivery recorded. POD saved.').send(res);
  }),

  // Admin/Accountant closes the trip, updating inventory stock level
  endTrip: asyncWrapper(async (req, res) => {
    const { tapalId } = req.body;
    const result = await tapalService.endTrip(tapalId);
    new ApiResponse(200, aliasTapalTripPair(result), 'Trip ended and closed. Inventory stock updated successfully.').send(res);
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
    new ApiResponse(200, { trip: aliasTripResponse(result) }, 'Expense logged successfully').send(res);
  }),

  // Driver submits detailed post-trip expenses form
  submitPostTripExpense: asyncWrapper(async (req, res) => {
    const { tripId } = req.params;
    const result = await tapalService.submitPostTripExpense(tripId, req.user.id, req.body);
    new ApiResponse(200, { trip: aliasTripResponse(result) }, 'Post-trip expenses submitted successfully').send(res);
  }),

  // Admin/Accountant reviews post-trip expenses
  reviewPostTripExpense: asyncWrapper(async (req, res) => {
    const { tripId } = req.params;
    const { status, rejectionReason } = req.body;
    const result = await tapalService.reviewPostTripExpense(tripId, req.user.id, status, rejectionReason);
    new ApiResponse(200, { trip: aliasTripResponse(result) }, `Post-trip expenses ${status.toLowerCase()} successfully`).send(res);
  }),

  // Get Trip Details by ID
  getTripById: asyncWrapper(async (req, res) => {
    const { id } = req.params;
    let query = { _id: id };
    if (!mongoose.Types.ObjectId.isValid(id)) {
      query = { tripNumber: id };
    } else {
      const exists = await Trip.exists({ _id: id });
      if (!exists) {
        query = { tapalId: id };
      }
    }
    const trip = await Trip.findOne(query).populate('tapalId driverId vehicleId');
    new ApiResponse(200, { trip: aliasTripResponse(trip) }, 'Trip retrieved successfully').send(res);
  })
};

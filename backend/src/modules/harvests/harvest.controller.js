import { harvestService } from './harvest.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';

export const harvestController = {
  // Create a new Harvest Slip
  create: asyncWrapper(async (req, res) => {
    // Inject current creator user ID from auth middleware
    const harvestData = {
      ...req.body,
      createdBy: req.user.id
    };

    const harvest = await harvestService.create(harvestData);
    new ApiResponse(201, { harvest }, 'Harvest Slip created successfully').send(res);
  }),

  // Fetch all Harvest Slips with filters, search, and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await harvestService.findHarvestsWithFilters(req.query);
    new ApiResponse(
      200, 
      result.docs, 
      'Harvest Slips fetched successfully', 
      result.meta
    ).send(res);
  }),

  // Fetch a single Harvest Slip by ID
  getById: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.findById(req.params.id, 'farmerId');
    new ApiResponse(200, { harvest }, 'Harvest Slip retrieved successfully').send(res);
  }),

  // Update a Harvest Slip
  update: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.updateById(req.params.id, req.body);
    new ApiResponse(200, { harvest }, 'Harvest Slip updated successfully').send(res);
  }),

  // Patch status state of a Harvest Slip
  patchStatus: asyncWrapper(async (req, res) => {
    const { status } = req.body;
    const harvest = await harvestService.updateById(req.params.id, { status });
    
    // Broadcast status change for real-time dashboard sync
    broadcastEvent('harvest:status_update', { 
      id: req.params.id, 
      status, 
      harvestNumber: harvest.harvestNumber 
    }, 'dashboard:updates');

    new ApiResponse(200, { harvest }, `Harvest status updated to ${status}`).send(res);
  }),

  // Convert a Confirmed Harvest Slip into a Purchase Tapal Contract
  convertToTapal: asyncWrapper(async (req, res) => {
    const tapal = await harvestService.convertToTapal(req.params.id, req.user);
    
    // Broadcast Tapal creation and Harvest conversion
    broadcastEvent('tapal:created', { tapal }, 'dashboard:updates');
    broadcastEvent('harvest:status_update', { 
      id: req.params.id, 
      status: 'CONVERTED_TO_TAPAL' 
    }, 'dashboard:updates');

    new ApiResponse(201, { tapal }, 'Harvest slip converted to Purchase Tapal successfully').send(res);
  }),

  // Save Net Rate calculations and finalize purchase bill
  saveNetRate: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.saveNetRate(req.params.id, req.body, req.user);
    new ApiResponse(200, { harvest }, 'Net rate and finalized purchase bill saved successfully').send(res);
  })
};

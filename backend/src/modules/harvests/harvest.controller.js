import { harvestService } from './harvest.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { aliasHarvestResponse, aliasTapalResponse } from '../../utils/apiAliases.js';
import { AppError } from '../../utils/appError.js';

function normalizeHarvestBody(body) {
  if (!body || typeof body !== 'object') return body;
  const o = { ...body };
  if (o.hNo && !o.harvestNumber) o.harvestNumber = o.hNo;
  if (o.farmer && !o.farmerId) o.farmerId = o.farmer;
  if (o.date && !o.harvestDate) o.harvestDate = o.date;
  if (o.loadingPoint && !o.pickupLocation) o.pickupLocation = o.loadingPoint;
  return o;
}

export const harvestController = {
  // Create a new Harvest Slip
  create: asyncWrapper(async (req, res) => {
    // Inject current creator user ID from auth middleware
    const harvestData = normalizeHarvestBody({
      ...req.body,
      createdBy: req.user.id
    });

    const harvest = await harvestService.create(harvestData);
    new ApiResponse(201, { harvest: aliasHarvestResponse(harvest) }, 'Harvest Slip created successfully').send(res);
  }),

  // Fetch all Harvest Slips with filters, search, and pagination
  all: asyncWrapper(async (req, res) => {
    const result = await harvestService.findHarvestsWithFilters(req.query);
    const rows = (result.docs || []).map((h) => aliasHarvestResponse(h));
    new ApiResponse(
      200, 
      rows, 
      'Harvest Slips fetched successfully', 
      result.meta
    ).send(res);
  }),

  // Fetch a single Harvest Slip by ID
  getById: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.findById(req.params.id, 'farmerId');
    new ApiResponse(200, { harvest: aliasHarvestResponse(harvest) }, 'Harvest Slip retrieved successfully').send(res);
  }),

  // Update a Harvest Slip
  update: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.updateById(req.params.id, normalizeHarvestBody(req.body));
    new ApiResponse(200, { harvest: aliasHarvestResponse(harvest) }, 'Harvest Slip updated successfully').send(res);
  }),

  // Reject harvest slip (alias for status REJECTED)
  reject: asyncWrapper(async (req, res) => {
    const { reason } = req.body || {};
    const harvest = await harvestService.updateById(req.params.id, {
      status: 'REJECTED',
      ...(reason && { remarks: reason }),
    });
    broadcastEvent(
      'harvest:status_update',
      { id: req.params.id, status: 'REJECTED', harvestNumber: harvest.harvestNumber },
      'dashboard:updates'
    );
    new ApiResponse(200, { harvest: aliasHarvestResponse(harvest) }, 'Harvest slip rejected').send(res);
  }),

  // Patch status state of a Harvest Slip (workflow-safe transitions only)
  patchStatus: asyncWrapper(async (req, res) => {
    const { status } = req.body;
    const forbidden = ['CONVERTED_TO_TAPAL', 'COMPLETED'];
    if (forbidden.includes(status)) {
      throw new AppError(
        `Use dedicated endpoints for ${status} (convert-to-tapal / billing workflow)`,
        400
      );
    }
    const harvest = await harvestService.updateById(req.params.id, { status });
    
    // Broadcast status change for real-time dashboard sync
    broadcastEvent('harvest:status_update', { 
      id: req.params.id, 
      status, 
      harvestNumber: harvest.harvestNumber 
    }, 'dashboard:updates');

    new ApiResponse(200, { harvest: aliasHarvestResponse(harvest) }, `Harvest status updated to ${status}`).send(res);
  }),

  // Convert a Confirmed Harvest Slip into a Purchase Tapal Contract
  convertToTapal: asyncWrapper(async (req, res) => {
    const {
      assignedTo,
      selectedItems,
      buyerPhone,
      buyerId,
      assignedBuyer,
      destination,
      logisticsNotes,
      vehicleNumber,
      driverName,
    } = req.body || {};
    const logistics = {
      buyerPhone,
      buyerId,
      assignedBuyer,
      destination,
      logisticsNotes,
      vehicleNumber,
      driverName,
    };
    const tapal = await harvestService.convertToTapal(
      req.params.id,
      assignedTo,
      req.user,
      selectedItems,
      logistics
    );
    
    // Broadcast Tapal creation and Harvest conversion
    broadcastEvent('tapal:created', { tapal }, 'dashboard:updates');
    broadcastEvent('harvest:status_update', { 
      id: req.params.id, 
      status: 'CONVERTED_TO_TAPAL' 
    }, 'dashboard:updates');

    new ApiResponse(201, { tapal: aliasTapalResponse(tapal) }, 'Harvest slip converted to Purchase Tapal successfully').send(res);
  }),

  // Save Net Rate calculations and finalize purchase bill
  saveNetRate: asyncWrapper(async (req, res) => {
    const harvest = await harvestService.saveNetRate(req.params.id, req.body, req.user);
    new ApiResponse(200, { harvest: aliasHarvestResponse(harvest) }, 'Net rate and finalized purchase bill saved successfully').send(res);
  })
};

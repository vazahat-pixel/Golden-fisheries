import { restaurantService } from './restaurant.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { restaurantInventoryService } from './restaurantInventory.service.js';

export const restaurantController = {
  create: asyncWrapper(async (req, res) => {
    const order = await restaurantService.createOrder(req.body, req.user.id);
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('restaurant:order_created', { order }, 'dashboard:updates');
    
    new ApiResponse(201, { order }, 'Order ticket created successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await restaurantService.findOrdersWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Order tickets fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const order = await restaurantService.findById(req.params.id);
    new ApiResponse(200, { order }, 'Order retrieved successfully').send(res);
  }),

  settle: asyncWrapper(async (req, res) => {
    const order = await restaurantService.settleOrder(req.params.id, req.body, req.user.id);
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('restaurant:order_settled', { order }, 'dashboard:updates');
    
    new ApiResponse(200, { order }, 'Order ticket settled and paid successfully').send(res);
  }),

  getMenu: asyncWrapper(async (req, res) => {
    const result = await restaurantInventoryService.list({ limit: 500 });
    const menu = result.docs.map((item) => ({
      _id: item._id,
      id: item._id,
      name: item.name,
      quantity: item.quantity,
      stock: item.quantity,
      rate: item.rate,
      basePrice: item.rate,
      category: item.category,
      unit: item.unit,
      recordDate: item.recordDate,
    }));
    new ApiResponse(200, menu, 'Restaurant menu & kitchen stock fetched successfully').send(res);
  }),

  createMenuItem: asyncWrapper(async (req, res) => {
    const item = await restaurantInventoryService.createItem(req.body, req.user.id);
    new ApiResponse(201, item, 'Restaurant inventory item created successfully').send(res);
  }),

  listInventory: asyncWrapper(async (req, res) => {
    const result = await restaurantInventoryService.list(req.query);
    new ApiResponse(200, result.docs, 'Restaurant inventory fetched', result.meta).send(res);
  }),

  adjustInventory: asyncWrapper(async (req, res) => {
    const { quantityChange, remarks } = req.body;
    const item = await restaurantInventoryService.adjustItem(
      req.params.id,
      quantityChange,
      req.user.id,
      remarks
    );
    new ApiResponse(200, item, 'Restaurant stock adjusted').send(res);
  }),

  inventorySummary: asyncWrapper(async (req, res) => {
    const summary = await restaurantInventoryService.getSummary();
    new ApiResponse(200, summary, 'Restaurant inventory summary').send(res);
  }),

  inventoryLogs: asyncWrapper(async (req, res) => {
    const logs = await restaurantInventoryService.getLogs(req.query);
    new ApiResponse(200, logs, 'Restaurant inventory logs').send(res);
  }),

  getTables: asyncWrapper(async (req, res) => {
    const tables = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      label: `T${String(i + 1).padStart(2, '0')}`,
      status: 'available',
      capacity: i < 4 ? 2 : i < 14 ? 4 : 6,
    }));
    new ApiResponse(200, tables, 'Tables fetched successfully').send(res);
  })
};

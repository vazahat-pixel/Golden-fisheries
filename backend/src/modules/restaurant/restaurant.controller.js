import { restaurantService } from './restaurant.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { Product } from '../products/product.model.js';

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
    const { paymentMethod } = req.body;
    const order = await restaurantService.settleOrder(req.params.id, paymentMethod, req.user.id);
    
    // Broadcast for real-time dashboard sync
    broadcastEvent('restaurant:order_settled', { order }, 'dashboard:updates');
    
    new ApiResponse(200, { order }, 'Order ticket settled and paid successfully').send(res);
  }),

  getMenu: asyncWrapper(async (req, res) => {
    const menu = await Product.find({ category: 'RESTAURANT' });
    new ApiResponse(200, menu, 'Menu fetched successfully').send(res);
  }),

  createMenuItem: asyncWrapper(async (req, res) => {
    const product = await Product.create({ ...req.body, category: 'RESTAURANT' });
    new ApiResponse(201, product, 'Menu item created successfully').send(res);
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

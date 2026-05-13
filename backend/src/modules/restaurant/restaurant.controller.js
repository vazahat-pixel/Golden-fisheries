import { restaurantService } from './restaurant.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

export const restaurantController = {
  create: asyncWrapper(async (req, res) => {
    const order = await restaurantService.createOrder(req.body, req.user.id);
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
    new ApiResponse(200, { order }, 'Order ticket settled and paid successfully').send(res);
  })
};

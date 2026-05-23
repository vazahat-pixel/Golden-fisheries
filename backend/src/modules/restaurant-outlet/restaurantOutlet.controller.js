import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { restaurantOutletService } from './restaurantOutlet.service.js';

export const restaurantOutletController = {
  list: asyncWrapper(async (req, res) => {
    const result = await restaurantOutletService.list(req.query);
    new ApiResponse(200, result.docs, 'Restaurant outlets fetched', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const outlet = await restaurantOutletService.getById(req.params.id);
    new ApiResponse(200, { outlet }, 'Restaurant outlet retrieved').send(res);
  }),

  create: asyncWrapper(async (req, res) => {
    const outlet = await restaurantOutletService.create(req.body, req.user.id);
    new ApiResponse(201, { outlet }, 'Restaurant registered successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const outlet = await restaurantOutletService.update(req.params.id, req.body);
    new ApiResponse(200, { outlet }, 'Restaurant outlet updated').send(res);
  }),
};

export default restaurantOutletController;

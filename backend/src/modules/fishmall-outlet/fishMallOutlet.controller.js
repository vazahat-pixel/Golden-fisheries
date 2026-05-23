import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { fishMallOutletService } from './fishMallOutlet.service.js';

export const fishMallOutletController = {
  list: asyncWrapper(async (req, res) => {
    const result = await fishMallOutletService.list(req.query);
    new ApiResponse(200, result.docs, 'Fish Mall outlets fetched', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const outlet = await fishMallOutletService.getById(req.params.id);
    new ApiResponse(200, { outlet }, 'Fish Mall outlet retrieved').send(res);
  }),

  create: asyncWrapper(async (req, res) => {
    const outlet = await fishMallOutletService.create(req.body, req.user.id);
    new ApiResponse(201, { outlet }, 'Fish Mall registered successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const outlet = await fishMallOutletService.update(req.params.id, req.body);
    new ApiResponse(200, { outlet }, 'Fish Mall outlet updated').send(res);
  }),
};

export default fishMallOutletController;

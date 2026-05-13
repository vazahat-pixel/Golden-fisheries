import { fishmallService } from './fishmall.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

export const fishmallController = {
  create: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.createSale(req.body, req.user.id);
    new ApiResponse(201, { sale }, 'Retail POS sale recorded successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await fishmallService.findSalesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Retail sales fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.findById(req.params.id);
    new ApiResponse(200, { sale }, 'Retail sale retrieved successfully').send(res);
  })
};

const router = Router();

router.use(protect);

router.post(
  '/create',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.FISHMALL),
  fishmallController.create
);

router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.FISHMALL),
  fishmallController.all
);

router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.FISHMALL),
  fishmallController.getById
);

export default router;

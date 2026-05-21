import { fishmallService } from './fishmall.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import {
  protect,
  restrictTo,
  requireWeb,
  requireBusinessUnit,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import {
  FISHMALL_ALL,
  FISHMALL_MANAGER_ROLES,
} from '../../constants/roleGroups.js';
import { broadcastEvent } from '../../sockets/socket.js';

export const fishmallController = {
  create: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.createSale(req.body, req.user.id);
    broadcastEvent('fishmall:sale_created', { sale }, 'dashboard:updates');
    new ApiResponse(201, { sale }, 'Retail POS sale recorded successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await fishmallService.findSalesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Retail sales fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.findById(req.params.id);
    new ApiResponse(200, { sale }, 'Retail sale retrieved successfully').send(res);
  }),
};

const router = Router();
const web = [protect, requireWeb, requireBusinessUnit('FISHMALL'), enforcePlatformPolicy, blockMobileWrite];

router.post('/create', ...web, restrictTo(...FISHMALL_ALL), fishmallController.create);
router.get('/all', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.all);
router.get('/:id', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.getById);

export default router;

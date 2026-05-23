import { Router } from 'express';
import { restaurantOutletController } from './restaurantOutlet.controller.js';
import { restaurantOutletValidators } from '../../validators/restaurantOutlet.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, PROCUREMENT, REST_MANAGER_ROLES } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const adminWrite = [...web, restrictTo(...WEB_ERP)];
const readAll = [...web, restrictTo(...WEB_ERP, ...PROCUREMENT, ...REST_MANAGER_ROLES)];

router.get('/', ...readAll, restaurantOutletController.list);
router.get('/:id', ...readAll, restaurantOutletController.getById);
router.post(
  '/',
  ...adminWrite,
  validateBody(restaurantOutletValidators.create),
  restaurantOutletController.create
);
router.patch(
  '/:id',
  ...adminWrite,
  validateBody(restaurantOutletValidators.update),
  restaurantOutletController.update
);

export default router;

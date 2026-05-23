import { Router } from 'express';
import { fishMallOutletController } from './fishMallOutlet.controller.js';
import { fishMallOutletValidators } from '../../validators/fishMallOutlet.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, PROCUREMENT, FISHMALL_MANAGER_ROLES } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const adminWrite = [...web, restrictTo(...WEB_ERP)];
const readAll = [...web, restrictTo(...WEB_ERP, ...PROCUREMENT, ...FISHMALL_MANAGER_ROLES)];

router.get('/', ...readAll, fishMallOutletController.list);
router.get('/:id', ...readAll, fishMallOutletController.getById);
router.post(
  '/',
  ...adminWrite,
  validateBody(fishMallOutletValidators.create),
  fishMallOutletController.create
);
router.patch(
  '/:id',
  ...adminWrite,
  validateBody(fishMallOutletValidators.update),
  fishMallOutletController.update
);

export default router;

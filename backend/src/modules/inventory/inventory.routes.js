import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { inventoryValidators } from '../../validators/inventory.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, FISHMALL_MANAGER_ROLES } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.get('/', ...web, restrictTo(...WEB_ERP, ...FISHMALL_MANAGER_ROLES), inventoryController.getLiveStock);
router.get(
  '/transactions',
  ...web,
  restrictTo(...WEB_ERP, ...FISHMALL_MANAGER_ROLES),
  inventoryController.getTransactionHistory
);
router.post(
  '/adjust',
  ...web,
  restrictTo(...WEB_ERP),
  validateBody(inventoryValidators.adjust),
  inventoryController.adjustStock
);

export default router;

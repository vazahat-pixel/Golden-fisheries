import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { inventoryValidators } from '../../validators/inventory.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Secure all endpoints
router.use(protect);

// 1. Fetch current live stock levels of products (Readable by all authorized panel users)
router.get(
  '/',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.FISHMALL, ROLES.RESTAURANT),
  inventoryController.getLiveStock
);

// 2. Fetch auditable historical transaction ledger movements
router.get(
  '/transactions',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  inventoryController.getTransactionHistory
);

// 3. Admin executes manual stock calibrations
router.post(
  '/adjust',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validateBody(inventoryValidators.adjust),
  inventoryController.adjustStock
);

export default router;

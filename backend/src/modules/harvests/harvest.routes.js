import { Router } from 'express';
import { harvestController } from './harvest.controller.js';
import { harvestValidators } from '../../validators/harvest.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Protect all routes under the harvest engine
router.use(protect);

// 1. Create a new Harvest Slip (Allowed for Admin & Logistics Manager roles)
router.post(
  '/create',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validateBody(harvestValidators.create),
  harvestController.create
);

// 2. Fetch all Harvest Slips with filters, paging, and searching
router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  harvestController.all
);

// 3. Retrieve a single Harvest Slip by ID
router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  harvestController.getById
);

// 4. Update an existing Harvest Slip
router.put(
  '/update/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validateBody(harvestValidators.update),
  harvestController.update
);

// 5. Update the lifecycle status of a Harvest Slip
router.patch(
  '/status/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validateBody(harvestValidators.patchStatus),
  harvestController.patchStatus
);

// 6. Convert a Confirmed Harvest Slip into an active Purchase Tapal Contract
router.post(
  '/convert-to-tapal/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  harvestController.convertToTapal
);

export default router;

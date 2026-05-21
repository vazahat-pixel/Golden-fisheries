import { Router } from 'express';
import { harvestController } from './harvest.controller.js';
import { harvestValidators } from '../../validators/harvest.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireMobile,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { PROCUREMENT, WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const mobile = [protect, requireMobile, enforcePlatformPolicy, blockMobileWrite];
const webRead = [protect, requireWeb, enforcePlatformPolicy];

router.use(protect);

router.post(
  '/create',
  ...mobile,
  restrictTo(...PROCUREMENT),
  validateBody(harvestValidators.create),
  harvestController.create
);

router.get('/all', ...webRead, restrictTo(...WEB_ERP), harvestController.all);
router.get('/:id', ...webRead, restrictTo(...WEB_ERP), harvestController.getById);

router.put(
  '/update/:id',
  ...mobile,
  restrictTo(...PROCUREMENT),
  validateBody(harvestValidators.update),
  harvestController.update
);

router.patch(
  '/status/:id',
  ...mobile,
  restrictTo(...PROCUREMENT),
  validateBody(harvestValidators.patchStatus),
  harvestController.patchStatus
);

/** Farmer approval from web ERP (SUPER_ADMIN) — client office workflow */
router.patch(
  '/reject/:id',
  ...mobile,
  restrictTo(...PROCUREMENT),
  validateBody(harvestValidators.reject),
  harvestController.reject
);

router.patch(
  '/approve/:id',
  ...webRead,
  restrictTo(...WEB_ERP),
  validateBody(harvestValidators.approveStatus),
  harvestController.patchStatus
);

router.post(
  '/convert-to-tapal/:id',
  ...mobile,
  restrictTo(...PROCUREMENT),
  harvestController.convertToTapal
);

router.post(
  '/net-rate/:id',
  ...mobile,
  restrictTo(...PROCUREMENT),
  harvestController.saveNetRate
);

export default router;

import { Router } from 'express';
import { tripController } from './trip.controller.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, DISPATCH_ROLES } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const dispatch = [protect, enforcePlatformPolicy, blockMobileWrite];

router.post('/create', ...web, restrictTo(...DISPATCH_ROLES), tripController.create);
router.get('/planned', ...web, restrictTo(...WEB_ERP, ...DISPATCH_ROLES), tripController.planned);
router.get('/:id', protect, enforcePlatformPolicy, restrictTo(...WEB_ERP, ...DISPATCH_ROLES), tripController.getById);
router.patch('/assign-driver', ...dispatch, restrictTo(...DISPATCH_ROLES), tripController.assignDriver);

export default router;

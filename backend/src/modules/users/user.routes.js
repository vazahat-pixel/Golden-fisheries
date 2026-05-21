import { Router } from 'express';
import { userController } from './user.service.js';
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

router.use(...web);

router.get('/drivers', restrictTo(...DISPATCH_ROLES), userController.drivers);
router.get('/all', restrictTo(...WEB_ERP), userController.all);
router.put('/update/:id', restrictTo(...WEB_ERP), userController.update);
router.delete('/:id', restrictTo(...WEB_ERP), userController.delete);

export default router;

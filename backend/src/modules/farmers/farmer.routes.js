import { Router } from 'express';
import { farmerController } from './farmer.service.js';
import {
  protect,
  restrictTo,
  requireMobile,
  requireWeb,
  enforcePlatformPolicy,
} from '../../middleware/auth.middleware.js';
import { PROCUREMENT, WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const mobile = [protect, requireMobile, enforcePlatformPolicy];
const webRead = [protect, requireWeb, enforcePlatformPolicy];

router.post('/create', ...mobile, restrictTo(...PROCUREMENT), farmerController.create);
router.get('/all', ...webRead, restrictTo(...WEB_ERP, ...PROCUREMENT), farmerController.all);
router.get('/:id', ...webRead, restrictTo(...WEB_ERP, ...PROCUREMENT), farmerController.getById);
router.put('/update/:id', ...mobile, restrictTo(...PROCUREMENT), farmerController.update);
router.delete('/:id', ...mobile, restrictTo(...WEB_ERP), farmerController.delete);

export default router;

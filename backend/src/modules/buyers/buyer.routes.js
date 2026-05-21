import { Router } from 'express';
import { buyerController } from './buyer.service.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.post('/create', ...web, restrictTo(...WEB_ERP), buyerController.create);
router.get('/all', ...web, restrictTo(...WEB_ERP), buyerController.all);
router.get('/:id', ...web, restrictTo(...WEB_ERP), buyerController.getById);
router.put('/update/:id', ...web, restrictTo(...WEB_ERP), buyerController.update);
router.delete('/:id', ...web, restrictTo(...WEB_ERP), buyerController.delete);

export default router;

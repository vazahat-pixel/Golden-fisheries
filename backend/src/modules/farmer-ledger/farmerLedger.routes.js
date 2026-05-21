import { Router } from 'express';
import { farmerLedgerController } from './farmerLedger.controller.js';
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

router.get('/summary', ...webRead, restrictTo(...WEB_ERP, ...PROCUREMENT), farmerLedgerController.summary);
router.get('/:farmerId', ...webRead, restrictTo(...WEB_ERP, ...PROCUREMENT), farmerLedgerController.getLedger);
router.post('/payment', ...mobile, restrictTo(...PROCUREMENT), farmerLedgerController.createPayment);

export default router;

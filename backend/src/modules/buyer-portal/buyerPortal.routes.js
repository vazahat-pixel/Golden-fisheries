import { Router } from 'express';
import { buyerPortalController } from './buyerPortal.controller.js';
import {
  protect,
  restrictTo,
  requireMobile,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { BUYER_ROLES, WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const mobile = [protect, requireMobile, enforcePlatformPolicy];
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.get('/assigned-tapals', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.assignedTapals);
router.post('/verify/:tapalId', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.submitVerification);
router.post('/bill/:tapalId', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.createBill);
router.get('/bills', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.listBills);
router.post('/return', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.createReturn);
router.get('/returns', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.listReturns);
router.get('/reconciliation', ...mobile, restrictTo(...BUYER_ROLES), buyerPortalController.reconciliation);

router.patch(
  '/return/:id/approve',
  ...web,
  restrictTo(...WEB_ERP),
  buyerPortalController.approveReturn
);

router.get(
  '/admin/returns',
  ...web,
  restrictTo(...WEB_ERP),
  buyerPortalController.adminReturns
);

export default router;

import { Router } from 'express';
import { billingController } from './billing.controller.js';
import { billingValidators } from '../../validators/billing.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();

router.get('/public/:id', billingController.getById);
router.patch('/public/payment/:id', billingController.patchPaymentPublic);

const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];

router.post(
  '/create',
  ...web,
  restrictTo(...WEB_ERP),
  validateBody(billingValidators.create),
  billingController.create
);

router.get('/all', ...web, restrictTo(...WEB_ERP), billingController.all);

router.patch(
  '/payment-status/:id',
  ...web,
  restrictTo(...WEB_ERP),
  validateBody(billingValidators.payment),
  billingController.patchPayment
);

router.get('/:id', ...web, restrictTo(...WEB_ERP), billingController.getById);

export default router;

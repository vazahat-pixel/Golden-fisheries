import { Router } from 'express';
import { billingController } from './billing.controller.js';
import { billingValidators } from '../../validators/billing.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Secure all endpoints
router.use(protect);

// 1. Create a new Billing Invoice (Procurement purchase bills or customer Sales bills)
router.post(
  '/create',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  validateBody(billingValidators.create),
  billingController.create
);

// 2. Fetch all Billing Invoices with filters and page cursor limits
router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  billingController.all
);

// 3. Record a payment installment on an Invoice
router.patch(
  '/payment-status/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  validateBody(billingValidators.payment),
  billingController.patchPayment
);

// 4. Retrieve details of a single Invoice by ID
router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  billingController.getById
);

export default router;

import { Router } from 'express';
import { tapalController } from './tapal.controller.js';
import { tapalValidators } from '../../validators/tapal.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import {
  protect,
  restrictTo,
  requireWeb,
  requireMobile,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import {
  WEB_ERP,
  DISPATCH_ROLES,
  PROCUREMENT,
  BUYER_ROLES,
  DRIVER_ROLES,
} from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite];
const mobile = [protect, requireMobile, enforcePlatformPolicy, blockMobileWrite];
/** Assign driver: buyer + procurement on phone, super admin on web */
const dispatch = [protect, enforcePlatformPolicy, blockMobileWrite];

router.use(protect);

/** Removed from client workflow — explicit block (do not use as /:id) */
router.patch('/reject-trip', (req, res) => {
  return res.status(410).json({
    success: false,
    message: 'Trip reject has been removed from the driver workflow.',
    data: null,
  });
});

// Procurement: Tapal from Harvest only
router.post(
  '/create-from-harvest',
  ...mobile,
  restrictTo(...PROCUREMENT),
  tapalController.createFromHarvest
);

// Web ERP monitoring
router.get('/all', ...web, restrictTo(...WEB_ERP), tapalController.all);
router.get('/trips/all', ...web, restrictTo(...WEB_ERP), tapalController.allTrips);

// Driver lifecycle (mobile only) — Assigned → Start → Pickup → Deliver → Expense → End
router.get('/my-trips', ...mobile, restrictTo(...DRIVER_ROLES, ...WEB_ERP), tapalController.myTrips);
router.patch('/start-trip', ...mobile, restrictTo(...DRIVER_ROLES, ...WEB_ERP), tapalController.startTrip);
router.patch(
  '/pickup',
  ...mobile,
  restrictTo(...DRIVER_ROLES, ...WEB_ERP),
  validateBody(tapalValidators.pickup),
  tapalController.pickup
);
router.patch(
  '/deliver',
  ...mobile,
  restrictTo(...DRIVER_ROLES, ...WEB_ERP),
  validateBody(tapalValidators.deliver),
  tapalController.deliver
);
router.post(
  '/expense',
  ...mobile,
  restrictTo(...DRIVER_ROLES, ...WEB_ERP),
  validateBody(tapalValidators.logExpense),
  tapalController.logExpense
);
router.post(
  '/trip/:tripId/post-trip-expense',
  ...mobile,
  restrictTo(...DRIVER_ROLES, ...WEB_ERP),
  tapalController.submitPostTripExpense
);

// Web: assign driver, end trip, expense review
router.patch(
  '/assign-driver',
  ...dispatch,
  restrictTo(...DISPATCH_ROLES),
  validateBody(tapalValidators.assignDriver),
  tapalController.assignDriver
);
router.patch('/end-trip', ...web, restrictTo(...WEB_ERP), tapalController.endTrip);
router.patch(
  '/trip/:tripId/post-trip-expense/review',
  ...web,
  restrictTo(...WEB_ERP),
  tapalController.reviewPostTripExpense
);
router.patch(
  '/trip/:tripId/post-trip-expense/confirm-payment',
  ...web,
  restrictTo(...WEB_ERP),
  tapalController.confirmPostTripPayment
);

// Buyer read (mobile)
router.get('/my-buyer-trips', ...mobile, restrictTo(...BUYER_ROLES), tapalController.myBuyerTrips);

router.get(
  '/trip/:id',
  protect,
  enforcePlatformPolicy,
  restrictTo(...WEB_ERP, ...PROCUREMENT, ...BUYER_ROLES, ...DRIVER_ROLES),
  tapalController.getTripById
);

router.get(
  '/:id',
  protect,
  enforcePlatformPolicy,
  restrictTo(...WEB_ERP, ...PROCUREMENT, ...BUYER_ROLES),
  tapalController.getById
);

router.patch(
  '/:id',
  ...web,
  restrictTo(...WEB_ERP, ...PROCUREMENT),
  tapalController.update
);

router.post(
  '/return',
  ...web,
  restrictTo(...WEB_ERP, ...PROCUREMENT),
  tapalController.returnTapal
);

export default router;

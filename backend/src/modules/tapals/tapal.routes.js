import { Router } from 'express';
import { tapalController } from './tapal.controller.js';
import { tapalValidators } from '../../validators/tapal.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

// Gated behind authentication
router.use(protect);

// 1. Create Tapal from Harvest Slip
router.post(
  '/create-from-harvest',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.PROCUREMENT_MANAGER),
  tapalController.createFromHarvest
);

// 2. Fetch all Tapal Contracts
router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.PROCUREMENT_MANAGER, ROLES.BUYER),
  tapalController.all
);

// 2.1 Fetch all Trips
router.get(
  '/trips/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.PROCUREMENT_MANAGER, ROLES.BUYER),
  tapalController.allTrips
);

// 2.2 Driver fetches ONLY their own assigned trips (scoped by JWT identity)
router.get(
  '/my-trips',
  restrictTo(ROLES.DRIVER),
  tapalController.myTrips
);

// 3. Assign Driver & Vehicle to Tapal (Launches active trip)
router.patch(
  '/assign-driver',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validateBody(tapalValidators.assignDriver),
  tapalController.assignDriver
);

// 4. Driver starts the trip
router.patch(
  '/start-trip',
  restrictTo(ROLES.DRIVER),
  tapalController.startTrip
);

// 5. Driver records scale weight at pickup
router.patch(
  '/pickup',
  restrictTo(ROLES.DRIVER),
  validateBody(tapalValidators.pickup),
  tapalController.pickup
);

// 6. Driver records scale weight at delivery with proof
router.patch(
  '/deliver',
  restrictTo(ROLES.DRIVER),
  validateBody(tapalValidators.deliver),
  tapalController.deliver
);

// 7. Admin/Accountant verifies cargo weights, closes trip, and triggers inventory reconciliation
router.patch(
  '/end-trip',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  tapalController.endTrip
);

// 8. Driver logs trip expenses (Fuel, Toll, etc.)
router.post(
  '/expense',
  restrictTo(ROLES.DRIVER),
  validateBody(tapalValidators.logExpense),
  tapalController.logExpense
);

// 8.1 Driver submits post-trip expenses form
router.post(
  '/trip/:tripId/post-trip-expense',
  restrictTo(ROLES.DRIVER),
  tapalController.submitPostTripExpense
);

// 8.2 Admin/Accountant reviews post-trip expenses
router.patch(
  '/trip/:tripId/post-trip-expense/review',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT),
  tapalController.reviewPostTripExpense
);

// 9. Fetch active Trip details
router.get(
  '/trip/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.DRIVER, ROLES.BUYER, ROLES.PROCUREMENT_MANAGER),
  tapalController.getTripById
);

// 10. Fetch single Tapal details
router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.PROCUREMENT_MANAGER, ROLES.BUYER),
  tapalController.getById
);

export default router;

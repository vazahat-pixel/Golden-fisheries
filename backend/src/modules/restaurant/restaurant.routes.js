import { Router } from 'express';
import { restaurantController } from './restaurant.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

const router = Router();

router.use(protect);

router.post(
  '/create',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.RESTAURANT),
  restaurantController.create
);

router.get(
  '/all',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.RESTAURANT),
  restaurantController.all
);

router.get(
  '/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT, ROLES.RESTAURANT),
  restaurantController.getById
);

router.patch(
  '/settle/:id',
  restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.RESTAURANT),
  restaurantController.settle
);

export default router;

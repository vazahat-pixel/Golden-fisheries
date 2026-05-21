import { Router } from 'express';
import { restaurantController } from './restaurant.controller.js';
import {
  protect,
  restrictTo,
  requireWeb,
  requireBusinessUnit,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import {
  REST_ALL,
  REST_MANAGER_ROLES,
  REST_CASHIER_ROLES,
} from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, requireBusinessUnit('REST'), enforcePlatformPolicy, blockMobileWrite];

router.post('/create', ...web, restrictTo(...REST_ALL), restaurantController.create);
router.get('/all', ...web, restrictTo(...REST_ALL), restaurantController.all);
router.get('/:id', ...web, restrictTo(...REST_ALL), restaurantController.getById);
router.patch('/settle/:id', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.settle);
router.get('/menu', ...web, restrictTo(...REST_ALL), restaurantController.getMenu);
router.get('/tables', ...web, restrictTo(...REST_ALL), restaurantController.getTables);
router.post('/menu', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.createMenuItem);

export default router;

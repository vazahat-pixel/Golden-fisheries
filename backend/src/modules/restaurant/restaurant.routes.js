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

router.get('/inventory/summary', ...web, restrictTo(...REST_ALL), restaurantController.inventorySummary);
router.get('/inventory/logs', ...web, restrictTo(...REST_ALL), restaurantController.inventoryLogs);
router.get('/inventory', ...web, restrictTo(...REST_ALL), restaurantController.listInventory);
router.patch('/inventory/:id/adjust', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.adjustInventory);
router.get('/menu', ...web, restrictTo(...REST_ALL), restaurantController.getMenu);
router.get('/tables', ...web, restrictTo(...REST_ALL), restaurantController.getTables);
router.post('/menu', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.createMenuItem);
router.post('/create', ...web, restrictTo(...REST_ALL), restaurantController.create);
router.get('/all', ...web, restrictTo(...REST_ALL), restaurantController.all);
router.patch('/settle/:id', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.settle);
router.get('/:id', ...web, restrictTo(...REST_ALL), restaurantController.getById);

export default router;

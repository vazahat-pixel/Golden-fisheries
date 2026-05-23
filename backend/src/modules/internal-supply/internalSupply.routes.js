import { Router } from 'express';
import { internalSupplyController } from './internalSupply.controller.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

const router = Router();
const web = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP)];

router.get('/bills', ...web, internalSupplyController.listBills);
router.get('/bills/:id', ...web, internalSupplyController.getBill);
router.get('/summary', ...web, internalSupplyController.summary);
router.get('/reports/fishmall-sales', ...web, internalSupplyController.fishMallSalesReport);
router.get('/reports/restaurant-receives', ...web, internalSupplyController.restaurantReceiveReport);
router.get('/reports/movements', ...web, internalSupplyController.movementReport);
router.get('/reports/daily', ...web, internalSupplyController.dailyTransferSummary);

export default router;

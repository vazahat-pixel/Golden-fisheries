import { Router } from 'express';
import { internalSupplyController } from './internalSupply.controller.js';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP, REST_ALL, REST_MANAGER_ROLES, FISHMALL_ALL } from '../../constants/roleGroups.js';

const router = Router();
const webAdmin = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP)];
const webAll = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP, ...REST_ALL, ...FISHMALL_ALL)];
const webRest = [protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP, ...REST_MANAGER_ROLES)];

router.get('/bills', ...webAll, internalSupplyController.listBills);
router.get('/bills/:id', ...webAll, internalSupplyController.getBill);
router.post('/bills/:id/accept', ...webRest, internalSupplyController.acceptBill);

router.get('/summary', ...webAdmin, internalSupplyController.summary);
router.get('/reports/fishmall-sales', ...webAdmin, internalSupplyController.fishMallSalesReport);
router.get('/reports/restaurant-receives', ...webAdmin, internalSupplyController.restaurantReceiveReport);
router.get('/reports/movements', ...webAdmin, internalSupplyController.movementReport);
router.get('/reports/daily', ...webAdmin, internalSupplyController.dailyTransferSummary);

export default router;


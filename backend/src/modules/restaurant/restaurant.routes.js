import { Router } from 'express';
import { restaurantController } from './restaurant.controller.js';
import { restaurantValidators } from '../../validators/restaurant.validator.js';
import { validateBody } from '../../validators/auth.validator.js';
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
} from '../../constants/roleGroups.js';
import { internalSupplyController } from '../internal-supply/internalSupply.controller.js';

const router = Router();
const web = [protect, requireWeb, requireBusinessUnit('REST'), enforcePlatformPolicy, blockMobileWrite];

router.get('/inventory/summary', ...web, restrictTo(...REST_ALL), restaurantController.inventorySummary);
router.get('/inventory/logs', ...web, restrictTo(...REST_ALL), restaurantController.inventoryLogs);
router.get('/inventory', ...web, restrictTo(...REST_ALL), restaurantController.listInventory);
router.patch(
  '/inventory/:id/adjust',
  ...web,
  restrictTo(...REST_MANAGER_ROLES),
  restaurantController.adjustInventory
);
router.post(
  '/inventory/wastage',
  ...web,
  restrictTo(...REST_MANAGER_ROLES),
  validateBody(restaurantValidators.wastage),
  restaurantController.recordWastage
);

router.get('/menu', ...web, restrictTo(...REST_ALL), restaurantController.getMenu);
router.get('/menu/catalog', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.listMenuAdmin);
router.post(
  '/menu',
  ...web,
  restrictTo(...REST_MANAGER_ROLES),
  validateBody(restaurantValidators.createMenu),
  restaurantController.createMenuItem
);
router.patch('/menu/:id', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.updateMenuItem);
router.delete('/menu/:id', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.deleteMenuItem);

router.get('/tables', ...web, restrictTo(...REST_ALL), restaurantController.getTables);
router.get('/tables/order', ...web, restrictTo(...REST_ALL), restaurantController.getTableOrder);
router.post('/tables/merge', ...web, restrictTo(...REST_ALL), restaurantController.mergeTables);

// Restaurant's own name/address/GSTIN — printed on every bill
router.get('/outlet-settings', ...web, restrictTo(...REST_ALL), restaurantController.getOutletSettings);
router.patch(
  '/outlet-settings',
  ...web,
  restrictTo(...REST_MANAGER_ROLES),
  restaurantController.updateOutletSettings
);

router.get(
  '/kitchen-tickets',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.listKitchenTickets
);
router.post(
  '/kitchen-tickets',
  ...web,
  restrictTo(...REST_ALL),
  validateBody(restaurantValidators.kitchenTicket),
  restaurantController.createKitchenTicket
);
router.get(
  '/kitchen-tickets/:id',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.getKitchenTicket
);
router.patch(
  '/kitchen-tickets/:ticketId/lines/:lineId/advance',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.advanceKitchenLine
);
router.patch(
  '/kitchen-tickets/:ticketId/lines/:lineId',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.updateKitchenLine
);
router.patch(
  '/kitchen-tickets/:id/cancel',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.cancelKitchenTicket
);
router.patch(
  '/kitchen-tickets/:ticketId/lines/:lineId/void',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.voidKitchenLine
);

router.get('/reports/daily-sales', ...web, restrictTo(...REST_ALL), restaurantController.reportDailySales);
router.get('/reports/item-sales', ...web, restrictTo(...REST_ALL), restaurantController.reportItemSales);
router.get('/reports/dish-history', ...web, restrictTo(...REST_ALL), restaurantController.reportDishHistory);
router.get('/reports/consumption', ...web, restrictTo(...REST_ALL), restaurantController.reportConsumption);
router.get('/reports/wastage', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.reportWastage);
router.get('/reports/tables', ...web, restrictTo(...REST_ALL), restaurantController.reportTables);
router.get('/reports/profit', ...web, restrictTo(...REST_MANAGER_ROLES), restaurantController.reportProfit);

// --- Shift Sessions & Accounting Routes ---
router.get('/accounting/session/active', ...web, restrictTo(...REST_ALL), restaurantController.activeSession);
router.post('/accounting/session/open', ...web, restrictTo(...REST_ALL), restaurantController.openSession);
router.post('/accounting/session/close', ...web, restrictTo(...REST_ALL), restaurantController.closeSession);
router.get('/accounting/session/summary', ...web, restrictTo(...REST_ALL), restaurantController.sessionSummary);
router.post('/accounting/expenses', ...web, restrictTo(...REST_ALL), restaurantController.recordExpense);
router.get('/accounting/expenses', ...web, restrictTo(...REST_ALL), restaurantController.listExpenses);
router.get('/accounting/cashbook', ...web, restrictTo(...REST_ALL), restaurantController.listCashbook);

router.post(
  '/create',
  ...web,
  restrictTo(...REST_ALL),
  validateBody(restaurantValidators.createOrder),
  restaurantController.create
);
router.get('/all', ...web, restrictTo(...REST_ALL), restaurantController.all);
router.patch(
  '/settle/:id',
  ...web,
  restrictTo(...REST_ALL),
  validateBody(restaurantValidators.settle),
  restaurantController.settle
);
router.patch('/:id/status', ...web, restrictTo(...REST_ALL), restaurantController.updateStatus);
router.delete(
  '/:orderId/items/:itemId',
  ...web,
  restrictTo(...REST_ALL),
  restaurantController.removeOrderItem
);
router.patch(
  '/:id/void',
  ...web,
  restrictTo(...REST_MANAGER_ROLES),
  restaurantController.voidOrder
);

router.get(
  '/internal-supplies/reports/receives',
  ...web,
  restrictTo(...REST_ALL),
  internalSupplyController.restaurantReceiveReport
);
router.get(
  '/internal-supplies/reports/daily',
  ...web,
  restrictTo(...REST_ALL),
  internalSupplyController.dailyTransferSummary
);
router.get(
  '/internal-supplies',
  ...web,
  restrictTo(...REST_ALL),
  internalSupplyController.listBills
);
router.get(
  '/internal-supplies/:id',
  ...web,
  restrictTo(...REST_ALL),
  internalSupplyController.getBill
);

router.get('/:id', ...web, restrictTo(...REST_ALL), restaurantController.getById);

export default router;

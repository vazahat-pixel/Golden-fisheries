import { fishmallService } from './fishmall.service.js';
import { fishMallInventoryService } from './fishMallInventory.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import {
  protect,
  restrictTo,
  requireWeb,
  requireBusinessUnit,
  resolveFishMallOutlet,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import {
  FISHMALL_ALL,
  FISHMALL_MANAGER_ROLES,
} from '../../constants/roleGroups.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { internalSupplyController } from '../internal-supply/internalSupply.controller.js';
import { internalSupplyValidators } from '../../validators/internalSupply.validator.js';
import { validateBody } from '../../validators/auth.validator.js';

export const fishmallController = {
  create: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.createSale(req.body, req.user.id);
    broadcastEvent('fishmall:sale_created', { sale }, 'dashboard:updates');
    new ApiResponse(201, { sale }, 'Retail POS sale recorded successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await fishmallService.findSalesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Retail sales fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const sale = await fishmallService.findById(req.params.id);
    new ApiResponse(200, { sale }, 'Retail sale retrieved successfully').send(res);
  }),

  listInventory: asyncWrapper(async (req, res) => {
    const result = await fishMallInventoryService.list({
      ...req.query,
      outletId: req.fishMallOutletId,
    });
    new ApiResponse(200, result.docs, 'Fish Mall inventory fetched', result.meta).send(res);
  }),

  createInventoryItem: asyncWrapper(async (req, res) => {
    const item = await fishMallInventoryService.createItem(
      { ...req.body, outletId: req.fishMallOutletId },
      req.user.id
    );
    new ApiResponse(201, item, 'Fish Mall inventory item created').send(res);
  }),

  updateInventoryItem: asyncWrapper(async (req, res) => {
    const item = await fishMallInventoryService.updateItem(req.params.id, req.body);
    new ApiResponse(200, item, 'Fish Mall inventory updated').send(res);
  }),

  adjustInventory: asyncWrapper(async (req, res) => {
    const { quantityChange, remarks } = req.body;
    const item = await fishMallInventoryService.adjustItem(
      req.params.id,
      quantityChange,
      req.user.id,
      remarks
    );
    new ApiResponse(200, item, 'Fish Mall stock adjusted').send(res);
  }),

  inventorySummary: asyncWrapper(async (req, res) => {
    const summary = await fishMallInventoryService.getSummary();
    new ApiResponse(200, summary, 'Fish Mall inventory summary').send(res);
  }),

  inventoryLogs: asyncWrapper(async (req, res) => {
    const logs = await fishMallInventoryService.getLogs(req.query);
    new ApiResponse(200, logs, 'Fish Mall inventory logs').send(res);
  }),

  dailyPnL: asyncWrapper(async (req, res) => {
    const pnl = await fishMallInventoryService.getDailyPnL(req.query.date);
    new ApiResponse(200, pnl, 'Fish Mall daily P&L').send(res);
  }),

  recordClosing: asyncWrapper(async (req, res) => {
    const closing = await fishMallInventoryService.recordDailyClosing(req.body, req.user.id);
    new ApiResponse(201, closing, 'Daily closing recorded').send(res);
  }),
};

const router = Router();
const web = [
  protect,
  requireWeb,
  requireBusinessUnit('FISHMALL'),
  resolveFishMallOutlet,
  enforcePlatformPolicy,
  blockMobileWrite,
];

router.get('/inventory/summary', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.inventorySummary);
router.get('/inventory/logs', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.inventoryLogs);
router.get('/inventory/daily-pnl', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.dailyPnL);
router.post('/inventory/closing', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.recordClosing);
router.get('/inventory', ...web, restrictTo(...FISHMALL_ALL), fishmallController.listInventory);
router.post('/inventory', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.createInventoryItem);
router.patch('/inventory/:id', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.updateInventoryItem);
router.patch('/inventory/:id/adjust', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.adjustInventory);
router.post(
  '/internal-bill/restaurant',
  ...web,
  restrictTo(...FISHMALL_ALL),
  validateBody(internalSupplyValidators.createRestaurantBill),
  internalSupplyController.createRestaurantBill
);
router.get(
  '/internal-bill',
  ...web,
  restrictTo(...FISHMALL_ALL),
  internalSupplyController.listBills
);
router.get(
  '/internal-bill/reports/summary',
  ...web,
  restrictTo(...FISHMALL_MANAGER_ROLES),
  internalSupplyController.summary
);
router.get(
  '/internal-bill/reports/daily',
  ...web,
  restrictTo(...FISHMALL_MANAGER_ROLES),
  internalSupplyController.dailyTransferSummary
);
router.get(
  '/internal-bill/reports/sales',
  ...web,
  restrictTo(...FISHMALL_MANAGER_ROLES),
  internalSupplyController.fishMallSalesReport
);
router.get(
  '/internal-bill/:id',
  ...web,
  restrictTo(...FISHMALL_ALL),
  internalSupplyController.getBill
);
router.post('/create', ...web, restrictTo(...FISHMALL_ALL), fishmallController.create);
router.get('/all', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.all);
router.get('/:id', ...web, restrictTo(...FISHMALL_MANAGER_ROLES), fishmallController.getById);

export default router;

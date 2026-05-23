import { reportsService } from './reports.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import {
  protect,
  restrictTo,
  requireWeb,
  enforcePlatformPolicy,
  blockMobileWrite,
} from '../../middleware/auth.middleware.js';
import { WEB_ERP } from '../../constants/roleGroups.js';

export const reportsController = {
  // Sales summaries
  getSalesSummary: asyncWrapper(async (req, res) => {
    const data = await reportsService.getSalesSummary();
    new ApiResponse(200, data, 'Sales report summary aggregated successfully').send(res);
  }),

  // Expense summaries
  getExpenseSummary: asyncWrapper(async (req, res) => {
    const data = await reportsService.getExpenseSummary();
    new ApiResponse(200, data, 'Expense report summary aggregated successfully').send(res);
  }),

  // Inventory reserves
  getInventorySummary: asyncWrapper(async (req, res) => {
    const data = await reportsService.getInventorySummary();
    new ApiResponse(200, data, 'Inventory stock level alert reports aggregated successfully').send(res);
  }),

  // P&L metrics
  getProfitSummary: asyncWrapper(async (req, res) => {
    const data = await reportsService.getProfitSummary();
    new ApiResponse(200, data, 'Net profit ledger report aggregated successfully').send(res);
  }),

  // Dashboard stats
  getDashboardStats: asyncWrapper(async (req, res) => {
    const data = await reportsService.getDashboardStats();
    new ApiResponse(200, data, 'Dashboard stats aggregated successfully').send(res);
  }),

  getProcurementLedger: asyncWrapper(async (req, res) => {
    const data = await reportsService.getProcurementStockLedger(req.query);
    new ApiResponse(200, data, 'Procurement stock ledger fetched').send(res);
  }),

  getFishMallLedger: asyncWrapper(async (req, res) => {
    const data = await reportsService.getFishMallStockLedger(req.query);
    new ApiResponse(200, data, 'Fish Mall stock ledger fetched').send(res);
  }),

  getTransferReport: asyncWrapper(async (req, res) => {
    const data = await reportsService.getTransferReport(req.query);
    new ApiResponse(200, data, 'Stock transfer report fetched').send(res);
  }),

  getDailyStockReport: asyncWrapper(async (req, res) => {
    const data = await reportsService.getDailyStockReport(req.query);
    new ApiResponse(200, data, 'Daily stock report fetched').send(res);
  }),
};

const router = Router();

router.use(protect, requireWeb, enforcePlatformPolicy, blockMobileWrite, restrictTo(...WEB_ERP));

router.get('/sales', reportsController.getSalesSummary);
router.get('/expenses', reportsController.getExpenseSummary);
router.get('/inventory', reportsController.getInventorySummary);
router.get('/profitability', reportsController.getProfitSummary);
router.get('/dashboard/stats', reportsController.getDashboardStats);
router.get('/inventory/procurement-ledger', reportsController.getProcurementLedger);
router.get('/inventory/fishmall-ledger', reportsController.getFishMallLedger);
router.get('/inventory/transfers', reportsController.getTransferReport);
router.get('/inventory/daily-stock', reportsController.getDailyStockReport);

export default router;

import { reportsService } from './reports.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { Router } from 'express';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';
import { ROLES } from '../../constants/roles.js';

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
  })
};

const router = Router();

router.use(protect);

// Financial reports are restricted to Admins, Managers, and Accountants
router.use(restrictTo(ROLES.ADMIN, ROLES.MANAGER, ROLES.ACCOUNTANT));

router.get('/sales', reportsController.getSalesSummary);
router.get('/expenses', reportsController.getExpenseSummary);
router.get('/inventory', reportsController.getInventorySummary);
router.get('/profitability', reportsController.getProfitSummary);

export default router;

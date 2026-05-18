import { apiClient } from './apiClient';

export const reportsService = {
  // 1. Fetch Sales Summary
  getSales: async () => {
    return await apiClient.get('/reports/sales');
  },

  // 2. Fetch Expense Summary
  getExpenses: async () => {
    return await apiClient.get('/reports/expenses');
  },

  // 3. Fetch Inventory Summary
  getInventory: async () => {
    return await apiClient.get('/reports/inventory');
  },

  // 4. Fetch Profitability (P&L) Summary
  getProfitability: async () => {
    return await apiClient.get('/reports/profitability');
  },

  // 5. Fetch Dashboard Stats
  getDashboardStats: async () => {
    return await apiClient.get('/reports/dashboard/stats');
  }
};

export default reportsService;

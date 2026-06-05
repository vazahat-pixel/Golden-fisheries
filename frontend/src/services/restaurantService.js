import { apiClient } from './apiClient';

export const restaurantService = {
  // 1. Fetch all Restaurant Orders
  all: async (params = {}) => {
    return await apiClient.get('/restaurant/all', { params });
  },

  // 2. Create Restaurant Order
  create: async (data) => {
    return await apiClient.post('/restaurant/create', data);
  },

  // 3. Settle Restaurant Order (Payment)
  settle: async (id, paymentData) => {
    return await apiClient.patch(`/restaurant/settle/${id}`, paymentData);
  },

  // 4. Get Order by ID
  getById: async (id) => {
    return await apiClient.get(`/restaurant/${id}`);
  },

  // 5. Get Menu
  getMenu: async () => {
    return await apiClient.get('/restaurant/menu');
  },

  // 6. Get Tables
  getTables: async () => {
    return await apiClient.get('/restaurant/tables');
  },

  getInventory: async (params = {}) => {
    return await apiClient.get('/restaurant/inventory', { params });
  },

  createInventoryItem: async (data) => {
    return await apiClient.post('/restaurant/menu', data);
  },

  adjustInventory: async (id, body) => {
    return await apiClient.patch(`/restaurant/inventory/${id}/adjust`, body);
  },

  getInventorySummary: async () => {
    return await apiClient.get('/restaurant/inventory/summary');
  },

  listInternalSupplies: async (params = {}) => {
    return await apiClient.get('/restaurant/internal-supplies', { params });
  },

  getInternalSupply: async (id) => {
    return await apiClient.get(`/restaurant/internal-supplies/${id}`);
  },

  acceptInternalSupply: async (id, data) => {
    return await apiClient.post(`/internal-supply/bills/${id}/accept`, data);
  },

  getReceiveReport: async (params = {}) => {
    return await apiClient.get('/restaurant/internal-supplies/reports/receives', { params });
  },

  getInternalDailySummary: async (params = {}) => {
    return await apiClient.get('/restaurant/internal-supplies/reports/daily', { params });
  },

  getInventoryLogs: async (params = {}) => {
    return await apiClient.get('/restaurant/inventory/logs', { params });
  },

  createKitchenTicket: async (data) => {
    return await apiClient.post('/restaurant/kitchen-tickets', data);
  },

  listKitchenTickets: async (params = { active: 'true' }) => {
    return await apiClient.get('/restaurant/kitchen-tickets', { params });
  },

  advanceKitchenLine: async (ticketId, lineId) => {
    return await apiClient.patch(`/restaurant/kitchen-tickets/${ticketId}/lines/${lineId}/advance`);
  },

  createMenuItem: async (data) => {
    return await apiClient.post('/restaurant/menu', data);
  },

  updateMenuItem: async (id, data) => {
    return await apiClient.patch(`/restaurant/menu/${id}`, data);
  },

  getMenuCatalog: async () => {
    return await apiClient.get('/restaurant/menu/catalog');
  },

  recordWastage: async (data) => {
    return await apiClient.post('/restaurant/inventory/wastage', data);
  },

  getReportDailySales: async (params) => {
    return await apiClient.get('/restaurant/reports/daily-sales', { params });
  },

  getReportItemSales: async (params) => {
    return await apiClient.get('/restaurant/reports/item-sales', { params });
  },

  getReportConsumption: async (params) => {
    return await apiClient.get('/restaurant/reports/consumption', { params });
  },

  getReportWastage: async (params) => {
    return await apiClient.get('/restaurant/reports/wastage', { params });
  },

  getReportTables: async (params) => {
    return await apiClient.get('/restaurant/reports/tables', { params });
  },

  // --- Shift Sessions & Accounting API Calls ---
  getActiveSession: async () => {
    return await apiClient.get('/restaurant/accounting/session/active');
  },
  openSession: async (data) => {
    return await apiClient.post('/restaurant/accounting/session/open', data);
  },
  closeSession: async (data) => {
    return await apiClient.post('/restaurant/accounting/session/close', data);
  },
  getSessionSummary: async () => {
    return await apiClient.get('/restaurant/accounting/session/summary');
  },
  recordExpense: async (data) => {
    return await apiClient.post('/restaurant/accounting/expenses', data);
  },
  listExpenses: async () => {
    return await apiClient.get('/restaurant/accounting/expenses');
  },
  listCashbook: async () => {
    return await apiClient.get('/restaurant/accounting/cashbook');
  },
};

export default restaurantService;

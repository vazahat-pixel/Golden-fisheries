import { apiClient } from './apiClient';

export const fishmallService = {
  // 1. Fetch all FishMall Sales
  all: async (params = {}) => {
    return await apiClient.get('/fishmall/all', { params });
  },

  // 2. Create FishMall Sale (Retail scale-based)
  create: async (data) => {
    return await apiClient.post('/fishmall/create', data);
  },

  // 3. Get Sale by ID
  getById: async (id) => {
    return await apiClient.get(`/fishmall/${id}`);
  },

  getInventory: async (params = {}) => {
    return await apiClient.get('/fishmall/inventory', { params });
  },

  createInventoryItem: async (data) => {
    return await apiClient.post('/fishmall/inventory', data);
  },

  updateInventoryItem: async (id, data) => {
    return await apiClient.patch(`/fishmall/inventory/${id}`, data);
  },

  adjustInventory: async (id, body) => {
    return await apiClient.patch(`/fishmall/inventory/${id}/adjust`, body);
  },

  getInventorySummary: async () => {
    return await apiClient.get('/fishmall/inventory/summary');
  },

  getDailyPnL: async (params = {}) => {
    return await apiClient.get('/fishmall/inventory/daily-pnl', { params });
  },

  recordClosing: async (data) => {
    return await apiClient.post('/fishmall/inventory/closing', data);
  },

  createInternalBillToRestaurant: async (data) => {
    return await apiClient.post('/fishmall/internal-bill/restaurant', data);
  },

  listInternalBills: async (params = {}) => {
    return await apiClient.get('/fishmall/internal-bill', { params });
  },

  getInternalBill: async (id) => {
    return await apiClient.get(`/fishmall/internal-bill/${id}`);
  },
};

export default fishmallService;

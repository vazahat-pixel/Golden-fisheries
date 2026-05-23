import { apiClient } from './apiClient';

export const stockTransferService = {
  list: async (params = {}) => {
    const res = await apiClient.get('/stock-transfers', { params });
    return res;
  },

  getById: async (id) => {
    const res = await apiClient.get(`/stock-transfers/${id}`);
    return res;
  },

  create: async (payload) => {
    const res = await apiClient.post('/stock-transfers', payload);
    return res;
  },

  approve: async (id, notes = '') => {
    const res = await apiClient.patch(`/stock-transfers/${id}/approve`, { notes });
    return res;
  },

  cancel: async (id, cancelReason) => {
    const res = await apiClient.patch(`/stock-transfers/${id}/cancel`, { cancelReason });
    return res;
  },

  update: async (id, payload) => {
    const res = await apiClient.patch(`/stock-transfers/${id}`, payload);
    return res;
  },
};

export default stockTransferService;

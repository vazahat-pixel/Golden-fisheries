import { apiClient } from './apiClient';

/** Admin ERP — full internal supply visibility */
export const internalSupplyAdminService = {
  listBills: (params) => apiClient.get('/internal-supply/bills', { params }),
  getBill: (id) => apiClient.get(`/internal-supply/bills/${id}`),
  getSummary: (params) => apiClient.get('/internal-supply/summary', { params }),
  getMovementReport: (params) => apiClient.get('/internal-supply/reports/movements', { params }),
  getDailySummary: (params) => apiClient.get('/internal-supply/reports/daily', { params }),
};

export default internalSupplyAdminService;

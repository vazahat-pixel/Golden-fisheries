import { apiClient } from './apiClient';

export const buyerPortalService = {
  getAssignedTapals: async (params = {}) => apiClient.get('/buyer-portal/assigned-tapals', { params }),

  submitVerification: async (tapalId, data) =>
    apiClient.post(`/buyer-portal/verify/${tapalId}`, data),

  createBill: async (tapalId, data) => apiClient.post(`/buyer-portal/bill/${tapalId}`, data),

  listBills: async (params = {}) => apiClient.get('/buyer-portal/bills', { params }),

  createReturn: async (data) => apiClient.post('/buyer-portal/return', data),

  listReturns: async (params = {}) => apiClient.get('/buyer-portal/returns', { params }),

  getReconciliation: async () => apiClient.get('/buyer-portal/reconciliation'),

  approveReturn: async (id) => apiClient.patch(`/buyer-portal/return/${id}/approve`),

  adminListReturns: async (params = {}) => apiClient.get('/buyer-portal/admin/returns', { params }),
};

export default buyerPortalService;

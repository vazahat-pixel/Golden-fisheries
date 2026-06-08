import { apiClient } from './apiClient';
import { buyerPortalPlatformConfig } from './platformHeaders';

const buyerCfg = buyerPortalPlatformConfig;

export const buyerPortalService = {
  getAssignedTapals: async (params = {}) =>
    apiClient.get('/buyer-portal/assigned-tapals', { params, ...buyerCfg() }),

  getAssignableTapals: async (params = {}) =>
    apiClient.get('/buyer-portal/assignable-tapals', {
      params: { limit: 50, ...params },
      ...buyerCfg(),
    }),

  lookupTapal: async (tapalNumber) =>
    apiClient.get('/buyer-portal/lookup-tapal', { params: { tapalNumber }, ...buyerCfg() }),

  claimTapal: async (tapalNumber) =>
    apiClient.post('/buyer-portal/claim-tapal', { tapalNumber }, buyerCfg()),

  submitVerification: async (tapalId, data) =>
    apiClient.post(`/buyer-portal/verify/${tapalId}`, data, buyerCfg()),

  createBill: async (tapalId, data) =>
    apiClient.post(`/buyer-portal/bill/${tapalId}`, data, buyerCfg()),

  listBills: async (params = {}) =>
    apiClient.get('/buyer-portal/bills', { params, ...buyerCfg() }),

  createReturn: async (data) => apiClient.post('/buyer-portal/return', data, buyerCfg()),

  listReturns: async (params = {}) =>
    apiClient.get('/buyer-portal/returns', { params, ...buyerCfg() }),

  getReconciliation: async () => apiClient.get('/buyer-portal/reconciliation', buyerCfg()),

  approveReturn: async (id) =>
    apiClient.patch(`/buyer-portal/return/${id}/approve`, {}, buyerCfg()),

  adminListReturns: async (params = {}) =>
    apiClient.get('/buyer-portal/admin/returns', { params }),

  adminSalesOverview: async () => apiClient.get('/buyer-portal/admin/sales/overview'),

  adminListBills: async (params = {}) =>
    apiClient.get('/buyer-portal/admin/sales/bills', { params }),

  adminSaleByTapal: async (tapalId) =>
    apiClient.get(`/buyer-portal/admin/sales/tapal/${tapalId}`),

  markBillPaid: async (billId, data) =>
    apiClient.patch(`/buyer-portal/admin/bills/${billId}/mark-paid`, data),
};

export default buyerPortalService;

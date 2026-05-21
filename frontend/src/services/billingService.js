import { apiClient } from './apiClient';

export const billingService = {
  all: async (params = {}) => apiClient.get('/billing/all', { params }),

  create: async (data) => apiClient.post('/billing/create', data),

  updatePayment: async (id, paymentData) =>
    apiClient.patch(`/billing/payment-status/${id}`, paymentData),

  getById: async (id) => apiClient.get(`/billing/${id}`),
};

export default billingService;

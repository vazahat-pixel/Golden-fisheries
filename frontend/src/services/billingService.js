import { apiClient } from './apiClient';

export const billingService = {
  // 1. Fetch all Billing Invoices
  all: async (params = {}) => {
    return await apiClient.get('/billing/all', { params });
  },

  // 2. Create Billing Invoice
  create: async (data) => {
    return await apiClient.post('/billing/create', data);
  },

  // 3. Update Payment Status
  updatePayment: async (id, paymentData) => {
    return await apiClient.patch(`/billing/payment/${id}`, paymentData);
  },

  // 4. Get Invoice by ID
  getById: async (id) => {
    return await apiClient.get(`/billing/${id}`);
  }
};

export default billingService;

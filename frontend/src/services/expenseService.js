import { apiClient } from './apiClient';

export const expenseService = {
  // 1. Fetch all Expenses
  all: async (params = {}) => {
    return await apiClient.get('/expenses/all', { params });
  },

  // 2. Create/Submit Expense
  create: async (data) => {
    return await apiClient.post('/expenses/create', data);
  },

  // 2.5 Upload Receipt Image
  uploadReceipt: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/expenses/upload-receipt', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 3. Approve/Reject Expense (Admin)
  approve: async (id, status) => {
    return await apiClient.patch(`/expenses/approve/${id}`, { status });
  },

  // 4. Get Expense by ID
  getById: async (id) => {
    return await apiClient.get(`/expenses/${id}`);
  }
};

export default expenseService;

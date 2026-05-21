import { apiClient } from './apiClient';

export const farmerLedgerService = {
  summary: async () => apiClient.get('/farmer-ledger/summary'),
  getByFarmer: async (farmerId) => apiClient.get(`/farmer-ledger/${farmerId}`),
  recordPayment: async (data) => apiClient.post('/farmer-ledger/payment', data),
};

export default farmerLedgerService;

import { apiClient } from './apiClient';

export const harvestService = {
  // 1. Fetch all Harvest Slips
  all: async (params = {}) => {
    return await apiClient.get('/harvests/all', { params });
  },

  // 2. Create Harvest Slip
  create: async (data) => {
    return await apiClient.post('/harvests/create', data);
  },

  // 3. Update Harvest Slip Status (e.g., CONFIRM, REJECT)
  updateStatus: async (id, status) => {
    return await apiClient.patch(`/harvests/status/${id}`, { status });
  },

  // 4. Reject Harvest Slip
  reject: async (id, reason) => {
    return await apiClient.patch(`/harvests/reject/${id}`, { reason });
  },

  // 5. Get Harvest Slip by ID
  getById: async (id) => {
    return await apiClient.get(`/harvests/${id}`);
  },

  // 6. Convert Harvest Slip to Tapal
  convertToTapal: async (id, data = {}) => {
    return await apiClient.post(`/harvests/convert-to-tapal/${id}`, data);
  },

  // 7. Save Net Rate calculation
  saveNetRate: async (id, data) => {
    return await apiClient.post(`/harvests/net-rate/${id}`, data);
  }
};

export default harvestService;

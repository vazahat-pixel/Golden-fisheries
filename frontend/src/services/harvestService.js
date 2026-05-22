import { apiClient } from './apiClient';
import { mobilePlatformConfig } from './platformHeaders';

const mobile = mobilePlatformConfig;

export const harvestService = {
  // 1. Fetch all Harvest Slips
  all: async (params = {}) => {
    return await apiClient.get('/harvests/all', { params });
  },

  // 2. Create Harvest Slip
  create: async (data) => {
    return await apiClient.post('/harvests/create', data, mobile());
  },

  // 3. Update Harvest Slip Status (e.g., CONFIRM, REJECT)
  updateStatus: async (id, status) => {
    return await apiClient.patch(`/harvests/status/${id}`, { status }, mobile());
  },

  /** SUPER_ADMIN web farmer approval */
  approve: async (id, status = 'CONFIRMED') => {
    return await apiClient.patch(`/harvests/approve/${id}`, { status });
  },

  // 4. Reject Harvest Slip
  reject: async (id, reason) => {
    return await apiClient.patch(`/harvests/reject/${id}`, { reason }, mobile());
  },

  // 5. Get Harvest Slip by ID
  getById: async (id) => {
    return await apiClient.get(`/harvests/${id}`);
  },

  // 6. Convert Harvest Slip to Tapal
  convertToTapal: async (id, data = {}) => {
    return await apiClient.post(`/harvests/convert-to-tapal/${id}`, data, mobile());
  },

  // 7. Save Net Rate calculation
  saveNetRate: async (id, data) => {
    return await apiClient.post(`/harvests/net-rate/${id}`, data, mobile());
  },
};

export default harvestService;

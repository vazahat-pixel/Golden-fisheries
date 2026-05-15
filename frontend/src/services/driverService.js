import { apiClient } from './apiClient';

export const driverService = {
  /**
   * Public registration — sends multipart/form-data with text fields + file blobs.
   * No auth token required.
   */
  register: async (formData) => {
    const response = await apiClient.post('/drivers/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  },

  /**
   * Driver fetches own profile (requires DRIVER token)
   */
  getMyProfile: async () => {
    const response = await apiClient.get('/drivers/my-profile');
    return response;
  },

  /**
   * Admin fetches all registered drivers (paginated)
   */
  getAll: async (params = {}) => {
    const response = await apiClient.get('/drivers/all', { params });
    return response;
  },

  /**
   * Admin fetches active drivers for trip assignment
   */
  getActive: async () => {
    const response = await apiClient.get('/drivers/active');
    return response;
  },

  /**
   * Admin fetches single driver full detail
   */
  getById: async (id) => {
    const response = await apiClient.get(`/drivers/${id}`);
    return response;
  },

  /**
   * Admin approves a driver registration
   */
  approve: async (id) => {
    const response = await apiClient.patch(`/drivers/${id}/approve`);
    return response;
  },

  /**
   * Admin rejects a driver registration with a reason
   */
  reject: async (id, reason) => {
    const response = await apiClient.patch(`/drivers/${id}/reject`, { reason });
    return response;
  }
};

export default driverService;

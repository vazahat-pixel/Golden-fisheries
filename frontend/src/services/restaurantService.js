import { apiClient } from './apiClient';

export const restaurantService = {
  // 1. Fetch all Restaurant Orders
  all: async (params = {}) => {
    return await apiClient.get('/restaurant/all', { params });
  },

  // 2. Create Restaurant Order
  create: async (data) => {
    return await apiClient.post('/restaurant/create', data);
  },

  // 3. Settle Restaurant Order (Payment)
  settle: async (id, paymentData) => {
    return await apiClient.patch(`/restaurant/settle/${id}`, paymentData);
  },

  // 4. Get Order by ID
  getById: async (id) => {
    return await apiClient.get(`/restaurant/${id}`);
  }
};

export default restaurantService;

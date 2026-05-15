import { apiClient } from './apiClient';

export const fishmallService = {
  // 1. Fetch all FishMall Sales
  all: async (params = {}) => {
    return await apiClient.get('/fishmall/all', { params });
  },

  // 2. Create FishMall Sale (Retail scale-based)
  create: async (data) => {
    return await apiClient.post('/fishmall/create', data);
  },

  // 3. Get Sale by ID
  getById: async (id) => {
    return await apiClient.get(`/fishmall/${id}`);
  }
};

export default fishmallService;

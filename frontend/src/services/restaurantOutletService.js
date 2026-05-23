import { apiClient } from './apiClient';

export function unwrapOutletList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.docs)) return res.data.docs;
  if (Array.isArray(res.docs)) return res.docs;
  return [];
}

export const restaurantOutletService = {
  async list(params = {}) {
    return await apiClient.get('/restaurant-outlets', { params });
  },

  async getById(id) {
    return await apiClient.get(`/restaurant-outlets/${id}`);
  },

  async create(payload) {
    return await apiClient.post('/restaurant-outlets', payload);
  },

  async update(id, payload) {
    return await apiClient.patch(`/restaurant-outlets/${id}`, payload);
  },
};

export default restaurantOutletService;

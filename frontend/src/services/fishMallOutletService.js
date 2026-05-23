import { apiClient } from './apiClient';

/** Unwrap list payload from API envelope { success, data, meta } */
export function unwrapOutletList(res) {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.docs)) return res.data.docs;
  if (Array.isArray(res.docs)) return res.docs;
  return [];
}

export const fishMallOutletService = {
  async list(params = {}) {
    return await apiClient.get('/fishmall-outlets', { params });
  },

  async getById(id) {
    return await apiClient.get(`/fishmall-outlets/${id}`);
  },

  async create(payload) {
    return await apiClient.post('/fishmall-outlets', payload);
  },

  async update(id, payload) {
    return await apiClient.patch(`/fishmall-outlets/${id}`, payload);
  },
};

export default fishMallOutletService;

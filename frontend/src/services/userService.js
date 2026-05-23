import { apiClient } from './apiClient';

export const userService = {
  all: async (params = {}) => {
    const response = await apiClient.get('/users/all', { params });
    return response;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/users/update/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  drivers: async () => {
    const response = await apiClient.get('/users/drivers');
    return response;
  },
};

export default userService;

import { apiClient } from './apiClient';

/**
 * Generic factory to create standard CRUD API clients for any master entity
 */
const createCrudService = (endpoint) => ({
  getAll: async (params = {}) => {
    // Unpacks standard { success, data, meta }
    const response = await apiClient.get(`/${endpoint}/all`, { params });
    return response; // response contains { docs, meta } or raw list if not paginated on backend
  },

  getById: async (id) => {
    const response = await apiClient.get(`/${endpoint}/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post(`/${endpoint}/create`, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/${endpoint}/update/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/${endpoint}/${id}`);
    return response;
  }
});

export const masterService = {
  farmers: createCrudService('farmers'),
  buyers: createCrudService('buyers'),
  products: createCrudService('products'),
  vehicles: {
    ...createCrudService('vehicles'),
    uploadDocument: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await apiClient.post('/vehicles/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    }
  },
  drivers: {
    ...createCrudService('drivers'),
    getActive: async () => {
      const response = await apiClient.get('/drivers/active');
      return response.data;
    }
  },
  // Inventory — read-only from frontend, writes always through backend service
  inventory: {
    getAll: async (params = {}) => {
      const response = await apiClient.get('/inventory', { params });
      return response;
    },
    getTransactions: async (params = {}) => {
      const response = await apiClient.get('/inventory/transactions', { params });
      return response;
    },
    // Admin-only manual stock calibration — always goes through backend inventory ledger
    adjustManual: async (productId, { qtyChange, remarks }) => {
      const response = await apiClient.post('/inventory/adjust', {
        productId,
        quantityChange: qtyChange,
        remarks
      });
      return response;
    }
  }
};

export default masterService;

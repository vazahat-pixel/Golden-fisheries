import { apiClient } from './apiClient';

export const tripService = {
  create: async (payload) => {
    return apiClient.post('/trips/create', payload);
  },

  planned: async () => {
    return apiClient.get('/trips/planned');
  },

  getById: async (tripId) => {
    return apiClient.get(`/trips/${tripId}`);
  },

  assignDriver: async (tripId, driverId, vehicleId, driverName) => {
    return apiClient.patch('/trips/assign-driver', {
      tripId,
      driverId: driverId || undefined,
      vehicleId,
      driverName: driverName || undefined,
    });
  },
};

export default tripService;

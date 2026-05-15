import { apiClient } from './apiClient';

export const tapalService = {
  // 1. Fetch all Tapal Contracts
  all: async (params = {}) => {
    return await apiClient.get('/tapals/all', { params });
  },

  // 2. Create Tapal from Harvest Slip
  createFromHarvest: async (harvestId, data = {}) => {
    return await apiClient.post('/tapals/create-from-harvest', { harvestId, ...data });
  },

  // 3. Assign Driver & Vehicle to Tapal (Launches active trip)
  assignDriver: async (tapalId, driverId, vehicleId) => {
    return await apiClient.patch('/tapals/assign-driver', { tapalId, driverId, vehicleId });
  },

  // 4. Driver starts the trip
  startTrip: async (tapalId) => {
    return await apiClient.patch('/tapals/start-trip', { tapalId });
  },

  // 4.1 Driver rejects the trip
  rejectTrip: async (tapalId) => {
    return await apiClient.patch('/tapals/reject-trip', { tapalId });
  },

  // 5. Driver records scale weight at pickup
  pickup: async (tapalId, actualPickupQty) => {
    return await apiClient.patch('/tapals/pickup', { tapalId, actualPickupQty });
  },

  // 6. Driver records scale weight at delivery with proof
  deliver: async (tapalId, actualDeliveredQty, proofPhotoUrl, signatureUrl) => {
    return await apiClient.patch('/tapals/deliver', { 
      tapalId, 
      actualDeliveredQty, 
      proofPhotoUrl, 
      signatureUrl 
    });
  },

  // 7. Admin/Accountant verifies cargo weights, closes trip, and triggers inventory reconciliation
  endTrip: async (tapalId) => {
    return await apiClient.patch('/tapals/end-trip', { tapalId });
  },

  // 8. Driver logs trip expenses (Fuel, Toll, etc.)
  logExpense: async (tripId, expenseData) => {
    return await apiClient.post('/tapals/expense', { tripId, ...expenseData });
  },

  // 9. Fetch active Trip details
  getTripById: async (id) => {
    return await apiClient.get(`/tapals/trip/${id}`);
  },

  // 10. Fetch single Tapal details
  getById: async (id) => {
    return await apiClient.get(`/tapals/${id}`);
  }
};

export default tapalService;

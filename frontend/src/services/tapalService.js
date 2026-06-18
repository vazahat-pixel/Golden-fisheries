import { apiClient } from './apiClient';

export const tapalService = {
  // 1. Fetch all Tapal Contracts
  all: async (params = {}) => {
    return await apiClient.get('/tapals/all', { params });
  },

  // 1.1 Fetch all Trips (Admin)
  allTrips: async () => {
    return await apiClient.get('/tapals/trips/all');
  },

  // 1.2 Driver fetches only their own trips (scoped by JWT)
  myTrips: async () => {
    return await apiClient.get('/tapals/my-trips');
  },

  // 1.3 Buyer fetches only their own trips (scoped by JWT)
  myBuyerTrips: async () => {
    return await apiClient.get('/tapals/my-buyer-trips');
  },

  // 2. Create Tapal from Harvest Slip
  createFromHarvest: async (harvestId, data = {}) => {
    return await apiClient.post('/tapals/create-from-harvest', { harvestId, ...data });
  },

  // 3. Assign Driver & Vehicle to Tapal (Launches active trip)
  assignDriver: async (tapalId, driverId, vehicleId, driverName) => {
    return await apiClient.patch('/tapals/assign-driver', {
      tapalId,
      driverId: driverId || undefined,
      vehicleId,
      driverName: driverName || undefined,
    });
  },

  // 3.1 Driver accepts an assigned trip
  acceptTrip: async (tapalId) => {
    return await apiClient.patch('/tapals/accept-trip', { tapalId });
  },

  // 4. Driver starts the trip
  startTrip: async (tapalId) => {
    return await apiClient.patch('/tapals/start-trip', { tapalId });
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
    return await apiClient.post('/tapals/expense', { 
      tripId, 
      expenseType: expenseData.type || expenseData.expenseType,  // map frontend 'type' to backend 'expenseType'
      amount: expenseData.amount,
      receiptUrl: expenseData.receiptUrl || '',
      remarks: expenseData.remarks || expenseData.method || ''
    });
  },

  // 8.1 Driver submits post-trip expenses form
  submitPostTripExpense: async (tripId, postTripData) => {
    return await apiClient.post(`/tapals/trip/${tripId}/post-trip-expense`, postTripData);
  },

  // 8.2 Admin reviews post-trip expenses
  reviewPostTripExpense: async (tripId, status, rejectionReason = '') => {
    return await apiClient.patch(`/tapals/trip/${tripId}/post-trip-expense/review`, { status, rejectionReason });
  },

  // 8.3 Admin confirms payout and closes trip
  confirmPostTripPayment: async (tripId, paidAmount, upiTransactionId, paymentMethod = 'UPI') => {
    return await apiClient.patch(`/tapals/trip/${tripId}/post-trip-expense/confirm-payment`, {
      paidAmount,
      upiTransactionId,
      paymentMethod,
    });
  },

  // 9. Fetch active Trip details
  getTripById: async (id) => {
    return await apiClient.get(`/tapals/trip/${id}`);
  },

  // 10. Fetch single Tapal details
  getById: async (id) => {
    return await apiClient.get(`/tapals/${id}`);
  },

  // 11. Update Tapal
  update: async (id, data) => {
    return await apiClient.patch(`/tapals/${id}`, data);
  },

  // 12. Return Tapal
  returnTapal: async (tapalId, reason) => {
    return await apiClient.post('/tapals/return', { tapalId, reason });
  }
};

export default tapalService;

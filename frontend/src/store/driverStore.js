import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tapalService } from '../services/tapalService';
import { expenseService } from '../services/expenseService';

export const useDriverStore = create(
  persist(
    (set, get) => ({
      drivers: [],

      registerDriver: (driverData) => set((state) => ({
        drivers: [
          {
            ...driverData,
            id: `DRV-${String(state.drivers.length + 1).padStart(4, '0')}`,
            status: 'pending_verification',
            registeredAt: new Date().toISOString().slice(0, 10),
          },
          ...state.drivers
        ]
      })),

      updateDriver: (id, updates) => set((state) => ({
        drivers: state.drivers.map((d) => d.id === id ? { ...d, ...updates } : d)
      })),

      approveDriver: (id, adminName) => set((state) => ({
        drivers: state.drivers.map((d) => 
          d.id === id ? { 
            ...d, 
            status: 'active', 
            verifiedBy: adminName, 
            verifiedAt: new Date().toISOString().slice(0, 10),
            rejectionReason: null 
          } : d
        )
      })),

      rejectDriver: (id, reason) => set((state) => ({
        drivers: state.drivers.map((d) => 
          d.id === id ? { ...d, status: 'rejected', rejectionReason: reason } : d
        )
      })),

      getDriverByMobile: (mobile) => {
        return get().drivers.find(d => d.mobile === mobile);
      },

      incomingAssignment: null,
      setIncomingAssignment: (data) => set({ incomingAssignment: data }),
      clearIncomingAssignment: () => set({ incomingAssignment: null }),

      activeTrip: null,
      myTrips: [],
      myExpenses: [],
      loading: false,

      fetchMyTrips: async () => {
        set({ loading: true });
        try {
          // GET /tapals/my-trips — DRIVER-scoped, JWT-filtered server-side
          // tapalController.myTrips: ApiResponse(200, trips, ...)
          // After apiClient interceptor: res = { success, data: [...trips] }
          const res = await tapalService.myTrips();
          const list = Array.isArray(res?.data) ? res.data : [];
          // Active trip = any in-progress Trip status (Trip model enum: ASSIGNED, STARTED, PICKED, DELIVERED, CLOSED)
          const live = list.find(t => ['ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED'].includes(t.status));
          set({ myTrips: list, activeTrip: live || null, loading: false });
        } catch (err) {
          console.error('[Driver] Failed to fetch my trips:', err?.message || err);
          set({ loading: false });
        }
      },

      fetchMyExpenses: async () => {
        set({ loading: true });
        try {
          // GET /expenses — backend should filter by JWT driverId server-side
          const res = await expenseService.all();
          const list = Array.isArray(res?.data) ? res.data : [];
          set({ myExpenses: list, loading: false });
        } catch (err) {
          console.error('[Driver] Failed to fetch expenses:', err?.message || err);
          set({ loading: false });
        }
      },

      submitExpenseAsync: async (expenseData) => {
        set({ loading: true });
        try {
          await expenseService.create(expenseData);
          if (expenseData.driverId) await get().fetchMyExpenses(expenseData.driverId);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      startTripAsync: async (tapalId) => {
        set({ loading: true });
        try {
          await tapalService.startTrip(tapalId);
          // Store will be updated via socket or manual refetch
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      pickupAsync: async (tapalId, qty) => {
        set({ loading: true });
        try {
          await tapalService.pickup(tapalId, qty);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deliverAsync: async (tapalId, qty, proof, sig) => {
        set({ loading: true });
        try {
          await tapalService.deliver(tapalId, qty, proof, sig);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      submitPostTripExpenseAsync: async (tripId, postTripData) => {
        set({ loading: true });
        try {
          const res = await tapalService.submitPostTripExpense(tripId, postTripData);
          await get().fetchMyTrips();
          set({ loading: false });
          return res.data;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'golden-fisheries-drivers',
    }
  )
);

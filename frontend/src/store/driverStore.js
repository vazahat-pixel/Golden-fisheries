import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tapalService } from '../services/tapalService';
import { expenseService } from '../services/expenseService';
import { apiClient } from '../services/apiClient';

/** Trip rows from /my-trips use trip _id; tapal APIs need tapalId */
export function resolveTapalIdFromTrip(tripOrTapalId) {
  if (!tripOrTapalId) return null;
  if (typeof tripOrTapalId === 'string') return tripOrTapalId;
  const ref = tripOrTapalId.tapalId ?? tripOrTapalId.tapal;
  if (ref && typeof ref === 'object') {
    const id = ref._id || ref.id;
    return id ? String(id) : null;
  }
  if (ref) return String(ref);
  return null;
}

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
          const live = list.find(t => ['ASSIGNED', 'ACCEPTED', 'STARTED', 'PICKED', 'DELIVERED'].includes(t.status));
          set({ myTrips: list, activeTrip: live || null, loading: false });
        } catch (err) {
          console.error('[Driver] Failed to fetch my trips:', err?.message || err);
          set({ loading: false });
        }
      },

      fetchMyExpenses: async () => {
        set({ loading: true });
        try {
          const res = await expenseService.my({ limit: 100 });
          const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          set({ myExpenses: list, loading: false });
        } catch (err) {
          console.warn('[Driver] Expenses unavailable:', err?.message || err);
          set({ myExpenses: [], loading: false });
        }
      },

      acceptTripAsync: async (tapalId) => {
        set({ loading: true });
        try {
          await tapalService.acceptTrip(tapalId);
          await get().fetchMyTrips();
          set({ loading: false });
        } catch (err) {
          set({ loading: false });
          throw err;
        }
      },

      submitExpenseAsync: async (expenseData) => {
        set({ loading: true });
        try {
          await expenseService.create(expenseData);
          await get().fetchMyExpenses();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      startTripAsync: async (tripOrTapalId, { startMeterPhotoUrl, startOdometerKm } = {}) => {
        const tapalId = resolveTapalIdFromTrip(tripOrTapalId);
        const tripId =
          tripOrTapalId && typeof tripOrTapalId === 'object'
            ? tripOrTapalId._id || tripOrTapalId.id
            : undefined;
        if (!tapalId && !tripId) throw new Error('Trip reference missing');
        set({ loading: true });
        try {
          await tapalService.startTrip({
            tapalId: tapalId || undefined,
            tripId: tripId ? String(tripId) : undefined,
            startMeterPhotoUrl,
            startOdometerKm,
          });
          await get().fetchMyTrips();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      pickupAsync: async (tripOrTapalId, qty) => {
        const tapalId = resolveTapalIdFromTrip(tripOrTapalId);
        if (!tapalId) throw new Error('Tapal link missing on this trip');
        set({ loading: true });
        try {
          await tapalService.pickup(tapalId, qty);
          await get().fetchMyTrips();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deliverAsync: async (tripOrTapalId, qty, proof, sig) => {
        const tapalId = resolveTapalIdFromTrip(tripOrTapalId);
        if (!tapalId) throw new Error('Tapal link missing on this trip');
        set({ loading: true });
        try {
          await tapalService.deliver(tapalId, qty, proof, sig);
          await get().fetchMyTrips();
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
      name: 'golden-fisheries-drivers-v2',
      partialize: () => ({}),
    }
  )
);

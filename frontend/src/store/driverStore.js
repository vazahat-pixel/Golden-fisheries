import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { tapalService } from '../services/tapalService';
import { expenseService } from '../services/expenseService';

export const useDriverStore = create(
  persist(
    (set, get) => ({
      drivers: [
        {
          id: 'DRV-0001',
          status: 'pending_verification',
          registeredAt: '2026-05-04',
          fullName: 'RAJESH KUMAR',
          mobile: '6655443322',
          alternateMobile: '',
          currentAddress: 'Plot 5, Main Road, Hassan',
          permanentAddress: 'Village Hemavathi, Hassan',
          profilePhoto: null,
          aadhaarNumber: '1234 5678 9012',
          aadhaarFrontImage: null,
          aadhaarBackImage: null,
          panNumber: '',
          panImage: null,
          licenseNumber: 'KA-01-2020-0001234',
          licenseExpiry: '2028-12-31',
          licenseFrontImage: null,
          licenseBackImage: null,
          hasOwnVehicle: true,
          vehicleType: 'Mini Truck',
          vehicleNumber: 'KA-01-AX-1234',
          rcImage: null,
          rcExpiry: '2030-06-15',
          insuranceImage: null,
          insuranceExpiry: '2027-01-01',
          permitImage: null,
          permitExpiry: '2027-06-01',
          pucImage: null,
          pucExpiry: '2026-12-31',
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: null,
        },
        {
          id: 'DRV-0002',
          status: 'registered',
          registeredAt: '2026-05-04',
          fullName: 'AMIT SHARMA',
          mobile: '9988776655',
          alternateMobile: '',
          currentAddress: 'Market St, Mangalore',
          permanentAddress: 'Market St, Mangalore',
          profilePhoto: null,
          aadhaarNumber: '8877 6655 4433',
          aadhaarFrontImage: null,
          aadhaarBackImage: null,
          panNumber: '',
          panImage: null,
          licenseNumber: 'KA-19-2021-0009876',
          licenseExpiry: '2029-05-20',
          licenseFrontImage: null,
          licenseBackImage: null,
          hasOwnVehicle: false,
          verifiedBy: null,
          verifiedAt: null,
          rejectionReason: null,
        }
      ],

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

      fetchMyTrips: async (driverId) => {
        set({ loading: true });
        try {
          const res = await tapalService.all({ driverId });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const live = list.find(t => ['ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED'].includes(t.status));
          set({ myTrips: list, activeTrip: live, loading: false });
        } catch (err) {
          console.error('Failed to fetch driver trips', err);
          set({ loading: false });
        }
      },

      fetchMyExpenses: async (driverId) => {
        set({ loading: true });
        try {
          const res = await expenseService.all({ driverId });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ myExpenses: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch driver expenses', err);
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
    }),
    {
      name: 'golden-fisheries-drivers',
    }
  )
);

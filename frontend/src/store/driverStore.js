import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    }),
    {
      name: 'golden-fisheries-drivers',
    }
  )
);

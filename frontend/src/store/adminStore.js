import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { masterService } from '../services/masterService';
import { tapalService } from '../services/tapalService';
import { billingService } from '../services/billingService';
import { harvestService } from '../services/harvestService';
import { expenseService } from '../services/expenseService';
import { reportsService } from '../services/reportsService';
import mockData from '../data/mockData.json';
import vehicleMockData from '../data/vehicleMockData.json';
import { useRestaurantStore } from './restaurantStore';
import { useFishMallStore } from './fishMallStore';
import { useDriverStore } from './driverStore';

const generateId = (prefix, list) => {
  const next = (list.length + 1).toString().padStart(4, '0');
  return `${prefix}-${next}`;
};

export const useAdminStore = create(
  persist(
    (set, get) => ({
      // Data
      tapals: mockData.admin.tapals || [],
      inventory: [
        { id: 1, name: 'ROHU FISH', category: 'FRESHWATER', qty: 450, unit: 'KG', price: 85, status: 'in-stock' },
        { id: 2, name: 'CATLA FISH', category: 'FRESHWATER', qty: 320, unit: 'KG', price: 90, status: 'in-stock' },
        { id: 3, name: 'TIGER PRAWNS', category: 'SEAFOOD', qty: 15, unit: 'KG', price: 450, status: 'low-stock' },
        { id: 4, name: 'SQUID', category: 'SEAFOOD', qty: 0, unit: 'KG', price: 280, status: 'out-of-stock' },
        { id: 5, name: 'MRIGAL', category: 'FRESHWATER', qty: 180, unit: 'KG', price: 75, status: 'in-stock' },
      ],
      invoices: [
        { id: 'INV-1001', client: 'GOLDEN RESTAURANT', type: 'SALES', amount: '₹12,450', numericAmount: 12450, date: '30 APR 2026', status: 'paid' },
        { id: 'INV-1002', client: 'FISH MALL RETAIL', type: 'SALES', amount: '₹8,900', numericAmount: 8900, date: '30 APR 2026', status: 'pending' },
        { id: 'INV-1003', client: 'DEEP SEA FARMS', type: 'PROCUREMENT', amount: '₹45,000', numericAmount: 45000, date: '29 APR 2026', status: 'paid' },
        { id: 'INV-1004', client: 'BLUE WATER HOTEL', type: 'SALES', amount: '₹18,200', numericAmount: 18200, date: '29 APR 2026', status: 'overdue' },
        { id: 'INV-1005', client: 'COASTAL CUISINES', type: 'SALES', amount: '₹6,750', numericAmount: 6750, date: '28 APR 2026', status: 'paid' },
      ],
      drivers: [
        { id: 1, name: 'Suresh Kumar', phone: '+91 98765 43210', vehicle: 'MH-12-AS-4567', status: 'active', rating: 4.8, trips: 142 },
        { id: 2, name: 'Ramesh Singh', phone: '+91 98765 43211', vehicle: 'MH-12-BT-8890', status: 'on-trip', rating: 4.5, trips: 98 },
        { id: 3, name: 'Abdul Khan', phone: '+91 98765 43212', vehicle: 'MH-12-CQ-1122', status: 'inactive', rating: 4.2, trips: 215 },
      ],
      users: [
        { id: 1, name: 'MAHESH KUMAR', email: 'mahesh@mke.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '10 MINS AGO' },
        { id: 2, name: 'CHANNAPPA S.', email: 'channappa@mke.com', role: 'MANAGER', status: 'ACTIVE', lastLogin: '2 HRS AGO' },
        { id: 3, name: 'LOKESH B.', email: 'lokesh@mke.com', role: 'BILLING', status: 'ACTIVE', lastLogin: 'YESTERDAY' },
        { id: 4, name: 'RAMU K.', email: 'ramu@mke.com', role: 'DRIVER', status: 'INACTIVE', lastLogin: '3 DAYS AGO' },
      ],
      transactions: [
        { date: '30/04/26', desc: 'Diesel KA-01-AX-1234', method: 'Cash', type: 'expense', amount: 1200 },
        { date: '29/04/26', desc: 'Payment - Golden Rest.', method: 'UPI', type: 'income', amount: 12500 },
        { date: '29/04/26', desc: 'Ramu Fisheries Purchase', method: 'Bank Transfer', type: 'expense', amount: 40000 },
        { date: '28/04/26', desc: 'Fish Mall Daily Sales', method: 'Cash', type: 'income', amount: 18400 },
      ],

      trips: mockData.driver?.trips || [],
      incomingStock: [],
      purchaseInvoices: [],

      // Expense Ledger — pending admin approval before hitting accounts
      expenses: [
        {
          id: 'EXP-0001',
          driverName: 'Suresh Kumar',
          tripId: 'TRP-0001',
          type: 'FUEL',
          amount: 1200,
          description: 'Diesel fill at HP Pump, NH-48',
          receiptPhoto: null,
          date: '10 May 2026',
          submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Pending',
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null
        },
        {
          id: 'EXP-0002',
          driverName: 'Ramesh Singh',
          tripId: 'TRP-0002',
          type: 'TOLL',
          amount: 340,
          description: 'Toll Plaza — Bangalore-Mysore Expressway',
          receiptPhoto: null,
          date: '11 May 2026',
          submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Approved',
          reviewedBy: 'MAHESH KUMAR',
          reviewedAt: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
          rejectionReason: null
        },
        {
          id: 'EXP-0003',
          driverName: 'Suresh Kumar',
          tripId: null,
          type: 'MAINTENANCE',
          amount: 2800,
          description: 'Tyre puncture repair — Mangalore highway',
          receiptPhoto: null,
          date: '12 May 2026',
          submittedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          status: 'Rejected',
          reviewedBy: 'MAHESH KUMAR',
          reviewedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          rejectionReason: 'Duplicate submission — already covered in TRP-0001 maintenance log'
        },
      ],

      // Vehicle Fleet State
      vehicles: vehicleMockData.vehicles || [],
      maintenanceLogs: vehicleMockData.maintenanceLogs || [],
      vehiclePerformance: vehicleMockData.performance || [],

      // Dashboard KPIs
      dashboardStats: null,
      fetchDashboardStats: async () => {
        set({ loading: true });
        try {
          const sales = await reportsService.getSales();
          const profit = await reportsService.getProfitability();
          set({ dashboardStats: { ...sales, ...profit }, loading: false });
        } catch (err) {
          console.error('Failed to fetch dashboard stats', err);
          set({ loading: false });
        }
      },

      // Master Lists Async
      fetchInventory: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.products.getAll(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ inventory: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchInventory failed:', err.message);
          set({ loading: false });
        }
      },

      fetchDrivers: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.drivers.getAll(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ drivers: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchDrivers failed:', err.message);
          set({ loading: false });
        }
      },

      fetchVehicles: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.vehicles.getAll(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ vehicles: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchVehicles failed:', err.message);
          set({ loading: false });
        }
      },

      fetchFarmers: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.farmers.getAll(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ farmers: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchFarmers failed:', err.message);
          set({ loading: false });
        }
      },

      fetchBuyers: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.buyers.getAll(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ buyers: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchBuyers failed:', err.message);
          set({ loading: false });
        }
      },

      // Tapals Async
      fetchTapals: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await tapalService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ tapals: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchTapals failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      assignDriverAsync: async (tapalId, driverId, vehicleId) => {
        set({ loading: true });
        try {
          await tapalService.assignDriver(tapalId, driverId, vehicleId);
          await get().fetchTapals();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      endTripAsync: async (tapalId) => {
        set({ loading: true });
        try {
          await tapalService.endTrip(tapalId);
          await get().fetchTapals();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Harvest Slips Async
      fetchHarvestSlips: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await harvestService.all(params);
          const list = res?.data?.docs || res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ harvestSlips: Array.isArray(list) ? list : [], loading: false });
        } catch (err) {
          console.warn('Backend fetchHarvestSlips failed:', err.message);
          set({ loading: false });
        }
      },

      convertSlipToTapalAsync: async (slipId) => {
        set({ loading: true });
        try {
          // Use the more reliable URL-based endpoint
          await harvestService.convertToTapal(slipId);
          await get().fetchHarvestSlips();
          await get().fetchTapals();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      createHarvestSlipAsync: async (data) => {
        set({ loading: true });
        try {
          const res = await harvestService.create(data);
          await get().fetchHarvestSlips();
          set({ loading: false });
          return res?.data?.harvest || res?.data || res;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      addFarmerAsync: async (data) => {
        set({ loading: true });
        try {
          const res = await masterService.farmers.create(data);
          await get().fetchFarmers();
          set({ loading: false });
          return res?.data || res;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateInventoryQtyAsync: async (itemId, delta) => {
        set({ loading: true });
        try {
          const item = get().inventory.find(i => i.id === itemId || i._id === itemId);
          if (!item) throw new Error("Item not found");
          
          const newQty = (item.qty || 0) + delta;
          const mongoId = item._id || item.id;
          
          await masterService.products.update(mongoId, { qty: newQty });
          await get().fetchInventory();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateHarvestStatusAsync: async (id, status) => {
        set({ loading: true });
        try {
          await harvestService.updateStatus(id, status);
          await get().fetchHarvestSlips();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      convertSlipToTapalAsync: async (slipId) => {
        set({ loading: true });
        try {
          await tapalService.createFromHarvest(slipId);
          await get().fetchTapals();
          await get().fetchHarvestSlips();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Invoices Async
      fetchInvoices: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await billingService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ invoices: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchInvoices failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      updatePaymentAsync: async (id, paymentData) => {
        set({ loading: true });
        try {
          await billingService.updatePayment(id, paymentData);
          await get().fetchInvoices();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Expenses Async
      fetchExpenses: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await expenseService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ expenses: list, loading: false });
        } catch (err) {
          console.warn('Backend fetchExpenses failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      approveExpenseAsync: async (id) => {
        set({ loading: true });
        try {
          await expenseService.approve(id, 'APPROVED');
          await get().fetchExpenses();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      rejectExpenseAsync: async (id) => {
        set({ loading: true });
        try {
          await expenseService.approve(id, 'REJECTED');
          await get().fetchExpenses();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Actions - Tapals
      addTapal: (tapal) => set((state) => ({ 
        tapals: [tapal, ...state.tapals] 
      })),
      
      updateTapalStatus: (id, status) => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { ...t, status } : t)
      })),

      editTapal: (id, updates) => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { ...t, ...updates } : t)
      })),

      deleteTapal: (id) => set((state) => ({
        tapals: state.tapals.filter(t => t.id !== id)
      })),

      assignDriver: (tapalId, driverId) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        
        // Search in local drivers and external driverStore
        const externalDrivers = useDriverStore.getState().drivers || [];
        const allDrivers = [...state.drivers, ...externalDrivers];
        
        const driver = allDrivers.find(d => d.id === driverId) || state.drivers[0]; 
        if (!tapal) return {};

        // Find associated vehicle
        const vehicle = state.vehicles.find(v => v.assignedDriverId === driverId || v.assignedDriverName === (driver.name || driver.fullName));

        const newTrip = {
          id: generateId('TRP', state.trips),
          tapalId,
          driverId: driverId || 'DRV-0001',
          driverName: driver.name || driver.fullName,
          vehicle: vehicle?.vehicleNumber || driver.vehicle || driver.vehicleNumber || 'UNASSIGNED',
          status: 'Assigned',
          pickupLocation: tapal.pickupLocation || 'FARM SITE',
          deliveryLocation: tapal.type === 'Purchase' ? 'WAREHOUSE' : 'BUYER SITE',
          product: tapal.products?.[0]?.name || 'GENERAL FISH',
          expectedQty: tapal.qty,
          actualQty: null,
          createdAt: new Date().toLocaleTimeString(),
          expenses: [],
          timeline: [{ status: 'Assigned', time: new Date().toLocaleTimeString() }]
        };

        return {
          trips: [newTrip, ...state.trips],
          tapals: state.tapals.map(t => t.id === tapalId ? { 
            ...t, 
            status: 'Assigned', 
            driver: driver.name || driver.fullName,
            driverPhone: driver.phone || driver.mobile,
            vehicleNumber: vehicle?.vehicleNumber || driver.vehicle || driver.vehicleNumber || 'UNASSIGNED'
          } : t),
          drivers: state.drivers.map(d => d.id === driverId ? { ...d, status: 'on-trip' } : d)
        };
      }),

      driverAcceptTrip: (tapalId) => set((state) => ({
        tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'Accepted' } : t),
        trips: state.trips.map(t => t.tapalId === tapalId ? { 
          ...t, 
          status: 'Accepted', 
          acceptedAt: new Date().toLocaleTimeString(),
          timeline: [...(t.timeline || []), { status: 'Accepted', time: new Date().toLocaleTimeString() }]
        } : t)
      })),

      driverRejectTrip: (tripId) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return {};
        return {
          trips: state.trips.map(t => t.id === tripId ? { ...t, status: 'Rejected' } : t),
          tapals: state.tapals.map(t => t.id === trip.tapalId ? { ...t, status: 'pending', driver: 'Unassigned' } : t)
        };
      }),

      driverStartTrip: (tapalId) => set((state) => ({
        tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'In Transit' } : t),
        trips: state.trips.map(t => t.tapalId === tapalId ? { 
          ...t, 
          status: 'In Transit', 
          startedAt: new Date().toLocaleTimeString(),
          timeline: [...(t.timeline || []), { status: 'In Transit', time: new Date().toLocaleTimeString() }]
        } : t)
      })),

      confirmPickup: (tapalId, pickupData) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        if (!tapal) return {};

        return {
          tapals: state.tapals.map(t => t.id === tapalId ? { 
            ...t, 
            status: 'Picked', 
            actualQty: pickupData.actualQty + ' KG' 
          } : t),
          trips: state.trips.map(t => t.tapalId === tapalId ? { 
            ...t, 
            status: 'Picked',
            actualQty: pickupData.actualQty,
            quality: pickupData.quality,
            proofPhoto: pickupData.photo,
            signature: pickupData.signature,
            timeline: [...(t.timeline || []), { status: 'Picked', time: new Date().toLocaleTimeString() }]
          } : t)
        };
      }),

      completeTrip: (tapalId) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        const trip = state.trips.find(t => t.tapalId === tapalId);
        if (!tapal || !trip) return {};

        const qtyVal = parseFloat(trip.actualQty || tapal.qty);
        const amountVal = parseFloat(tapal.amount.replace(/[₹,]/g, '')) || 0;

        // Inventory Logic
        const newInventory = state.inventory.map(item => {
          const productName = tapal.products?.[0]?.name || 'GENERAL FISH';
          if (productName.toUpperCase() === item.name.toUpperCase() || item.id === 1) { // Fallback to first item if name mismatch
            const addedQty = tapal.type === 'Purchase' ? qtyVal : -qtyVal;
            const nextQty = Math.max(0, item.qty + addedQty);
            return { ...item, qty: nextQty, status: nextQty === 0 ? 'out-of-stock' : nextQty < 50 ? 'low-stock' : 'in-stock' };
          }
          return item;
        });

        // Create Purchase Invoice if applicable
        const newPurchaseInvoices = tapal.type === 'Purchase' ? [{
          id: generateId('PINV', state.purchaseInvoices || []),
          tapalId,
          farmer: tapal.farmer?.name || tapal.party,
          amount: amountVal,
          date: new Date().toISOString(),
          status: 'unpaid',
          paidAmount: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
        }, ...(state.purchaseInvoices || [])] : (state.purchaseInvoices || []);

        return {
          tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'Delivered' } : t),
          inventory: newInventory,
          purchaseInvoices: newPurchaseInvoices,
          trips: state.trips.map(t => t.tapalId === tapalId ? { 
            ...t, 
            status: 'Delivered', 
            completedAt: new Date().toLocaleTimeString(),
            timeline: [...(t.timeline || []), { status: 'Delivered', time: new Date().toLocaleTimeString() }]
          } : t)
        };
      }),

      closeTrip: (tapalId) => set((state) => {
        const tapal = state.tapals.find(t => t.id === tapalId);
        if (!tapal) return {};

        return {
          tapals: state.tapals.map(t => t.id === tapalId ? { ...t, status: 'Closed' } : t),
          trips: state.trips.map(t => t.tapalId === tapalId ? { ...t, status: 'Closed' } : t)
        };
      }),

      // --- Expense Lifecycle Actions ---

      // Driver submits an expense — stays Pending until admin reviews
      submitExpense: (expenseData) => set((state) => {
        const newExpense = {
          ...expenseData,
          id: generateId('EXP', state.expenses),
          submittedAt: new Date().toISOString(),
          status: 'Pending',
          reviewedBy: null,
          reviewedAt: null,
          rejectionReason: null
        };

        // Also mark trip as 'Expense Submitted' if a trip is linked
        const linkedTrip = expenseData.tripId
          ? state.trips.find(t => t.id === expenseData.tripId)
          : null;

        return {
          expenses: [newExpense, ...state.expenses],
          trips: linkedTrip
            ? state.trips.map(t => t.id === linkedTrip.id
                ? { ...t, status: 'Expense Submitted', expenses: [...(t.expenses || []), newExpense] }
                : t)
            : state.trips,
          tapals: linkedTrip
            ? state.tapals.map(t => t.id === linkedTrip.tapalId ? { ...t, status: 'Expense Submitted' } : t)
            : state.tapals
        };
      }),

      // Admin approves — now posts to accounts/transactions
      approveExpense: (id, reviewerName = 'ADMIN') => set((state) => {
        const expense = state.expenses.find(e => e.id === id);
        if (!expense || expense.status !== 'Pending') return {};

        const newTransaction = {
          date: new Date().toLocaleDateString('en-GB'),
          desc: `APPROVED EXPENSE (${expense.type}) — ${expense.driverName}`,
          method: 'CASH',
          type: 'expense',
          amount: Number(expense.amount)
        };

        return {
          expenses: state.expenses.map(e => e.id === id ? {
            ...e,
            status: 'Approved',
            reviewedBy: reviewerName,
            reviewedAt: new Date().toISOString()
          } : e),
          transactions: [newTransaction, ...state.transactions]
        };
      }),

      // Admin rejects with a reason
      rejectExpense: (id, reason, reviewerName = 'ADMIN') => set((state) => ({
        expenses: state.expenses.map(e => e.id === id ? {
          ...e,
          status: 'Rejected',
          rejectionReason: reason,
          reviewedBy: reviewerName,
          reviewedAt: new Date().toISOString()
        } : e)
      })),

      // Legacy trip expense helper (kept for backward compat, no longer auto-posts to accounts)
      addTripExpense: (tripId, expense) => set((state) => {
        const trip = state.trips.find(t => t.id === tripId || t.tapalId === tripId);
        if (!trip) return {};
        const updatedTrip = {
          ...trip,
          status: 'Expense Submitted',
          expenses: [...(trip.expenses || []), expense]
        };
        return {
          tapals: state.tapals.map(t => t.id === trip.tapalId ? { ...t, status: 'Expense Submitted' } : t),
          trips: state.trips.map(t => t.id === trip.id ? updatedTrip : t)
        };
      }),

      updateInventoryQty: (id, amount) => set((state) => ({
        inventory: state.inventory.map(item => {
          if (item.id === id) {
            const newQty = Math.max(0, item.qty + amount);
            let newStatus = 'in-stock';
            if (newQty === 0) newStatus = 'out-of-stock';
            else if (newQty < 50) newStatus = 'low-stock';
            return { ...item, qty: newQty, status: newStatus };
          }
          return item;
        })
      })),
      addInventoryItem: (item) => set((state) => ({
        inventory: [...state.inventory, { ...item, id: state.inventory.length + 1 }]
      })),

      updateDriverStatus: (id, status) => set((state) => ({
        drivers: state.drivers.map(d => d.id === id ? { ...d, status } : d)
      })),
      addDriver: (driver) => set((state) => ({
        drivers: [...state.drivers, { ...driver, id: state.drivers.length + 1 }]
      })),
      deleteDriver: (id) => set((state) => ({
        drivers: state.drivers.filter(d => d.id !== id)
      })),

      addInvoice: (invoice) => set((state) => ({
        invoices: [invoice, ...state.invoices]
      })),

      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: state.users.length + 1 }]
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),

      approveSalesTapal: (id, editedData, userName = 'CHANNAPPA S.') => set((state) => {
        const tapal = state.tapals.find(t => t.id === id);
        if (!tapal) return {};

        const updatedTapal = { 
          ...tapal, 
          ...editedData, 
          status: 'Approved',
          approvedAt: new Date().toISOString(),
          approvedBy: userName
        };

        // Auto-generate invoice
        const newInvoice = {
          id: generateId('INV', state.invoices),
          client: updatedTapal.party,
          type: 'SALES',
          amount: updatedTapal.amount,
          numericAmount: parseFloat(updatedTapal.amount.replace(/[₹,]/g, '')) || 0,
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
          status: 'pending',
          tapalId: id
        };

        return {
          tapals: state.tapals.map(t => t.id === id ? updatedTapal : t),
          invoices: [newInvoice, ...state.invoices]
        };
      }),

      rejectSalesTapal: (id, reason, userName = 'CHANNAPPA S.') => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { 
          ...t, 
          status: 'Rejected', 
          rejectionReason: reason,
          rejectedAt: new Date().toISOString(),
          rejectedBy: userName
        } : t)
      })),

      suggestChangeSalesTapal: (id, changes, userName = 'CHANNAPPA S.') => set((state) => ({
        tapals: state.tapals.map(t => t.id === id ? { 
          ...t, 
          status: 'Changes Requested', 
          suggestedChanges: changes,
          suggestedAt: new Date().toISOString(),
          suggestedBy: userName
        } : t)
      })),

      addTransaction: (tx) => set((state) => ({
        transactions: [tx, ...state.transactions]
      })),

      farmers: [
        { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi', whatsapp: true, active: true, totalSlips: 12 },
        { id: 'FRM-002', name: 'DEEP SEA FARMS', mobile: '+91 98765 43211', location: 'MANGALORE', village: 'Ullal', whatsapp: true, active: true, totalSlips: 8 },
        { id: 'FRM-003', name: 'COASTAL HARVEST', mobile: '+91 98765 43212', location: 'UDUPI', village: 'Malpe', whatsapp: false, active: false, totalSlips: 5 },
      ],

      harvestSlips: [
        {
          id: 'HSL-0001', slipNo: 1, status: 'confirmed', createdBy: 'Mahesh', createdAt: '2026-04-29',
          farmer: { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi' },
          products: [{ id: 1, fishName: 'Rohu', category: 'Freshwater', quantity: 500, unit: 'KG', qualityType: 'A', estimatedWeight: 510, rate: 85, confirmedQty: 500 }],
          harvestDate: '2026-05-01', pickupDate: '2026-05-02', pickupTime: '06:00 AM',
          pickupLocation: 'Hemavathi Pond, Hassan', logisticsNotes: 'Ice required',
          remarks: '', attachmentUrl: null, rejectedReason: null, convertedToTapalId: 'PUR-1001',
        },
        {
          id: 'HSL-0002', slipNo: 2, status: 'sent', createdBy: 'Mahesh', createdAt: '2026-04-30',
          farmer: { id: 'FRM-002', name: 'DEEP SEA FARMS', mobile: '+91 98765 43211', location: 'MANGALORE', village: 'Ullal' },
          products: [
            { id: 1, fishName: 'Tiger Prawns', category: 'Seafood', quantity: 200, unit: 'KG', qualityType: 'A', estimatedWeight: null, rate: null, confirmedQty: null },
            { id: 2, fishName: 'Squid', category: 'Seafood', quantity: 100, unit: 'KG', qualityType: 'B', estimatedWeight: null, rate: null, confirmedQty: null },
          ],
          harvestDate: '2026-05-03', pickupDate: '2026-05-04', pickupTime: '07:00 AM',
          pickupLocation: 'Ullal Jetty, Mangalore', logisticsNotes: '',
          remarks: 'Call before pickup', attachmentUrl: null, rejectedReason: null, convertedToTapalId: null,
        },
        {
          id: 'HSL-0003', slipNo: 3, status: 'pending', createdBy: 'Mahesh', createdAt: '2026-05-01',
          farmer: { id: 'FRM-001', name: 'RAMU FISHERIES', mobile: '+91 98765 43210', location: 'HASSAN', village: 'Hemavathi' },
          products: [{ id: 1, fishName: 'Catla', category: 'Freshwater', quantity: 300, unit: 'KG', qualityType: 'Mix', estimatedWeight: null, rate: 90, confirmedQty: null }],
          harvestDate: '2026-05-06', pickupDate: '2026-05-07', pickupTime: '05:30 AM',
          pickupLocation: 'Hemavathi Pond, Hassan', logisticsNotes: 'Narrow road — small truck only',
          remarks: '', attachmentUrl: null, rejectedReason: null, convertedToTapalId: null,
        },
      ],

      addHarvestSlip: (slip) => set((state) => ({
        harvestSlips: [slip, ...state.harvestSlips],
        farmers: state.farmers.map(f =>
          f.id === slip.farmer.id ? { ...f, totalSlips: f.totalSlips + 1 } : f
        ),
      })),

      updateSlipStatus: (id, status, extra = {}) => set((state) => ({
        harvestSlips: state.harvestSlips.map(s =>
          s.id === id ? { ...s, status, ...extra } : s
        ),
      })),

      addFarmer: (farmer) => set((state) => ({
        farmers: [...state.farmers, { ...farmer, id: generateId('FRM', state.farmers), totalSlips: 0, active: true }],
      })),

      // ── API State variables ────────────────────────────────────
      loading: false,
      error: null,
      vehicles: [
        { id: 'VEH-0001', model: 'TATA ACE', plateNumber: 'KA-04-A-1234', capacity: '1.2 Tons', type: 'REEFER', status: 'ACTIVE', expiryDate: '2028-12-31' },
        { id: 'VEH-0002', model: 'MAHINDRA BOLERO', plateNumber: 'KA-04-B-5678', capacity: '1.8 Tons', type: 'REEFER', status: 'ACTIVE', expiryDate: '2027-06-30' }
      ],
      buyers: [
        { id: 'BUY-0001', name: 'GOLDEN RESTAURANT', phone: '+91 99887 76655', email: 'pos@goldenrest.com', address: 'MG Road, Bangalore', creditLimit: 50000, active: true },
        { id: 'BUY-0002', name: 'FISH MALL RETAIL', phone: '+91 99887 76656', email: 'mall@goldenrest.com', address: 'Ullal, Mangalore', creditLimit: 25000, active: true }
      ],

      // ── Async Actions: Farmers CRUD ────────────────────────────
      fetchFarmers: async (search = '') => {
        set({ loading: true, error: null });
        try {
          const res = await masterService.farmers.getAll({ search });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(f => ({
            id: f._id,
            name: (f.fullName || f.name || '').toUpperCase(),
            mobile: f.phone || f.mobile || '',
            location: (f.location || '').toUpperCase(),
            village: f.village || '',
            whatsapp: f.whatsapp !== false,
            active: f.isActive !== false,
            totalSlips: f.totalSlips || 0
          }));
          if (mapped.length) {
            set({ farmers: mapped });
          }
          set({ loading: false });
        } catch (err) {
          console.warn('Backend fetchFarmers failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      addFarmerAsync: async (farmerData) => {
        set({ loading: true });
        try {
          await masterService.farmers.create({
            fullName: farmerData.name,
            phone: farmerData.mobile,
            location: farmerData.location,
            village: farmerData.village,
            whatsapp: farmerData.whatsapp
          });
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateFarmerAsync: async (id, farmerData) => {
        set({ loading: true });
        try {
          await masterService.farmers.update(id, {
            fullName: farmerData.name,
            phone: farmerData.mobile,
            location: farmerData.location,
            village: farmerData.village,
            whatsapp: farmerData.whatsapp,
            isActive: farmerData.active
          });
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteFarmerAsync: async (id) => {
        set({ loading: true });
        try {
          await masterService.farmers.delete(id);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Async Actions: Products (Inventory) CRUD ───────────────
      fetchInventory: async () => {
        set({ loading: true, error: null });
        try {
          const res = await masterService.products.getAll();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(p => ({
            id: p._id,
            name: (p.name || '').toUpperCase(),
            category: (p.category || '').toUpperCase(),
            qty: p.quantity || 0,
            unit: p.baseUnit || 'KG',
            price: p.basePrice || 0,
            status: (p.quantity || 0) === 0 ? 'out-of-stock' : (p.quantity || 0) < (p.minStockLimit || 50) ? 'low-stock' : 'in-stock'
          }));
          if (mapped.length) {
            set({ inventory: mapped });
          }
          set({ loading: false });
        } catch (err) {
          console.warn('Backend fetchInventory failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      addInventoryItemAsync: async (itemData) => {
        set({ loading: true });
        try {
          await masterService.products.create({
            name: itemData.name,
            category: itemData.category,
            quantity: itemData.qty,
            baseUnit: itemData.unit,
            basePrice: itemData.price,
            minStockLimit: 50
          });
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Async Actions: Drivers CRUD ────────────────────────────
      fetchDrivers: async (search = '') => {
        set({ loading: true, error: null });
        try {
          const res = await masterService.drivers.getAll({ search });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(d => ({
            id: d._id,
            name: d.fullName || '',
            phone: d.phone || d.mobile || '',
            vehicle: d.vehicleNumber || 'MH-12-AS-4567',
            status: d.status || 'active',
            rating: d.rating || 4.5,
            trips: d.totalTrips || 0
          }));
          if (mapped.length) {
            set({ drivers: mapped });
          }
          set({ loading: false });
        } catch (err) {
          console.warn('Backend fetchDrivers failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      addDriverAsync: async (driverData) => {
        set({ loading: true });
        try {
          await masterService.drivers.create({
            fullName: driverData.name,
            phone: driverData.phone,
            vehicleNumber: driverData.vehicle,
            status: 'active'
          });
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Async Actions: Vehicles CRUD ───────────────────────────
      fetchVehicles: async () => {
        set({ loading: true, error: null });
        try {
          const res = await masterService.vehicles.getAll();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(v => ({
            id: v._id,
            model: v.model || '',
            plateNumber: v.plateNumber || '',
            capacity: v.capacity || '',
            type: v.type || 'REEFER',
            status: v.status || 'ACTIVE',
            expiryDate: v.expiryDate ? new Date(v.expiryDate).toISOString().slice(0, 10) : '2028-12-31'
          }));
          if (mapped.length) {
            set({ vehicles: mapped });
          }
          set({ loading: false });
        } catch (err) {
          console.warn('Backend fetchVehicles failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      addVehicleAsync: async (vehicleData) => {
        set({ loading: true });
        try {
          await masterService.vehicles.create(vehicleData);
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Async Actions: Buyers CRUD ─────────────────────────────
      fetchBuyers: async (search = '') => {
        set({ loading: true, error: null });
        try {
          const res = await masterService.buyers.getAll({ search });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(b => ({
            id: b._id,
            name: (b.fullName || b.name || '').toUpperCase(),
            phone: b.phone || '',
            email: b.email || '',
            address: b.address || '',
            creditLimit: b.creditLimit || 0,
            active: b.isActive !== false
          }));
          if (mapped.length) {
            set({ buyers: mapped });
          }
          set({ loading: false });
        } catch (err) {
          console.warn('Backend fetchBuyers failed, using mock persistence:', err.message);
          set({ loading: false });
        }
      },

      addBuyerAsync: async (buyerData) => {
        set({ loading: true });
        try {
          await masterService.buyers.create({
            fullName: buyerData.name,
            phone: buyerData.phone,
            email: buyerData.email,
            address: buyerData.address,
            creditLimit: buyerData.creditLimit
          });
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Legacy helper removed in favor of convertSlipToTapalAsync
      convertSlipToTapal: async (slipId) => {
        return await get().convertSlipToTapalAsync(slipId);
      },

      // Vehicle Actions
      addVehicle: (vehicle) => set((state) => ({
        vehicles: [...state.vehicles, { ...vehicle, id: generateId('VEH', state.vehicles) }]
      })),

      updateVehicle: (id, updates) => set((state) => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...updates } : v)
      })),

      deleteVehicle: (id) => set((state) => ({
        vehicles: state.vehicles.filter(v => v.id !== id)
      })),

      assignDriverToVehicle: (vehicleId, driverId, driverName) => set((state) => ({
        vehicles: state.vehicles.map(v => v.id === vehicleId ? { ...v, assignedDriverId: driverId, assignedDriverName: driverName } : v)
      })),

      addMaintenanceLog: (log) => set((state) => ({
        maintenanceLogs: [...state.maintenanceLogs, { ...log, id: generateId('MLOG', state.maintenanceLogs) }]
      })),

      addVehicleDocument: (vehicleId, docType, docData) => set((state) => ({
        vehicles: state.vehicles.map(v => 
          v.id === vehicleId 
            ? { ...v, documents: { ...v.documents, [docType]: docData } } 
            : v
        )
      })),

      transferStockToRestaurant: (items) => set((state) => {
        // items is array of { name: 'ROHU', qty: 50 }
        const newInventory = state.inventory.map(invItem => {
          const matchingItem = items.find(i => i.name.toUpperCase() === invItem.name.toUpperCase());
          if (matchingItem) {
            const nextQty = Math.max(0, invItem.qty - matchingItem.qty);
            return { ...invItem, qty: nextQty, status: nextQty === 0 ? 'out-of-stock' : nextQty < 50 ? 'low-stock' : 'in-stock' };
          }
          return invItem;
        });

        // Notify restaurant store
        useRestaurantStore.getState().receiveStock(items);

        return { inventory: newInventory };
      }),

      transferStockToFishMall: (items) => set((state) => {
        const newInventory = state.inventory.map(invItem => {
          const matchingItem = items.find(i => i.name.toUpperCase() === invItem.name.toUpperCase());
          if (matchingItem) {
            const nextQty = Math.max(0, invItem.qty - matchingItem.qty);
            return { ...invItem, qty: nextQty, status: nextQty === 0 ? 'out-of-stock' : nextQty < 50 ? 'low-stock' : 'in-stock' };
          }
          return invItem;
        });

        // Notify fish mall store
        useFishMallStore.getState().receiveStock(items);

        return { inventory: newInventory };
      }),
    }),
    {
      name: 'golden-fisheries-admin-v2',
    }
  )
);

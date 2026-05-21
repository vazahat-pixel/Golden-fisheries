import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { masterService } from '../services/masterService';
import { tapalService } from '../services/tapalService';
import { billingService } from '../services/billingService';
import { harvestService } from '../services/harvestService';
import { expenseService } from '../services/expenseService';
import { reportsService } from '../services/reportsService';
import { apiClient } from '../services/apiClient';
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
      tapals: [],
      inventory: [],
      invoices: [],
      drivers: [],
      users: [],
      transactions: [],
      trips: [],
      buyerTrips: [],
      incomingStock: [],
      purchaseInvoices: [],
      harvestSlips: [],
      farmers: [],

      // Expense Ledger — pending admin approval before hitting accounts
      expenses: [],

      // Vehicle Fleet State
      vehicles: [],
      maintenanceLogs: [],
      vehiclePerformance: [],

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







      fetchFarmers: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await masterService.farmers.getAll(params);
          // apiClient interceptor returns response.data = ApiResponse envelope
          // farmerController.all: ApiResponse(200, result.docs, ..., result.meta)
          // So res = { success, data: [...farmers], meta }
          const list = Array.isArray(res?.data) ? res.data : [];
          set({ farmers: list, loading: false });
        } catch (err) {
          console.warn('[Procurement] fetchFarmers failed:', err.message);
          set({ loading: false });
        }
      },



      // Tapals Async
      fetchTapals: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await tapalService.all(params);
          // tapalController.all: ApiResponse(200, result.docs, ..., result.meta)
          // So res = { success, data: [...tapals], meta }
          const list = Array.isArray(res?.data) ? res.data : [];
          const mapped = list.map(t => ({
            ...t,
            id: t._id,
            status: (t.type === 'Sale' && t.status === 'CREATED') ? 'Pending Approval' : t.status
          }));
          set({ tapals: mapped, loading: false });
        } catch (err) {
          console.warn('[Tapals] fetchTapals failed:', err.message);
          set({ loading: false });
        }
      },

      fetchTrips: async () => {
        set({ loading: true });
        try {
          const res = await tapalService.allTrips();
          // tapalController trips: ApiResponse(200, result.docs, ..., result.meta)
          // So res = { success, data: [...trips], meta }
          const list = Array.isArray(res?.data) ? res.data : [];
          const mapped = list.map(t => ({
            id: t._id,
            tripNumber: t.tripNumber,
            tapalId: t.tapalId?._id || t.tapalId,
            driverId: t.driverId?._id || t.driverId,
            driverName: t.driverId?.fullName || 'Driver',
            vehicle: t.vehicleId?.plateNumber || 'Vehicle',
            status: t.status,
            pickupLocation: t.pickupLocation,
            deliveryLocation: t.deliveryLocation,
            product: 'Cargo',
            expectedQty: t.expectedQty,
            actualQty: t.actualDeliveredQty || t.actualPickupQty,
            createdAt: new Date(t.createdAt).toLocaleTimeString(),
            expenses: t.expenses || [],
            timeline: t.timeline || []
          }));
          set({ trips: mapped, loading: false });
        } catch (err) {
          console.warn('[Logistics] fetchTrips failed:', err.message);
          set({ loading: false });
        }
      },

      fetchBuyerTrips: async () => {
        set({ loading: true });
        try {
          const res = await tapalService.myBuyerTrips();
          const list = Array.isArray(res?.data) ? res.data : [];
          const mapped = list.map(t => ({
            id: t._id,
            tripNumber: t.tripNumber,
            tapalId: t.tapalId?._id || t.tapalId,
            driverId: t.driverId?._id || t.driverId,
            driverName: t.driverId?.fullName || 'Driver',
            vehicle: t.vehicleId?.plateNumber || 'Vehicle',
            status: t.status,
            pickupLocation: t.pickupLocation,
            deliveryLocation: t.deliveryLocation,
            product: 'Cargo',
            expectedQty: t.expectedQty,
            actualQty: t.actualDeliveredQty || t.actualPickupQty,
            createdAt: new Date(t.createdAt).toLocaleTimeString(),
            expenses: t.expenses || [],
            timeline: t.timeline || []
          }));
          set({ buyerTrips: mapped, loading: false });
        } catch (err) {
          console.warn('[Buyer] fetchBuyerTrips failed:', err.message);
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

      returnTapalAsync: async (tapalId, reason) => {
        set({ loading: true });
        try {
          await tapalService.returnTapal(tapalId, reason);
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
          // harvestService calls apiClient.get directly — interceptor returns response.data
          // harvestController.all sends: ApiResponse(200, result.docs, ..., result.meta)
          // So res = { success, data: [...harvests], meta: {...} }
          const list = Array.isArray(res?.data) ? res.data : (res?.docs || []);
          set({ harvestSlips: Array.isArray(list) ? list : [], loading: false });
        } catch (err) {
          console.warn('[Procurement] fetchHarvestSlips failed:', err.message);
          set({ loading: false });
        }
      },

      convertSlipToTapalAsync: async (slipId, assignedTo = null, selectedItems = null) => {
        try {
          // POST /harvests/convert-to-tapal/:id
          // Returns ApiResponse(201, { tapal }, ...)
          // After interceptor: res = { success, data: { tapal } }
          const res = await harvestService.convertToTapal(slipId, { assignedTo, selectedItems });
          const tapal = res?.data?.tapal || res?.tapal || res;
          await get().fetchHarvestSlips();
          await get().fetchTapals();
          return tapal;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      createHarvestSlipAsync: async (data) => {
        try {
          const res = await harvestService.create(data);
          // harvestController.create sends ApiResponse(201, { harvest }, ...)
          // After interceptor: res = { success, data: { harvest } }
          const created = res?.data?.harvest || res?.harvest || res;
          await get().fetchHarvestSlips();
          return created;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      addFarmerAsync: async (data) => {
        try {
          // masterService.create returns response.data (ApiResponse envelope)
          // farmerController.create: ApiResponse(201, { farmer }, ...)
          // So res = { success, data: { farmer } }
          const res = await masterService.farmers.create(data);
          await get().fetchFarmers();
          return res?.data?.farmer || res?.farmer || res;
        } catch (err) {
          set({ error: err.message });
          throw err;
        }
      },

      // NOTE: Frontend NEVER directly updates stock qty.
      // All stock changes must go through the backend inventory service.
      // Use masterService.inventory.adjustManual for admin manual corrections.
      updateInventoryQtyAsync: async (itemId, delta, remarks = 'Admin manual adjustment') => {
        set({ loading: true });
        try {
          await masterService.inventory.adjustManual(itemId, { qtyChange: delta, remarks });
          // Inventory is managed server-side; no client-side store holds live qty
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

      saveNetRateAsync: async (id, data) => {
        set({ loading: true });
        try {
          const res = await harvestService.saveNetRate(id, data);
          await get().fetchHarvestSlips();
          set({ loading: false });
          return res?.data?.harvest || res?.harvest || res;
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
          const mapped = list.map(inv => ({
            id: inv.invoiceNumber || inv._id,
            client: inv.partyName || 'Unknown Client',
            type: inv.type,
            amount: `₹${inv.totalAmount?.toLocaleString('en-IN') || 0}`,
            numericAmount: inv.totalAmount || 0,
            status: (inv.paymentStatus || 'pending').toLowerCase(),
            date: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'RECENT',
            dueDate: inv.dueDate,
            tapalId: inv.tapalId
          }));
          const salesInvoices = mapped.filter(inv => inv.type === 'SALES');
          const purchaseInvoices = mapped.filter(inv => inv.type === 'PROCUREMENT');
          set({ invoices: salesInvoices, purchaseInvoices, loading: false });
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
          console.warn('Backend fetchExpenses failed:', err.message);
          set({ loading: false });
        }
      },

      fetchTransactions: async () => {
        set({ loading: true });
        try {
          const [invoicesRes, expensesRes, restaurantRes, fishmallRes] = await Promise.all([
            billingService.all(),
            expenseService.all(),
            apiClient.get('/restaurant/all'),
            apiClient.get('/fishmall/all')
          ]);
          
          const invoices = invoicesRes?.docs || invoicesRes?.data || [];
          const expenses = expensesRes?.docs || expensesRes?.data || [];
          const restaurantOrders = restaurantRes?.docs || restaurantRes?.data || [];
          const fishmallSales = fishmallRes?.docs || fishmallRes?.data || [];
          
          const tx1 = invoices.map(inv => ({
            date: new Date(inv.createdAt).toLocaleDateString(),
            desc: `Invoice ${inv.invoiceNumber} - ${inv.partyName}`,
            method: 'Bank Transfer',
            type: inv.type === 'Sale' ? 'income' : 'expense',
            amount: inv.numericAmount
          }));

          const tx2 = restaurantOrders.map(order => ({
            date: new Date(order.createdAt).toLocaleDateString(),
            desc: `Restaurant Order #${order.orderNumber || order._id}`,
            method: order.paymentMethod || 'CASH',
            type: 'income',
            amount: order.totalAmount
          }));

          const tx3 = fishmallSales.map(sale => ({
            date: new Date(sale.createdAt).toLocaleDateString(),
            desc: `FishMall Sale #${sale.saleNumber || sale._id}`,
            method: sale.paymentMethod || 'CASH',
            type: 'income',
            amount: sale.totalAmount
          }));

          const tx4 = expenses.map(exp => ({
            date: new Date(exp.createdAt).toLocaleDateString(),
            desc: `${exp.expenseType} - ${exp.description || 'Expense'}`,
            method: exp.paymentMethod || 'CASH',
            type: 'expense',
            amount: exp.amount
          }));
          
          const allTx = [...tx1, ...tx2, ...tx3, ...tx4].sort((a, b) => new Date(b.date) - new Date(a.date));
          set({ transactions: allTx, loading: false });
        } catch (err) {
          console.warn('Backend fetchTransactions failed:', err.message);
          set({ loading: false });
        }
      },

      reviewExpenseAsync: async (id, status, reason = null) => {
        set({ loading: true });
        try {
          const upperStatus = status.toUpperCase(); // Convert to UPPERCASE for backend enum
          await expenseService.approve(id, upperStatus);
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
        tapals: state.tapals.map(t => (t._id === id || t.id === id) ? { ...t, status } : t)
      })),

      editTapal: (id, updates) => set((state) => ({
        tapals: state.tapals.map(t => (t._id === id || t.id === id) ? { ...t, ...updates } : t)
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

      // driverRejectTrip REMOVED — business rule: drivers have no reject option

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

      // Driver submits an expense
      submitExpense: async (expenseData) => {
        set({ loading: true });
        try {
          await expenseService.create(expenseData);
          await get().fetchExpenses();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // Admin marks stock received — triggers inventory update via endTrip (backend-safe)
      markStockReceived: async (tapalId, qty) => {
        try {
          await tapalService.endTrip(tapalId);
          await get().fetchTapals();
          await get().fetchTrips();
          // Inventory is updated server-side by tapalService.endTrip — no client-side stock mutation
        } catch (err) {
          console.error('[Tapal] markStockReceived failed:', err.message);
          throw err;
        }
      },

      // Log a trip expense via backend (maps to POST /tapals/expense)
      addTripExpense: async (tripId, expenseData) => {
        try {
          await tapalService.logExpense(tripId, expenseData);
          await get().fetchTrips();
        } catch (err) {
          console.error('[Tapal] addTripExpense failed:', err.message);
          throw err;
        }
      },

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

      farmers: [],
      harvestSlips: [],

      fetchHarvestSlips: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await harvestService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ harvestSlips: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch harvest slips', err);
          set({ loading: false });
        }
      },

      addHarvestSlip: async (slipData) => {
        set({ loading: true });
        try {
          await harvestService.create(slipData);
          await get().fetchHarvestSlips();
          await get().fetchFarmers();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateSlipStatus: (id, status, extra = {}) => set((state) => ({
        harvestSlips: state.harvestSlips.map(s =>
          s.id === id ? { ...s, status, ...extra } : s
        ),
      })),

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

      convertSlipToTapalAsync: async (id, assignedTo, selectedItems) => {
        set({ loading: true });
        try {
          await harvestService.convertToTapal(id, { assignedTo, selectedItems });
          await get().fetchHarvestSlips();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      addFarmer: (farmer) => set((state) => ({
        farmers: [...state.farmers, { ...farmer, id: generateId('FRM', state.farmers), totalSlips: 0, active: true }],
      })),

      // ── API State variables ────────────────────────────────────
      loading: false,
      error: null,
      vehicles: [],
      buyers: [],
      dashboardStats: null,

      // ── Async Actions: Dashboard ───────────────────────────────
      fetchDashboardStats: async () => {
        set({ loading: true });
        try {
          const res = await reportsService.getDashboardStats();
          const data = res?.data || res;
          set({ dashboardStats: data, loading: false });
        } catch (err) {
          console.error('Failed to fetch dashboard stats', err);
          set({ loading: false });
        }
      },

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
          set({ farmers: mapped, loading: false });
        } catch (err) {
          console.warn('Backend fetchFarmers failed:', err.message);
          set({ loading: false });
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
          await get().fetchFarmers();
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
          set({ inventory: mapped, loading: false });
        } catch (err) {
          console.warn('Backend fetchInventory failed:', err.message);
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
          await get().fetchInventory();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ── Async Actions: Drivers CRUD ────────────────────────────
      fetchExpenses: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await expenseService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ expenses: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch expenses', err);
          set({ loading: false });
        }
      },

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
          set({ drivers: mapped, loading: false });
        } catch (err) {
          console.warn('Backend fetchDrivers failed:', err.message);
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
          await get().fetchDrivers();
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
            model: v.type || '',
            plateNumber: v.vehicleNumber || '',
            capacity: v.capacity || '',
            type: v.type || 'REEFER',
            status: v.status || 'Active',
            expiryDate: v.documents?.rc?.expiry ? new Date(v.documents.rc.expiry).toISOString().slice(0, 10) : '2028-12-31'
          }));
          set({ vehicles: mapped, loading: false });
        } catch (err) {
          console.warn('Backend fetchVehicles failed:', err.message);
          set({ loading: false });
        }
      },

      addVehicleAsync: async (vehicleData) => {
        set({ loading: true });
        try {
          await masterService.vehicles.create(vehicleData);
          await get().fetchVehicles();
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
          set({ buyers: mapped, loading: false });
        } catch (err) {
          console.warn('Backend fetchBuyers failed:', err.message);
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
          await get().fetchBuyers();
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

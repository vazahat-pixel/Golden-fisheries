import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAdminStore } from './adminStore';
import { fishmallService } from '../services/fishmallService';
import { masterService } from '../services/masterService';
import { expenseService } from '../services/expenseService';

export const useFishMallStore = create(
  persist(
    (set, get) => ({
      stock: [],
      bills: [],
      expenses: [],
      closings: [],
      alerts: [],
      stockLogs: [],
      
      // Actions
      addBill: (bill) => {
        const billData = {
          ...bill,
          id: bill.id || `BILL-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          bills: [billData, ...state.bills]
        }));
        // Auto-check for alerts after a bill
        get().generateAlerts();

        // NEW: Cross-post to Admin Finance
        useAdminStore.getState().addTransaction({
          date: new Date().toLocaleDateString('en-GB'),
          desc: `FISH MALL BILL: #${billData.id}`,
          method: 'CASH', // Default for mall
          type: 'income',
          amount: billData.total,
          source: 'FISHMALL'
        });
      },

      updateStockQty: (id, delta) => {
        const item = get().stock.find(i => i.id === id);
        set((state) => ({
          stock: state.stock.map(item => 
            item.id === id ? { ...item, qty: Math.max(0, item.qty + delta), lastSync: new Date().toISOString().split('T')[0] } : item
          ),
          stockLogs: [{
            id: Date.now(),
            productId: id,
            productName: item?.name,
            delta,
            type: delta > 0 ? 'INFLOW' : 'OUTFLOW',
            timestamp: new Date().toISOString()
          }, ...state.stockLogs]
        }));
        get().generateAlerts();
      },

      updateRate: (id, newRate) => {
        const oldItem = get().stock.find(i => i.id === id);
        set((state) => ({
          stock: state.stock.map(item => 
            item.id === id ? { ...item, rate: newRate } : item
          )
        }));
        if (oldItem && Math.abs(oldItem.rate - newRate) / oldItem.rate > 0.1) {
          get().generateAlerts(); // Trigger alert on 10%+ change
        }
      },

      addStockItem: (newItem) => set((state) => ({
        stock: [...state.stock, { ...newItem, id: state.stock.length + 1 }]
      })),

      receiveStock: (items) => set((state) => ({
        stock: state.stock.map(stockItem => {
          const matchingItem = items.find(i => i.name.toUpperCase() === stockItem.name.toUpperCase());
          if (matchingItem) {
            return { ...stockItem, qty: stockItem.qty + (matchingItem.qty || matchingItem.quantity || 0) };
          }
          return stockItem;
        })
      })),

      // NEW ACTIONS
      addExpense: (expense) => {
        const expenseData = { ...expense, id: Date.now(), timestamp: new Date().toISOString() };
        set((state) => ({
          expenses: [expenseData, ...state.expenses]
        }));

        // NEW: Cross-post to Admin Finance
        useAdminStore.getState().addTransaction({
          date: new Date().toLocaleDateString('en-GB'),
          desc: `FISH MALL EXPENSE: ${expenseData.description || expenseData.desc}`,
          method: expenseData.method || 'CASH',
          type: 'expense',
          amount: Number(expenseData.amount),
          source: 'FISHMALL'
        });
      },

      removeExpense: (id) => set((state) => ({
        expenses: state.expenses.filter(e => e.id !== id)
      })),

      recordClosing: (closingData) => set((state) => ({
        closings: [{ ...closingData, id: `CLOSE-${Date.now()}`, timestamp: new Date().toISOString() }, ...state.closings]
      })),

      generateAlerts: () => {
        const currentStock = get().stock;
        const newAlerts = [];
        
        currentStock.forEach(item => {
          if (item.qty < 50) {
            newAlerts.push({
              id: `LOW-${item.id}-${Date.now()}`,
              type: 'LOW_STOCK',
              title: 'Low Stock Alert',
              message: `${item.name} is below 50KG (${item.qty}KG remaining)`,
              severity: 'warning',
              timestamp: new Date().toISOString()
            });
          }
        });

        set(state => {
          // Merge unique alerts (simple deduplication by type+id)
          const existingIds = new Set(state.alerts.map(a => a.id.split('-').slice(0,2).join('-')));
          const uniqueNew = newAlerts.filter(a => !existingIds.has(a.id.split('-').slice(0,2).join('-')));
          return { alerts: [...uniqueNew, ...state.alerts] };
        });
      },

      dismissAlert: (id) => set(state => ({
        alerts: state.alerts.filter(a => a.id !== id)
      })),

      // Async Actions
      fetchStock: async () => {
        set({ loading: true });
        try {
          const res = await masterService.products.getAll();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(p => ({
            id: p._id,
            name: p.name,
            category: p.category,
            qty: p.quantity,
            unit: p.baseUnit,
            rate: p.basePrice,
            lastSync: new Date().toISOString().split('T')[0]
          }));
          set({ stock: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch stock', err);
          set({ loading: false });
        }
      },

      createSaleAsync: async (saleData) => {
        set({ loading: true });
        try {
          const res = await fishmallService.create(saleData);
          
          // Cross-post to Admin Finance
          useAdminStore.getState().addTransaction({
            date: new Date().toLocaleDateString('en-GB'),
            desc: `FISH MALL BILL: #${res?.data?.saleNumber || res?.saleNumber || 'FM'}`,
            method: saleData.paymentMethod || 'CASH',
            type: 'income',
            amount: saleData.total,
            source: 'FISHMALL'
          });

          await get().fetchStock();
          set({ loading: false });
          return res;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      publishRatesAsync: async () => {
        set({ loading: true });
        try {
          const stock = get().stock;
          for (const item of stock) {
            await masterService.products.update(item.id, { basePrice: item.rate });
          }
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      fetchStockAsync: async () => {
        set({ loading: true });
        try {
          const res = await masterService.products.getAll();
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          const mapped = list.map(p => ({
            id: p._id,
            name: (p.name || '').toUpperCase(),
            category: (p.category || '').toUpperCase(),
            qty: p.quantity || 0,
            unit: p.baseUnit || 'KG',
            rate: p.basePrice || 0,
            lastSync: new Date(p.updatedAt).toLocaleDateString()
          }));
          set({ stock: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch fishmall stock', err);
          set({ loading: false });
        }
      },

      fetchExpensesAsync: async () => {
        set({ loading: true });
        try {
          const res = await expenseService.all({ source: 'FISHMALL' });
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ expenses: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch fishmall expenses', err);
          set({ loading: false });
        }
      },

      submitExpenseAsync: async (expenseData) => {
        set({ loading: true });
        try {
          await expenseService.create({ ...expenseData, source: 'FISHMALL' });
          await get().fetchExpensesAsync();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'golden-fisheries-fishmall',
    }
  )
);

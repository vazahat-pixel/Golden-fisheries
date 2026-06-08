import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAdminStore } from './adminStore';
import { fishmallService } from '../services/fishmallService';
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
      pendingTransfers: [],
      activeSession: null,
      accountingSummary: null,
      cashbook: [],
      
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

      addProcurementTransferAlert: (payload, kind = 'received') => {
        const lines = payload?.lines || [];
        const itemsSummary = lines
          .map((l) => `${l.productName} (${l.quantity} ${l.unit || 'KG'})`)
          .join(', ');
        const status = payload?.status || (kind === 'pending' ? 'PENDING_APPROVAL' : 'ACCEPTED');
        const canAccept = status === 'IN_TRANSIT' || status === 'PENDING_ACCEPTANCE';
        const transferId = payload?.transferId || payload?._id;
        const isPending = kind === 'pending';
        const alert = {
          id: `TR-${payload.transferNumber}-${status}-${Date.now()}`,
          type: 'PROCUREMENT_TRANSFER',
          title: canAccept
            ? `Stock dispatch — ${payload.transferNumber}`
            : isPending
              ? `Transfer queued — ${payload.transferNumber}`
              : `Stock received — ${payload.transferNumber}`,
          message: canAccept
            ? `Procurement ne stock bheja hai: ${itemsSummary || `${payload.lineCount || lines.length} item(s)`}. Accept karein — inventory auto update hogi.`
            : isPending
              ? `Admin ne transfer banaya (${payload.outletName || 'Fish Mall'}). Dispatch ke baad accept option milega.`
              : `Procurement stock delivered: ${itemsSummary || payload.transferNumber}.`,
          severity: canAccept ? 'critical' : isPending ? 'warning' : 'info',
          timestamp: new Date().toISOString(),
          read: false,
          transferNumber: payload.transferNumber,
          transferId,
          outletId: payload.outletId,
          status,
          canAccept,
          lines,
        };
        set((state) => ({
          alerts: [
            alert,
            ...state.alerts.filter(
              (a) =>
                a.type !== 'PROCUREMENT_TRANSFER' ||
                (a.transferNumber !== payload.transferNumber && String(a.transferId) !== String(transferId))
            ),
          ].slice(0, 50),
        }));
        return alert;
      },

      markAlertsRead: () =>
        set((state) => ({
          alerts: state.alerts.map((a) => ({ ...a, read: true })),
        })),

      unreadAlertCount: () => get().alerts.filter((a) => !a.read).length,

      // Async Actions
      fetchStock: async () => {
        set({ loading: true });
        try {
          const res = await fishmallService.getInventory({ limit: 500 });
          const list = res?.data || res?.docs || (Array.isArray(res) ? res : []);
          const mapped = list.map((p) => ({
            id: p._id || p.id,
            name: p.name,
            category: 'RETAIL',
            qty: p.quantity ?? 0,
            unit: p.unit || 'KG',
            rate: p.rate ?? 0,
            openingStock: p.openingStock ?? 0,
            lastSync: new Date(p.recordDate || p.updatedAt).toISOString().split('T')[0],
          }));
          set({ stock: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch Fish Mall stock', err);
          set({ loading: false });
        }
      },

      fetchPendingTransfers: async () => {
        try {
          const res = await fishmallService.listPendingTransfers();
          const list = res?.data || res || [];
          set({ pendingTransfers: Array.isArray(list) ? list : [] });
        } catch (err) {
          console.error('Failed to fetch pending transfers', err);
          set({ pendingTransfers: [] });
        }
      },

      acceptTransferAsync: async (transferId, payload = { status: 'ACCEPTED', remarks: 'Accepted at Fish Mall' }) => {
        set({ loading: true });
        try {
          await fishmallService.acceptTransfer(transferId, payload);
          await get().fetchPendingTransfers();
          await get().fetchStock();
          set((state) => ({
            loading: false,
            alerts: state.alerts.filter(
              (a) =>
                a.type !== 'PROCUREMENT_TRANSFER' ||
                String(a.transferId) !== String(transferId)
            ),
          }));
        } catch (err) {
          set({ loading: false, error: err.message });
          throw err;
        }
      },

      createSaleAsync: async (saleData) => {
        set({ loading: true });
        try {
          const res = await fishmallService.create(saleData);
          
          // Cross-post to Admin Finance
          useAdminStore.getState().addTransaction({
            date: new Date().toLocaleDateString('en-GB'),
            desc: `FISH MALL BILL: #${res?.data?.sale?.saleNumber || res?.sale?.saleNumber || 'FM'}`,
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
            await fishmallService.updateInventoryItem(item.id, { rate: item.rate });
          }
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      fetchStockAsync: async () => {
        await get().fetchStock();
      },

      fetchExpensesAsync: async () => {
        set({ loading: true });
        try {
          const res = await fishmallService.listExpenses();
          const list = res?.data || res || [];
          set({ expenses: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch fishmall expenses', err);
          set({ loading: false });
        }
      },

      submitExpenseAsync: async (expenseData) => {
        set({ loading: true });
        try {
          await fishmallService.recordExpense(expenseData);
          await get().fetchAccountingSummaryAsync();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      fetchActiveSessionAsync: async () => {
        try {
          const res = await fishmallService.getActiveSession();
          set({ activeSession: res?.data?.activeSession || res?.activeSession || null });
        } catch (err) {
          console.error('Failed to fetch active session', err);
        }
      },

      openSessionAsync: async (openingCash, openingNotes) => {
        set({ loading: true });
        try {
          const res = await fishmallService.openSession({ openingCash, openingNotes });
          const session = res?.data?.session || res?.session;
          set({ activeSession: session, loading: false });
          await get().fetchAccountingSummaryAsync();
          return session;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      closeSessionAsync: async (closingData) => {
        set({ loading: true });
        try {
          const res = await fishmallService.closeSession(closingData);
          const session = res?.data?.session || res?.session;
          set({ activeSession: null, accountingSummary: null, cashbook: [], loading: false });
          get().recordClosing({
            cashReported: closingData.actualClosingCash,
            notes: closingData.closingNotes,
            systemSales: session?.salesTotal || 0,
            date: new Date().toISOString().split('T')[0]
          });
          return session;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      fetchAccountingSummaryAsync: async () => {
        try {
          const res = await fishmallService.getSessionSummary();
          const summary = res?.data || res;
          set({
            accountingSummary: summary?.session || null,
            expenses: summary?.expenses || [],
            cashbook: summary?.cashbook || []
          });
        } catch (err) {
          console.error('Failed to fetch accounting summary', err);
        }
      },
    }),
    {
      name: 'golden-fisheries-fishmall-v2',
      partialize: () => ({}),
    }
  )
);

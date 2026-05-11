import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAdminStore } from './adminStore';

export const useFishMallStore = create(
  persist(
    (set, get) => ({
      stock: [
        { id: 1, name: "King Fish", category: "Premium", qty: 45, unit: "KG", rate: 550, lastSync: "2024-05-05" },
        { id: 2, name: "Prawns (Medium)", category: "Shellfish", qty: 120, unit: "KG", rate: 420, lastSync: "2024-05-05" },
        { id: 3, name: "Pomfret (White)", category: "Premium", qty: 25, unit: "KG", rate: 850, lastSync: "2024-05-05" },
        { id: 4, name: "Mackerel", category: "Regular", qty: 200, unit: "KG", rate: 180, lastSync: "2024-05-05" },
        { id: 5, name: "Sardines", category: "Regular", qty: 500, unit: "KG", rate: 120, lastSync: "2024-05-05" },
        { id: 6, name: "Crabs", category: "Shellfish", qty: 60, unit: "KG", rate: 650, lastSync: "2024-05-05" }
      ],
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
      }))
    }),
    {
      name: 'golden-fisheries-fishmall',
    }
  )
);

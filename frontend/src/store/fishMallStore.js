import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      
      // Actions
      addBill: (bill) => set((state) => ({
        bills: [
          {
            ...bill,
            id: `BILL-${Date.now()}`,
            timestamp: new Date().toISOString(),
          },
          ...state.bills
        ]
      })),

      updateStockQty: (id, delta) => set((state) => ({
        stock: state.stock.map(item => 
          item.id === id ? { ...item, qty: Math.max(0, item.qty + delta), lastSync: new Date().toISOString().split('T')[0] } : item
        )
      })),

      updateRate: (id, newRate) => set((state) => ({
        stock: state.stock.map(item => 
          item.id === id ? { ...item, rate: newRate } : item
        )
      })),

      addStockItem: (newItem) => set((state) => ({
        stock: [...state.stock, { ...newItem, id: state.stock.length + 1 }]
      }))
    }),
    {
      name: 'golden-fisheries-fishmall',
    }
  )
);

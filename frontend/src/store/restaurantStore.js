import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRestaurantStore = create(
  persist(
    (set, get) => ({
      menuItems: [
        { id: 1, name: "Fish Thali", price: 180, category: "Main Course", image: "🐟", stock: 50 },
        { id: 2, name: "Prawn Ghee Roast", price: 350, category: "Sea Food", image: "🍤", stock: 20 },
        { id: 3, name: "King Fish Fry", price: 420, category: "Sea Food", image: "🐟", stock: 15 },
        { id: 4, name: "Pomfret Masala", price: 550, category: "Sea Food", image: "🐠", stock: 10 },
        { id: 5, name: "Steam Rice", price: 60, category: "Main Course", image: "🍚", stock: 100 },
        { id: 6, name: "Chicken 65", price: 220, category: "Starters", image: "🍗", stock: 40 },
        { id: 7, name: "Lime Juice", price: 40, category: "Drinks", image: "🥤", stock: 80 },
        { id: 8, name: "Caramel Custard", price: 120, category: "Desserts", image: "🍮", stock: 25 }
      ],
      orders: [],
      
      // Actions
      addOrder: (order) => set((state) => ({
        orders: [
          {
            ...order,
            id: `ORD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: 'COMPLETED'
          },
          ...state.orders
        ]
      })),

      updateMenuItem: (updatedItem) => set((state) => ({
        menuItems: state.menuItems.map(item => 
          item.id === updatedItem.id ? updatedItem : item
        )
      })),

      addMenuItem: (newItem) => set((state) => ({
        menuItems: [
          ...state.menuItems,
          { ...newItem, id: state.menuItems.length + 1 }
        ]
      })),

      deleteMenuItem: (id) => set((state) => ({
        menuItems: state.menuItems.filter(item => item.id !== id)
      })),

      updateStock: (id, amount) => set((state) => ({
        menuItems: state.menuItems.map(item => 
          item.id === id ? { ...item, stock: item.stock + amount } : item
        )
      }))
    }),
    {
      name: 'golden-fisheries-restaurant',
    }
  )
);

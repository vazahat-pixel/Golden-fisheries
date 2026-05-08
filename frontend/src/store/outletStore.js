import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOutletStore = create(
  persist(
    (set, get) => ({
      restaurants: [],
      fishMalls: [],

      // Actions for Restaurants
      registerRestaurant: (data) => set((state) => ({
        restaurants: [
          ...state.restaurants,
          {
            ...data,
            id: `RES-${Date.now()}`,
            status: 'ACTIVE',
            registeredAt: new Date().toISOString()
          }
        ]
      })),

      toggleRestaurantStatus: (id) => set((state) => ({
        restaurants: state.restaurants.map(r => 
          r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : r
        )
      })),

      // Actions for Fish Malls
      registerFishMall: (data) => set((state) => ({
        fishMalls: [
          ...state.fishMalls,
          {
            ...data,
            id: `MAL-${Date.now()}`,
            status: 'ACTIVE',
            registeredAt: new Date().toISOString()
          }
        ]
      })),

      toggleFishMallStatus: (id) => set((state) => ({
        fishMalls: state.fishMalls.map(m => 
          m.id === id ? { ...m, status: m.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } : m
        )
      })),

      // Validation Helper for Login
      getOutletByPhone: (phone) => {
        const res = get().restaurants.find(r => r.phone === phone);
        if (res) return { ...res, type: 'RESTAURANT' };
        
        const mall = get().fishMalls.find(m => m.phone === phone);
        if (mall) return { ...mall, type: 'FISHMALL' };
        
        return null;
      }
    }),
    {
      name: 'golden-fisheries-outlets',
    }
  )
);

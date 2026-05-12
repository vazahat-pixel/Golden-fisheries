import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isVerifying: false, // For OTP state
      pendingUser: null, // Temp storage during signup/otp

      // Actions
      login: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isVerifying: false,
        pendingUser: null 
      }),

      logout: async () => {
        try {
          // Dynamic import to cleanly prevent circular dependencies during module loading
          const { authService } = await import('../services/authService');
          await authService.logout();
        } catch (err) {
          console.warn('[Session Teardown]: Unable to clear backend session cleanly.', err.message);
        }
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isVerifying: false,
          pendingUser: null
        });
      },

      startVerification: (userData) => set({ 
        isVerifying: true, 
        pendingUser: userData 
      }),

      completeVerification: () => set((state) => ({
        user: state.pendingUser,
        isAuthenticated: true,
        isVerifying: false,
        pendingUser: null
      })),

      cancelVerification: () => set({ 
        isVerifying: false, 
        pendingUser: null 
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      }))
    }),
    {
      name: 'golden-fisheries-auth',
    }
  )
);

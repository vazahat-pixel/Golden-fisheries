import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '../services/userService';

// --- Role Templates ---
export const ROLE_TEMPLATES = {
  RESTAURANT_STAFF: {
    id: 'RESTAURANT_STAFF',
    label: 'Restaurant Staff',
    description: 'POS, order history, and inventory access',
    color: '#6B7550',
    loginPortal: '/restaurant/auth',
    permissions: {
      panels: {
        restaurant: true,
        fishmall: false,
        driver: false,
        admin: false,
      },
      modules: {
        pos: { read: true, write: true, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: true, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
      },
    },
  },
  FISHMALL_BILLING: {
    id: 'FISHMALL_BILLING',
    label: 'Fish Mall Billing',
    description: 'Weight billing, rates, and stock inflow',
    color: '#2563EB',
    loginPortal: '/fishmall/auth',
    permissions: {
      panels: {
        restaurant: false,
        fishmall: true,
        driver: false,
        admin: false,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
      },
    },
  },
  DRIVER: {
    id: 'DRIVER',
    label: 'Fleet Driver',
    description: 'Trip management and delivery operations',
    color: '#D97706',
    loginPortal: '/driver/auth',
    permissions: {
      panels: {
        restaurant: false,
        fishmall: false,
        driver: true,
        admin: false,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: true, write: true, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
      },
    },
  },
  ACCOUNTANT: {
    id: 'ACCOUNTANT',
    label: 'Accountant',
    description: 'Finance, billing, and reporting access',
    color: '#7C3AED',
    loginPortal: '/admin/auth',
    permissions: {
      panels: {
        restaurant: false,
        fishmall: false,
        driver: false,
        admin: true,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        tapals: { read: true, write: false, delete: false },
        finance: { read: true, write: true, delete: false },
        procurement: { read: true, write: false, delete: false },
        logistics: { read: true, write: false, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: true, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
      },
    },
  },
  MANAGER: {
    id: 'MANAGER',
    label: 'Manager',
    description: 'Full ops access, cannot manage users',
    color: '#059669',
    loginPortal: '/admin/auth',
    permissions: {
      panels: {
        restaurant: true,
        fishmall: true,
        driver: true,
        admin: true,
      },
      modules: {
        pos: { read: true, write: true, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: true, delete: false },
        restaurantSettings: { read: true, write: false, delete: false },
        tapals: { read: true, write: true, delete: false },
        finance: { read: true, write: false, delete: false },
        procurement: { read: true, write: true, delete: false },
        logistics: { read: true, write: true, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: true, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
      },
    },
  },
};

// Module display config
export const MODULE_META = [
  { key: 'pos', label: 'POS Terminal', panel: 'Restaurant' },
  { key: 'orderHistory', label: 'Order History', panel: 'Restaurant' },
  { key: 'inventory', label: 'Inventory', panel: 'Restaurant' },
  { key: 'restaurantSettings', label: 'Rest. Settings', panel: 'Restaurant' },
  { key: 'billing', label: 'Fish Mall Billing', panel: 'Fish Mall' },
  { key: 'tapals', label: 'Tapals', panel: 'Admin' },
  { key: 'procurement', label: 'Procurement', panel: 'Admin' },
  { key: 'logistics', label: 'Logistics', panel: 'Admin' },
  { key: 'finance', label: 'Finance', panel: 'Admin' },
  { key: 'outlets', label: 'Outlets', panel: 'Admin' },
  { key: 'accessControl', label: 'Access Control', panel: 'Admin' },
];

// Deep clone a template
const clonePermissions = (templateId) => {
  const t = ROLE_TEMPLATES[templateId];
  if (!t) return null;
  return JSON.parse(JSON.stringify(t.permissions));
};

export const useRbacStore = create(
  persist(
    (set, get) => ({
      users: [],
      loading: false,
      error: null,
      otpSessions: {}, // phone → { otp, expiresAt }

      // ---- User Actions ----
      fetchUsers: async (params = {}) => {
        set({ loading: true });
        try {
          const res = await userService.all(params);
          const list = res?.docs || res?.data || (Array.isArray(res) ? res : []);
          set({ users: list, loading: false });
        } catch (err) {
          console.error('Failed to fetch users', err);
          set({ loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true });
        try {
          const newUser = await userService.register(userData);
          await get().fetchUsers();
          set({ loading: false });
          return newUser;
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      updateUser: async (userId, updates) => {
        set({ loading: true });
        try {
          await userService.update(userId, updates);
          await get().fetchUsers();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      revokeUser: async (userId) => {
        set({ loading: true });
        try {
          await userService.update(userId, { status: 'revoked' });
          await get().fetchUsers();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      togglePauseUser: async (userId) => {
        const user = get().users.find((u) => u.id === userId || u._id === userId);
        if (!user) return;
        
        set({ loading: true });
        try {
          const newStatus = user.status === 'paused' ? 'active' : 'paused';
          await userService.update(userId, { status: newStatus });
          await get().fetchUsers();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      deleteUser: async (userId) => {
        set({ loading: true });
        try {
          await userService.delete(userId);
          await get().fetchUsers();
          set({ loading: false });
        } catch (err) {
          set({ error: err.message, loading: false });
          throw err;
        }
      },

      // ---- OTP Actions (Simulated) ----
      sendOtp: (phone) => {
        const otp = '123456';
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour
        set((state) => ({
          otpSessions: { ...state.otpSessions, [phone]: { otp, expiresAt } },
        }));
        console.log(`[OTP] Universal OTP for ${phone}: ${otp}`);
        return otp;
      },

      verifyOtp: (phone, enteredOtp) => {
        if (enteredOtp === '123456') return { success: true };
        const session = get().otpSessions[phone];
        if (!session) return { success: false, message: 'OTP not sent' };
        if (Date.now() > session.expiresAt)
          return { success: false, message: 'OTP expired' };
        if (session.otp !== enteredOtp)
          return { success: false, message: 'Incorrect OTP' };
        return { success: true };
      },

      clearOtpSession: (phone) =>
        set((state) => {
          const sessions = { ...state.otpSessions };
          delete sessions[phone];
          return { otpSessions: sessions };
        }),

      // ---- Lookup Helpers ----
      getUserByPhone: (phone) => get().users.find((u) => u.phone === phone),

      hasPermission: (userId, module, action) => {
        const user = get().users.find((u) => u.id === userId);
        if (!user) return false;
        return user.permissions?.modules?.[module]?.[action] === true;
      },

      canAccessPanel: (phone, panel) => {
        const user = get().users.find((u) => u.phone === phone);
        if (!user || user.status !== 'active') return false;
        return user.permissions?.panels?.[panel] === true;
      },
    }),
    {
      name: 'golden-fisheries-rbac',
    }
  )
);

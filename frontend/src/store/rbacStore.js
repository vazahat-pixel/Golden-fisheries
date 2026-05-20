import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '../services/userService';

// --- Role Templates ---
export const ROLE_TEMPLATES = {
  ADMIN: {
    id: 'ADMIN',
    label: 'Administrator',
    description: 'Full system access and user management',
    color: '#EF4444',
    loginPortal: '/admin/auth',
    permissions: {
      panels: {
        restaurant: false,
        fishmall: false,
        driver: false,
        admin: true,
        buyer: false,
      },
      modules: {
        pos: { read: true, write: true, delete: true },
        orderHistory: { read: true, write: true, delete: true },
        inventory: { read: true, write: true, delete: true },
        restaurantSettings: { read: true, write: true, delete: true },
        dashboard: { read: true, write: true, delete: true },
        tapals: { read: true, write: true, delete: true },
        finance: { read: true, write: true, delete: true },
        procurement: { read: true, write: true, delete: true },
        logistics: { read: true, write: true, delete: true },
        billing: { read: true, write: true, delete: true },
        outlets: { read: true, write: true, delete: true },
        accessControl: { read: true, write: true, delete: true },
        settings: { read: true, write: true, delete: true },
      },
    },
  },
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
        buyer: false,
      },
      modules: {
        pos: { read: true, write: true, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: true, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
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
        buyer: false,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
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
        buyer: false,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: true, write: true, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
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
        buyer: false,
      },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: true, write: false, delete: false },
        tapals: { read: true, write: false, delete: false },
        finance: { read: true, write: true, delete: false },
        procurement: { read: true, write: false, delete: false },
        logistics: { read: true, write: false, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: true, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
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
        restaurant: false,
        fishmall: false,
        driver: false,
        admin: true,
        buyer: false,
      },
      modules: {
        pos: { read: true, write: true, delete: false },
        orderHistory: { read: true, write: false, delete: false },
        inventory: { read: true, write: true, delete: false },
        restaurantSettings: { read: true, write: false, delete: false },
        dashboard: { read: true, write: false, delete: false },
        tapals: { read: true, write: true, delete: false },
        finance: { read: true, write: false, delete: false },
        procurement: { read: true, write: true, delete: false },
        logistics: { read: true, write: true, delete: false },
        billing: { read: true, write: true, delete: false },
        outlets: { read: true, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: true, write: false, delete: false },
      },
    },
  },
  PROCUREMENT_MANAGER: {
    id: 'PROCUREMENT_MANAGER',
    label: 'Procurement Manager',
    description: 'Harvest slips, tapals, farmer data and net rates only',
    color: '#6B7550',
    loginPortal: '/admin/auth',
    permissions: {
      panels: { restaurant: false, fishmall: false, driver: false, admin: true, buyer: false },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: true, write: false, delete: false },
        tapals: { read: true, write: true, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: true, write: true, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
      },
    },
  },
  HARVEST_OPERATOR: {
    id: 'HARVEST_OPERATOR',
    label: 'Harvest Operator',
    description: 'Procurement harvest slips, farmer details, net rate (read/write, no finance)',
    color: '#6B7550',
    loginPortal: '/auth/admin',
    permissions: {
      panels: { restaurant: false, fishmall: false, driver: false, admin: true, buyer: false },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: true, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: true, write: true, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
      },
    },
  },
  BUYER: {
    id: 'BUYER',
    label: 'Buyer (Channapa)',
    description: 'Incoming tapals, buyer bills, sales return, invoice history',
    color: '#2563EB',
    loginPortal: '/buyer/auth',
    permissions: {
      panels: { restaurant: false, fishmall: false, driver: false, admin: false, buyer: true },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: false, write: false, delete: false },
        tapals: { read: true, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        billing: { read: true, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
      },
    },
  },
  VEHICLE_MANAGER: {
    id: 'VEHICLE_MANAGER',
    label: 'Vehicle Manager',
    description: 'Vehicles, documents and expiry alerts only',
    color: '#B45309',
    loginPortal: '/admin/auth',
    permissions: {
      panels: { restaurant: false, fishmall: false, driver: false, admin: true, buyer: false },
      modules: {
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
        dashboard: { read: true, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        logistics: { read: true, write: true, delete: false },
        billing: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
      },
    },
  },
};

// Module display config
export const MODULE_META = [
  { key: 'dashboard', label: 'Dashboard', panel: 'Admin' },
  { key: 'pos', label: 'POS Terminal', panel: 'Restaurant' },
  { key: 'orderHistory', label: 'Order History', panel: 'Restaurant' },
  { key: 'inventory', label: 'Inventory', panel: 'Admin' },
  { key: 'restaurantSettings', label: 'Rest. Settings', panel: 'Restaurant' },
  { key: 'billing', label: 'Billing', panel: 'Admin' },
  { key: 'tapals', label: 'Tapals', panel: 'Admin' },
  { key: 'procurement', label: 'Procurement', panel: 'Admin' },
  { key: 'logistics', label: 'Logistics', panel: 'Admin' },
  { key: 'finance', label: 'Finance', panel: 'Admin' },
  { key: 'outlets', label: 'Outlets', panel: 'Admin' },
  { key: 'accessControl', label: 'Access Control', panel: 'Admin' },
  { key: 'settings', label: 'Settings', panel: 'Admin' },
];

// Deep clone a template
const clonePermissions = (templateId) => {
  const t = ROLE_TEMPLATES[templateId];
  if (!t) return null;
  return JSON.parse(JSON.stringify(t.permissions));
};

const mapRoleToBackend = (role) => {
  if (role === 'RESTAURANT_STAFF') return 'RESTAURANT';
  if (role === 'FISHMALL_BILLING') return 'FISHMALL';
  // New specialist roles — pass through 1:1
  if (['PROCUREMENT_MANAGER','BUYER','VEHICLE_MANAGER','HARVEST_OPERATOR'].includes(role)) return role;
  return role;
};

const mapRoleToFrontend = (role) => {
  if (role === 'RESTAURANT') return 'RESTAURANT_STAFF';
  if (role === 'FISHMALL') return 'FISHMALL_BILLING';
  if (role === 'HARVEST_OPERATOR') return 'HARVEST_OPERATOR';
  return role;
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
          const mapped = list.map((u) => {
            const frontendRole = mapRoleToFrontend(u.role);
            const template = ROLE_TEMPLATES[frontendRole] || {};
            return {
              ...u,
              id: u._id || u.id,
              name: u.fullName || u.name || '',
              role: frontendRole,
              status: u.status || (u.isActive === false ? 'revoked' : 'active'),
              permissions: u.permissions || template.permissions || { panels: {}, modules: {} }
            };
          });
          set({ users: mapped, loading: false });
        } catch (err) {
          console.error('Failed to fetch users', err);
          set({ loading: false });
        }
      },

      createUser: async (userData) => {
        set({ loading: true });
        try {
          const backendRole = mapRoleToBackend(userData.role);
          const payload = {
            fullName: userData.name || userData.fullName || '',
            phone: userData.phone || '',
            role: backendRole,
            password: userData.password || 'password123',
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            status: userData.status || 'active',
            permissions: userData.permissions || {}
          };
          const newUser = await userService.register(payload);
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
          const payload = { ...updates };
          if (payload.role) {
            payload.role = mapRoleToBackend(payload.role);
          }
          if (payload.name) {
            payload.fullName = payload.name;
            delete payload.name;
          }
          // Ensure permissions are forwarded
          if (updates.permissions) {
            payload.permissions = updates.permissions;
          }
          await userService.update(userId, payload);
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
          await userService.update(userId, { status: 'revoked', isActive: false });
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
          const newIsActive = newStatus === 'active';
          await userService.update(userId, { status: newStatus, isActive: newIsActive });
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
        const user = get().users.find((u) => u.id === userId || u._id === userId);
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        return user.permissions?.modules?.[module]?.[action] === true;
      },

      canAccessPanel: (phone, panel) => {
        const user = get().users.find((u) => u.phone === phone);
        if (!user || user.status !== 'active') return false;
        if (user.role === 'ADMIN') return true;
        return user.permissions?.panels?.[panel] === true;
      },
    }),
    {
      name: 'golden-fisheries-rbac',
    }
  )
);

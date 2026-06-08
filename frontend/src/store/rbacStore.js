import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { userService } from '../services/userService';
import { useAuthStore } from './authStore';
import { isWebErpRole, normalizeRole } from '../constants/rbac';

function mergePermissions(stored, role) {
  const template = ROLE_TEMPLATES[normalizeRole(role)] || ROLE_TEMPLATES[role];
  const base = template?.permissions || { panels: {}, modules: {} };
  const incoming = stored || {};
  const mods = incoming.modules;
  const flatMods =
    mods && typeof mods === 'object' && !Array.isArray(mods)
      ? mods instanceof Map
        ? Object.fromEntries(mods.entries())
        : { ...mods }
      : {};
  return {
    panels: { ...base.panels, ...incoming.panels },
    modules: { ...base.modules, ...flatMods },
  };
}

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

// --- Role Templates ---
export const ROLE_TEMPLATES = {
  SUPER_ADMIN: {
    id: 'SUPER_ADMIN',
    label: 'Super Admin',
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
        systemControl: { read: true, write: true, delete: true },
      },
    },
  },
  REST_MANAGER: {
    id: 'REST_MANAGER',
    label: 'Restaurant Manager',
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
  REST_CASHIER: {
    id: 'REST_CASHIER',
    label: 'Restaurant Cashier',
    description: 'POS billing only',
    color: '#6B7550',
    loginPortal: '/restaurant/auth',
    permissions: {
      panels: { restaurant: true, fishmall: false, driver: false, admin: false, buyer: false },
      modules: {
        pos: { read: true, write: true, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
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
  FISHMALL_MANAGER: {
    id: 'FISHMALL_MANAGER',
    label: 'Fish Mall Manager',
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
  FISHMALL_CASHIER: {
    id: 'FISHMALL_CASHIER',
    label: 'Fish Mall Cashier',
    description: 'Retail POS billing only',
    color: '#2563EB',
    loginPortal: '/fishmall/auth',
    permissions: {
      panels: { restaurant: false, fishmall: true, driver: false, admin: false, buyer: false },
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
  BUYER: {
    id: 'BUYER',
    label: 'Buyer (Channapa)',
    description: 'Verify tapals, buyer billing, returns, settlement — sign in via Admin Login',
    color: '#2563EB',
    loginPortal: '/auth/admin',
    permissions: {
      panels: { restaurant: false, fishmall: false, driver: false, admin: false, buyer: false },
      modules: {
        dashboard: { read: false, write: false, delete: false },
        procurement: { read: false, write: false, delete: false },
        tapals: { read: false, write: false, delete: false },
        logistics: { read: false, write: false, delete: false },
        finance: { read: false, write: false, delete: false },
        billing: { read: false, write: false, delete: false },
        inventory: { read: false, write: false, delete: false },
        outlets: { read: false, write: false, delete: false },
        accessControl: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false },
        buyerDashboard: { read: true, write: false, delete: false },
        buyerVerify: { read: true, write: true, delete: false },
        buyerBills: { read: true, write: true, delete: false },
        buyerReturns: { read: true, write: true, delete: false },
        buyerSettlement: { read: true, write: false, delete: false },
        pos: { read: false, write: false, delete: false },
        orderHistory: { read: false, write: false, delete: false },
        restaurantSettings: { read: false, write: false, delete: false },
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
/** Roles manageable from Admin ERP access control */
export const ERP_MANAGEABLE_ROLES = [
  'SUPER_ADMIN',
  'ACCOUNTANT',
  'MANAGER',
  'PROCUREMENT_MANAGER',
  'BUYER',
  'VEHICLE_MANAGER',
  'DRIVER',
];

export function isAdminErpTemplateRole(roleKey) {
  const t = ROLE_TEMPLATES[roleKey];
  if (!t) return false;
  const panels = t.permissions?.panels || {};
  const mods = t.permissions?.modules || {};
  return panels.admin === true || Object.keys(mods).some((k) => k.startsWith('buyer'));
}

export function modulesForRole(roleKey) {
  if (roleKey === 'BUYER') {
    return MODULE_META.filter((m) => m.panel === 'Buyer (Admin)');
  }
  return MODULE_META.filter((m) => m.panel === 'Admin');
}

export const MODULE_META = [
  { key: 'dashboard', label: 'Dashboard', panel: 'Admin' },
  { key: 'procurement', label: 'Procurement', panel: 'Admin' },
  { key: 'tapals', label: 'Tapals', panel: 'Admin' },
  { key: 'logistics', label: 'Logistics', panel: 'Admin' },
  { key: 'finance', label: 'Finance', panel: 'Admin' },
  { key: 'billing', label: 'Billing (Procurement)', panel: 'Admin' },
  { key: 'inventory', label: 'Inventory', panel: 'Admin' },
  { key: 'outlets', label: 'Outlets', panel: 'Admin' },
  { key: 'accessControl', label: 'Access Control', panel: 'Admin' },
  { key: 'settings', label: 'Users & roles', panel: 'Admin' },
  { key: 'systemControl', label: 'System control', panel: 'Admin' },
  { key: 'buyerDashboard', label: 'Buyer Dashboard', panel: 'Buyer (Admin)' },
  { key: 'buyerVerify', label: 'Buyer Verify Tapals', panel: 'Buyer (Admin)' },
  { key: 'buyerBills', label: 'Buyer Bills', panel: 'Buyer (Admin)' },
  { key: 'buyerReturns', label: 'Buyer Returns', panel: 'Buyer (Admin)' },
  { key: 'buyerSettlement', label: 'Buyer Settlement', panel: 'Buyer (Admin)' },
  { key: 'pos', label: 'POS Terminal', panel: 'Restaurant' },
  { key: 'orderHistory', label: 'Order History', panel: 'Restaurant' },
  { key: 'restaurantSettings', label: 'Rest. Settings', panel: 'Restaurant' },
];

// Deep clone a template
const clonePermissions = (templateId) => {
  const t = ROLE_TEMPLATES[templateId];
  if (!t) return null;
  return JSON.parse(JSON.stringify(t.permissions));
};

const mapRoleToBackend = (role) => {
  const map = {
    ADMIN: 'SUPER_ADMIN',
    MANAGER: 'SUPER_ADMIN',
    ACCOUNTANT: 'SUPER_ADMIN',
    RESTAURANT_STAFF: 'REST_MANAGER',
    RESTAURANT: 'REST_MANAGER',
    FISHMALL_BILLING: 'FISHMALL_MANAGER',
    FISHMALL: 'FISHMALL_MANAGER',
    BILLING: 'FISHMALL_CASHIER',
  };
  return map[role] || role;
};

const mapRoleToFrontend = (role) => {
  const map = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    REST_MANAGER: 'REST_MANAGER',
    REST_CASHIER: 'REST_CASHIER',
    FISHMALL_MANAGER: 'FISHMALL_MANAGER',
    FISHMALL_CASHIER: 'FISHMALL_CASHIER',
    RESTAURANT: 'REST_MANAGER',
    FISHMALL: 'FISHMALL_MANAGER',
    ADMIN: 'SUPER_ADMIN',
  };
  return map[role] || role;
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
              permissions: mergePermissions(u.permissions, frontendRole)
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
          const frontendRole = mapRoleToFrontend(backendRole);
          const payload = {
            fullName: userData.name || userData.fullName || '',
            phone: userData.phone || '',
            role: backendRole,
            password: userData.password || 'password123',
            isActive: userData.isActive !== undefined ? userData.isActive : true,
            status: userData.status || 'active',
            platformAccess: userData.platformAccess || {
              web: frontendRole !== 'DRIVER',
              mobile: ['DRIVER', 'PROCUREMENT_MANAGER', 'BUYER', 'VEHICLE_MANAGER'].includes(frontendRole),
            },
            permissions:
              userData.permissions ||
              ROLE_TEMPLATES[frontendRole]?.permissions ||
              {},
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
          const session = useAuthStore.getState().user;
          if (session && sameId(session.id, userId)) {
            const updated = get().users.find((u) => sameId(u.id, userId));
            if (updated) {
              useAuthStore.getState().updateUser({
                permissions: updated.permissions,
                role: updated.role,
              });
            }
          }
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

      /** Resolve RBAC user from cached list or the active login session. */
      resolveUserForAccess: (userId) => {
        const fromList = get().users.find(
          (u) => sameId(u.id, userId) || sameId(u._id, userId)
        );
        if (fromList) return fromList;

        const sessionUser = useAuthStore.getState().user;
        if (!sessionUser) return null;
        if (!sameId(sessionUser.id, userId) && !sameId(sessionUser._id, userId)) {
          return null;
        }

        const frontendRole = mapRoleToFrontend(sessionUser.role);

        return {
          ...sessionUser,
          role: frontendRole,
          status: sessionUser.status || 'active',
          permissions: mergePermissions(sessionUser.permissions, frontendRole),
        };
      },

      hasPermission: (userId, module, action) => {
        const user = get().resolveUserForAccess(userId);
        if (!user) return false;
        if (isWebErpRole(user.role)) return true;
        return user.permissions?.modules?.[module]?.[action] === true;
      },

      canAccessPanel: (phone, panel) => {
        let user = get().users.find((u) => u.phone === phone);
        if (!user) {
          const sessionUser = useAuthStore.getState().user;
          if (sessionUser?.phone === phone) {
            user = get().resolveUserForAccess(sessionUser.id || sessionUser._id);
          }
        }
        if (!user || user.status !== 'active') return false;
        if (isWebErpRole(user.role)) return true;
        return user.permissions?.panels?.[panel] === true;
      },
    }),
    {
      name: 'golden-fisheries-rbac',
    }
  )
);

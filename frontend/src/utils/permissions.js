import { ROLE_TEMPLATES } from '../store/rbacStore.js';
import { normalizeRole, ROLES, isWebErpRole, MOBILE_FIELD_ROLES } from '../constants/rbac';

/** Convert Mongoose Map or plain object modules to a plain record */
export function normalizeModules(modules) {
  if (!modules) return {};
  if (typeof modules.toJSON === 'function') {
    return modules.toJSON();
  }
  if (modules instanceof Map) {
    return Object.fromEntries(modules.entries());
  }
  return { ...modules };
}

export function normalizePermissions(permissions, role) {
  const template =
    ROLE_TEMPLATES[normalizeRole(role)] || ROLE_TEMPLATES[role];
  const base = template?.permissions || { panels: {}, modules: {} };
  const incoming = permissions || {};
  return {
    panels: { ...base.panels, ...incoming.panels },
    modules: {
      ...normalizeModules(base.modules),
      ...normalizeModules(incoming.modules),
    },
  };
}

export function getEffectivePermissions(user) {
  if (!user) return { panels: {}, modules: {} };
  return normalizePermissions(user.permissions, user.role);
}

export function isSuperAdminUser(user) {
  return isWebErpRole(user?.role);
}

export function canAccessAdminPanel(user) {
  if (!user || user.status === 'revoked' || user.isActive === false) return false;
  if (isSuperAdminUser(user)) return true;
  const perms = getEffectivePermissions(user);
  return perms.panels?.admin === true;
}

const PANEL_ROLES = [ROLES.REST_MANAGER, ROLES.REST_CASHIER, ROLES.FISHMALL_MANAGER, ROLES.FISHMALL_CASHIER];

/** Unified Admin Login — office staff + field roles (buyer, procurement, vehicles). */
export function canLoginViaAdminErp(user) {
  if (!user || user.status === 'revoked' || user.isActive === false) return false;
  const role = normalizeRole(user.role);
  if (role === ROLES.DRIVER) return false;
  // Restaurant and FishMall panel roles can log in via their own auth pages
  if (PANEL_ROLES.includes(role)) {
    return user.platformAccess?.web !== false;
  }
  if (MOBILE_FIELD_ROLES.includes(role)) {
    return user.platformAccess?.mobile !== false;
  }
  if (isSuperAdminUser(user)) {
    return user.platformAccess?.web !== false;
  }
  return canAccessAdminPanel(user) && user.platformAccess?.web !== false;
}

export function hasModulePermission(user, moduleKey, action = 'read') {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  const perms = getEffectivePermissions(user);
  return perms.modules?.[moduleKey]?.[action] === true;
}

export function getDefaultHomePath(user) {
  const role = normalizeRole(user?.role);
  if (role === ROLES.BUYER) return '/mobile/buyer/dashboard';
  if (role === ROLES.PROCUREMENT_MANAGER) return '/mobile/procurement/harvest';
  if (role === ROLES.VEHICLE_MANAGER) return '/mobile/vehicles';
  if (role === ROLES.REST_MANAGER || role === ROLES.REST_CASHIER) return '/restaurant/dashboard';
  if (role === ROLES.FISHMALL_MANAGER || role === ROLES.FISHMALL_CASHIER) return '/fishmall/dashboard';
  if (canAccessAdminPanel(user)) return '/admin/dashboard';
  return '/auth/home';
}

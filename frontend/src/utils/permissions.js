import { ROLE_TEMPLATES } from '../store/rbacStore.js';
import { normalizeRole, ROLES, isWebErpRole } from '../constants/rbac';

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

export function hasModulePermission(user, moduleKey, action = 'read') {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  const perms = getEffectivePermissions(user);
  return perms.modules?.[moduleKey]?.[action] === true;
}

export function getDefaultHomePath(user) {
  const role = normalizeRole(user?.role);
  if (role === ROLES.BUYER && canAccessAdminPanel(user)) {
    return '/admin/buyer/dashboard';
  }
  if (canAccessAdminPanel(user)) {
    return '/admin/dashboard';
  }
  return '/auth/home';
}

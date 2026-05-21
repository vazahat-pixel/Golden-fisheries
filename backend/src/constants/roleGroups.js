import { ROLES, normalizeRole } from './roles.js';

/** Expand route allow-list to include legacy DB role strings */
export const expandRoles = (...roles) => {
  const set = new Set(roles);
  const legacyEntries = Object.entries({
    ADMIN: ROLES.SUPER_ADMIN,
    MANAGER: ROLES.SUPER_ADMIN,
    ACCOUNTANT: ROLES.SUPER_ADMIN,
    RESTAURANT: ROLES.REST_MANAGER,
    FISHMALL: ROLES.FISHMALL_MANAGER,
  });
  for (const allowed of roles) {
    for (const [legacy, mapped] of legacyEntries) {
      if (allowed === mapped) set.add(legacy);
    }
  }
  return [...set];
};

export const roleMatches = (userRole, allowedRoles) => {
  const normalized = normalizeRole(userRole);
  return allowedRoles.some((r) => r === userRole || normalizeRole(r) === normalized);
};

// --- Route groups (client operations) ---
export const WEB_ERP = expandRoles(ROLES.SUPER_ADMIN);
export const PROCUREMENT = expandRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER);
export const BUYER_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.BUYER);
export const DRIVER_ROLES = expandRoles(ROLES.DRIVER);
export const VEHICLE_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.VEHICLE_MANAGER);
export const REST_ALL = expandRoles(ROLES.SUPER_ADMIN, ROLES.REST_MANAGER, ROLES.REST_CASHIER);
export const REST_MANAGER_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.REST_MANAGER);
export const REST_CASHIER_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.REST_CASHIER);
export const FISHMALL_ALL = expandRoles(ROLES.SUPER_ADMIN, ROLES.FISHMALL_MANAGER, ROLES.FISHMALL_CASHIER);
export const FISHMALL_MANAGER_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.FISHMALL_MANAGER);
export const FISHMALL_CASHIER_ROLES = expandRoles(ROLES.SUPER_ADMIN, ROLES.FISHMALL_CASHIER);
export const MOBILE_FIELD = expandRoles(
  ROLES.PROCUREMENT_MANAGER,
  ROLES.BUYER,
  ROLES.DRIVER,
  ROLES.VEHICLE_MANAGER
);

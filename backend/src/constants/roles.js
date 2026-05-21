/**
 * Final ERP role enums — single source of truth.
 */
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  BUYER: 'BUYER',
  DRIVER: 'DRIVER',
  VEHICLE_MANAGER: 'VEHICLE_MANAGER',
  REST_MANAGER: 'REST_MANAGER',
  REST_CASHIER: 'REST_CASHIER',
  FISHMALL_MANAGER: 'FISHMALL_MANAGER',
  FISHMALL_CASHIER: 'FISHMALL_CASHIER',
};

export const ROLE_LIST = Object.values(ROLES);

/** Legacy DB / token values mapped to final roles */
export const LEGACY_ROLE_MAP = {
  ADMIN: ROLES.SUPER_ADMIN,
  MANAGER: ROLES.SUPER_ADMIN,
  ACCOUNTANT: ROLES.SUPER_ADMIN,
  RESTAURANT: ROLES.REST_MANAGER,
  FISHMALL: ROLES.FISHMALL_MANAGER,
};

export const normalizeRole = (role) => LEGACY_ROLE_MAP[role] || role;

export const isSuperAdmin = (role) => normalizeRole(role) === ROLES.SUPER_ADMIN;

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

export const PLATFORM_ACCESS = {
  WEB: 'WEB',
  MOBILE: 'MOBILE',
};

export const BUSINESS_UNITS = {
  MKE: 'MKE',
  REST: 'REST',
  FISHMALL: 'FISHMALL',
};

/** Legacy tokens from DB until migrated */
export const LEGACY_ROLE_MAP = {
  ADMIN: ROLES.SUPER_ADMIN,
  MANAGER: ROLES.SUPER_ADMIN,
  ACCOUNTANT: ROLES.SUPER_ADMIN,
  RESTAURANT: ROLES.REST_MANAGER,
  RESTAURANT_STAFF: ROLES.REST_MANAGER,
  FISHMALL: ROLES.FISHMALL_MANAGER,
  FISHMALL_BILLING: ROLES.FISHMALL_MANAGER,
  BILLING: ROLES.FISHMALL_CASHIER,
};

export const normalizeRole = (role) => LEGACY_ROLE_MAP[role] || role;

export const roleAllowed = (userRole, allowedRoles = []) => {
  const normalized = normalizeRole(userRole);
  return allowedRoles.some((r) => r === userRole || normalizeRole(r) === normalized);
};

export const WEB_ERP_ROLES = [
  ROLES.SUPER_ADMIN,
  'ADMIN',
  'MANAGER',
  'ACCOUNTANT',
];

export const REST_ROLES = [ROLES.REST_MANAGER, ROLES.REST_CASHIER, 'RESTAURANT', 'RESTAURANT_STAFF'];
export const FISHMALL_ROLES = [ROLES.FISHMALL_MANAGER, ROLES.FISHMALL_CASHIER, 'FISHMALL', 'FISHMALL_BILLING'];
export const MOBILE_ROLES = [
  ROLES.PROCUREMENT_MANAGER,
  ROLES.BUYER,
  ROLES.DRIVER,
  ROLES.VEHICLE_MANAGER,
];

export const detectClientPlatform = (pathname = '') => {
  if (pathname.startsWith('/driver') || pathname.startsWith('/buyer') || pathname.startsWith('/mobile')) {
    return PLATFORM_ACCESS.MOBILE;
  }
  if (pathname.startsWith('/admin') || pathname.startsWith('/restaurant') || pathname.startsWith('/fishmall')) {
    return PLATFORM_ACCESS.WEB;
  }
  return PLATFORM_ACCESS.WEB;
};

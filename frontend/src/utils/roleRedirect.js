import { normalizeRole, ROLES } from '../constants/rbac';

export function getHomePathForRole(role) {
  const r = normalizeRole(role);
  switch (r) {
    case ROLES.SUPER_ADMIN:
      return '/admin/dashboard';
    case ROLES.PROCUREMENT_MANAGER:
      return '/mobile/procurement/harvest';
    case ROLES.BUYER:
      return '/mobile/buyer/dashboard';
    case ROLES.DRIVER:
      return '/driver/dashboard';
    case ROLES.VEHICLE_MANAGER:
      return '/mobile/vehicles';
    case ROLES.REST_MANAGER:
    case ROLES.REST_CASHIER:
      return '/restaurant/dashboard';
    case ROLES.FISHMALL_MANAGER:
    case ROLES.FISHMALL_CASHIER:
      return '/fishmall/dashboard';
    default:
      return '/auth/home';
  }
}

export function isMobileRole(role) {
  const r = normalizeRole(role);
  return [
    ROLES.PROCUREMENT_MANAGER,
    ROLES.BUYER,
    ROLES.DRIVER,
    ROLES.VEHICLE_MANAGER,
    ROLES.SUPER_ADMIN,
  ].includes(r);
}

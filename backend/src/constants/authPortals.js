import { ROLES, normalizeRole } from './roles.js';

/** Login entry points — OTP is only issued if user role matches portal. */
export const AUTH_PORTALS = {
  DRIVER: 'driver',
  BUYER: 'buyer',
  RESTAURANT: 'restaurant',
  FISHMALL: 'fishmall'
};

export const PORTAL_ALLOWED_ROLES = {
  [AUTH_PORTALS.DRIVER]: [ROLES.DRIVER, ROLES.SUPER_ADMIN, 'ADMIN'],
  [AUTH_PORTALS.BUYER]: [ROLES.BUYER, ROLES.SUPER_ADMIN, 'ADMIN'],
  [AUTH_PORTALS.RESTAURANT]: [
    ROLES.REST_MANAGER,
    ROLES.REST_CASHIER,
    'RESTAURANT',
    'RESTAURANT_STAFF',
    ROLES.SUPER_ADMIN,
    'ADMIN'
  ],
  [AUTH_PORTALS.FISHMALL]: [
    ROLES.FISHMALL_MANAGER,
    ROLES.FISHMALL_CASHIER,
    'FISHMALL',
    'FISHMALL_BILLING',
    ROLES.SUPER_ADMIN,
    'ADMIN'
  ]
};

export const PORTAL_LIST = Object.values(AUTH_PORTALS);

export function isRoleAllowedForPortal(role, portal) {
  if (!portal) return true;
  const allowed = PORTAL_ALLOWED_ROLES[portal];
  if (!allowed) return false;
  const normalized = normalizeRole(role);
  return allowed.some((r) => r === role || normalizeRole(r) === normalized);
}

/**
 * Single source of truth for ERP User Roles.
 * Ensures consistent usage of authorization levels.
 */
export const ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  DRIVER: 'DRIVER',
  ACCOUNTANT: 'ACCOUNTANT',
  RESTAURANT: 'RESTAURANT',
  FISHMALL: 'FISHMALL'
};

export const ROLE_LIST = Object.values(ROLES);

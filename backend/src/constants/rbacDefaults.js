import { ROLES } from './roles.js';
import { BUSINESS_UNITS } from './businessUnits.js';

/**
 * Role → default platformAccess, businessUnit, permissions (client matrix).
 */
export const ROLE_RBAC_DEFAULTS = {
  [ROLES.SUPER_ADMIN]: {
    businessUnit: BUSINESS_UNITS.MKE,
    platformAccess: { web: true, mobile: true, mobileViewOnly: true },
    permissions: {
      panels: { admin: true, restaurant: true, fishmall: true, driver: true, buyer: true },
    },
  },
  [ROLES.PROCUREMENT_MANAGER]: {
    businessUnit: BUSINESS_UNITS.MKE,
    platformAccess: { web: false, mobile: true, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: false, driver: false, buyer: false },
    },
  },
  [ROLES.BUYER]: {
    businessUnit: BUSINESS_UNITS.MKE,
    platformAccess: { web: false, mobile: true, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: false, driver: false, buyer: true },
    },
  },
  [ROLES.DRIVER]: {
    businessUnit: BUSINESS_UNITS.MKE,
    platformAccess: { web: false, mobile: true, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: false, driver: true, buyer: false },
    },
  },
  [ROLES.VEHICLE_MANAGER]: {
    businessUnit: BUSINESS_UNITS.MKE,
    platformAccess: { web: false, mobile: true, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: false, driver: false, buyer: false },
    },
  },
  [ROLES.REST_MANAGER]: {
    businessUnit: BUSINESS_UNITS.REST,
    platformAccess: { web: true, mobile: false, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: true, fishmall: false, driver: false, buyer: false },
    },
  },
  [ROLES.REST_CASHIER]: {
    businessUnit: BUSINESS_UNITS.REST,
    platformAccess: { web: true, mobile: false, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: true, fishmall: false, driver: false, buyer: false },
    },
  },
  [ROLES.FISHMALL_MANAGER]: {
    businessUnit: BUSINESS_UNITS.FISHMALL,
    platformAccess: { web: true, mobile: false, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: true, driver: false, buyer: false },
    },
  },
  [ROLES.FISHMALL_CASHIER]: {
    businessUnit: BUSINESS_UNITS.FISHMALL,
    platformAccess: { web: true, mobile: false, mobileViewOnly: false },
    permissions: {
      panels: { admin: false, restaurant: false, fishmall: true, driver: false, buyer: false },
    },
  },
};

export const applyRoleDefaults = (userDoc) => {
  const role = userDoc.role;
  const defaults = ROLE_RBAC_DEFAULTS[role];
  if (!defaults) return;
  if (!userDoc.businessUnit) userDoc.businessUnit = defaults.businessUnit;
  if (!userDoc.platformAccess || userDoc.isNew) {
    userDoc.platformAccess = { ...defaults.platformAccess };
  }
  if (!userDoc.permissions?.panels || userDoc.isNew) {
    userDoc.permissions = userDoc.permissions || {};
    userDoc.permissions.panels = { ...defaults.permissions.panels };
  }
};

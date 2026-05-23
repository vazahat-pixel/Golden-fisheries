import { ROLES } from './roles.js';

const allFalse = () => ({ read: false, write: false, delete: false });
const readOnly = () => ({ read: true, write: false, delete: false });
const readWrite = () => ({ read: true, write: true, delete: false });
const full = () => ({ read: true, write: true, delete: true });

const BASE_MODULES = {
  dashboard: allFalse(),
  procurement: allFalse(),
  tapals: allFalse(),
  logistics: allFalse(),
  finance: allFalse(),
  billing: allFalse(),
  inventory: allFalse(),
  outlets: allFalse(),
  accessControl: allFalse(),
  settings: allFalse(),
  buyerDashboard: allFalse(),
  buyerVerify: allFalse(),
  buyerBills: allFalse(),
  buyerReturns: allFalse(),
  buyerSettlement: allFalse(),
  pos: allFalse(),
  orderHistory: allFalse(),
  restaurantSettings: allFalse(),
};

function withModules(overrides) {
  return { ...BASE_MODULES, ...overrides };
}

export const ROLE_MODULE_DEFAULTS = {
  [ROLES.SUPER_ADMIN]: withModules({
    dashboard: full(),
    procurement: full(),
    tapals: full(),
    logistics: full(),
    finance: full(),
    billing: full(),
    inventory: full(),
    outlets: full(),
    accessControl: full(),
    settings: full(),
  }),
  [ROLES.BUYER]: withModules({
    dashboard: allFalse(),
    buyerDashboard: readOnly(),
    buyerVerify: readWrite(),
    buyerBills: readWrite(),
    buyerReturns: readWrite(),
    buyerSettlement: readOnly(),
  }),
  [ROLES.PROCUREMENT_MANAGER]: withModules({
    dashboard: readOnly(),
    procurement: readWrite(),
    tapals: readWrite(),
    inventory: readWrite(),
  }),
  [ROLES.VEHICLE_MANAGER]: withModules({
    dashboard: readOnly(),
    logistics: readWrite(),
  }),
};

export function getModuleDefaultsForRole(role) {
  return ROLE_MODULE_DEFAULTS[role] || null;
}

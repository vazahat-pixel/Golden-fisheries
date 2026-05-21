/** Isolated inventory domains — no automatic cross-module sync */
export const INVENTORY_SCOPES = {
  PROCUREMENT: 'PROCUREMENT',
  RESTAURANT: 'RESTAURANT',
  FISHMALL: 'FISHMALL',
};

/** Only these types may touch central Product (procurement) ledger */
export const PROCUREMENT_TX_TYPES = [
  'PROCUREMENT_IN',
  'SALES_OUT',
  'RETURN_IN',
  'MANUAL_ADJUSTMENT',
];

/** Deprecated on central ledger — kept in DB enum for legacy rows only */
export const DEPRECATED_CROSS_MODULE_TX_TYPES = [
  'RESTAURANT_CONSUMPTION',
  'FISHMALL_SALE',
];

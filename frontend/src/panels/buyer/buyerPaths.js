import { useLocation } from 'react-router-dom';

/** Base path for buyer routes — works on /mobile/buyer and /admin/buyer */
export function buyerBaseFromPath(pathname = '') {
  if (pathname.startsWith('/admin/buyer')) return '/admin/buyer';
  return '/mobile/buyer';
}

export function buyerPaths(base = '/mobile/buyer') {
  return {
    base,
    dashboard: `${base}/dashboard`,
    tapals: `${base}/tapals`,
    invoices: `${base}/invoices`,
    returns: `${base}/returns`,
    reconciliation: `${base}/reconciliation`,
    bill: (tapalId) => `${base}/bill/${tapalId}`,
  };
}

export function useBuyerPaths() {
  const { pathname } = useLocation();
  return buyerPaths(buyerBaseFromPath(pathname));
}

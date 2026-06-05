import { Navigate, useLocation } from 'react-router-dom';

/** Maps legacy /buyer/* → mobile buyer app */
export default function LegacyBuyerRedirect() {
  const { pathname, search } = useLocation();
  const map = {
    '/buyer/dashboard': '/mobile/buyer/dashboard',
    '/buyer/tapals': '/mobile/buyer/tapals',
    '/buyer/invoices': '/mobile/buyer/invoices',
    '/buyer/returns': '/mobile/buyer/returns',
    '/buyer/reconciliation': '/mobile/buyer/reconciliation',
    '/buyer/assign': '/mobile/buyer/tapals',
    '/buyer/assign-driver': '/mobile/buyer/tapals',
    '/buyer/trips': '/mobile/buyer/dashboard',
  };
  let target = map[pathname];
  if (!target && pathname.startsWith('/buyer/bill/')) {
    target = pathname.replace('/buyer/bill/', '/mobile/buyer/bill/');
  }
  if (!target) target = '/mobile/buyer/dashboard';
  return <Navigate to={`${target}${search}`} replace />;
}

import { Navigate, useLocation } from 'react-router-dom';

/** Maps /buyer/* → /admin/buyer/* */
export default function LegacyBuyerRedirect() {
  const { pathname, search } = useLocation();
  const map = {
    '/buyer/dashboard': '/admin/buyer/dashboard',
    '/buyer/tapals': '/admin/buyer/tapals',
    '/buyer/invoices': '/admin/buyer/invoices',
    '/buyer/returns': '/admin/buyer/returns',
    '/buyer/reconciliation': '/admin/buyer/reconciliation',
    '/buyer/assign': '/admin/buyer/dashboard',
    '/buyer/trips': '/admin/buyer/dashboard',
  };
  let target = map[pathname];
  if (!target && pathname.startsWith('/buyer/bill/')) {
    target = pathname.replace('/buyer/', '/admin/buyer/');
  }
  if (!target) target = '/admin/buyer/dashboard';
  return <Navigate to={`${target}${search}`} replace />;
}

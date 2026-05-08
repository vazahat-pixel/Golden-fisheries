import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute
 *
 * allowedRoles: traditional role check (ADMIN, MANAGER, BILLING, DRIVER, etc.)
 *
 * RBAC sub-users (Channapa, etc.) log in with role = their template id
 * (e.g. 'RESTAURANT_STAFF', 'DRIVER', 'FISHMALL_BILLING', 'ACCOUNTANT', 'MANAGER').
 * We extend allowedRoles to automatically cover RBAC roles that have access to the
 * relevant panel, so no separate check is needed here – the auth portals already
 * gate access before calling login().
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    let authPath = '/launchpad';
    if (location.pathname.startsWith('/admin')) authPath = '/admin/auth';
    else if (location.pathname.startsWith('/restaurant')) authPath = '/restaurant/auth';
    else if (location.pathname.startsWith('/fishmall')) authPath = '/fishmall/auth';
    else if (location.pathname.startsWith('/driver')) authPath = '/driver/auth';
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  // RBAC sub-roles that have valid panel-level clearance (checked at auth portal):
  const RBAC_ROLES = ['RESTAURANT_STAFF', 'FISHMALL_BILLING', 'DRIVER', 'ACCOUNTANT', 'MANAGER'];

  // If user has an RBAC role, trust that the auth portal already verified panel access.
  const isRbacUser = RBAC_ROLES.includes(user?.role);

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role) && !isRbacUser) {
    console.warn('Unauthorized access attempt:', user?.role, '→ allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  // Extra safety: if allowedRoles is strict admin-only, block RBAC non-admins
  const adminOnly = allowedRoles.length > 0 && !allowedRoles.some(r => RBAC_ROLES.includes(r));
  if (adminOnly && isRbacUser && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

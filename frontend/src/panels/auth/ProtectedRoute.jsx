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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    console.warn('Unauthorized access attempt:', user?.role, '→ allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * ProtectedRoute
 * allowedRoles: ['ADMIN','MANAGER','PROCUREMENT_MANAGER','VEHICLE_MANAGER','BUYER','DRIVER',...]
 * Detects portal namespace and redirects unauthenticated users to correct login.
 */
const ProtectedRoute = ({ children, allowedRoles = [], module = '' }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    let authPath = '/launchpad';
    if (location.pathname.startsWith('/admin')) authPath = '/admin/auth';
    else if (location.pathname.startsWith('/restaurant')) authPath = '/restaurant/auth';
    else if (location.pathname.startsWith('/fishmall')) authPath = '/fishmall/auth';
    else if (location.pathname.startsWith('/driver')) authPath = '/driver/auth';
    else if (location.pathname.startsWith('/buyer')) authPath = '/buyer/auth';
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  const userRole = user?.role;
  const isAdminRole = userRole === 'ADMIN';

  const namespace = (() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/restaurant')) return 'restaurant';
    if (location.pathname.startsWith('/fishmall')) return 'fishmall';
    if (location.pathname.startsWith('/driver')) return 'driver';
    if (location.pathname.startsWith('/buyer')) return 'buyer';
    return 'public';
  })();

  const requiredPanel = namespace === 'public' ? null : namespace;
  const hasPanelAccess = requiredPanel ? (user?.permissions?.panels?.[requiredPanel] === true) : true;
  const hasModuleRead = module ? (user?.permissions?.modules?.[module]?.read === true) : false;

  const roleMatchesAllowed = () => {
    if (allowedRoles.length === 0) return true;
    if (allowedRoles.includes(userRole)) return true;
    if (userRole === 'RESTAURANT' && allowedRoles.includes('RESTAURANT_STAFF')) return true;
    if (userRole === 'RESTAURANT_STAFF' && allowedRoles.includes('RESTAURANT')) return true;
    if (userRole === 'FISHMALL' && allowedRoles.includes('FISHMALL_BILLING')) return true;
    if (userRole === 'FISHMALL_BILLING' && allowedRoles.includes('FISHMALL')) return true;
    return false;
  };

  let isAuthorized = false;
  if (namespace === 'admin') {
    if (isAdminRole) isAuthorized = true;
    else if (hasPanelAccess) isAuthorized = module ? hasModuleRead : true;
  } else if (namespace === 'public') {
    isAuthorized = roleMatchesAllowed();
  } else {
    if (hasPanelAccess && roleMatchesAllowed()) {
      isAuthorized = module ? hasModuleRead : true;
    }
  }

  if (!isAuthorized) {
    console.warn('Unauthorized access attempt:', userRole, '→ allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

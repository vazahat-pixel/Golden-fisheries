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
  const hasCustomAccess = module ? (user?.permissions?.modules?.[module]?.read === true) : false;

  const isAuthorized = allowedRoles.length === 0 || 
    userRole === 'ADMIN' ||
    hasCustomAccess ||
    allowedRoles.includes(userRole) || 
    (userRole === 'RESTAURANT' && allowedRoles.includes('RESTAURANT_STAFF')) ||
    (userRole === 'RESTAURANT_STAFF' && allowedRoles.includes('RESTAURANT')) ||
    (userRole === 'FISHMALL' && allowedRoles.includes('FISHMALL_BILLING')) ||
    (userRole === 'FISHMALL_BILLING' && allowedRoles.includes('FISHMALL'));

  if (!isAuthorized) {
    console.warn('Unauthorized access attempt:', userRole, '→ allowed:', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    // Determine which auth page to redirect to based on the attempted path
    let authPath = '/launchpad';
    if (location.pathname.startsWith('/admin')) authPath = '/admin/auth';
    else if (location.pathname.startsWith('/restaurant')) authPath = '/restaurant/auth';
    else if (location.pathname.startsWith('/fishmall')) authPath = '/fishmall/auth';
    else if (location.pathname.startsWith('/driver')) authPath = '/driver/auth';

    // Redirect to the specific login page
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Role not authorized
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

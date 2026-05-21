import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';
import {
  normalizeRole,
  roleAllowed,
  ROLES,
  detectClientPlatform,
  PLATFORM_ACCESS,
  IS_DEV,
  hasFullAdminAccess,
} from '../../constants/rbac';

const ProtectedRoute = ({ children, allowedRoles, module, requirePlatform }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { hasPermission } = useRbacStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/init" replace />;
  }

  const role = user?.role;
  const normalized = normalizeRole(role);

  if (allowedRoles?.length && role && !roleAllowed(role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  const isAdminWeb = location.pathname.startsWith('/admin');

  if (IS_DEV && isAdminWeb) {
    return <>{children}</>;
  }

  const clientPlatform = requirePlatform || detectClientPlatform(location.pathname);
  const pa = user?.platformAccess || {};

  if (clientPlatform === PLATFORM_ACCESS.WEB && pa.web === false) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (clientPlatform === PLATFORM_ACCESS.MOBILE && pa.mobile === false) {
    return <Navigate to="/unauthorized" replace />;
  }

  const webOnly = [ROLES.REST_MANAGER, ROLES.REST_CASHIER, ROLES.FISHMALL_MANAGER, ROLES.FISHMALL_CASHIER];
  const mobileOnly = [ROLES.PROCUREMENT_MANAGER, ROLES.BUYER, ROLES.DRIVER, ROLES.VEHICLE_MANAGER];

  if (clientPlatform === PLATFORM_ACCESS.WEB && mobileOnly.includes(normalized)) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (clientPlatform === PLATFORM_ACCESS.MOBILE && webOnly.includes(normalized)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (module && user) {
    if (hasFullAdminAccess(role, location.pathname)) {
      return <>{children}</>;
    }
    const userId = user.id || user._id;
    if (!hasPermission(userId, module, 'read')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

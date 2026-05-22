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
} from '../../constants/rbac';
import { canAccessAdminPanel, hasModulePermission, isSuperAdminUser } from '../../utils/permissions';

const ProtectedRoute = ({
  children,
  allowedRoles,
  module,
  requirePlatform,
  requireAdminErp,
}) => {
  const { user, isAuthenticated } = useAuthStore();
  const { hasPermission } = useRbacStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/home" replace />;
  }

  const role = user?.role;
  const normalized = normalizeRole(role);
  const isAdminPath = location.pathname.startsWith('/admin');

  if (requireAdminErp && !canAccessAdminPanel(user)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles?.length && role && !roleAllowed(role, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
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
  const mobileFieldRoles = [ROLES.PROCUREMENT_MANAGER, ROLES.BUYER, ROLES.DRIVER, ROLES.VEHICLE_MANAGER];

  if (
    clientPlatform === PLATFORM_ACCESS.WEB &&
    mobileFieldRoles.includes(normalized) &&
    !isAdminPath
  ) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (clientPlatform === PLATFORM_ACCESS.MOBILE && webOnly.includes(normalized)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (module) {
    const userId = user.id || user._id;
    if (!isSuperAdminUser(user) && !hasPermission(userId, module, 'read')) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  if (isAdminPath && normalized === ROLES.BUYER) {
    const onBuyerRoute = location.pathname.startsWith('/admin/buyer');
    const allowedBuyerModules = [
      'buyerDashboard',
      'buyerVerify',
      'buyerBills',
      'buyerReturns',
      'buyerSettlement',
    ];
    const canBuyerModule = allowedBuyerModules.some((m) =>
      hasModulePermission(user, m, 'read')
    );
    if (!onBuyerRoute && location.pathname === '/admin/dashboard') {
      return <Navigate to="/admin/buyer/dashboard" replace />;
    }
    if (
      !onBuyerRoute &&
      !allowedBuyerModules.some((m) => location.pathname.includes(m))
    ) {
      const restrictedPrefixes = [
        '/admin/procurement',
        '/admin/tapals',
        '/admin/logistics',
        '/admin/finance',
        '/admin/billing',
        '/admin/inventory',
        '/admin/access',
        '/admin/outlets',
        '/admin/expenses',
        '/admin/vehicles',
        '/admin/sales-approval',
      ];
      if (restrictedPrefixes.some((p) => location.pathname.startsWith(p))) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
    if (!canBuyerModule && !onBuyerRoute) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

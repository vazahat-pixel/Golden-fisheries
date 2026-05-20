import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';

const ProtectedRoute = ({ children, allowedRoles, module }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { hasPermission } = useRbacStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth/init" replace />;
  }

  // Check if role is allowed (if role restriction is provided)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check granular module permissions (if module permission check is requested)
  if (module && user) {
    const userId = user.id || user._id;
    const canRead = hasPermission(userId, module, 'read');
    if (!canRead) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

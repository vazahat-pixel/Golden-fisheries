import React from 'react';
import { Navigate } from 'react-router-dom';
import OtpLoginScreen from '../../components/auth/OtpLoginScreen';
import { useAuthStore } from '../../store/authStore';
import { ROLES, normalizeRole } from '../../constants/rbac';
import { AUTH_PORTALS } from '../../constants/authPortals';
import { getHomePathForRole } from '../../utils/roleRedirect';

const DriverLogin = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const role = normalizeRole(user.role);
    if (role === ROLES.DRIVER || role === ROLES.SUPER_ADMIN) {
      return <Navigate to={getHomePathForRole(role)} replace />;
    }
  }

  return (
    <OtpLoginScreen
      variant="fieldApp"
      title="Driver Login"
      subtitle="OTP sent to your registered mobile"
      loginPortal={AUTH_PORTALS.DRIVER}
      allowedRoles={[ROLES.DRIVER, ROLES.SUPER_ADMIN]}
      homePath="/driver/dashboard"
      backPath="/auth/home"
    />
  );
};

export default DriverLogin;

import { Navigate } from 'react-router-dom';

/** Legacy URL — field roles now use Admin Login at /auth/admin */
const MobileLogin = () => <Navigate to="/auth/admin" replace />;

export default MobileLogin;

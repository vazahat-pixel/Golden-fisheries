import { Navigate } from 'react-router-dom';

export default function AdminAuth() {
  return <Navigate to="/auth/admin" replace />;
}

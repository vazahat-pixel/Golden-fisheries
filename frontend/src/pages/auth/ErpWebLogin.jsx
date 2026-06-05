import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { normalizeRole, ROLES } from '../../constants/rbac';
import { canLoginViaAdminErp, getDefaultHomePath, normalizePermissions } from '../../utils/permissions';

/**
 * Unified Admin login — Super Admin, field roles (Buyer, Procurement, Vehicles), and office ERP staff.
 */
const ErpWebLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  // If already authenticated, redirect to their dashboard (prevents back-button loop)
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultHomePath(user)} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedPhone = phone.replace(/\D/g, '').slice(-10);
    if (normalizedPhone.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      toast.error('Password is required');
      return;
    }

    setLoading(true);
    try {
      const payload = await authService.login(normalizedPhone, password);
      const raw = payload?.user || payload?.data?.user || payload;
      const accessToken = payload?.accessToken || payload?.data?.accessToken;

      if (!raw || !accessToken) {
        throw new Error('Invalid login response from server');
      }

      const user = {
        ...raw,
        id: raw._id || raw.id,
        name: raw.fullName || raw.name,
        phone: raw.phone || normalizedPhone,
        role: normalizeRole(raw.role),
        status: raw.status || (raw.isActive === false ? 'revoked' : 'active'),
        platformAccess: raw.platformAccess || { web: true, mobile: true },
        permissions: normalizePermissions(raw.permissions, raw.role),
      };

      if (normalizeRole(user.role) === ROLES.DRIVER) {
        toast.error('Drivers must use Driver Login from the home screen.');
        navigate('/auth/driver');
        return;
      }

      if (!canLoginViaAdminErp(user)) {
        toast.error(
          'This account cannot sign in here. Use Restaurant, Fish Mall, or Driver login — or ask Admin to enable your access.'
        );
        return;
      }

      useAuthStore.getState().login(user, accessToken);
      toast.success(`Welcome, ${user.name || user.role}`);
      navigate(getDefaultHomePath(user));
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Role-based ERP access">
      <button
        type="button"
        onClick={() => navigate('/auth/home')}
        className="text-white/70 flex items-center gap-2 mb-5 text-xs font-semibold uppercase tracking-wider hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={14} /> Back to sign-in options
      </button>

      <form onSubmit={handleLogin} className="flex flex-col w-full -mt-1">
        <AuthInput
          type="tel"
          inputMode="numeric"
          placeholder="Mobile Number (10 digits)"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
          required
        />
        <AuthInput
          type="password"
          placeholder="Password"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <p className="text-[11px] text-white/45 mb-5 leading-relaxed">
          Use the mobile number and password shared by your administrator. Modules shown match your assigned role.
        </p>

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default ErpWebLogin;

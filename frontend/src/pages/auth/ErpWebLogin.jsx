import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { normalizeRole } from '../../constants/rbac';
import { canAccessAdminPanel, getDefaultHomePath, normalizePermissions } from '../../utils/permissions';

/**
 * Unified web ERP login — Super Admin, Procurement (web), Buyer, Finance, Logistics, etc.
 */
const ErpWebLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

      if (!canAccessAdminPanel(user)) {
        toast.error(
          'This account is not enabled for Admin ERP web access. Use Restaurant, Fish Mall, Driver, or Mobile login.'
        );
        return;
      }

      if (user.platformAccess?.web === false) {
        toast.error('Web ERP access is disabled for this account.');
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
    <AuthLayout title="Admin Login" subtitle="Access is controlled by your Admin-assigned role">
      <button
        type="button"
        onClick={() => navigate('/auth/home')}
        className="text-white flex items-center gap-2 mb-6 hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <form onSubmit={handleLogin} className="flex flex-col w-full">
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

        <p className="text-[10px] text-white/50 mb-4 leading-relaxed">
          Super Admin, Procurement Manager, Buyer, and Vehicle Manager use this screen. You will only see
          modules your Admin has enabled.
        </p>

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login to Admin ERP'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default ErpWebLogin;

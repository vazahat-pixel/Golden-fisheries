import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Smartphone, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { getHomePathForRole } from '../../utils/roleRedirect';
import { normalizeRole, ROLES } from '../../constants/rbac';
import { toast } from 'react-hot-toast';

const DriverLogin = () => {
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

    setLoading(true);
    try {
      const payload = await authService.login(normalizedPhone, password);
      const raw = payload?.user || payload?.data?.user || payload;
      const accessToken = payload?.accessToken || payload?.data?.accessToken;
      if (!raw || !accessToken) throw new Error('Invalid login response');

      const user = {
        ...raw,
        id: raw._id || raw.id,
        name: raw.fullName || raw.name,
        phone: raw.phone || normalizedPhone,
        role: raw.role,
      };

      const role = normalizeRole(user.role);
      if (role !== ROLES.DRIVER && role !== ROLES.SUPER_ADMIN) {
        toast.error('Driver login only');
        return;
      }

      useAuthStore.getState().login(user, accessToken);
      toast.success('Welcome');
      navigate(getHomePathForRole(role));
    } catch (err) {
      toast.error(err?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Driver Login" subtitle="Mobile trip operations">
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
          placeholder="Mobile Number"
          icon={Smartphone}
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
        <AuthButton type="submit" disabled={loading} className="mt-2">
          {loading ? 'Signing in...' : 'Login'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default DriverLogin;

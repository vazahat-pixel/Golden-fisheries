import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/auth/AuthLayout';
import AuthInput from '../../components/auth/AuthInput';
import AuthButton from '../../components/auth/AuthButton';
import { Phone, Lock, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { toast } from 'react-hot-toast';
import { ROLES, normalizeRole } from '../../constants/rbac';

const AdminLogin = () => {
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
      const raw = payload?.user || payload;
      const accessToken = payload?.accessToken;

      if (!raw || !accessToken) {
        throw new Error('Invalid login response from server');
      }

      const user = {
        ...raw,
        id: raw._id || raw.id,
        name: raw.fullName || raw.name,
        phone: raw.phone || normalizedPhone,
        role: raw.role,
        status: raw.status || 'active'
      };

      const normalized = normalizeRole(user.role);
      if (normalized !== ROLES.SUPER_ADMIN) {
        toast.error('This login is for Super Admin (web ERP) accounts only');
        return;
      }

      useAuthStore.getState().login(user, accessToken);
      toast.success('Welcome back!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err?.message || 'Login failed. Check phone and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Login" subtitle="Fleet Management System">
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
          Seeded admin: phone <span className="text-brand-yellow font-bold">9076062592</span> · password{' '}
          <span className="text-brand-yellow font-bold">admin_password_123</span>
        </p>

        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Login'}
        </AuthButton>
      </form>
    </AuthLayout>
  );
};

export default AdminLogin;

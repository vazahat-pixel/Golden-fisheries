import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import FieldAuthLayout from './FieldAuthLayout';
import AuthInput from './AuthInput';
import AuthButton from './AuthButton';
import { Smartphone, ArrowLeft, RotateCcw } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { normalizeRole } from '../../constants/rbac';
import { toast } from 'react-hot-toast';
import { unlockNotificationAudio } from '../../utils/notificationSound';

/**
 * Shared phone + OTP login for field portals (driver, buyer).
 */
const OtpLoginScreen = ({
  title,
  subtitle,
  loginPortal,
  allowedRoles,
  homePath,
  backPath = '/auth/home',
  variant = 'default',
}) => {
  const isFieldApp = variant === 'fieldApp';
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [view, setView] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer <= 0) return undefined;
    const id = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const normalizedPhone = () => phone.replace(/\D/g, '').slice(-10);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) {
      document.getElementById(`otp-${loginPortal}-${index + 1}`)?.focus();
    }
  };

  const sendOtp = async () => {
    const p = normalizedPhone();
    if (p.length !== 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestOtp(p, loginPortal);
      const payload = res?.data ?? res;
      if (payload?.devOtp) setDevOtp(payload.devOtp);
      setView('otp');
      setTimer(60);
      toast.success('OTP sent to your mobile');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (e) => {
    e?.preventDefault();
    const code = otp.join('');
    if (code.length < 4 || code.length > 6) {
      toast.error('Enter valid OTP (3232)');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.verifyOtp(normalizedPhone(), code, loginPortal);
      const raw = res?.user || res?.data?.user;
      const accessToken = res?.accessToken || res?.data?.accessToken;
      if (!raw || !accessToken) throw new Error('Invalid login response');

      const role = normalizeRole(raw.role);
      if (allowedRoles?.length && !allowedRoles.includes(role)) {
        toast.error('This account cannot sign in here');
        return;
      }

      const user = {
        ...raw,
        id: raw._id || raw.id,
        name: raw.fullName || raw.name,
        phone: raw.phone || normalizedPhone(),
        role,
        platformAccess: raw.platformAccess || { web: false, mobile: true },
      };

      login(user, accessToken);
      unlockNotificationAudio();
      toast.success(`Welcome, ${user.name || 'User'}`);
      navigate(homePath);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const backHandler = () => (view === 'otp' ? setView('phone') : navigate(backPath));
  const backLabel = view === 'otp' ? 'Change number' : 'Back';

  const phoneForm = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendOtp();
      }}
      className="flex flex-col w-full gap-4"
    >
      {isFieldApp ? (
        <input
          type="tel"
          inputMode="numeric"
          placeholder="Registered mobile (10 digits)"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
          required
          className="fa-input"
        />
      ) : (
        <AuthInput
          type="tel"
          inputMode="numeric"
          placeholder="Registered mobile (10 digits)"
          icon={Smartphone}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          maxLength={10}
          required
        />
      )}
      <p className={isFieldApp ? 'fa-muted text-xs' : 'text-white/50 text-xs'}>
        Admin must add your mobile first. You will receive an SMS OTP.
      </p>
      {isFieldApp ? (
        <button type="submit" disabled={loading} className="fa-btn-primary w-full py-3.5 text-sm font-bold fa-tap disabled:opacity-50">
          {loading ? 'Sending OTP…' : 'Send OTP'}
        </button>
      ) : (
        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </AuthButton>
      )}
    </form>
  );

  const otpForm = (
    <form onSubmit={verifyOtp} className="flex flex-col w-full gap-4">
      <p className={isFieldApp ? 'fa-muted text-sm text-center' : 'text-white/70 text-sm text-center'}>
        Code sent to +91 {normalizedPhone()}
      </p>
      {devOtp && (
        <p className="text-[var(--fa-accent)] text-xs text-center font-bold">Dev OTP: {devOtp}</p>
      )}
      <div className="flex justify-center gap-2">
        {otp.map((digit, idx) => (
          <input
            key={idx}
            id={`otp-${loginPortal}-${idx}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            className={
              isFieldApp
                ? 'w-11 h-12 rounded-[var(--fa-radius-md)] text-center text-lg font-bold fa-input'
                : 'w-11 h-13 sm:w-12 sm:h-14 rounded-xl text-center text-lg font-bold bg-white/95 text-brand-dark shadow-inner focus:ring-2 focus:ring-brand-yellow outline-none transition-all'
            }
          />
        ))}
      </div>
      {isFieldApp ? (
        <button type="submit" disabled={loading} className="fa-btn-primary w-full py-3.5 text-sm font-bold fa-tap disabled:opacity-50">
          {loading ? 'Verifying…' : 'Verify & Login'}
        </button>
      ) : (
        <AuthButton type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify & Login'}
        </AuthButton>
      )}
      {timer > 0 ? (
        <p className={isFieldApp ? 'fa-muted text-xs text-center' : 'text-white/40 text-xs text-center'}>
          Resend in {timer}s
        </p>
      ) : (
        <button
          type="button"
          onClick={sendOtp}
          className={
            isFieldApp
              ? 'text-[var(--fa-accent)] text-xs flex items-center justify-center gap-1 fa-tap'
              : 'text-brand-yellow text-xs flex items-center justify-center gap-1 hover:underline'
          }
        >
          <RotateCcw size={12} /> Resend OTP
        </button>
      )}
    </form>
  );

  if (isFieldApp) {
    return (
      <FieldAuthLayout title={title} subtitle={subtitle} onBack={backHandler} backLabel={backLabel}>
        {view === 'phone' ? phoneForm : otpForm}
      </FieldAuthLayout>
    );
  }

  return (
    <AuthLayout title={title} subtitle={subtitle}>
      <button
        type="button"
        onClick={backHandler}
        className="text-white/70 flex items-center gap-2 mb-5 text-xs font-semibold uppercase tracking-wider hover:text-brand-yellow transition-colors"
      >
        <ArrowLeft size={14} /> {backLabel}
      </button>
      {view === 'phone' ? phoneForm : otpForm}
    </AuthLayout>
  );
};

export default OtpLoginScreen;

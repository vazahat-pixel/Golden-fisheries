import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { ShoppingCart, Smartphone, ArrowLeft, Loader, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const OtpInput = ({ otp, setOtp }) => {
  const refs = Array.from({ length: 6 }, () => React.useRef());
  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp]; next[i] = val; setOtp(next);
    if (val && i < 5) refs[i + 1].current?.focus();
  };
  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs[i - 1].current?.focus();
  };
  return (
    <div className="flex justify-center gap-2">
      {otp.map((d, i) => (
        <input key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)} onKeyDown={e => handleKey(i, e)}
          className="w-10 h-12 bg-blue-50 text-center text-xl font-black text-blue-800 focus:ring-2 focus:ring-blue-500 outline-none rounded-xl border border-blue-200"
        />
      ))}
    </div>
  );
};

const BuyerAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState(null);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) return toast.error('Enter valid 10-digit mobile');
    setLoading(true);
    try {
      const res = await authService.requestOtp(phone);
      if (res?.devOtp) setDevOtp(res.devOtp);
      setView('otp');
      toast.success('OTP sent to your mobile');
    } catch (err) {
      toast.error(err?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return toast.error('Enter 6-digit OTP');
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phone, code);
      if (res?.user) {
        if (res.user.role !== 'BUYER' && res.user.role !== 'ADMIN') {
          toast.error('This portal is for Buyers only. Please use the correct login.');
          return;
        }
        login(res.user, res.accessToken);
        toast.success(`Welcome, ${res.user.fullName || 'Buyer'}!`);
        navigate('/buyer/dashboard');
      }
    } catch (err) {
      toast.error(err?.message || 'Invalid OTP code');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-8 right-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-300">BUYER SECURE GATEWAY</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 mb-5 bg-blue-500/20 border border-blue-400/30 rounded-3xl flex items-center justify-center shadow-2xl">
            <ShoppingCart size={36} className="text-blue-300" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">Buyer Portal</h1>
          <p className="text-[10px] text-blue-300/60 font-bold tracking-[0.2em] uppercase">Tapal Tracking & Invoice Hub</p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handleSendOtp} className="w-full max-w-sm space-y-5 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400/60" size={18} />
              <input type="tel" placeholder="Mobile Number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-12 py-4 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-blue-400 transition-all font-bold backdrop-blur-sm"
                required
              />
            </div>
            <button disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : 'Login with OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="space-y-2">
              <p className="text-xs text-white uppercase tracking-[0.2em] font-black">Enter Verification Code</p>
              <p className="text-[10px] text-blue-300/60">Sent to +91 {phone}</p>
            </div>
            {devOtp && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Dev OTP: {devOtp}</p>
              </div>
            )}
            <OtpInput otp={otp} setOtp={setOtp} />
            <button disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-400 text-white font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : 'Verify & Enter'}
            </button>
            <button type="button" onClick={() => setView('login')}
              className="text-[10px] text-blue-300/40 font-bold flex items-center justify-center gap-1 mx-auto hover:text-blue-300">
              <ArrowLeft size={12} /> Use different number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BuyerAuth;

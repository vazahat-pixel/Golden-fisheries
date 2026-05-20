import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';
import { authService } from '../../services/authService';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Globe,
  Settings,
  Loader,
  RotateCcw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

// --- OTP Input component ---
const OtpInput = ({ otp, setOtp }) => {
  const refs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
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
        <input
          key={i} ref={refs[i]}
          type="text" inputMode="numeric" maxLength={1} value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-10 h-12 bg-[#E6E3C8] text-center text-xl font-black text-[#6A7051] focus:ring-2 focus:ring-[#C5A021] outline-none rounded-xl"
        />
      ))}
    </div>
  );
};

const AdminAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { getUserByPhone, sendOtp, verifyOtp, clearOtpSession } = useRbacStore();
  
  const [view, setView] = useState('login'); // login, otp
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [devOtp, setDevOtp] = useState(null);

  const handlePhoneSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Enter valid 10-digit mobile'); return;
    }
    setLoading(true);
    try {
      const res = await authService.requestOtp(phone);
      if (res && res.devOtp) {
        setDevOtp(res.devOtp);
      }
      setView('otp');
      toast.success('Admin Verification OTP Sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    if (e) e.preventDefault();
    const entered = otp.join('');
    if (entered.length !== 6) { toast.error('Enter 6-digit OTP'); return; }
    
    setLoading(true);
    try {
      const res = await authService.verifyOtp(phone, entered);
      if (res && res.user) {
        const role = res.user.role;
        const hasAdminPanelAccess = role === 'ADMIN' || res.user.permissions?.panels?.admin === true;
        if (!hasAdminPanelAccess) {
          toast.error('This account does not have Admin Panel access');
          navigate('/unauthorized', { replace: true });
          return;
        }
        login(res.user, res.accessToken);
        toast.success('Access Granted');
        // Role-aware redirect
        if (role === 'PROCUREMENT_MANAGER') {
          navigate('/admin/procurement/harvest');
        } else if (role === 'VEHICLE_MANAGER') {
          navigate('/admin/vehicles');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        toast.error('Invalid response payload structure');
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP Code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#C5A021]/30">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 right-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#C5A021] rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">SECURE GATEWAY</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">
        <div className="mb-10 flex flex-col items-center text-center">
           <div className="w-24 h-24 mb-4 relative group active:scale-95 transition-transform duration-300">
              <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight mb-1 uppercase">Admin Portal</h1>
           <p className="text-[10px] text-[#E6E3C8]/60 font-bold tracking-[0.2em] uppercase">Control Plane Access</p>
        </div>

        {view === 'login' ? (
          <form onSubmit={handlePhoneSubmit} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6A7051]/60" size={18} />
              <input 
                type="tel" 
                placeholder="Mobile Number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full bg-[#E6E3C8] border-none rounded-2xl px-12 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] transition-all font-bold"
                required
              />
            </div>
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerify} className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="space-y-2">
               <p className="text-xs text-[#E6E3C8] uppercase tracking-[0.2em] font-black">Verification Required</p>
               <p className="text-[10px] text-[#E6E3C8]/60">Enter the code sent to +91 {phone}</p>
            </div>
            
            {devOtp && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-2 rounded-xl">
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Dev OTP: {devOtp}</p>
              </div>
            )}

            <OtpInput otp={otp} setOtp={setOtp} />
            
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-2">
              {loading ? <Loader className="animate-spin" size={18} /> : "Verify & Access"}
            </button>

            <button type="button" onClick={() => setView('login')} className="text-[10px] text-[#E6E3C8]/40 font-black uppercase tracking-widest hover:text-white flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft size={12} /> Use different number
            </button>
          </form>
        )}

        <div className="mt-16 opacity-20">
           <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
              <span className="text-[9px] font-black text-[#E6E3C8] uppercase tracking-[0.5em]">SYSTEM ADMINISTRATOR</span>
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;

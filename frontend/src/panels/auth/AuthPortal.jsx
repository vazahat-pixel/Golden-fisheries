import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Fish,
  UserPlus,
  KeyRound
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const AuthPortal = () => {
  const navigate = useNavigate();
  const { login, startVerification, completeVerification, cancelVerification } = useAuthStore();
  
  // View Switcher: login | signup | forgot | otp
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'CUSTOMER'
  });

  // OTP Timer logic
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    
    // Auto focus next
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API calls
    setTimeout(() => {
      if (view === 'login') {
        // Mock Login
        if (formData.phone === '9876543210' && formData.password === 'admin') {
          login({ name: 'MAHESH KUMAR', role: 'ADMIN', phone: formData.phone }, 'mock-jwt-token');
          toast.success('Identity Verified. Welcome back.');
          navigate('/admin');
        } else {
          toast.error('Invalid credentials. Access denied.');
        }
      } else if (view === 'signup') {
        if (!formData.phone || !formData.name) return setLoading(false);
        startVerification(formData);
        setView('otp');
        setTimer(60);
        toast.success('Verification code dispatched to your mobile.');
      } else if (view === 'otp') {
        if (otp.join('') === '123456') {
          completeVerification();
          toast.success('Registration finalized!');
          navigate('/admin');
        } else {
          toast.error('Invalid verification code.');
        }
      } else if (view === 'forgot') {
        toast.success('Recovery link sent to your registered mobile.');
        setView('login');
      }
      setLoading(false);
    }, 1500);
  };

  const renderView = () => {
    switch(view) {
      case 'login':
        return (
          <form onSubmit={handleAction} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">MOBILE NUMBER</label>
              <div className="relative group">
                <Smartphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-black transition-colors" />
                <input 
                  type="tel" 
                  placeholder="E.G. 9876543210"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-olive-50/20 border border-card-border px-10 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">PASSWORD</label>
                <button type="button" onClick={() => setView('forgot')} className="text-[9px] font-bold text-accent-olive hover:underline">FORGOT?</button>
              </div>
              <div className="relative group">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-black transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-olive-50/20 border border-card-border px-10 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all"
                />
              </div>
            </div>
            <Button disabled={loading} className="w-full h-12 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-xl hover:shadow-black/20">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>ACCESS ACCOUNT <ArrowRight size={16} /></>}
            </Button>
            <p className="text-center text-[10px] font-bold text-text-muted uppercase tracking-widest pt-2">
              NEW TO SYSTEM? <button type="button" onClick={() => setView('signup')} className="text-black hover:underline ml-1">CREATE ACCOUNT</button>
            </p>
          </form>
        );

      case 'signup':
        return (
          <form onSubmit={handleAction} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">FULL NAME</label>
              <input 
                type="text" 
                placeholder="E.G. MAHESH KUMAR"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-olive-50/20 border border-card-border px-4 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">MOBILE NUMBER (FOR OTP)</label>
              <input 
                type="tel" 
                placeholder="E.G. 9876543210"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-olive-50/20 border border-card-border px-4 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">SET PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-olive-50/20 border border-card-border px-4 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <Button disabled={loading} className="w-full h-12 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-xl">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>START VERIFICATION <Smartphone size={16} /></>}
            </Button>
            <button type="button" onClick={() => setView('login')} className="w-full text-center text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
              <ArrowLeft size={14} /> BACK TO LOGIN
            </button>
          </form>
        );

      case 'otp':
        return (
          <form onSubmit={handleAction} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
               <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mx-auto shadow-lg"><Smartphone size={20} /></div>
               <p className="text-[10px] font-bold text-black uppercase tracking-widest">VERIFY MOBILE NUMBER</p>
               <p className="text-[9px] text-text-muted font-bold uppercase">CODE SENT TO +91 {formData.phone.slice(-10)}</p>
            </div>
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-full h-12 border border-card-border bg-olive-50/20 text-center text-lg font-serif italic font-bold focus:ring-1 focus:ring-black outline-none"
                />
              ))}
            </div>
            <div className="space-y-4">
              <Button disabled={loading} className="w-full h-12 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-xl bg-black">
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>COMPLETE REGISTRATION <CheckCircle2 size={16} /></>}
              </Button>
              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">RESEND IN {timer}S</p>
                ) : (
                  <button type="button" onClick={() => setTimer(60)} className="text-[9px] font-bold text-accent-olive uppercase tracking-widest hover:underline underline-offset-4">RESEND VERIFICATION CODE</button>
                )}
              </div>
            </div>
            <button type="button" onClick={() => setView('signup')} className="w-full text-center text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> EDIT MOBILE NUMBER
            </button>
          </form>
        );

      case 'forgot':
        return (
          <form onSubmit={handleAction} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 mb-6">
               <div className="w-12 h-12 bg-olive-100 text-accent-olive rounded-full flex items-center justify-center mx-auto shadow-sm"><KeyRound size={20} /></div>
               <p className="text-[10px] font-bold text-black uppercase tracking-widest">PASSWORD RECOVERY</p>
               <p className="text-[9px] text-text-muted font-bold uppercase">ENTER REGISTERED MOBILE TO RECEIVE RESET LINK</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">MOBILE NUMBER</label>
              <input 
                type="tel" 
                placeholder="E.G. 9876543210"
                className="w-full bg-olive-50/20 border border-card-border px-4 py-3 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <Button disabled={loading} className="w-full h-12 text-[10px] font-bold uppercase tracking-widest gap-2 shadow-xl">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>SEND RECOVERY CODE <Smartphone size={16} /></>}
            </Button>
            <button type="button" onClick={() => setView('login')} className="w-full text-center text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center justify-center gap-2 mt-2">
              <ArrowLeft size={14} /> BACK TO LOGIN
            </button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-6 selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-500">
      <div className="w-full max-w-[440px] bg-white border border-gray-200 shadow-xl p-10">
        {/* Compact Branding */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gray-50 flex items-center justify-center mx-auto mb-6 overflow-hidden">
            <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight uppercase">
            {view === 'login' ? 'System Login' : view === 'signup' ? 'Create Account' : view === 'otp' ? 'Verification' : 'Recovery'}
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Enter credentials to proceed</p>
          <div className="h-0.5 w-8 bg-[#6B7550] mx-auto mt-4" />
        </div>

        <div className="min-h-[280px]">
          {renderView()}
        </div>

        {/* Audit Info */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
           <div className="flex items-center gap-2 opacity-40">
              <ShieldCheck size={14} className="text-[#6B7550]" />
              <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">Encrypted Enterprise Session</span>
           </div>
           <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">© 2026 Golden Fisheries</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;

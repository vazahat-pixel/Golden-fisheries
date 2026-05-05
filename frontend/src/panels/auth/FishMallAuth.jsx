import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { 
  ShieldCheck, 
  Smartphone, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  KeyRound,
  UserPlus,
  Mail,
  CheckCircle2,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FishMallAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    email: ''
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
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // MOCK LOGIC FOR FISH MALL
    setTimeout(() => {
      if (view === 'login') {
        if (formData.phone === '7766554433' && formData.password === 'mall123') {
          login({ name: 'RAMESH MANAGER', role: 'MANAGER', phone: formData.phone }, 'mock-jwt-token');
          toast.success('Identity Verified. Welcome back.');
          navigate('/fishmall/dashboard');
        } else {
          toast.error('Invalid credentials.');
        }
      } else if (view === 'signup') {
        setView('otp');
        setTimer(60);
        toast.success('Verification code sent.');
      } else if (view === 'otp') {
        if (otp.join('') === '123456') {
          toast.success('Account verified!');
          setView('login');
        } else {
          toast.error('Invalid code.');
        }
      } else if (view === 'forgot') {
        toast.success('Reset link sent.');
        setView('login');
      }
      setLoading(false);
    }, 1500);
  };

  const renderView = () => {
    switch(view) {
      case 'login':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="space-y-4">
              <input 
                type="tel" 
                placeholder="Mobile Number"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] transition-all font-bold"
                required
              />
              <input 
                type="password" 
                placeholder="Password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] transition-all font-bold"
                required
              />
            </div>
            
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl shadow-black/40 active:scale-[0.98] uppercase tracking-[0.2em] text-sm">
              {loading ? "VERIFYING..." : "Sign in"}
            </button>
            <p className="text-center text-xs text-[#E6E3C8]/40 pt-4 uppercase tracking-[0.2em] font-bold">
              NEW HERE? <button type="button" onClick={() => setView('signup')} className="text-[#C5A021] font-black hover:underline">CREATE ACCOUNT</button>
            </p>
          </form>
        );
      case 'signup':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-4 animate-in fade-in zoom-in-95 duration-500">
            <input type="text" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <input type="tel" placeholder="Mobile Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <input type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <input type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all mt-4 shadow-xl uppercase tracking-[0.2em]">{loading ? "SENDING OTP..." : "Continue"}</button>
            <button type="button" onClick={() => setView('login')} className="text-center text-xs text-[#E6E3C8]/60 uppercase tracking-widest mt-2 font-bold hover:text-white">Back to Sign in</button>
          </form>
        );
      case 'otp':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="flex justify-center gap-3">
              {otp.map((digit, idx) => (
                <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={e => handleOtpChange(idx, e.target.value)} className="w-12 h-14 bg-[#E6E3C8] border-none rounded-xl text-center text-xl font-black text-[#6A7051] focus:ring-2 focus:ring-[#C5A021] outline-none shadow-lg" />
              ))}
            </div>
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">{loading ? "VERIFYING..." : "Verify Identity"}</button>
          </form>
        );
      case 'forgot':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <input type="tel" placeholder="Registered Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">Send Reset Link</button>
            <button type="button" onClick={() => setView('login')} className="w-full text-center text-xs text-[#E6E3C8]/60 uppercase tracking-widest mt-2 font-bold hover:text-white">Back to Sign in</button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#C5A021]/30">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-8 right-12 flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
        <Globe size={16} className="text-[#E6E3C8]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">EN</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">
        <div className="mb-12 flex flex-col items-center text-center">
           <div className="w-32 h-32 mb-6 relative group active:scale-95 transition-transform duration-300">
              <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase">Sign in</h1>
           <p className="text-sm text-[#E6E3C8]/60 font-bold tracking-tight">Sign in and start managing your fish mall!</p>
        </div>

        {renderView()}

        <div className="mt-20 opacity-20">
           <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
              <span className="text-[9px] font-black text-[#E6E3C8] uppercase tracking-[0.5em]">GF INTERNAL CONTROL</span>
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
           </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none opacity-5">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-32 fill-[#E6E3C8]">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,14.29,1200,52.47V0Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default FishMallAuth;

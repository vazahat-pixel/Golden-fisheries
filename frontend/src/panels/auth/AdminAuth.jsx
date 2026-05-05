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
  CheckCircle2,
  Globe,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const handleAction = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // MOCK DELAY
    setTimeout(() => {
      if (view === 'login') {
        // DUMMY CREDENTIALS FOR ADMIN
        if (formData.phone === '9876543210' && formData.password === 'admin123') {
          login({ name: 'MAHESH KUMAR', role: 'ADMIN', phone: formData.phone }, 'mock-jwt-token');
          toast.success('Admin Identity Verified. Welcome back.');
          navigate('/admin/dashboard');
        } else {
          toast.error('Invalid administrative credentials.');
        }
      } else if (view === 'forgot') {
        toast.success('Reset link sent to secure device.');
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
                placeholder="Admin Mobile"
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
              {loading ? "VERIFYING..." : "Enter Portal"}
            </button>

            <div className="flex flex-col gap-4 text-center pt-2">
               <button type="button" onClick={() => setView('forgot')} className="text-[10px] text-[#E6E3C8]/60 font-black uppercase tracking-widest hover:text-[#C5A021]">Reset Admin Access?</button>
               <p className="text-[10px] text-[#E6E3C8]/40 uppercase tracking-[0.2em] font-bold">
                 PROTECTED SYSTEM <span className="text-[#C5A021] font-black underline">INTERNAL ONLY</span>
               </p>
            </div>
          </form>
        );
      case 'forgot':
        return (
          <form onSubmit={handleAction} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in-95 duration-500 text-center">
            <div className="space-y-2 mb-4">
               <p className="text-xs text-[#E6E3C8] uppercase tracking-[0.2em] font-black">Secure Recovery</p>
            </div>
            <input type="tel" placeholder="Admin Mobile" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#E6E3C8] border-none rounded-2xl px-6 py-4 text-sm text-[#6A7051] placeholder-[#6A7051]/60 outline-none focus:ring-2 focus:ring-[#C5A021] font-bold" required />
            <button disabled={loading} className="w-full bg-[#C5A021] hover:bg-[#D4AF37] text-[#0A0B09] font-black py-4 rounded-2xl transition-all shadow-xl uppercase tracking-[0.2em]">{loading ? "SENDING..." : "Request Reset"}</button>
            <button type="button" onClick={() => setView('login')} className="w-full text-center text-xs text-[#E6E3C8]/60 uppercase tracking-widest mt-2 font-bold hover:text-white">Back to Sign in</button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#6A7051] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-[#C5A021]/30">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="absolute top-8 right-12 flex items-center gap-2">
        <div className="w-2 h-2 bg-[#C5A021] rounded-full animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#E6E3C8]">ENCRYPTED ACCESS</span>
      </div>

      <div className="relative z-10 w-full flex flex-col items-center px-6">
        <div className="mb-12 flex flex-col items-center text-center">
           <div className="w-32 h-32 mb-6 relative group active:scale-95 transition-transform duration-300">
              <img src="/IMG_8643-removebg-preview.png" alt="Golden Fisheries" className="w-full h-full object-contain drop-shadow-2xl" />
           </div>
           <h1 className="text-5xl font-black text-white tracking-tight mb-2 uppercase">Admin Panel</h1>
           <p className="text-sm text-[#E6E3C8]/60 font-bold tracking-tight">Authorized Personnel Access Only</p>
        </div>
        {renderView()}
        <div className="mt-20 opacity-20">
           <div className="flex items-center gap-3">
              <div className="w-12 h-[1px] bg-[#E6E3C8]"></div>
              <span className="text-[9px] font-black text-[#E6E3C8] uppercase tracking-[0.5em]">SYSTEM ADMINISTRATOR</span>
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

export default AdminAuth;

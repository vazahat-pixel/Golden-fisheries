import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { useAuthStore } from '../../store/authStore';
import { 
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  FileText, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  LogOut,
  Camera,
  Settings,
  ChevronRight,
  Info,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: FileText, label: 'Vehicle Documents', path: '/driver/documents', color: 'bg-blue-500' },
    { icon: AlertTriangle, label: 'Vehicle Alerts', path: '/driver/alerts', color: 'bg-red-500' },
    { icon: Settings, label: 'App Settings', path: '/driver/settings', color: 'bg-slate-500' },
    { icon: Info, label: 'Support Center', path: '/driver/support', color: 'bg-emerald-500' },
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 bg-slate-50 min-h-screen">
      <div className="flex flex-col items-center space-y-4 pt-2">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2rem] bg-black p-1 shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} className="w-full h-full object-cover rounded-[1.9rem]" alt="Pilot" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-emerald-400">
                <User size={40} />
              </div>
            )}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-slate-50 hover:scale-110 active:scale-95 transition-all">
             <Camera size={14} />
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic">{user?.name || 'RAJESH KUMAR'}</h2>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg uppercase tracking-widest border border-emerald-100">Verified Pilot</span>
            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Rank: Gold</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-[1.5rem] text-center space-y-1 border-none">
          <p className="text-xl font-black text-black italic leading-none">12.4k</p>
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Total KM</p>
        </div>
        <div className="glass-card p-4 rounded-[1.5rem] text-center space-y-1 border-none">
          <p className="text-xl font-black text-black italic leading-none">4.9</p>
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Safety Score</p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Console Configuration</h3>
        <div className="space-y-2">
          {menuItems.map((item, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(item.path)}
              className="glass-card p-4 rounded-[1.5rem] flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer border-none"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 ${item.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-6 transition-transform`}>
                  <item.icon size={14} />
                </div>
                <span className="text-[13px] font-bold text-black uppercase tracking-tight">{item.label}</span>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={logout}
        className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100/50"
      >
        <LogOut size={16} /> Terminate Session
      </button>

      <div className="flex flex-col items-center gap-2 pt-2 opacity-30 italic">
        <img src="/logo.PNG" className="w-6 h-6 object-contain" alt="" />
        <p className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.1em]">
          GF Fleet Pilot v2.4.0 (AESTHETIC_REDACTED)
        </p>
      </div>
    </div>
  );
};

export default DriverProfile;

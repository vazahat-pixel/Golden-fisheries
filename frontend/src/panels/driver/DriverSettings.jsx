import React, { useState } from 'react';
import { 
  ChevronLeft, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Moon, 
  Globe, 
  LogOut, 
  ChevronRight,
  Lock,
  Eye,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const DriverSettings = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const settingsGroups = [
    {
      title: 'Operational Profile',
      items: [
        { icon: User, label: 'Pilot Identity', value: 'Verified', path: '/driver/profile' },
        { icon: Bell, label: 'Global Notifications', type: 'toggle', state: notifications, setState: setNotifications },
        { icon: Eye, label: 'Ghost Mode', type: 'toggle', state: false, setState: () => toast.error('Admin restricted') },
      ]
    },
    {
      title: 'Console Interface',
      items: [
        { icon: Moon, label: 'Tactical Dark Mode', type: 'toggle', state: darkMode, setState: setDarkMode },
        { icon: Globe, label: 'Display Language', value: 'English (IN)' },
      ]
    },
    {
      title: 'Security & Access',
      items: [
        { icon: Lock, label: 'Update Console PIN', path: '#' },
        { icon: Shield, label: 'Compliance Policy', path: '#' },
        { icon: Info, label: 'App Version', value: 'v2.4.0-Pilot' },
      ]
    }
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-soft active:scale-95 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Settings</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">System Configuration</p>
        </div>
      </div>

      <div className="space-y-6">
        {settingsGroups.map((group, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2">{group.title}</h3>
            <div className="glass-card rounded-[1.8rem] overflow-hidden border-none shadow-soft">
              {group.items.map((item, i) => (
                <div 
                  key={i}
                  onClick={() => item.path && navigate(item.path)}
                  className={`flex items-center justify-between p-4 ${i !== group.items.length - 1 ? 'border-b border-black/5' : ''} active:bg-black/5 transition-colors cursor-pointer group`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-slate-50 text-black rounded-xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <item.icon size={16} />
                    </div>
                    <span className="text-[10px] font-black text-black uppercase tracking-tight">{item.label}</span>
                  </div>
                  
                  {item.type === 'toggle' ? (
                    <button 
                      onClick={(e) => { e.stopPropagation(); item.setState(!item.state); }}
                      className={`w-10 h-5 rounded-full p-1 transition-all duration-300 ${item.state ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <div className={`w-3 h-3 bg-white rounded-full transition-all duration-300 ${item.state ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      {item.value && <span className="text-[8px] font-bold text-gray-400 uppercase">{item.value}</span>}
                      <ChevronRight size={14} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={logout}
        className="w-full py-4 bg-red-50 text-red-600 rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-sm border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-95 mt-4"
      >
        <LogOut size={16} /> Terminate Console Session
      </button>

      <div className="flex flex-col items-center gap-2 pt-4 opacity-10 grayscale">
         <img src="/logo.PNG" alt="GF" className="w-6 h-6 object-contain" />
         <p className="text-[7px] font-black uppercase tracking-widest">GF Internal Systems</p>
      </div>
    </div>
  );
};

export default DriverSettings;

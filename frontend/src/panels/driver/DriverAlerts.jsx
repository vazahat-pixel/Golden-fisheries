import React from 'react';
import { AlertCircle, ShieldCheck, FileText, Settings, ChevronRight, AlertTriangle, Info, Calendar, BellRing } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverAlerts = () => {
  const navigate = useNavigate();

  const alerts = [
    {
      id: 1,
      title: 'RC Expiry Reminder',
      status: 'CRITICAL',
      expiry: 'May 16, 2026',
      daysLeft: 5,
      description: 'Vehicle Registration Certificate is nearing its expiration date.',
      icon: FileText,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      id: 2,
      title: 'Insurance Policy',
      status: 'WARNING',
      expiry: 'June 02, 2026',
      daysLeft: 22,
      description: 'Comprehensive insurance policy renewal window is now open.',
      icon: ShieldCheck,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
    },
    {
      id: 3,
      title: 'Service Due',
      status: 'STABLE',
      expiry: '500 KM',
      daysLeft: null,
      description: 'Vehicle service scheduled based on current odometer.',
      icon: Settings,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
    }
  ];

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Alert Module</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Fleet Compliance Monitor</p>
        </div>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg relative">
          <BellRing size={18} />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black">2</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft flex items-center gap-3">
          <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-500">
             <AlertCircle size={14} />
          </div>
          <div>
            <p className="text-[12px] font-black text-black leading-none">1</p>
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Critical</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
             <ShieldCheck size={14} />
          </div>
          <div>
            <p className="text-[12px] font-black text-black leading-none">4/5</p>
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Valid Docs</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Active Compliance Alerts</h4>
        {alerts.map((alert) => (
          <div key={alert.id} className="glass-card p-3.5 rounded-2xl border-none shadow-extra-soft space-y-3 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="flex gap-3 items-center">
                <div className={`w-9 h-9 ${alert.color} rounded-xl flex items-center justify-center shadow-lg text-white`}>
                  <alert.icon size={16} />
                </div>
                <div>
                  <h3 className="text-[10px] font-black text-black uppercase tracking-tight">{alert.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[7px] font-black uppercase tracking-widest ${alert.textColor}`}>{alert.status}</span>
                    <div className="w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
                    <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{alert.expiry}</span>
                  </div>
                </div>
              </div>
              {alert.daysLeft !== null && (
                <div className="bg-red-50 text-red-600 px-2 py-0.5 rounded-lg text-[7px] font-black uppercase tracking-tighter">
                  {alert.daysLeft}d Left
                </div>
              )}
            </div>

            <p className="text-[9px] text-gray-500 leading-tight font-medium pl-2 border-l-2 border-slate-100 italic">
              {alert.description}
            </p>

            <button 
              onClick={() => toast.success('Details requested')}
              className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-[8px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
            >
              Action Required
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverAlerts;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings, User, Bell, Lock, Store, Clock, Shield, CreditCard, ChefHat, 
  IndianRupee, ChevronRight, ArrowLeft, Save, RefreshCw, Smartphone, 
  Database, BellRing, Key, LogOut, Check, X, Sliders
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useAuthStore } from '../../store/authStore';

const RestaurantSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('GENERAL');

  const tabs = [
    { id: 'GENERAL', label: 'Identity', icon: Store, desc: 'MASTER_PROFILE' },
    { id: 'STAFF', label: 'Personnel', icon: ChefHat, desc: 'ROSTER_LOGS' },
    { id: 'NOTIFICATIONS', label: 'Telemetry', icon: BellRing, desc: 'ALERT_STREAMS' },
    { id: 'SECURITY', label: 'Guard', icon: Shield, desc: 'ENCRYPTION_CORE' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'GENERAL':
        return (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { label: 'INSTITUTION_NAME', value: 'GOLDEN FISHERIES RESTAURANT', type: 'text' },
                { label: 'MASTER_REGISTRY_ID', value: 'GF-MKE-5501', type: 'text', disabled: true },
                { label: 'PRIMARY_CONTACT', value: '+91 98765 43210', type: 'text' },
                { label: 'PHYSICAL_COORDINATES', value: 'Bay View Road, Sector 4, Mangaluru', type: 'text' }
              ].map((field, i) => (
                <div key={i} className="bg-white border border-slate-200 p-3 space-y-1">
                  <label className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                  <input 
                    type={field.type} 
                    defaultValue={field.value}
                    disabled={field.disabled}
                    className="w-full bg-transparent border-none p-0 text-[10px] font-black uppercase tracking-tight focus:ring-0 disabled:opacity-30"
                  />
                </div>
              ))}
            </div>

            <div className="bg-white border border-slate-200 p-4">
              <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-4">Operational Duty Windows</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 p-3 border border-slate-200">
                   <p className="text-[7px] font-black text-accent-olive uppercase mb-1">STATION_OPEN</p>
                   <p className="text-lg font-serif italic font-black text-slate-900 leading-none">10:00 AM</p>
                </div>
                <div className="flex-1 bg-slate-50 p-3 border border-slate-200">
                   <p className="text-[7px] font-black text-accent-olive uppercase mb-1">STATION_CLOSE</p>
                   <p className="text-lg font-serif italic font-black text-slate-900 leading-none">11:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'STAFF':
        return (
          <div className="bg-white border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
                    <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-center">Clearance</th>
                    <th className="px-4 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Duty_State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Suresh Kumar', role: 'BILLING', status: 'STATIONED' },
                    { name: 'Anil Verma', role: 'KITCHEN', status: 'ON_SHIFT' },
                    { name: 'Meena Raj', role: 'ADMIN', status: 'IDLE' }
                  ].map((staff, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                         <p className="text-[10px] font-black text-slate-900 uppercase">{staff.name}</p>
                         <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-1">ID: REG-00{i+1}</p>
                      </td>
                      <td className="px-4 py-3 text-center">
                         <Badge className="bg-slate-100 text-slate-500 border-none text-[7px] font-black uppercase px-2">{staff.role}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                         <span className={`text-[8px] font-black uppercase tracking-widest ${staff.status === 'IDLE' ? 'text-slate-300' : 'text-accent-olive'}`}>{staff.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 border-dashed opacity-30 grayscale">
             <Sliders size={32} className="mb-4 text-slate-400" />
             <p className="text-[9px] font-black uppercase tracking-[0.3em]">Module_Inactive</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 md:p-8 font-sans selection:bg-accent-olive selection:text-white">
      {/* Tactical Settings Header */}
      <header className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <button 
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-slate-900 tracking-tight uppercase leading-none">
                Registry <span className="text-accent-olive">Control.</span>
              </h1>
              <Badge className="bg-slate-100 text-slate-400 border-none text-[8px] font-black uppercase">NODE: GF-POS-01</Badge>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">CENTRAL OPERATIONAL ARCHITECTURE • CONFIGURATION HUB</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
           <Button className="h-10 px-6 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] border-none shadow-xl active:scale-95 transition-all">
             <Save size={14} className="mr-2" /> COMMIT_ALL
           </Button>
        </div>
        
        {/* Abstract design element */}
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-slate-50 skew-x-12 translate-x-16" />
      </header>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-4 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-4 transition-all group border-l-4 ${
                activeTab === tab.id 
                  ? 'bg-white text-slate-900 border-accent-olive shadow-md scale-[1.02] z-10' 
                  : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-4">
                <tab.icon size={18} className={activeTab === tab.id ? "text-accent-olive" : "opacity-30 group-hover:opacity-100 transition-opacity"} />
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">{tab.label}</p>
                  <p className="text-[7px] font-bold uppercase tracking-tight mt-1 opacity-50">{tab.desc}</p>
                </div>
              </div>
              <ChevronRight size={14} className={activeTab === tab.id ? "text-accent-olive" : "opacity-0 group-hover:opacity-50"} />
            </button>
          ))}
          
          <div className="pt-10">
             <button 
              onClick={() => navigate('/login')}
              className="w-full flex items-center gap-4 p-4 text-red-500 hover:bg-red-50 transition-all group"
             >
                <LogOut size={18} className="opacity-50 group-hover:opacity-100" />
                <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8">
           <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-accent-olive animate-pulse" />
                 <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{activeTab}_SUBSYSTEM_ACTIVE</p>
              </div>
              <p className="text-[7px] font-bold text-slate-300 uppercase tracking-widest">GF_PROTOCOL_v4.2.0</p>
           </div>
           
           <div className="min-h-[400px]">
              {renderContent()}
           </div>
           
           {/* Terminal Footer Info */}
           <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-6">
              {[
                { label: 'System Uptime', value: '142h 12m' },
                { label: 'Database Sync', value: '0.4ms Latency' },
                { label: 'Secure Socket', value: 'AES-256 Bit' }
              ].map((stat, i) => (
                <div key={i}>
                   <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest mb-1">{stat.label}</p>
                   <p className="text-[9px] font-black text-slate-900 uppercase">{stat.value}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;

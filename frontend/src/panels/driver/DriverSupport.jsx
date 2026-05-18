import React from 'react';
import { 
  Phone, 
  MessageSquare, 
  AlertTriangle, 
  ChevronRight, 
  Clock, 
  Shield, 
  HelpCircle,
  Truck,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DriverSupport = () => {
  const navigate = useNavigate();
  const support = {
    emergencyContact: '9876543210',
    dispatchOffice: '080-1234567',
    faqs: [
      { q: 'How do I log fuel expenses?', a: 'Go to the Active Trip console and tap "Add Expense". Take a photo of the receipt and submit.' },
      { q: 'What if the buyer refuses delivery?', a: 'Do not leave the site. Call the Dispatch Office immediately using the Emergency Line.' },
      { q: 'How are payouts calculated?', a: 'Payouts are processed weekly based on verified trip distance and approved expenses.' }
    ]
  };

  const helpChannels = [
    { 
      icon: Phone, 
      label: 'Emergency Line', 
      desc: 'Accidents or breakdowns', 
      action: () => window.open(`tel:${support.emergencyContact}`),
      color: 'bg-red-500',
      tag: '24/7 LIVE'
    },
    { 
      icon: MessageSquare, 
      label: 'Dispatch Office', 
      desc: 'Mission & route queries', 
      action: () => window.open(`tel:${support.dispatchOffice}`),
      color: 'bg-emerald-500',
      tag: 'ACTIVE'
    },
  ];

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm active:scale-95 transition-all">
          <ChevronLeft size={18} className="text-slate-600" />
        </button>
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Support Command</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic text-center">Protocol & Assistance</p>
        </div>
        <div className="w-10" />
      </div>

      {/* SOS Module */}
      <div className="bg-black rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Shield size={100} className="text-white" />
        </div>
        <div className="relative z-10 space-y-4">
          <div>
            <p className="text-[8px] font-black text-red-500 uppercase tracking-[0.4em] mb-1">Critical Intervention</p>
            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">EMERGENCY_SOS</h3>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed max-w-[200px]">
            Immediate response for vehicle failure, safety threats, or medical emergencies.
          </p>
          <button 
            onClick={() => window.open(`tel:${support.emergencyContact}`)}
            className="w-full py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <AlertTriangle size={16} className="animate-pulse" />
            Trigger Alarm
          </button>
        </div>
      </div>

      {/* Assistance Channels */}
      <div className="space-y-3">
        <h3 className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em] ml-1">Direct Channels</h3>
        <div className="grid grid-cols-1 gap-2">
          {helpChannels.map((channel, idx) => (
            <div 
              key={idx}
              onClick={channel.action}
              className="glass-card p-4 rounded-[1.5rem] flex items-center justify-between border-none shadow-soft active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 ${channel.color} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                  <channel.icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-black text-black uppercase tracking-tight">{channel.label}</span>
                    <span className="text-[6px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">{channel.tag}</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{channel.desc}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Operational FAQs</h3>
          <HelpCircle size={12} className="text-gray-300" />
        </div>
        <div className="space-y-2">
          {support.faqs.map((faq, idx) => (
            <div key={idx} className="glass-card p-4 rounded-[1.5rem] border-none shadow-extra-soft space-y-2">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0" />
                <p className="text-[10px] font-black text-black uppercase tracking-tight leading-tight">{faq.q}</p>
              </div>
              <p className="text-[9px] font-bold text-gray-400 leading-relaxed pl-4">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* System Identity */}
      <div className="flex flex-col items-center gap-2 pt-4 opacity-10 italic">
        <img src="/logo.PNG" className="w-5 h-5 object-contain grayscale" alt="" />
        <p className="text-[8px] font-medium text-gray-400 uppercase tracking-[0.2em]">
          PROTOCOL_COMMAND v2.4 // SECURE_LINE
        </p>
      </div>
    </div>
  );
};

export default DriverSupport;

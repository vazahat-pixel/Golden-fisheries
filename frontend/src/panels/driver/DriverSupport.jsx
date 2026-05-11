import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Phone, 
  MessageSquare, 
  LifeBuoy, 
  AlertTriangle, 
  ChevronRight,
  HelpCircle,
  FileQuestion,
  Send,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverSupport = () => {
  const navigate = useNavigate();
  const [issue, setIssue] = useState('');

  const handleSupportAction = (channel) => {
    toast.success(`Connecting to ${channel}...`);
  };

  const handleSubmitIssue = (e) => {
    e.preventDefault();
    if (!issue) return toast.error('Please describe the issue');
    toast.success('Incident report submitted to dispatch');
    setIssue('');
  };

  const faqs = [
    { q: 'Trip not starting?', a: 'Ensure GPS is enabled and you have accepted the task.' },
    { q: 'Payment discrepancy?', a: 'Contact the accounts department at head office.' },
    { q: 'Vehicle breakdown?', a: 'Use the SOS button for immediate assistance.' },
  ];

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans selection:bg-red-500 selection:text-white">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-xl shadow-soft active:scale-95 transition-all">
            <ChevronLeft size={18} />
          </button>
          <div>
            <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Support Command</h2>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Operational Assistance</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-soft border border-black/5">
          <LifeBuoy size={18} className="text-black" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <button 
          onClick={() => handleSupportAction('Emergency SOS')}
          className="bg-black text-white p-5 rounded-[1.8rem] shadow-2xl flex items-center justify-between group active:scale-95 transition-all overflow-hidden relative border-2 border-red-600/20"
        >
          <div className="absolute right-0 top-0 p-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform">
            <Zap size={60} className="text-red-500 fill-red-500" />
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/40">
              <AlertTriangle size={18} className="animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-md font-black uppercase tracking-tight italic">Emergency SOS</p>
              <p className="text-[7px] font-black text-red-500 uppercase tracking-[0.3em] bg-red-500/10 px-1.5 py-0.5 rounded-lg mt-1 w-fit">Immediate Response</p>
            </div>
          </div>
          <ChevronRight size={18} className="relative z-10 text-white/40" />
        </button>

        <div className="grid grid-cols-2 gap-3">
           <button 
             onClick={() => handleSupportAction('Dispatch Call')}
             className="glass-card p-4 rounded-[1.5rem] flex flex-col items-center gap-2.5 border-none shadow-soft active:scale-[0.98] transition-all"
           >
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                 <Phone size={16} />
              </div>
              <p className="text-[8px] font-black text-black uppercase tracking-widest">Call Dispatch</p>
           </button>
           <button 
             onClick={() => handleSupportAction('WhatsApp')}
             className="glass-card p-4 rounded-[1.5rem] flex flex-col items-center gap-2.5 border-none shadow-soft active:scale-[0.98] transition-all"
           >
              <div className="w-8 h-8 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                 <MessageSquare size={16} />
              </div>
              <p className="text-[8px] font-black text-black uppercase tracking-widest">WhatsApp</p>
           </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em]">Incident Report</h3>
          <span className="text-[7px] font-bold text-gray-300 uppercase tracking-[0.2em]">Priority High</span>
        </div>
        <div className="glass-card p-4 rounded-[1.8rem] border-none shadow-soft space-y-3">
           <textarea 
             value={issue}
             onChange={(e) => setIssue(e.target.value)}
             className="w-full bg-slate-50/50 rounded-2xl p-4 text-[9px] font-black text-black outline-none h-24 resize-none border border-black/5 placeholder:text-gray-300 uppercase tracking-tight"
             placeholder="Describe the problem (Breakdown, Delay, etc)..."
           />
           <button 
             onClick={handleSubmitIssue}
             className="w-full py-4 bg-black text-white rounded-xl font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
           >
              <Send size={14} /> Submit Incident
           </button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">Operational FAQ</h3>
        <div className="space-y-2">
           {faqs.map((faq, i) => (
             <div key={i} className="glass-card p-3.5 rounded-2xl border-none shadow-extra-soft space-y-1 relative overflow-hidden group hover:bg-slate-50 transition-all">
                <div className="absolute right-0 top-0 p-3 opacity-0 group-hover:opacity-5 transition-opacity">
                  <HelpCircle size={30} />
                </div>
                <p className="text-[9px] font-black text-black uppercase tracking-tight flex items-center gap-2">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div> {faq.q}
                </p>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed ml-3 italic">
                  {faq.a}
                </p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default DriverSupport;

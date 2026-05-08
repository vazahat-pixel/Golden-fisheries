import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { 
  IndianRupee, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const DriverExpenses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips } = useAdminStore();

  // Aggregate all expenses from all trips for this driver
  const allExpenses = trips
    .filter(t => t.driverName === (user?.name || 'JAGRATI DOD'))
    .flatMap(t => (t.expenses || []).map(e => ({ ...e, tripId: t.id, date: t.completedAt || t.createdAt })));

  const totalAmount = allExpenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);

  return (
    <div className="bg-white min-h-screen pb-24 selection:bg-black selection:text-white animate-in fade-in duration-500">
      {/* Sharp Registry Header */}
      <div className="bg-black text-white p-8">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white/10 hover:bg-white hover:text-black transition-all flex items-center justify-center border border-white/10 active:scale-95">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-2xl font-serif italic font-black text-white tracking-tight uppercase leading-none">
              Expense <span className="text-[#6B7550]">Ledger.</span>
            </h2>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mt-2">Financial Reimbursable Pipeline</p>
          </div>
        </div>
      </div>

      {/* Summary Matrix Card */}
      <div className="p-6 -mt-10">
        <div className="bg-black text-white p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
             <IndianRupee size={120} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div className="space-y-4">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-[#6B7550]">Total Aggregate Claims</p>
              <h3 className="text-6xl font-black tracking-tighter leading-none italic">₹{totalAmount.toLocaleString()}</h3>
            </div>
            
            <div className="flex gap-8 border-l-2 border-[#6B7550] pl-8">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Registry Items</p>
                <p className="text-xl font-black">{allExpenses.length}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.2em]">Validated</p>
                <p className="text-xl font-black text-[#6B7550]">{allExpenses.filter(e => e.status === 'Approved').length}</p>
              </div>
            </div>
          </div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#6B7550]" />
        </div>
      </div>

      {/* Ledger Stream */}
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-black pb-2">
          <h4 className="text-[10px] font-black text-black uppercase tracking-[0.3em]">Operational Manifest Stream</h4>
          <Receipt size={12} className="text-[#6B7550]" />
        </div>
        
        <div className="space-y-4">
          {allExpenses.length > 0 ? (
            allExpenses.map((exp, idx) => (
              <Card key={idx} padding="none" className="bg-white border border-black/5 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center group hover:border-black transition-all">
                <div className="p-6 flex items-center gap-6 w-full sm:w-auto">
                  <div className="w-14 h-14 bg-black text-white flex items-center justify-center shrink-0 shadow-lg group-hover:bg-[#6B7550] transition-colors">
                    <Receipt size={24} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-black text-black uppercase tracking-tight">{exp.type}</span>
                      <div className="w-1 h-1 bg-black/10 rounded-full" />
                      <span className="text-[9px] font-black text-[#6B7550] uppercase tracking-widest">{exp.tripId}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{exp.date}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50/50 sm:bg-transparent border-t sm:border-t-0 border-black/5 w-full sm:w-auto text-right flex sm:flex-col justify-between items-center sm:items-end gap-2">
                  <p className="text-xl font-black text-black leading-none italic group-hover:scale-110 transition-transform">₹{exp.amount}</p>
                  <div className="flex items-center gap-2">
                     {exp.status === 'Approved' ? (
                       <CheckCircle2 size={14} className="text-[#6B7550]" />
                     ) : (
                       <Clock size={14} className="text-black animate-pulse" />
                     )}
                     <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${exp.status === 'Approved' ? 'text-[#6B7550]' : 'text-black'}`}>{exp.status || 'Pending'}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-32 opacity-10 space-y-8">
               <Receipt size={80} className="mx-auto" />
               <p className="text-[12px] font-black uppercase tracking-[0.5em]">Ledger Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverExpenses;

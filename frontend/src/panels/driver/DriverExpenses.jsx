import React, { useState } from 'react';
import {
  IndianRupee,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Fuel,
  MapPin,
  Coffee,
  Wrench,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const STATUS_CONFIG = {
  Pending:  { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-50',   border: 'border-amber-100',  label: 'Pending Review' },
  Approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Approved' },
  Rejected: { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-50',     border: 'border-red-100',    label: 'Rejected' },
};

const TYPE_CONFIG = {
  FUEL:        { icon: Fuel,          color: 'bg-blue-500',    label: 'Fuel' },
  TOLL:        { icon: MapPin,        color: 'bg-emerald-500', label: 'Toll' },
  FOOD:        { icon: Coffee,        color: 'bg-amber-500',   label: 'Food' },
  MAINTENANCE: { icon: Wrench,        color: 'bg-red-500',     label: 'Maintenance' },
  MISC:        { icon: Receipt,       color: 'bg-slate-500',   label: 'Misc' },
};

const DriverExpenses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { expenses } = useAdminStore();

  const [activeTab, setActiveTab] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const myName = user?.name || 'RAJESH KUMAR';

  const myExpenses = expenses
    .filter(e => e.driverName === myName)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const filteredExpenses = activeTab === 'All'
    ? myExpenses
    : myExpenses.filter(e => e.status === activeTab);

  const totalAmount   = myExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const approvedAmt   = myExpenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount), 0);
  const pendingAmt    = myExpenses.filter(e => e.status === 'Pending').reduce((s, e) => s + Number(e.amount), 0);
  const pendingCount  = myExpenses.filter(e => e.status === 'Pending').length;

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">My Claims</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Expense Ledger</p>
        </div>
        <button
          onClick={() => navigate('/driver/expenses/new')}
          className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-center space-y-1">
          <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Total</p>
          <p className="text-base font-black text-black italic leading-none">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 text-center space-y-1">
          <p className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">Approved</p>
          <p className="text-base font-black text-emerald-700 italic leading-none">₹{approvedAmt.toLocaleString()}</p>
        </div>
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 text-center space-y-1">
          <p className="text-[7px] font-black text-amber-400 uppercase tracking-widest">Pending</p>
          <p className="text-base font-black text-amber-700 italic leading-none">₹{pendingAmt.toLocaleString()}</p>
        </div>
      </div>

      {/* Pending nudge */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <Clock size={13} className="text-white" />
          </div>
          <p className="text-[9px] font-bold text-amber-800">
            <span className="font-black">{pendingCount} claim{pendingCount > 1 ? 's' : ''}</span> awaiting admin approval
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 ${
              activeTab === tab ? 'bg-black text-white shadow-md' : 'bg-white text-gray-400 border border-black/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Expense List */}
      <div className="space-y-3">
        <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Claim Manifest</h4>
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => {
            const typeCfg = TYPE_CONFIG[exp.type] || TYPE_CONFIG.MISC;
            const statusCfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.Pending;
            const isExpanded = expandedId === exp.id;
            const StatusIcon = statusCfg.icon;
            const TypeIcon = typeCfg.icon;

            return (
              <div key={exp.id} className={`bg-white rounded-2xl border ${exp.status === 'Rejected' ? 'border-red-100' : 'border-slate-100'} shadow-sm overflow-hidden transition-all`}>
                {/* Main Row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : exp.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${typeCfg.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                      <TypeIcon size={16} className="text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-[10px] font-black text-black uppercase tracking-tight">{typeCfg.label}</h3>
                        {exp.tripId && (
                          <>
                            <div className="w-0.5 h-0.5 bg-gray-300 rounded-full" />
                            <span className="text-[8px] font-bold text-gray-400 uppercase">{exp.tripId}</span>
                          </>
                        )}
                      </div>
                      <p className="text-[8px] text-gray-400 font-medium">{exp.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-black text-black italic">₹{Number(exp.amount).toLocaleString()}</p>
                      <div className={`flex items-center justify-end gap-1 mt-0.5 ${statusCfg.color}`}>
                        <StatusIcon size={9} />
                        <span className={`text-[7px] font-black uppercase tracking-widest`}>{statusCfg.label}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-300 shrink-0" /> : <ChevronDown size={14} className="text-slate-300 shrink-0" />}
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && (
                  <div className={`px-4 pb-4 pt-0 space-y-3 border-t ${exp.status === 'Rejected' ? 'border-red-50 bg-red-50/30' : 'border-slate-50 bg-slate-50/50'}`}>
                    {exp.description && (
                      <div className="pt-3">
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                        <p className="text-[10px] font-medium text-slate-700">{exp.description}</p>
                      </div>
                    )}

                    {exp.receiptPhoto && (
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt</p>
                        <img src={exp.receiptPhoto} className="w-full max-h-32 object-cover rounded-xl" alt="Receipt" />
                      </div>
                    )}

                    {exp.status === 'Rejected' && exp.rejectionReason && (
                      <div className="bg-red-100 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-0.5">Rejection Reason</p>
                          <p className="text-[10px] font-medium text-red-700">{exp.rejectionReason}</p>
                          {exp.reviewedBy && <p className="text-[8px] text-red-400 mt-1">by {exp.reviewedBy}</p>}
                        </div>
                      </div>
                    )}

                    {exp.status === 'Approved' && (
                      <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <div>
                          <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Posted to Accounts</p>
                          {exp.reviewedBy && <p className="text-[8px] text-emerald-500">Approved by {exp.reviewedBy}</p>}
                        </div>
                      </div>
                    )}

                    {exp.status === 'Pending' && (
                      <div className="bg-amber-50 rounded-xl p-3 flex items-center gap-2">
                        <Clock size={13} className="text-amber-500" />
                        <p className="text-[9px] font-bold text-amber-700">Waiting for admin review</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center opacity-20 space-y-3">
            <Receipt size={40} className="mx-auto" />
            <p className="text-[10px] font-bold uppercase tracking-widest">No Claims Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverExpenses;

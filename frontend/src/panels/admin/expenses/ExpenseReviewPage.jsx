import React, { useState } from 'react';
import {
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  IndianRupee,
  Fuel,
  MapPin,
  Coffee,
  Wrench,
  User,
  Truck,
  Calendar,
  Eye,
  X,
  Check,
  AlertCircle,
  ChevronRight,
  Filter
} from 'lucide-react';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { toast } from 'react-hot-toast';

const TYPE_CONFIG = {
  FUEL:        { icon: Fuel,    color: 'bg-blue-500',    label: 'Fuel' },
  TOLL:        { icon: MapPin,  color: 'bg-emerald-500', label: 'Toll' },
  FOOD:        { icon: Coffee,  color: 'bg-amber-500',   label: 'Food' },
  MAINTENANCE: { icon: Wrench,  color: 'bg-red-500',     label: 'Maintenance' },
  MISC:        { icon: Receipt, color: 'bg-slate-500',   label: 'Misc' },
};

const STATUS_CONFIG = {
  Pending:  { color: 'text-amber-600',  bg: 'bg-amber-50',   border: 'border-amber-200',  dot: 'bg-amber-400' },
  Approved: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-400' },
  Rejected: { color: 'text-red-600',    bg: 'bg-red-50',     border: 'border-red-200',    dot: 'bg-red-400' },
};

export default function ExpenseReviewPage() {
  const { expenses, approveExpense, rejectExpense } = useAdminStore();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState('Pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [detailId, setDetailId] = useState(null);

  const reviewerName = user?.name || 'ADMIN';

  const allExpenses = [...expenses].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const pendingCount  = allExpenses.filter(e => e.status === 'Pending').length;
  const approvedTotal = allExpenses.filter(e => e.status === 'Approved').reduce((s, e) => s + Number(e.amount), 0);
  const rejectedCount = allExpenses.filter(e => e.status === 'Rejected').length;

  const filtered = activeTab === 'All'
    ? allExpenses
    : allExpenses.filter(e => e.status === activeTab);

  const handleApprove = (id) => {
    approveExpense(id, reviewerName);
    toast.success('Expense approved & posted to accounts');
    setDetailId(null);
  };

  const handleReject = (id) => {
    if (!rejectReason.trim()) return toast.error('Enter a rejection reason');
    rejectExpense(id, rejectReason.trim(), reviewerName);
    toast.error('Expense rejected');
    setRejectingId(null);
    setRejectReason('');
    setDetailId(null);
  };

  const detailExpense = detailId ? allExpenses.find(e => e.id === detailId) : null;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Expense Review</h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Driver Claim Approval Center</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-1">
          <p className="text-[8px] font-black text-amber-400 uppercase tracking-widest">Pending Review</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-amber-700 italic leading-none">{pendingCount}</p>
            <div className="w-8 h-8 bg-amber-400 rounded-xl flex items-center justify-center">
              <Clock size={14} className="text-white" />
            </div>
          </div>
          <p className="text-[8px] text-amber-400">claims awaiting action</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-1">
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Approved (₹)</p>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-black text-emerald-700 italic leading-none">₹{approvedTotal.toLocaleString()}</p>
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center">
              <CheckCircle2 size={14} className="text-white" />
            </div>
          </div>
          <p className="text-[8px] text-emerald-400">posted to accounts</p>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 space-y-1">
          <p className="text-[8px] font-black text-red-400 uppercase tracking-widest">Rejected</p>
          <div className="flex items-end justify-between">
            <p className="text-3xl font-black text-red-600 italic leading-none">{rejectedCount}</p>
            <div className="w-8 h-8 bg-red-400 rounded-xl flex items-center justify-center">
              <XCircle size={14} className="text-white" />
            </div>
          </div>
          <p className="text-[8px] text-red-300">declined claims</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 items-center">
        <Filter size={12} className="text-slate-400" />
        {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab ? 'bg-black text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-slate-400'
            }`}
          >
            {tab}
            {tab === 'Pending' && pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-400 rounded-full text-[7px] font-black text-white flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Expense Table / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-slate-300 space-y-3">
            <Receipt size={48} className="mx-auto" />
            <p className="text-xs font-black uppercase tracking-widest">No claims in this category</p>
          </div>
        ) : (
          filtered.map(exp => {
            const typeCfg = TYPE_CONFIG[exp.type] || TYPE_CONFIG.MISC;
            const statusCfg = STATUS_CONFIG[exp.status] || STATUS_CONFIG.Pending;
            const TypeIcon = typeCfg.icon;

            return (
              <div
                key={exp.id}
                className={`bg-white rounded-2xl border ${exp.status === 'Rejected' ? 'border-red-100' : exp.status === 'Approved' ? 'border-emerald-100' : 'border-slate-100'} shadow-sm overflow-hidden hover:shadow-md transition-all group`}
              >
                {/* Main Row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Type Icon */}
                  <div className={`w-11 h-11 ${typeCfg.color} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
                    <TypeIcon size={18} className="text-white" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{typeCfg.label}</span>
                      <span className="text-[8px] font-bold text-slate-300 bg-slate-50 px-2 py-0.5 rounded-full">{exp.id}</span>
                      {exp.tripId && (
                        <span className="text-[8px] font-bold text-blue-400 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Truck size={8} /> {exp.tripId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-slate-400">
                        <User size={9} />
                        <span className="text-[9px] font-bold">{exp.driverName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar size={9} />
                        <span className="text-[9px] font-medium">{exp.date}</span>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-[9px] text-slate-400 mt-1 truncate max-w-xs">{exp.description}</p>
                    )}
                  </div>

                  {/* Amount + Status */}
                  <div className="text-right shrink-0 space-y-1">
                    <p className="text-lg font-black text-slate-900 italic">₹{Number(exp.amount).toLocaleString()}</p>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${statusCfg.bg} border ${statusCfg.border}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot} ${exp.status === 'Pending' ? 'animate-pulse' : ''}`} />
                      <span className={`text-[7px] font-black uppercase tracking-widest ${statusCfg.color}`}>{exp.status}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {exp.receiptPhoto && (
                      <button
                        onClick={() => setLightboxSrc(exp.receiptPhoto)}
                        className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                        title="View receipt"
                      >
                        <Eye size={14} className="text-slate-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setDetailId(detailId === exp.id ? null : exp.id)}
                      className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition-all group/btn"
                    >
                      <ChevronRight size={14} className="text-slate-400 group-hover/btn:text-white transition-colors" />
                    </button>
                  </div>
                </div>

                {/* Inline Approve / Reject for Pending */}
                {exp.status === 'Pending' && (
                  <div className="px-4 pb-4 flex gap-2">
                    {rejectingId === exp.id ? (
                      <div className="flex-1 flex gap-2 items-center animate-in slide-in-from-left-4 duration-200">
                        <input
                          type="text"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          placeholder="Reason for rejection..."
                          autoFocus
                          className="flex-1 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-[10px] text-slate-700 outline-none placeholder:text-red-200 focus:border-red-400 transition-colors"
                          onKeyDown={e => e.key === 'Enter' && handleReject(exp.id)}
                        />
                        <button
                          onClick={() => handleReject(exp.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wide hover:bg-red-600 active:scale-95 transition-all"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectReason(''); }}
                          className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
                        >
                          <X size={14} className="text-slate-500" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => handleApprove(exp.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wide hover:bg-emerald-600 active:scale-[0.98] transition-all shadow-sm shadow-emerald-500/20"
                        >
                          <Check size={13} />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectingId(exp.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl text-[9px] font-black uppercase tracking-wide hover:bg-red-100 active:scale-[0.98] transition-all"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Detail Drawer */}
                {detailId === exp.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Submitted</p>
                        <p className="text-[9px] font-bold text-slate-700">{new Date(exp.submittedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {exp.reviewedAt && (
                        <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Reviewed</p>
                          <p className="text-[9px] font-bold text-slate-700">{exp.reviewedBy} · {new Date(exp.reviewedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      )}
                    </div>
                    {exp.description && (
                      <div>
                        <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Full Description</p>
                        <p className="text-[10px] text-slate-700">{exp.description}</p>
                      </div>
                    )}
                    {exp.status === 'Rejected' && exp.rejectionReason && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2">
                        <AlertCircle size={12} className="text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-[7px] font-black text-red-500 uppercase tracking-widest">Rejection Reason</p>
                          <p className="text-[10px] text-red-700 mt-0.5">{exp.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                    {exp.status === 'Approved' && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2">
                        <IndianRupee size={12} className="text-emerald-500" />
                        <p className="text-[9px] font-bold text-emerald-700">₹{Number(exp.amount).toLocaleString()} posted to Accounts</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Lightbox */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200"
          onClick={() => setLightboxSrc(null)}
        >
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <img src={lightboxSrc} className="w-full rounded-2xl shadow-2xl" alt="Receipt" />
            <button
              onClick={() => setLightboxSrc(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              <X size={16} className="text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

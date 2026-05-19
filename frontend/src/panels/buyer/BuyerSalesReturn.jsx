import React, { useState } from 'react';
import { RotateCcw, Plus, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const BuyerSalesReturn = () => {
  const { user } = useAuthStore();
  const { trips } = useAdminStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tapalId: '', reason: '', qty: '', remarks: '' });
  const [returns, setReturns] = useState([]);

  const myTapals = trips.filter(t =>
    ['DELIVERED','COMPLETED'].includes(t.status) &&
    (t.buyerName === (user?.fullName || user?.name) || t.buyerPhone === user?.phone)
  );

  const handleSubmit = () => {
    if (!form.tapalId) return toast.error('Select a tapal');
    if (!form.reason) return toast.error('Select return reason');
    if (!form.qty) return toast.error('Enter return quantity');
    const newReturn = {
      id: `RET-${Date.now()}`,
      tapalId: form.tapalId,
      reason: form.reason,
      qty: form.qty,
      remarks: form.remarks,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-IN'),
    };
    setReturns(prev => [newReturn, ...prev]);
    setForm({ tapalId: '', reason: '', qty: '', remarks: '' });
    setShowForm(false);
    toast.success('Sales return request submitted for admin review.');
  };

  const reasons = ['Damaged Goods', 'Weight Shortage', 'Wrong Species', 'Quality Issue', 'Excess Delivery', 'Other'];

  const statusColor = (s) => s === 'Pending'
    ? 'bg-amber-50 text-amber-600 border-amber-100'
    : s === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
    : 'bg-rose-50 text-rose-600 border-rose-100';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
          <h1 className="text-2xl font-serif italic font-black text-slate-900">Sales Returns</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{returns.length} return requests</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md">
          <Plus size={14} /> New Return
        </button>
      </div>

      {/* New Return Form */}
      {showForm && (
        <div className="bg-white rounded-3xl border border-blue-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Raise Return Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Tapal</label>
              <select value={form.tapalId} onChange={e => setForm({ ...form, tapalId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none">
                <option value="">SELECT DELIVERED TAPAL</option>
                {myTapals.map(t => <option key={t.id} value={t.id}>{t.tripNumber || t.id} — {t.product}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Return Reason</label>
              <select value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none">
                <option value="">SELECT REASON</option>
                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Return Quantity (KG)</label>
              <input type="number" value={form.qty} onChange={e => setForm({ ...form, qty: e.target.value })}
                placeholder="e.g. 50"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks (optional)</label>
              <input type="text" value={form.remarks} onChange={e => setForm({ ...form, remarks: e.target.value })}
                placeholder="Additional details..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-900 outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowForm(false)}
              className="flex-1 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
              Cancel
            </button>
            <button onClick={handleSubmit}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 shadow-md">
              Submit Return Request
            </button>
          </div>
        </div>
      )}

      {/* Returns List */}
      {returns.length === 0 && !showForm ? (
        <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center">
          <RotateCcw size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No return requests yet</p>
          <p className="text-[9px] text-slate-300 mt-1">Click "New Return" to raise a return against a delivered tapal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[11px] font-black text-slate-900 uppercase">{r.id}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">Tapal: {r.tapalId} · Qty: {r.qty} KG</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Reason: {r.reason}</p>
                {r.remarks && <p className="text-[9px] text-slate-400 italic">{r.remarks}</p>}
              </div>
              <div className="text-right space-y-2">
                <span className={`inline-block text-[7px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${statusColor(r.status)}`}>{r.status}</span>
                <p className="text-[8px] text-slate-400 font-bold uppercase">{r.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerSalesReturn;

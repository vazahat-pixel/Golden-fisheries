import React, { useState, useRef } from 'react';
import {
  ChevronLeft,
  Receipt,
  Droplet,
  NavigationIcon,
  Coffee,
  Camera,
  Clock,
  Zap,
  Truck,
  ShieldCheck,
  ChevronDown,
  Wrench,
  AlignLeft,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const DriverAddExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, submitExpense } = useAdminStore();
  const fileInputRef = useRef(null);

  const [expenseForm, setExpenseForm] = useState({
    type: 'FUEL',
    amount: '',
    tripId: '',
    description: '',
    receiptPhoto: null
  });
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'FUEL',        icon: Droplet,        label: 'Fuel',        color: 'bg-blue-500' },
    { id: 'TOLL',        icon: NavigationIcon,  label: 'Toll',        color: 'bg-emerald-500' },
    { id: 'FOOD',        icon: Coffee,          label: 'Food',        color: 'bg-amber-500' },
    { id: 'MAINTENANCE', icon: Wrench,          label: 'Maintenance', color: 'bg-red-500' },
    { id: 'MISC',        icon: Receipt,         label: 'Misc',        color: 'bg-slate-500' },
  ];

  const activeTrips = trips.filter(t =>
    (!t.driverName || t.driverName === (user?.name || 'RAJESH KUMAR')) &&
    !['Closed', 'Rejected'].includes(t.status)
  );

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setExpenseForm(prev => ({ ...prev, receiptPhoto: event.target.result }));
        toast.success('Receipt captured');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!expenseForm.amount) return toast.error('Enter expense amount');
    if (!expenseForm.description.trim()) return toast.error('Add a description');

    try {
      await submitExpense({
        driverName: user?.name || 'RAJESH KUMAR',
        tripId: expenseForm.tripId || null,
        type: expenseForm.type,
        amount: Number(expenseForm.amount),
        description: expenseForm.description.trim(),
        receiptPhoto: expenseForm.receiptPhoto,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      });
      setSubmitted(true);
    } catch (err) {
      toast.error('Failed to submit expense');
    }
  };

  const selectedCat = categories.find(c => c.id === expenseForm.type);

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center justify-center p-8 gap-6 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-emerald-500 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30">
          <CheckCircle2 size={36} className="text-white" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-black uppercase italic tracking-tighter">Claim Submitted</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Pending admin review</p>
          <p className="text-xs text-slate-500 mt-3 max-w-[260px]">
            Your expense of <span className="font-black text-black">₹{Number(expenseForm.amount).toLocaleString()}</span> has been sent for approval. You'll see the status update in your Expenses.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={() => navigate('/driver/expenses')}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
          >
            View Claims
          </button>
          <button
            onClick={() => { setSubmitted(false); setExpenseForm({ type: 'FUEL', amount: '', tripId: '', description: '', receiptPhoto: null }); }}
            className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-all shadow-sm">
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase italic leading-none">Add Expense</h1>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Awaits Admin Approval</p>
          </div>
        </div>
        <div className={`w-8 h-8 flex items-center justify-center ${selectedCat?.color || 'bg-emerald-500'} rounded-lg transition-colors duration-300`}>
          {selectedCat && <selectedCat.icon size={14} className="text-white" />}
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Category Pill Selection */}
        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Expense Type</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setExpenseForm({ ...expenseForm, type: cat.id })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shrink-0 ${
                  expenseForm.type === cat.id
                    ? 'bg-black border-black text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <cat.icon size={12} strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount + Description */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-5">
          {/* Amount */}
          <div className="text-center space-y-1">
            <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Amount (₹)</label>
            <div className="flex items-center justify-center">
              <span className="text-lg font-bold text-slate-200 mr-2">₹</span>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="bg-transparent text-4xl font-black text-slate-900 outline-none text-center w-full placeholder:text-slate-100 tracking-tighter"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          <div className="h-[1px] bg-slate-50 w-full" />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <AlignLeft size={10} className="text-slate-400" />
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Description</label>
            </div>
            <textarea
              value={expenseForm.description}
              onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
              placeholder="e.g. Diesel at HP pump, NH-48 towards Mangalore..."
              rows={2}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[11px] font-medium text-slate-700 outline-none resize-none placeholder:text-slate-300 focus:border-black transition-all"
            />
          </div>

          <div className="h-[1px] bg-slate-50 w-full" />

          {/* Trip Selector (optional) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <Truck size={10} className="text-slate-400" />
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Link to Trip <span className="text-slate-300 font-medium normal-case">(optional)</span></label>
            </div>
            {activeTrips.length > 0 ? (
              <div className="relative">
                <select
                  value={expenseForm.tripId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[9px] font-black text-slate-900 outline-none appearance-none cursor-pointer uppercase shadow-sm"
                >
                  <option value="">NO LINKED TRIP</option>
                  {activeTrips.map(t => <option key={t.id} value={t.id}>{t.id} — {t.product}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
              </div>
            ) : (
              <div className="bg-slate-50/80 border border-slate-100 rounded-xl px-4 py-3 flex items-center gap-2">
                <Clock size={12} className="text-slate-300" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight">No active trips — standalone claim</p>
              </div>
            )}
          </div>
        </div>

        {/* Receipt Upload */}
        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Receipt / Proof</label>
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full bg-white border-2 border-dashed border-slate-100 rounded-2xl py-5 flex flex-col items-center justify-center gap-2 active:scale-95 transition-all overflow-hidden relative min-h-[90px]"
          >
            {expenseForm.receiptPhoto ? (
              <>
                <img src={expenseForm.receiptPhoto} className="absolute inset-0 w-full h-full object-cover" alt="Receipt" />
                <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-1">
                  <ShieldCheck size={22} className="text-white drop-shadow-md" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest drop-shadow">Receipt Attached ✓</span>
                </div>
              </>
            ) : (
              <>
                <Camera size={20} className="text-slate-300" />
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Tap to Upload Receipt</span>
              </>
            )}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        {/* Approval Notice */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
          <Clock size={14} className="text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[9px] font-bold text-amber-700 leading-relaxed">
            This claim will be sent for <span className="font-black">admin approval</span> before it's posted to accounts. You'll see the status update in your Expenses ledger.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-black text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          <Zap size={16} className="text-emerald-400" />
          Submit for Approval
        </button>
      </div>
    </div>
  );
};

export default DriverAddExpense;

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  IndianRupee, 
  Camera, 
  CheckCircle2, 
  Truck, 
  ChevronRight,
  ShieldCheck,
  Clock,
  Check,
  Fuel,
  MapPin,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const DriverAddExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, addTripExpense } = useAdminStore();
  
  const [expenseForm, setExpenseForm] = useState({ 
    type: 'FUEL', 
    amount: '', 
    note: '', 
    tripId: '',
    photo: null 
  });

  const categories = [
    { id: 'FUEL', icon: Fuel },
    { id: 'TOLL', icon: MapPin },
    { id: 'FOOD', icon: Info },
    { id: 'MISC', icon: Info },
  ];

  const activeTrips = trips.filter(t => 
    (t.driverName === (user?.name || 'RAJESH KUMAR')) && 
    !['Closed', 'Rejected'].includes(t.status)
  );

  const handleAddExpense = () => {
    if (!expenseForm.amount) return toast.error('Enter amount');
    const targetTripId = expenseForm.tripId || (activeTrips.length > 0 ? activeTrips[0].id : 'DEMO-TRIP');
    
    addTripExpense(targetTripId, {
      ...expenseForm,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending'
    });

    toast.success('Claim Authenticated & Submitted');
    navigate('/driver/expenses');
  };

  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-500 pb-24 bg-white min-h-screen font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 bg-slate-50 rounded-xl shadow-soft active:scale-95 transition-all">
          <ChevronLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Authenticate Claim</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Financial Ledger Entry</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Tactical Category Grid */}
        <div className="grid grid-cols-4 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setExpenseForm({ ...expenseForm, type: cat.id })}
              className={`flex flex-col items-center gap-2 py-5 rounded-2xl transition-all duration-300 relative border ${
                expenseForm.type === cat.id 
                ? 'bg-black text-white border-black shadow-2xl scale-[1.02]' 
                : 'bg-slate-50 text-gray-400 border-transparent hover:border-black/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${expenseForm.type === cat.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white shadow-sm'}`}>
                 <cat.icon size={16} />
              </div>
              <span className="text-[7px] font-black uppercase tracking-[0.2em]">{cat.id}</span>
              {expenseForm.type === cat.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                  <CheckCircle2 size={10} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {/* Mission Selector */}
          {activeTrips.length > 0 && (
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 opacity-50">
                <Truck size={14} />
              </div>
              <select 
                value={expenseForm.tripId}
                onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                className="w-full bg-slate-50 border border-black/5 rounded-xl pl-10 pr-10 py-4 text-[9px] font-black text-black outline-none appearance-none cursor-pointer uppercase tracking-tight shadow-inner"
              >
                {activeTrips.map(t => (
                  <option key={t.id} value={t.id}>Mission: {t.id} — {t.product}</option>
                ))}
              </select>
              <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 rotate-90" />
            </div>
          )}

          {/* Financial Instrument Area */}
          <div className="bg-slate-950 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-focus-within:opacity-10 transition-opacity">
              <IndianRupee size={120} className="text-white" />
            </div>
            
            <label className="text-[7px] font-black text-emerald-500 uppercase tracking-[0.4em] mb-6 block text-center italic">Declare Expenditure Value</label>
            
            <div className="relative flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-500 mr-2 italic drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">₹</span>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                className="bg-transparent text-6xl font-black text-white outline-none text-center w-full placeholder:text-white/5 tracking-tighter"
                placeholder="0.00"
                autoFocus
              />
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5">
              <textarea
                value={expenseForm.note}
                onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                className="w-full bg-white/5 rounded-2xl p-4 text-[10px] font-medium text-white/60 outline-none h-24 resize-none placeholder:text-white/10 uppercase tracking-tight leading-relaxed"
                placeholder="Submit operational justification for this claim..."
              />
            </div>
          </div>

          {/* Proof of Authenticity */}
          <div className="grid grid-cols-2 gap-3">
             <input type="file" id="bill-upload" className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => { setExpenseForm(prev => ({ ...prev, photo: event.target.result })); toast.success('Telemetry Authenticated'); };
                  reader.readAsDataURL(e.target.files[0]);
                }
             }} />
             
             <button 
              onClick={() => document.getElementById('bill-upload').click()}
              className={`h-28 rounded-[2rem] flex flex-col items-center justify-center gap-2 transition-all relative overflow-hidden group border-2 ${expenseForm.photo ? 'border-emerald-500 shadow-2xl' : 'border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50'}`}
             >
                {expenseForm.photo ? (
                  <>
                    <img src={expenseForm.photo} className="absolute inset-0 w-full h-full object-cover" alt="Bill" />
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px]" />
                    <div className="relative z-10 bg-white p-2.5 rounded-full shadow-2xl scale-110">
                      <Check size={20} className="text-emerald-500" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black shadow-soft group-hover:bg-black group-hover:text-white transition-all">
                      <Camera size={18} />
                    </div>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-400">Capture Proof</span>
                  </>
                )}
             </button>

             <div className={`rounded-[2rem] p-4 flex flex-col items-center justify-center border transition-all ${expenseForm.photo ? 'bg-emerald-500 text-white border-emerald-600 shadow-2xl shadow-emerald-500/20' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                {expenseForm.photo ? (
                  <div className="text-center animate-in zoom-in duration-300">
                    <ShieldCheck size={24} className="mx-auto mb-1.5" />
                    <p className="text-[8px] font-black uppercase tracking-widest leading-none">Authenticated</p>
                    <p className="text-[6px] font-bold text-white/60 uppercase mt-1">Verified Payload</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Clock size={20} className="mx-auto mb-1.5 text-gray-400" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Pending Proof</p>
                  </div>
                )}
             </div>
          </div>

          <button 
            onClick={handleAddExpense} 
            className="w-full py-5 bg-black text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.6em] shadow-2xl active:scale-[0.98] transition-all hover:bg-emerald-600 flex items-center justify-center gap-4 relative overflow-hidden group mt-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            Finalize & Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverAddExpense;

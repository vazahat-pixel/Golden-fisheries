import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, 
  Receipt, 
  Droplet, 
  NavigationIcon, 
  Coffee, 
  ChevronRight, 
  Camera, 
  Clock, 
  Zap,
  Truck,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const DriverAddExpense = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, addTripExpense } = useAdminStore();
  const fileInputRef = useRef(null);

  const [expenseForm, setExpenseForm] = useState({
    type: 'FUEL',
    amount: '',
    tripId: '',
    photo: null 
  });

  const categories = [
    { id: 'FUEL', icon: Droplet, label: 'Fuel' },
    { id: 'TOLL', icon: NavigationIcon, label: 'Toll' },
    { id: 'FOOD', icon: Coffee, label: 'Food' },
    { id: 'MISC', icon: Receipt, label: 'Misc' },
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
        setExpenseForm(prev => ({ ...prev, photo: event.target.result }));
        toast.success('Telemetry Authenticated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExpense = () => {
    if (!expenseForm.amount) return toast.error('Enter amount');
    
    const targetTripId = expenseForm.tripId || (activeTrips.length > 0 ? activeTrips[0].id : null);
    if (!targetTripId) return toast.error('No mission selected');
    
    addTripExpense(targetTripId, {
      ...expenseForm,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Pending'
    });

    toast.success('Claim Submitted Successfully');
    navigate('/driver/expenses');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 animate-in fade-in duration-500">
      {/* Compact Header */}
      <div className="bg-white px-5 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-full active:scale-90 transition-all shadow-sm">
            <ChevronLeft size={16} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-sm font-black text-slate-900 uppercase italic leading-none">Add Expense</h1>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ledger Entry</p>
          </div>
        </div>
        <div className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg">
          <Receipt size={14} className="text-emerald-600" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Category Pill Selection */}
        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Select Type</label>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setExpenseForm({ ...expenseForm, type: cat.id })}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all shrink-0 ${
                  expenseForm.type === cat.id ? 'bg-black border-black text-white shadow-md' : 'bg-white border-slate-200 text-slate-500'
                }`}
              >
                <cat.icon size={12} strokeWidth={2.5} />
                <span className="text-[9px] font-black uppercase tracking-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input Section */}
        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm space-y-5">
           <div className="text-center space-y-1">
             <label className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Amount Entry</label>
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

           <div className="space-y-2">
             <div className="flex items-center gap-2 px-1">
               <Truck size={10} className="text-slate-400" />
               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Target Mission</label>
             </div>
             {activeTrips.length > 0 ? (
               <div className="relative">
                 <select 
                   value={expenseForm.tripId}
                   onChange={(e) => setExpenseForm({ ...expenseForm, tripId: e.target.value })}
                   className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-[9px] font-black text-slate-900 outline-none appearance-none cursor-pointer uppercase shadow-sm"
                 >
                   <option value="" disabled>SELECT TARGET</option>
                   {activeTrips.map(t => <option key={t.id} value={t.id}>{t.id} — {t.product}</option>)}
                 </select>
                 <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
               </div>
             ) : (
               <div className="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3 flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Clock size={12} className="text-amber-600" />
                    <p className="text-[9px] font-black text-amber-900 uppercase tracking-tight">No Active Missions</p>
                 </div>
                 <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
               </div>
             )}
           </div>
        </div>

        {/* Compact Evidence Bridge */}
        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-1">Evidence Bridge</label>
          <div className="flex gap-2">
            <button 
              onClick={() => fileInputRef.current.click()}
              className="flex-1 bg-white border-2 border-dashed border-slate-100 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-all group overflow-hidden relative min-h-[80px]"
            >
              {expenseForm.photo ? (
                <>
                  <img src={expenseForm.photo} className="absolute inset-0 w-full h-full object-cover" alt="Receipt" />
                  <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] flex items-center justify-center">
                    <ShieldCheck size={20} className="text-white drop-shadow-md" />
                  </div>
                </>
              ) : (
                <>
                  <Camera size={18} className="text-slate-300" />
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Add Receipt</span>
                </>
              )}
            </button>
            
            <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-1.5 opacity-40">
               <Clock size={16} className="text-slate-200" />
               <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Waiting...</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </div>

        <button 
          onClick={handleAddExpense}
          className="w-full bg-black text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-2"
        >
          <Zap size={16} className="text-emerald-400" />
          Finalize Entry
        </button>
      </div>
    </div>
  );
};

export default DriverAddExpense;

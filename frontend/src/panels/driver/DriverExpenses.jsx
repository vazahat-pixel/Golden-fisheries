import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { 
  IndianRupee, 
  Calendar, 
  Receipt, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Plus,
  Fuel,
  Info,
  MapPin,
  Camera,
  Trash2,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

const DriverExpenses = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('All');
  
  const categories = [
    { id: 'FUEL', icon: Fuel, color: 'bg-blue-500' },
    { id: 'TOLL', icon: MapPin, color: 'bg-emerald-500' },
    { id: 'FOOD', icon: Info, color: 'bg-amber-500' },
    { id: 'MISC', icon: Info, color: 'bg-slate-500' },
  ];

  // Extract all expenses from all trips of this driver
  const myExpenses = trips
    .filter(t => t.driverName === (user?.name || 'RAJESH KUMAR'))
    .flatMap(t => (t.expenses || []).map((e, idx) => ({ 
      ...e, 
      id: `${t.id}-${idx}`, 
      tripId: t.id, 
      date: e.date || t.date || 'Today',
      status: e.status || 'Pending'
    })))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredExpenses = activeTab === 'All' 
    ? myExpenses 
    : myExpenses.filter(e => e.type === activeTab.toUpperCase());

  const totalAmount = myExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const pendingAmount = myExpenses
    .filter(e => e.status === 'Pending')
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Ledger Center</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Financial Claims Portal</p>
        </div>
        <button 
          onClick={() => navigate('/driver/expenses/new')}
          className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft">
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Total Claimed</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
               <IndianRupee size={12} />
            </div>
            <p className="text-xl font-black text-black italic leading-none">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft">
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Pending Review</p>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-lg flex items-center justify-center text-white">
               <Clock size={12} />
            </div>
            <p className="text-xl font-black text-black italic leading-none">₹{pendingAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
        {['All', 'Fuel', 'Toll', 'Food', 'Misc'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all shrink-0 ${activeTab === tab ? 'bg-black text-white shadow-md' : 'bg-white text-gray-400 border border-black/5'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Claim Manifest</h4>
        {filteredExpenses.length > 0 ? (
          filteredExpenses.map((exp) => (
            <div key={exp.id} className="glass-card p-3 rounded-2xl flex items-center justify-between border-none shadow-extra-soft group active:scale-[0.98] transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-black border border-black/5 group-hover:rotate-3 transition-transform">
                  {categories.find(c => c.id === exp.type)?.icon ? React.createElement(categories.find(c => c.id === exp.type).icon, { size: 18 }) : <Receipt size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <h3 className="text-[10px] font-black text-black uppercase tracking-tight">{exp.type}</h3>
                    <div className="w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{exp.tripId}</span>
                  </div>
                  <p className="text-[8px] text-gray-400 font-medium italic">{exp.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-black italic">₹{exp.amount}</p>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  {exp.status === 'Approved' ? <CheckCircle2 size={10} className="text-emerald-500" /> : <Clock size={10} className="text-amber-500" />}
                  <span className={`text-[7px] font-black uppercase tracking-widest ${exp.status === 'Approved' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-12 text-center opacity-20 space-y-3">
             <Receipt size={40} className="mx-auto" />
             <p className="text-[10px] font-bold uppercase tracking-widest">No Claims Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverExpenses;

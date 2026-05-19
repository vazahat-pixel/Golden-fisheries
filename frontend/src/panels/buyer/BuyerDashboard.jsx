import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, FileText, RotateCcw, TrendingUp, IndianRupee, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips, expenses } = useAdminStore();

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const myTapals = trips.filter(t =>
    t.buyerName === (user?.fullName || user?.name) ||
    t.buyerPhone === user?.phone ||
    t.buyerId === (user?._id || user?.id)
  );

  const pending = myTapals.filter(t => !['DELIVERED','COMPLETED'].includes(t.status)).length;
  const delivered = myTapals.filter(t => ['DELIVERED','COMPLETED'].includes(t.status)).length;

  const cards = [
    { label: 'Incoming Tapals', value: pending, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600', bg: 'from-blue-500 to-blue-700' },
    { label: 'Completed Bills', value: delivered, icon: FileText, color: 'bg-emerald-50 text-emerald-600', bg: 'from-emerald-500 to-emerald-700' },
    { label: 'Total Shipments', value: myTapals.length, icon: TrendingUp, color: 'bg-slate-50 text-slate-600', bg: 'from-slate-500 to-slate-700' },
  ];

  const recent = [...myTapals].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Overview</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">
          Welcome, <span className="text-blue-600">{user?.fullName || user?.name || 'Buyer'}</span>
        </h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          M.K. Fisheries · Golden Fisheries Buyer Portal
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.color}`}>
              <c.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900 font-serif italic">{c.value}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tapals */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recent Incoming Tapals</h2>
          <button onClick={() => navigate('/buyer/tapals')}
            className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800">
            View All →
          </button>
        </div>
        {recent.length === 0 ? (
          <div className="py-12 text-center">
            <AlertCircle size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No tapals found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recent.map((t) => (
              <div key={t.id} onClick={() => navigate(`/buyer/bill/${t.id}`)}
                className="px-6 py-4 flex justify-between items-center hover:bg-blue-50/30 cursor-pointer transition-colors group">
                <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{t.tripNumber || t.id}</p>
                  <p className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">{t.product} · {t.expectedQty} KG</p>
                </div>
                <div className="text-right space-y-1">
                  <span className={`inline-block text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    ['DELIVERED','COMPLETED'].includes(t.status) ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>{t.status}</span>
                  <p className="text-[8px] text-slate-400 font-bold uppercase">{t.createdAt?.slice(0, 10)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyerDashboard;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, FileText, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const BuyerIncomingTapals = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const myTapals = trips.filter(t =>
    t.buyerName === (user?.fullName || user?.name) ||
    t.buyerPhone === user?.phone ||
    t.buyerId === (user?._id || user?.id)
  ).filter(t =>
    !search || t.tripNumber?.toLowerCase().includes(search.toLowerCase()) ||
    t.product?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (s) => {
    if (['DELIVERED','COMPLETED'].includes(s)) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (['STARTED','PICKED','IN_TRANSIT'].includes(s)) return 'bg-blue-50 text-blue-600 border-blue-100 animate-pulse';
    return 'bg-amber-50 text-amber-600 border-amber-100';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
          <h1 className="text-2xl font-serif italic font-black text-slate-900">Incoming Tapals</h1>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{myTapals.length} shipments found</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tapal / product..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 outline-none focus:border-blue-400 transition-all"
          />
        </div>
      </div>

      <div className="space-y-3">
        {myTapals.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center">
            <ShoppingCart size={36} className="mx-auto text-slate-200 mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No incoming tapals</p>
          </div>
        ) : myTapals.map((t) => (
          <div key={t.id} onClick={() => navigate(`/buyer/bill/${t.id}`)}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-blue-400" />
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{t.tripNumber || t.id}</p>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">
                  Product: <span className="text-slate-900">{t.product}</span> ·
                  Qty: <span className="text-slate-900">{t.expectedQty} KG</span>
                </p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">
                  Driver: {t.driverName} · Vehicle: {t.vehicle}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(t.status)}`}>
                  {t.status}
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{t.createdAt?.slice(0,10)}</span>
                <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyerIncomingTapals;

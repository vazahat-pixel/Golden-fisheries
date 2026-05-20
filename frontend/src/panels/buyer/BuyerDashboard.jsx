import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { Layers, FileText, CheckCircle, PackageOpen, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuyerDashboard = () => {
  const { user } = useAuthStore();
  const { tapals, fetchTapals } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // A real app might have a buyer-specific fetch route. Here we filter locally for the mock up.
    fetchTapals().finally(() => setLoading(false));
  }, [fetchTapals]);

  const buyerTapals = tapals.filter(t => (t.buyerId === user?.id) || (t.buyerName?.toLowerCase() === user?.name?.toLowerCase()) || (user?.role === 'BUYER'));
  
  const pendingArrival = buyerTapals.filter(t => t.status?.toUpperCase() === 'IN TRANSIT' || t.status?.toUpperCase() === 'ASSIGNED');
  const delivered = buyerTapals.filter(t => t.status?.toUpperCase() === 'DELIVERED' || t.status?.toUpperCase() === 'CLOSED');

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="border-b border-card-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
          Welcome, {user?.name || 'Buyer'}
        </h1>
        <p className="text-text-secondary text-sm mt-1">Monitor your incoming fish deliveries and access your invoices.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-card-border p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-brand-yellow/20 rounded-full">
            <Truck className="text-brand-olive" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">In Transit</p>
            <p className="text-2xl font-extrabold text-brand-olive">{pendingArrival.length}</p>
          </div>
        </div>
        <div className="bg-white border border-card-border p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-100 rounded-full">
            <CheckCircle className="text-emerald-800" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Delivered Loads</p>
            <p className="text-2xl font-extrabold text-emerald-800">{delivered.length}</p>
          </div>
        </div>
        <div className="bg-white border border-card-border p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-slate-100 rounded-full">
            <FileText className="text-slate-600" size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Outstanding</p>
            <p className="text-2xl font-extrabold text-brand-olive">₹ 0.00</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-card-border shadow-sm p-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
          Recent Incoming Loads
        </h3>
        {loading ? (
          <p className="text-sm text-text-muted py-4">Loading data...</p>
        ) : buyerTapals.length === 0 ? (
          <p className="text-sm text-text-muted py-4">No recent deliveries found.</p>
        ) : (
          <div className="space-y-4">
            {buyerTapals.slice(0, 5).map(tapal => (
              <div key={tapal.id || tapal._id} className="flex justify-between items-center p-4 border border-card-border bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div>
                  <h4 className="font-black text-brand-olive uppercase text-sm">TP #{tapal.tpNo || tapal.tapalNumber}</h4>
                  <p className="text-xs text-text-secondary mt-1">Vehicle: {tapal.vehicleNo || 'TBD'} • Driver: {tapal.driverName || 'TBD'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-sm ${
                    tapal.status?.toUpperCase() === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-yellow/30 text-brand-olive'
                  }`}>
                    {tapal.status || 'CREATED'}
                  </span>
                  <p className="text-xs font-bold mt-2 text-brand-olive">{tapal.totalWeight || tapal.qty || '0'} KG</p>
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

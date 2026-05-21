import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, FileText, RotateCcw } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { buyerPortalService } from '../../services/buyerPortalService';

const BuyerDashboard = () => {
  const { buyerTrips, fetchBuyerTrips } = useAdminStore();
  const [billCount, setBillCount] = useState(0);
  const [pendingVerify, setPendingVerify] = useState(0);

  useEffect(() => {
    fetchBuyerTrips();
    buyerPortalService.listBills().then((r) => {
      setBillCount(Array.isArray(r?.data) ? r.data.length : 0);
    }).catch(() => {});
    buyerPortalService.getAssignedTapals({ status: 'DELIVERED' }).then((r) => {
      setPendingVerify(Array.isArray(r?.data) ? r.data.length : 0);
    }).catch(() => {});
  }, [fetchBuyerTrips]);

  const activeTrips = buyerTrips.filter((t) => !['DELIVERED', 'CLOSED'].includes(t.status)).length;

  const cards = [
    { label: 'Active trips', value: activeTrips, icon: Truck, to: '/buyer/trips', color: 'text-accent-olive' },
    { label: 'Awaiting verify', value: pendingVerify, icon: Package, to: '/buyer/tapals', color: 'text-brand-yellow' },
    { label: 'Bills', value: billCount, icon: FileText, to: '/buyer/invoices', color: 'text-black' },
    { label: 'Returns', value: '—', icon: RotateCcw, to: '/buyer/returns', color: 'text-slate-500' }
  ];

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-olive mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-none border border-card-border p-5 hover:shadow-wapixo hover:border-black transition-all group duration-300"
          >
            <c.icon size={20} className={`${c.color} transition-transform group-hover:scale-110`} />
            <p className={`text-2xl font-black mt-2 ${c.color}`}>{c.value}</p>
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <Link
        to="/buyer/assign"
        className="block w-full py-4 bg-black text-white text-center rounded-none border border-black font-black text-[10px] uppercase tracking-[0.2em] shadow-subtle hover:bg-black/90 active:scale-95 transition-all"
      >
        Assign driver to tapal
      </Link>
    </div>
  );
};

export default BuyerDashboard;

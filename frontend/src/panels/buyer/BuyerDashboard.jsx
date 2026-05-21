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
    { label: 'Awaiting verify', value: pendingVerify, icon: Package, to: '/admin/buyer/tapals', color: 'text-amber-600' },
    { label: 'Bills', value: billCount, icon: FileText, to: '/admin/buyer/invoices', color: 'text-slate-900' },
    { label: 'Returns', value: '—', icon: RotateCcw, to: '/admin/buyer/returns', color: 'text-purple-600' },
    { label: 'Settlement', value: '→', icon: Truck, to: '/admin/buyer/reconciliation', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer · Admin ERP</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-2xl border border-slate-100 p-4 hover:shadow-md transition-all"
          >
            <c.icon size={20} className={c.color} />
            <p className={`text-2xl font-black mt-2 ${c.color}`}>{c.value}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</p>
          </Link>
        ))}
      </div>

    </div>
  );
};

export default BuyerDashboard;

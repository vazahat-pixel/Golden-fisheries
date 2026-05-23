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
    }).catch(() => { });
    buyerPortalService.getAssignedTapals({ status: 'DELIVERED' }).then((r) => {
      setPendingVerify(Array.isArray(r?.data) ? r.data.length : 0);
    }).catch(() => { });
  }, [fetchBuyerTrips]);

  const activeTrips = buyerTrips.filter((t) => !['DELIVERED', 'CLOSED'].includes(t.status)).length;

  const cards = [
    { label: 'Awaiting verify', value: pendingVerify, icon: Package, to: '/mobile/buyer/tapals', color: 'text-amber-600' },
    { label: 'Bills', value: billCount, icon: FileText, to: '/mobile/buyer/invoices', color: 'text-slate-900' },
    { label: 'Returns', value: '—', icon: RotateCcw, to: '/mobile/buyer/returns', color: 'text-purple-600' },
    { label: 'Settlement', value: '→', icon: Truck, to: '/mobile/buyer/reconciliation', color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6 p-1">
      <div>
<<<<<<< HEAD
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-olive mb-1">Buyer Portal</p>
=======
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer · Admin ERP</p>
>>>>>>> 4e5aef310993ff2aebf762c63b40b849a93de9dd
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Dashboard</h1>
      </div >

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

<<<<<<< HEAD
      <Link
        to="/buyer/assign"
        className="block w-full py-4 bg-black text-white text-center rounded-none border border-black font-black text-[10px] uppercase tracking-[0.2em] shadow-subtle hover:bg-black/90 active:scale-95 transition-all"
      >
        Assign driver to tapal
      </Link>
=======
>>>>>>> 4e5aef310993ff2aebf762c63b40b849a93de9dd
    </div >
  );
};

export default BuyerDashboard;

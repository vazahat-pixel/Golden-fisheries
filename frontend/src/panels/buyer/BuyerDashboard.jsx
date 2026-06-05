import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { Package, FileText, RotateCcw, Truck, ClipboardList } from 'lucide-react';

import { useAuthStore } from '../../store/authStore';

import { useAdminStore } from '../../store/adminStore';

import { buyerPortalService } from '../../services/buyerPortalService';

import {

  FieldScreen,

  FieldBuyerPortalCard,

  FieldQuickActions,

  FieldTransactionList,

  FieldSectionHeader,

} from '../../design-system/field-app';



const BuyerDashboard = () => {

  const navigate = useNavigate();

  const { user } = useAuthStore();

  const { buyerTrips, fetchBuyerTrips } = useAdminStore();

  const [billCount, setBillCount] = useState(0);

  const [pendingVerify, setPendingVerify] = useState(0);



  useEffect(() => {

    fetchBuyerTrips();

    buyerPortalService

      .listBills()

      .then((r) => setBillCount(Array.isArray(r?.data) ? r.data.length : 0))

      .catch(() => {});

    buyerPortalService

      .getAssignedTapals({ status: 'DELIVERED' })

      .then((r) => setPendingVerify(Array.isArray(r?.data) ? r.data.length : 0))

      .catch(() => {});

  }, [fetchBuyerTrips]);



  const rawName = user?.fullName || user?.name || 'Buyer';

  const buyerName = rawName.includes(' ')

    ? rawName.split(/\s+/)[0].toLowerCase()

    : rawName.toLowerCase();

  const phoneDigits = String(user?.phone || '').replace(/\D/g, '');

  const buyerRef = phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '—';

  const activeTapals = buyerTrips.filter((t) => !['DELIVERED', 'CLOSED'].includes(t.status)).length;

  const statusTone = pendingVerify > 0 ? 'assigned' : activeTapals > 0 ? 'active' : 'idle';

  const portalStatus =

    pendingVerify > 0 ? 'Verify pending' : activeTapals > 0 ? 'Loads open' : 'Ready';



  const recentRows = buyerTrips.slice(0, 6).map((t) => ({

    id: t._id || t.id,

    title: t.partyName || `Tapal #${t.tapalNumber || '—'}`,

    subtitle: t.status || '—',

    amount: t.qty ? `+${t.qty} kg` : '—',

    amountPositive: true,

    type: 'Tapal',

    initials: (t.partyName || 'T').slice(0, 2).toUpperCase(),

    onClick: () => navigate('/mobile/buyer/tapals'),

  }));



  const isEmpty = activeTapals === 0 && pendingVerify === 0 && billCount === 0 && recentRows.length === 0;



  return (
<<<<<<< HEAD

    <FieldScreen userName={buyerName}>

      <FieldSectionHeader

        title="My portal"

        actionLabel="Verify →"

        onAction={() => navigate('/mobile/buyer/tapals')}

      />



      <FieldBuyerPortalCard

        sectionLabel="Procurement portal"

        accountRef={buyerRef}

        status={portalStatus}

        statusTone={statusTone}

        activeTapals={activeTapals}

        pendingVerify={pendingVerify}

        billsCount={billCount}

        hint={

          isEmpty

            ? 'No tapals or bills yet. Admin will assign loads — check Verify when deliveries arrive.'

            : undefined

        }

        onClick={() => navigate('/mobile/buyer/tapals')}

      />



      <FieldQuickActions

        actions={[

          { icon: Package, label: 'Verify', to: '/mobile/buyer/tapals' },

          { icon: FileText, label: 'Bills', to: '/mobile/buyer/invoices' },

          { icon: RotateCcw, label: 'Return', to: '/mobile/buyer/returns' },

          { icon: Truck, label: 'Settle', to: '/mobile/buyer/reconciliation' },

        ]}

      />



      <FieldTransactionList

        title="Recent activity"

        onViewAll={() => navigate('/mobile/buyer/tapals')}

        items={recentRows}

        emptyMessage="No tapals yet"

      />



      <button

        type="button"

        onClick={() => navigate('/mobile/buyer/tapals')}

        className="w-full fa-surface p-4 text-left fa-tap flex items-center gap-3"

      >

        <ClipboardList className="text-[var(--fa-accent)] shrink-0" size={22} />

        <div>

          <p className="text-sm font-medium">Verify incoming tapals</p>

          <p className="text-[11px] fa-muted">{pendingVerify} awaiting verification</p>

        </div>

      </button>

    </FieldScreen>

=======
    <div className="space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-olive mb-1">Buyer Portal</p>
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
    </div >
>>>>>>> 36813be461d21b408f6150d714f5746d56ef9a1c
  );

};



export default BuyerDashboard;


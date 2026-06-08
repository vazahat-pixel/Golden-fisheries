import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText, RotateCcw, Truck, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { buyerPortalService } from '../../services/buyerPortalService';
import {
  FieldScreen,
  FieldBuyerPortalCard,
  FieldQuickActions,
  FieldTransactionList,
  FieldSectionHeader,
} from '../../design-system/field-app';
import { useBuyerPaths } from './buyerPaths';
import { BuyerWorkflowGuide } from './BuyerWorkflowGuide';

const VERIFY_STATUSES = ['DELIVERED', 'IN_TRANSIT', 'BILL_PENDING'];
const ACTIVE_STATUSES = ['CREATED', 'ASSIGNED', 'CONFIRMED', 'ACCEPTED', 'IN_TRANSIT'];

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const paths = useBuyerPaths();
  const { user } = useAuthStore();
  const [tapals, setTapals] = useState([]);
  const [billCount, setBillCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [tapalRes, billRes] = await Promise.all([
          buyerPortalService.getAssignedTapals({ limit: 50 }),
          buyerPortalService.listBills(),
        ]);
        if (cancelled) return;
        setTapals(Array.isArray(tapalRes?.data) ? tapalRes.data : []);
        setBillCount(Array.isArray(billRes?.data) ? billRes.data.length : 0);
      } catch {
        if (!cancelled) {
          setTapals([]);
          setBillCount(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rawName = user?.fullName || user?.name || 'Buyer';
  const buyerName = rawName.includes(' ')
    ? rawName.split(/\s+/)[0].toLowerCase()
    : rawName.toLowerCase();
  const phoneDigits = String(user?.phone || '').replace(/\D/g, '');
  const buyerRef = phoneDigits.length >= 4 ? phoneDigits.slice(-4) : '—';

  const pendingVerify = tapals.filter((t) => VERIFY_STATUSES.includes(t.status)).length;
  const activeTapals = tapals.filter((t) => ACTIVE_STATUSES.includes(t.status)).length;
  const statusTone = pendingVerify > 0 ? 'assigned' : activeTapals > 0 ? 'active' : 'idle';
  const portalStatus =
    pendingVerify > 0 ? 'Verify pending' : activeTapals > 0 ? 'Loads open' : 'Ready';

  const recentRows = tapals.slice(0, 6).map((t) => ({
    id: t._id || t.id,
    title: t.partyName || t.tapalNumber || t.tpNo || 'Tapal',
    subtitle: t.status || '—',
    amount: t.numericQty ? `+${t.numericQty} kg` : t.qty || '—',
    amountPositive: true,
    type: 'Tapal',
    initials: (t.partyName || t.tapalNumber || 'T').slice(0, 2).toUpperCase(),
    onClick: () => navigate(paths.tapals),
  }));

  const isEmpty = !loading && activeTapals === 0 && pendingVerify === 0 && billCount === 0;

  return (
    <FieldScreen userName={buyerName}>
      <FieldSectionHeader
        title="My portal"
        actionLabel="Verify →"
        onAction={() => navigate(paths.tapals)}
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
            ? 'No tapals yet. Admin will assign — check Verify after delivery.'
            : undefined
        }
        onClick={() => navigate(paths.tapals)}
      />

      <FieldQuickActions
        actions={[
          { icon: Package, label: 'Verify', to: paths.tapals },
          { icon: FileText, label: 'Bills', to: paths.invoices },
          { icon: RotateCcw, label: 'Return', to: paths.returns },
          { icon: Truck, label: 'Settle', to: paths.reconciliation },
        ]}
      />

      {isEmpty && <BuyerWorkflowGuide />}

      <FieldTransactionList
        title="Recent tapals"
        onViewAll={() => navigate(paths.tapals)}
        items={recentRows}
        emptyMessage={loading ? 'Loading…' : 'No tapals yet — waiting for admin assignment'}
      />

      <button
        type="button"
        onClick={() => navigate(paths.tapals)}
        className="w-full fa-surface p-4 text-left fa-tap flex items-center gap-3"
      >
        <ClipboardList className="text-[var(--fa-accent)] shrink-0" size={22} />
        <div>
          <p className="text-sm font-medium">Verify incoming tapals</p>
          <p className="text-[11px] fa-muted">{pendingVerify} awaiting verification</p>
        </div>
      </button>
    </FieldScreen>
  );
};

export default BuyerDashboard;

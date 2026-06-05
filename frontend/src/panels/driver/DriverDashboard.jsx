import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { useAuthStore } from '../../store/authStore';
import { DollarSign, History, Loader2, Navigation, Receipt, Route } from 'lucide-react';
import { unlockNotificationAudio, playTripAlertSound, vibrateTripAlert } from '../../utils/notificationSound';
import {
  FieldScreen,
  FieldTripHeroCard,
  FieldQuickActions,
  FieldTransactionList,
  FieldSectionHeader,
} from '../../design-system/field-app';
import { FieldPillTabs } from '../../design-system/field-app/FieldPillTabs';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    myTrips,
    myExpenses,
    fetchMyTrips,
    fetchMyExpenses,
    loading,
    incomingAssignment,
    clearIncomingAssignment,
  } = useDriverStore();

  const [listTab, setListTab] = useState('trips');

  useEffect(() => {
    fetchMyTrips();
    fetchMyExpenses();
  }, [fetchMyTrips, fetchMyExpenses]);

  useEffect(() => {
    const unlock = () => unlockNotificationAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  useEffect(() => {
    if (!incomingAssignment) return;
    unlockNotificationAudio();
    playTripAlertSound();
    vibrateTripAlert();
  }, [incomingAssignment]);

  const tripsList = myTrips || [];
  const activeTrip = tripsList.find((t) =>
    ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED'].includes(t.status)
  );
  const pastTrips = tripsList.filter(
    (t) => !['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED'].includes(t.status)
  );

  const rawName = user?.fullName || user?.name || 'Driver';
  const driverName = rawName.includes(' ')
    ? rawName.split(/\s+/)[0].toLowerCase()
    : rawName.toLowerCase();
  const heroTrip = activeTrip || incomingAssignment;
  const tripNo =
    activeTrip?.tripNumber ||
    activeTrip?.tapalNumber ||
    incomingAssignment?.tapalNumber ||
    null;
  const displayTripNo = tripNo ? String(tripNo).replace(/^#/, '') : '—';

  const statusTone = activeTrip
    ? ['In Transit', 'Picked', 'STARTED', 'PICKED'].includes(activeTrip.status)
      ? 'active'
      : 'assigned'
    : incomingAssignment
      ? 'assigned'
      : 'idle';

  const tripStatus = activeTrip?.status || (incomingAssignment ? 'Assigned' : 'Ready');

  const sourceList = listTab === 'expenses' ? myExpenses || [] : pastTrips;
  const tripRows = sourceList.slice(0, 6).map((row) => {
    if (listTab === 'trips') {
      return {
        id: row._id || row.id,
        title: row.partyName || `Trip #${row.tripNumber || '—'}`,
        subtitle: row.status || '—',
        amount: row.expectedQty ? `+${row.expectedQty} kg` : '+0',
        amountPositive: true,
        type: 'Trip',
        initials: 'TR',
        onClick: () => navigate('/driver/active-trip'),
      };
    }
    return {
      id: row._id,
      title: row.expenseType || row.type || 'Expense',
      subtitle: row.createdAt ? new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today',
      amount: `+₹${row.amount ?? 0}`,
      amountPositive: true,
      type: row.status || 'Claim',
      initials: 'EX',
    };
  });

  return (
    <FieldScreen userName={driverName} notifyHref="/driver/notifications">
      {incomingAssignment && (
        <div className="fa-surface p-4 border border-[var(--fa-accent)]/30">
          <p className="text-[10px] font-bold uppercase text-[var(--fa-accent)]">New assignment</p>
          <p className="text-sm font-medium mt-1">Tapal #{incomingAssignment.tapalNumber}</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                clearIncomingAssignment();
                navigate('/driver/active-trip');
              }}
              className="flex-1 py-2.5 fa-btn-primary text-[10px] font-bold uppercase fa-tap"
            >
              Open trip
            </button>
            <button
              type="button"
              onClick={clearIncomingAssignment}
              className="flex-1 py-2.5 rounded-[var(--fa-radius-md)] border border-[var(--fa-border)] text-[10px] font-bold fa-tap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <FieldSectionHeader
        title="My active trip"
        actionLabel="Open →"
        onAction={() => navigate('/driver/active-trip')}
      />

      {heroTrip ? (
        <FieldTripHeroCard
          tripLabel="Active run"
          tripNumber={displayTripNo}
          status={tripStatus}
          statusTone={statusTone}
          pickup={activeTrip?.pickupLocation || incomingAssignment?.pickupLocation}
          delivery={activeTrip?.deliveryLocation || incomingAssignment?.deliveryLocation}
          loadValue={activeTrip?.expectedQty ? `${activeTrip.expectedQty} kg` : 'Pending'}
          onClick={() => navigate('/driver/active-trip')}
        />
      ) : (
        <FieldTripHeroCard
          tripLabel="Dispatch queue"
          tripNumber="—"
          status="Ready"
          statusTone="idle"
          hint="No trip assigned yet. Admin will dispatch your next run — check Tasks for updates."
          loadLabel="Queue"
          loadValue="0 trips"
          onClick={() => navigate('/driver/tasks')}
        />
      )}

      <FieldQuickActions
        actions={[
          { icon: Navigation, label: 'Transit', to: '/driver/active-trip' },
          { icon: DollarSign, label: 'Expense', to: '/driver/expenses/new' },
          { icon: Route, label: 'Tasks', to: '/driver/tasks' },
          { icon: Receipt, label: 'Claims', to: '/driver/expenses' },
        ]}
      />

      <FieldPillTabs
        options={[
          { label: 'Trips', value: 'trips' },
          { label: 'Expenses', value: 'expenses' },
          { label: 'All', value: 'all' },
        ]}
        value={listTab}
        onChange={setListTab}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-[var(--fa-accent)]" size={28} />
        </div>
      ) : (
        <FieldTransactionList
          title="Recent activity"
          onViewAll={() => navigate(listTab === 'expenses' ? '/driver/expenses' : '/driver/history')}
          items={
            listTab === 'all'
              ? [
                  ...pastTrips.slice(0, 4).map((row) => ({
                    id: row._id || row.id,
                    title: row.partyName || `Trip #${row.tripNumber || '—'}`,
                    subtitle: row.status || '—',
                    amount: row.expectedQty ? `+${row.expectedQty} kg` : '+0',
                    amountPositive: true,
                    type: 'Trip',
                    initials: 'TR',
                    onClick: () => navigate('/driver/active-trip'),
                  })),
                  ...(myExpenses || []).slice(0, 2).map((row) => ({
                    id: `e-${row._id}`,
                    title: row.expenseType || 'Expense',
                    subtitle: 'Claim',
                    amount: `+₹${row.amount ?? 0}`,
                    amountPositive: true,
                    type: row.status,
                    initials: 'EX',
                  })),
                ]
              : tripRows
          }
          emptyMessage="No records yet"
        />
      )}
    </FieldScreen>
  );
};

export default DriverDashboard;

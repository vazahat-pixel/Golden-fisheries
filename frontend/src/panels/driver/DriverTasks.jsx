import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { Truck } from 'lucide-react';
import { FieldPageWrap, FieldInlineLoader, FieldTransactionList } from '../../design-system/field-app';
import { tripStopsSummary } from '../../utils/tripStopsDisplay';

const LIVE_STATUSES = ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED', 'ACCEPTED'];

const DriverTasks = () => {
  const navigate = useNavigate();
  const { myTrips, fetchMyTrips, loading } = useDriverStore();

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const { live, upcoming } = useMemo(() => {
    const list = myTrips || [];
    const liveList = list.filter((t) => LIVE_STATUSES.includes(t.status));
    const rest = list.filter((t) => !LIVE_STATUSES.includes(t.status));
    return { live: liveList, upcoming: rest };
  }, [myTrips]);

  const rows = [...live, ...upcoming].slice(0, 12).map((t) => {
    const stopInfo = tripStopsSummary(t);
    return {
      id: t._id || t.id,
      title: `Trip #${t.tripNumber || t.tapalNumber || '—'}`,
      subtitle: stopInfo || `${t.pickupLocation || 'Pickup'} → ${t.deliveryLocation || 'Delivery'}`,
      amount: t.status,
      amountPositive: LIVE_STATUSES.includes(t.status),
      type: LIVE_STATUSES.includes(t.status) ? 'Active' : 'Queued',
      initials: 'TR',
      onClick: () => navigate('/driver/active-trip'),
    };
  });

  return (
    <FieldPageWrap fill subtitle="My assignments">
      <div className="mb-4">
        <h1 className="fa-page-title">Tasks</h1>
        <p className="fa-page-subtitle">Tap a trip to open the transit console</p>
      </div>

      {loading ? (
        <FieldInlineLoader label="Loading tasks" />
      ) : rows.length === 0 ? (
        <div className="fa-empty-state fa-empty-state--fill space-y-4">
          <Truck className="fa-empty-icon" size={44} strokeWidth={1.5} />
          <p className="text-sm fa-muted">No trips in your queue</p>
          <button
            type="button"
            onClick={() => navigate('/driver/dashboard')}
            className="fa-btn-primary w-full max-w-[220px] mx-auto py-3 text-[11px] font-bold uppercase tracking-wider fa-tap"
          >
            Back to home
          </button>
        </div>
      ) : (
        <FieldTransactionList
          title={`${live.length} active · ${upcoming.length} other`}
          onViewAll={() => navigate('/driver/history')}
          items={rows}
          emptyMessage="No tasks"
        />
      )}
    </FieldPageWrap>
  );
};

export default DriverTasks;

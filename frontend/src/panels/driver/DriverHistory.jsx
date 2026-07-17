import React, { useEffect } from 'react';
import { useDriverStore } from '../../store/driverStore';
import { FieldPageWrap, FieldInlineLoader } from '../../design-system/field-app';

const DriverHistory = () => {
  const { myTrips, fetchMyTrips, loading } = useDriverStore();

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const closed = (myTrips || []).filter((t) => ['CLOSED', 'COMPLETED', 'DELIVERED'].includes(t.status));

  return (
    <FieldPageWrap subtitle="Completed runs">
      <div className="mb-4">
        <h1 className="fa-page-title">Trip history</h1>
        <p className="fa-page-subtitle">Your completed deliveries and runs</p>
      </div>
      {loading ? (
        <FieldInlineLoader label="Loading history" />
      ) : closed.length === 0 ? (
        <div className="fa-empty-state py-12">
          <p className="text-sm fa-muted">No completed trips yet</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {closed.map((t) => (
            <li key={t._id || t.id} className="fa-glass-card fa-card-interactive p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="fa-display-num fa-text-gradient text-lg">#{t.tripNumber || t.tapalNumber || '—'}</p>
                <span className="fa-badge fa-badge--success">{t.status}</span>
              </div>
              <p className="text-xs fa-muted mt-2 truncate leading-relaxed">
                {t.pickupLocation} → {t.deliveryLocation}
              </p>
            </li>
          ))}
        </ul>
      )}
    </FieldPageWrap>
  );
};

export default DriverHistory;

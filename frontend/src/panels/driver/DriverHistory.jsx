import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';

const DriverHistory = () => {
  const { myTrips, fetchMyTrips, loading } = useDriverStore();

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  const closed = (myTrips || []).filter((t) => ['CLOSED', 'COMPLETED'].includes(t.status));

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-lg font-black uppercase tracking-wide">Trip history</h1>
      {loading ? (
        <p className="text-sm text-gray-500">Loading...</p>
      ) : closed.length === 0 ? (
        <p className="text-sm text-gray-500">No completed trips</p>
      ) : (
        <ul className="space-y-2">
          {closed.map((t) => (
            <li key={t._id} className="bg-white border rounded-lg p-3 text-sm">
              <p className="font-bold">{t.tripNumber || t.tapalNumber}</p>
              <p className="text-[10px] text-gray-500">{t.status}</p>
              {t._id && (
                <Link to={`/driver/trip/${t._id}/end`} className="text-xs text-blue-600 underline mt-1 inline-block">
                  View sheet
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DriverHistory;

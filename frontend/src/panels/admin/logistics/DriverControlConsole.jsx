import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tapalService } from '../../../services/tapalService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';

const DriverControlConsole = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tapalService
      .allTrips({ limit: 50 })
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        setTrips(list);
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-12">
      <AdminPageHeader title="Driver control" subtitle="Live trips & end-trip settlement" badge="Logistics" />
      {loading ? (
        <p className="text-sm text-gray-500">Loading trips...</p>
      ) : trips.length === 0 ? (
        <AdminCard className="p-6 text-sm text-gray-500">No trips</AdminCard>
      ) : (
        <div className="space-y-2">
          {trips.map((t) => {
            const pte = t.postTripExpenses || {};
            return (
              <AdminCard key={t._id} className="p-4 flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-bold text-sm">{t.tripNumber}</p>
                  <p className="text-[10px] text-gray-500">
                    {t.tapalId?.tapalNumber || t.tapalNumber} · {t.status}
                  </p>
                  {pte.balancePayable != null && (
                    <p className="text-xs mt-1">
                      Balance payable: ₹{pte.balancePayable.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>
                <Link to="/admin/logistics" className="text-[10px] font-bold uppercase underline">
                  Trips & expenses
                </Link>
              </AdminCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverControlConsole;

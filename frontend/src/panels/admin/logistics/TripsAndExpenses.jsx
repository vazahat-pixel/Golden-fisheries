import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { AdminPageHeader, AdminDataTable, StatusBadge } from '../shared/adminUi';

const TripsAndExpenses = () => {
  const navigate = useNavigate();
  const { trips, fetchTrips, expenses, fetchExpenses, loading } = useAdminStore();

  useEffect(() => {
    fetchTrips();
    fetchExpenses();
  }, [fetchTrips, fetchExpenses]);

  return (
    <div className="pb-12 space-y-10">
      <AdminPageHeader title="Logistics" subtitle="Trips & expenses" badge="Operations" />

      <section>
        <h2 className="text-sm font-black uppercase mb-3">Active trips</h2>
        <AdminDataTable
          loading={loading}
          emptyMessage="No trips — assign drivers to tapals first"
          columns={[
            { key: 'tripNumber', label: 'Trip No' },
            { key: 'driverName', label: 'Driver' },
            { key: 'pickupLocation', label: 'From' },
            { key: 'deliveryLocation', label: 'To' },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={trips || []}
          onRowClick={(r) => r.tapalId && navigate(`/admin/tapals/${r.tapalId}`)}
        />
      </section>

      <section>
        <h2 className="text-sm font-black uppercase mb-3">Recent expenses</h2>
        <AdminDataTable
          loading={loading}
          emptyMessage="No expenses logged"
          columns={[
            { key: 'expenseType', label: 'Type' },
            { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` },
            { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          ]}
          rows={(expenses || []).slice(0, 20)}
        />
      </section>
    </div>
  );
};

export default TripsAndExpenses;

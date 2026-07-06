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
      <AdminPageHeader
        title="Logistics"
        subtitle="Trips & expenses"
        badge="Operations"
        actions={
          <button
            type="button"
            onClick={() => navigate('/admin/logistics/assign-driver', { state: { view: 'create' } })}
            className="px-4 py-2 bg-[#6A7051] text-white text-[10px] font-black uppercase tracking-wider rounded hover:bg-[#5F6846]"
          >
            Create New Trip & Assign
          </button>
        }
      />

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
            {
              key: 'totalExpense',
              label: 'Total Expense',
              render: (r) => {
                const total = r.postTripExpenses?.totalExpenses ?? 0;
                return <span className="font-semibold">₹{Number(total || 0).toLocaleString('en-IN')}</span>;
              }
            },
            {
              key: 'balancePayable',
              label: 'Payable',
              render: (r) => {
                const payable = r.postTripExpenses?.balancePayable ?? 0;
                return <span className="font-semibold text-amber-700">₹{Number(payable || 0).toLocaleString('en-IN')}</span>;
              }
            },
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

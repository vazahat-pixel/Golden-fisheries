import React, { useEffect } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import { AdminPageHeader, AdminDataTable, AdminBtn, StatusBadge } from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const ExpenseReviewPage = () => {
  const { expenses, fetchExpenses, reviewExpenseAsync, rejectExpenseAsync, loading } = useAdminStore();

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleApprove = async (id) => {
    try {
      await reviewExpenseAsync(id, 'APPROVED');
      toast.success('Expense approved');
    } catch (err) {
      toast.error(err?.message || 'Failed');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectExpenseAsync(id);
      toast.success('Expense rejected');
    } catch (err) {
      toast.error(err?.message || 'Failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader title="Expense approval" subtitle="Driver & trip expenses" badge="Finance" />

      <AdminDataTable
        loading={loading}
        emptyMessage="No expenses pending review"
        columns={[
          { key: 'expenseCode', label: 'Code' },
          { key: 'expenseType', label: 'Type' },
          { key: 'payee', label: 'Payee' },
          { key: 'amount', label: 'Amount', render: (r) => `₹${r.amount}` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
          {
            key: 'actions',
            label: '',
            render: (r) =>
              r.status === 'PENDING' ? (
                <span className="flex gap-1">
                  <AdminBtn variant="primary" onClick={(e) => { e.stopPropagation(); handleApprove(r._id || r.id); }}>
                    Approve
                  </AdminBtn>
                  <AdminBtn variant="danger" onClick={(e) => { e.stopPropagation(); handleReject(r._id || r.id); }}>
                    Reject
                  </AdminBtn>
                </span>
              ) : null,
          },
        ]}
        rows={expenses || []}
      />
    </div>
  );
};

export default ExpenseReviewPage;

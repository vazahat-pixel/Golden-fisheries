import React, { useEffect, useState } from 'react';
import { billingService } from '../../../services/billingService';
import { useAdminStore } from '../../../store/adminStore';
import {
  AdminPageHeader,
  AdminDataTable,
  AdminBtn,
  StatusBadge,
} from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const AdminBilling = () => {
  const { fetchInvoices, invoices, loading } = useAdminStore();
  const [filter, setFilter] = useState('ALL');
  const [payModal, setPayModal] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const rows = (invoices || []).filter((inv) => {
    if (filter === 'ALL') return true;
    return (inv.type || '').toUpperCase() === filter;
  });

  const submitPayment = async () => {
    if (!payModal) return;
    try {
      await billingService.updatePayment(payModal._id || payModal.id, {
        paidAmount: parseFloat(paidAmount),
        paymentStatus: 'PAID',
      });
      toast.success('Payment recorded');
      setPayModal(null);
      setPaidAmount('');
      fetchInvoices();
    } catch (err) {
      toast.error(err?.message || 'Payment update failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader
        title="Billing"
        subtitle="Procurement & sales invoices"
        badge="Finance"
        actions={
          <>
            {['ALL', 'PROCUREMENT', 'SALES'].map((f) => (
              <AdminBtn key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
                {f}
              </AdminBtn>
            ))}
          </>
        }
      />

      <AdminDataTable
        loading={loading}
        emptyMessage="No invoices in system"
        columns={[
          { key: 'invoiceNumber', label: 'Invoice No' },
          { key: 'type', label: 'Type' },
          { key: 'partyName', label: 'Party' },
          {
            key: 'totalAmount',
            label: 'Amount',
            render: (r) => `₹${(r.totalAmount || r.numericAmount || 0).toLocaleString('en-IN')}`,
          },
          {
            key: 'paymentStatus',
            label: 'Status',
            render: (r) => <StatusBadge status={r.paymentStatus || 'PENDING'} />,
          },
          {
            key: 'actions',
            label: '',
            render: (r) =>
              r.paymentStatus !== 'PAID' ? (
                <AdminBtn
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPayModal(r);
                    setPaidAmount(String(r.totalAmount || r.balanceAmount || ''));
                  }}
                >
                  Record pay
                </AdminBtn>
              ) : null,
          },
        ]}
        rows={rows}
      />

      {payModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 max-w-sm w-full border-2 border-black">
            <h3 className="font-bold uppercase text-sm mb-4">Record payment — {payModal.invoiceNumber}</h3>
            <input
              className="w-full border px-3 py-2 mb-4"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
            />
            <div className="flex gap-2">
              <AdminBtn onClick={submitPayment}>Save</AdminBtn>
              <AdminBtn variant="outline" onClick={() => setPayModal(null)}>
                Cancel
              </AdminBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBilling;

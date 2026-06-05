import React, { useEffect, useMemo, useState } from 'react';
import { useAdminStore } from '../../../store/adminStore';
import { AdminPageHeader, AdminDataTable, AdminBtn, StatusBadge } from '../shared/adminUi';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../design-system/components/Modal';
import { FormField } from '../../../design-system/components/FormField';
import { Input } from '../../../design-system/components/Input';

const ExpenseReviewPage = () => {
  const {
    expenses,
    trips,
    fetchExpenses,
    fetchTrips,
    reviewExpenseAsync,
    rejectExpenseAsync,
    confirmTripPaymentAsync,
    loading
  } = useAdminStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchTrips();
  }, [fetchExpenses, fetchTrips]);

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

  const openPaymentModal = (trip) => {
    const payable = Number(trip?.postTripExpenses?.balancePayable || 0);
    if (payable <= 0) {
      toast.error('No payable amount found for this trip');
      return;
    }
    setSelectedTrip(trip);
    setPaidAmount(String(payable));
    setUpiTransactionId('');
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    if (submittingPayment) return;
    setPaymentModalOpen(false);
    setSelectedTrip(null);
    setPaidAmount('');
    setUpiTransactionId('');
  };

  const payableAmount = useMemo(
    () => Number(selectedTrip?.postTripExpenses?.balancePayable || 0),
    [selectedTrip]
  );

  const submitPayment = async () => {
    const amountNum = parseFloat(paidAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error('Enter a valid paid amount');
      return;
    }
    if (!upiTransactionId || !upiTransactionId.trim()) {
      toast.error('UPI transaction ID is required');
      return;
    }
    if (!selectedTrip) return;

    setSubmittingPayment(true);
    try {
      await confirmTripPaymentAsync(selectedTrip.id || selectedTrip._id, amountNum, upiTransactionId.trim(), 'UPI');
      toast.success(`Payment confirmed for ${selectedTrip.tripNumber}`);
      closePaymentModal();
    } catch (err) {
      toast.error(err?.message || 'Failed to confirm payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const paymentPendingTrips = (trips || []).filter(
    (t) =>
      t?.postTripExpenses &&
      t.postTripExpenses.status === 'APPROVED' &&
      (t.postTripExpenses.paymentStatus || 'UNPAID') !== 'PAID'
  );

  return (
    <div className="pb-12">
      <AdminPageHeader title="Expense approval" subtitle="Driver & trip expenses" badge="Finance" />

      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-2">Trip payment pending</h3>
        <AdminDataTable
          loading={loading}
          emptyMessage="No trip pending payment"
          columns={[
            { key: 'tripNumber', label: 'Trip' },
            { key: 'driverName', label: 'Driver' },
            {
              key: 'totalExpenses',
              label: 'Total Expense',
              render: (r) => (
                <span className="font-semibold text-red-700">
                  ₹{Number(r?.postTripExpenses?.totalExpenses || 0).toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'balancePayable',
              label: 'Payable',
              render: (r) => (
                <span className="font-semibold text-amber-700">
                  ₹{Number(r?.postTripExpenses?.balancePayable || 0).toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'paymentStatus',
              label: 'Payment',
              render: (r) => <StatusBadge status={r?.postTripExpenses?.paymentStatus || 'UNPAID'} />,
            },
            {
              key: 'actions',
              label: '',
              render: (r) => (
                <AdminBtn
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPaymentModal(r);
                  }}
                >
                  Confirm Payment
                </AdminBtn>
              ),
            },
          ]}
          rows={paymentPendingTrips}
        />
      </div>

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

      <Modal
        isOpen={paymentModalOpen}
        onClose={closePaymentModal}
        title="Confirm Trip Payment"
        footer={
          <>
            <AdminBtn variant="outline" onClick={closePaymentModal} disabled={submittingPayment}>
              Cancel
            </AdminBtn>
            <AdminBtn variant="primary" onClick={submitPayment} loading={submittingPayment}>
              Confirm
            </AdminBtn>
          </>
        }
      >
        <div className="space-y-3">
          <div className="text-xs text-text-muted">
            <div>
              <span className="font-semibold text-text-primary">Trip:</span> {selectedTrip?.tripNumber || '—'}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Driver:</span> {selectedTrip?.driverName || '—'}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Payable:</span>{' '}
              ₹{payableAmount.toLocaleString('en-IN')}
            </div>
          </div>

          <FormField label="Paid Amount" required>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              disabled={submittingPayment}
            />
          </FormField>

          <FormField label="UPI Transaction ID" required>
            <Input
              type="text"
              value={upiTransactionId}
              onChange={(e) => setUpiTransactionId(e.target.value)}
              placeholder="e.g. 413245678901"
              disabled={submittingPayment}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseReviewPage;

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { expenseService } from '../../../services/expenseService';
import { tapalService } from '../../../services/tapalService';
import { AdminPageHeader, AdminDataTable, AdminBtn, StatusBadge } from '../shared/adminUi';
import { TripExpenseSummary, TripSettlementPaymentForm } from '../shared/TripSettlementPayment';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../design-system/components/Modal';
import { FormField } from '../../../design-system/components/FormField';
import { Input } from '../../../design-system/components/Input';
import { Card } from '../../../design-system/components/Card';
import { CheckCircle2, Clock, Wallet, ExternalLink } from 'lucide-react';

const ExpenseReviewPage = () => {
  const navigate = useNavigate();
  const {
    expenses,
    trips,
    fetchExpenses,
    fetchTrips,
    reviewExpenseAsync,
    rejectExpenseAsync,
    confirmTripPaymentAsync,
    loading,
  } = useAdminStore();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [paidAmount, setPaidAmount] = useState('');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailActionLoading, setDetailActionLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
    fetchTrips();
  }, [fetchExpenses, fetchTrips]);

  const pendingReviewTrips = useMemo(
    () => (trips || []).filter((t) => t?.postTripExpenses?.status === 'PENDING'),
    [trips]
  );

  const awaitingDriverSheetTrips = useMemo(
    () =>
      (trips || []).filter((t) => {
        const st = String(t?.status || '').toUpperCase();
        const hasSheet = Boolean(t?.postTripExpenses?.status);
        return ['DELIVERED', 'PICKED', 'IN_TRANSIT', 'STARTED'].includes(st) && !hasSheet;
      }),
    [trips]
  );

  const paymentPendingTrips = useMemo(
    () =>
      (trips || []).filter(
        (t) =>
          t?.postTripExpenses &&
          t.postTripExpenses.status === 'APPROVED' &&
          (t.postTripExpenses.paymentStatus || 'UNPAID') !== 'PAID'
      ),
    [trips]
  );

  const totalPendingPayable = useMemo(
    () => paymentPendingTrips.reduce((s, t) => s + Number(t?.postTripExpenses?.balancePayable || 0), 0),
    [paymentPendingTrips]
  );

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

  const submitPayment = async () => {
    const amountNum = parseFloat(paidAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      toast.error('Enter a valid paid amount');
      return;
    }
    if (!upiTransactionId?.trim()) {
      toast.error('UPI transaction ID is required');
      return;
    }
    if (!selectedTrip) return;

    setSubmittingPayment(true);
    try {
      await confirmTripPaymentAsync(selectedTrip.id || selectedTrip._id, amountNum, upiTransactionId.trim(), 'UPI');
      toast.success(`Trip ${selectedTrip.tripNumber} marked complete — payment recorded`);
      closePaymentModal();
    } catch (err) {
      toast.error(err?.message || 'Failed to confirm payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const linkedTripFromExpense = (expense) => {
    const raw = expense?.linkedTripId;
    if (!raw) return null;
    if (typeof raw === 'object') return raw;
    return (trips || []).find((t) => String(t._id || t.id) === String(raw)) || null;
  };

  const openExpenseDetail = async (row) => {
    const id = row?._id || row?.id;
    if (!id) return;
    setDetailModalOpen(true);
    setLoadingDetail(true);
    setSelectedExpense(null);
    try {
      const res = await expenseService.getById(id);
      const expense = res?.data?.expense || res?.expense || res?.data || res;
      setSelectedExpense(expense);
    } catch (err) {
      toast.error(err?.message || 'Could not load expense details');
      setDetailModalOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeExpenseDetail = () => {
    if (detailActionLoading) return;
    setDetailModalOpen(false);
    setSelectedExpense(null);
  };

  const approveExpenseWithTripSync = async (expense) => {
    const id = expense?._id || expense?.id;
    if (!id) return;
    setDetailActionLoading(true);
    try {
      const trip = linkedTripFromExpense(expense);
      const tripId = trip?._id || trip?.id;
      if (tripId && trip?.postTripExpenses?.status === 'PENDING') {
        await tapalService.reviewPostTripExpense(tripId, 'APPROVED');
        await fetchTrips();
      }
      await reviewExpenseAsync(id, 'APPROVED');
      toast.success('Expense approved');
      await fetchExpenses();
      closeExpenseDetail();
    } catch (err) {
      toast.error(err?.message || 'Approve failed');
    } finally {
      setDetailActionLoading(false);
    }
  };

  const rejectExpenseWithTripSync = async (expense) => {
    const id = expense?._id || expense?.id;
    if (!id) return;
    setDetailActionLoading(true);
    try {
      const trip = linkedTripFromExpense(expense);
      const tripId = trip?._id || trip?.id;
      if (tripId && trip?.postTripExpenses?.status === 'PENDING') {
        await tapalService.reviewPostTripExpense(tripId, 'REJECTED', 'Rejected from expense ledger');
        await fetchTrips();
      }
      await rejectExpenseAsync(id);
      toast.success('Expense rejected');
      await fetchExpenses();
      closeExpenseDetail();
    } catch (err) {
      toast.error(err?.message || 'Reject failed');
    } finally {
      setDetailActionLoading(false);
    }
  };

  const detailTrip = selectedExpense ? linkedTripFromExpense(selectedExpense) : null;
  const detailPostTrip = detailTrip?.postTripExpenses;
  const detailTapal =
    detailTrip?.tapalId && typeof detailTrip.tapalId === 'object' ? detailTrip.tapalId : null;

  return (
    <div className="pb-12 space-y-5">
      <AdminPageHeader
        title="Expense & trip settlement"
        subtitle="Driver must submit End Trip Sheet after delivery — then review, pay UPI, mark complete"
        badge="Finance"
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card padding="md" className="border-border-strong">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase">Awaiting Sheet</span>
          </div>
          <p className="text-2xl font-black text-brand-olive mt-1">{awaitingDriverSheetTrips.length}</p>
        </Card>
        <Card padding="md" className="border-border-strong">
          <div className="flex items-center gap-2 text-amber-700">
            <Clock size={16} />
            <span className="text-[10px] font-black uppercase">Awaiting Review</span>
          </div>
          <p className="text-2xl font-black text-brand-olive mt-1">{pendingReviewTrips.length}</p>
        </Card>
        <Card padding="md" className="border-border-strong">
          <div className="flex items-center gap-2 text-accent">
            <Wallet size={16} />
            <span className="text-[10px] font-black uppercase">Awaiting Payment</span>
          </div>
          <p className="text-2xl font-black text-brand-olive mt-1">{paymentPendingTrips.length}</p>
        </Card>
        <Card padding="md" className="border-amber-300 bg-amber-50/50">
          <div className="flex items-center gap-2 text-amber-800">
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase">Total Payable</span>
          </div>
          <p className="text-2xl font-black text-amber-800 mt-1 tabular-nums">₹{totalPendingPayable.toLocaleString('en-IN')}</p>
        </Card>
      </div>

      {awaitingDriverSheetTrips.length > 0 && (
        <section className="space-y-2">
          <h3 className="erp-h3 uppercase tracking-wide flex items-center gap-2">
            <Clock size={14} className="text-slate-500" /> Delivered — driver expense sheet not submitted
          </h3>
          <p className="text-[11px] text-text-secondary">
            Trip delivery alone does not create expenses. Driver must open <strong>End Trip Sheet</strong> in the driver app and submit diesel, toll, batta, etc.
          </p>
          <AdminDataTable
            loading={loading}
            emptyMessage="No trips waiting for driver sheet"
            columns={[
              { key: 'tripNumber', label: 'Trip' },
              { key: 'driverName', label: 'Driver' },
              {
                key: 'status',
                label: 'Status',
                render: (r) => <StatusBadge status={r.status} />,
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <AdminBtn
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/tapals/${r.tapalId || r.tapal?._id}`);
                    }}
                  >
                    <ExternalLink size={12} /> View Tapal
                  </AdminBtn>
                ),
              },
            ]}
            rows={awaitingDriverSheetTrips}
          />
        </section>
      )}

      {pendingReviewTrips.length > 0 && (
        <section className="space-y-2">
          <h3 className="erp-h3 uppercase tracking-wide flex items-center gap-2">
            <Clock size={14} className="text-amber-600" /> Driver trip sheets — pending review
          </h3>
          <AdminDataTable
            loading={loading}
            emptyMessage="No trips awaiting review"
            columns={[
              { key: 'tripNumber', label: 'Trip' },
              { key: 'driverName', label: 'Driver' },
              {
                key: 'totalExpenses',
                label: 'Total Expenses',
                render: (r) => (
                  <span className="font-black text-red-700 tabular-nums">
                    ₹{Number(r?.postTripExpenses?.totalExpenses || 0).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                key: 'balancePayable',
                label: 'Net Payable',
                render: (r) => (
                  <span className="font-black text-amber-700 tabular-nums">
                    ₹{Number(r?.postTripExpenses?.balancePayable || 0).toLocaleString('en-IN')}
                  </span>
                ),
              },
              {
                key: 'actions',
                label: '',
                render: (r) => (
                  <AdminBtn
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/tapals/${r.tapalId || r.tapal?._id}`);
                    }}
                  >
                    <ExternalLink size={12} /> Review Sheet
                  </AdminBtn>
                ),
              },
            ]}
            rows={pendingReviewTrips}
          />
        </section>
      )}

      <section className="space-y-2">
        <h3 className="erp-h3 uppercase tracking-wide flex items-center gap-2">
          <Wallet size={14} className="text-accent" /> Approved — pay driver & mark complete
        </h3>
        <AdminDataTable
          loading={loading}
          emptyMessage="No trips pending payment"
          columns={[
            { key: 'tripNumber', label: 'Trip' },
            { key: 'driverName', label: 'Driver' },
            {
              key: 'totalExpenses',
              label: 'Total Expense',
              render: (r) => (
                <span className="font-black text-red-700 tabular-nums">
                  ₹{Number(r?.postTripExpenses?.totalExpenses || 0).toLocaleString('en-IN')}
                </span>
              ),
            },
            {
              key: 'balancePayable',
              label: 'Payable',
              render: (r) => (
                <span className="font-black text-amber-700 tabular-nums">
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
                  Pay via UPI
                </AdminBtn>
              ),
            },
          ]}
          rows={paymentPendingTrips}
        />
      </section>

      <section className="space-y-2">
        <h3 className="erp-h3 uppercase tracking-wide">General expense ledger</h3>
        <p className="text-[11px] text-text-secondary">Click a row (e.g. EXP-0001) to open full trip sheet and line-item breakdown.</p>
        <AdminDataTable
          loading={loading}
          emptyMessage="No expense claims in ledger yet"
          onRowClick={openExpenseDetail}
          columns={[
            {
              key: 'expenseCode',
              label: 'Code',
              render: (r) => (
                <span className="font-black text-brand-olive underline decoration-dotted cursor-pointer">
                  {r.expenseCode || '—'}
                </span>
              ),
            },
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
      </section>

      <Modal
        isOpen={paymentModalOpen}
        onClose={closePaymentModal}
        title="Confirm driver payment"
        footer={
          <>
            <AdminBtn variant="outline" onClick={closePaymentModal} disabled={submittingPayment}>
              Cancel
            </AdminBtn>
            <AdminBtn variant="primary" onClick={submitPayment} loading={submittingPayment}>
              <CheckCircle2 size={14} /> Mark Complete
            </AdminBtn>
          </>
        }
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-text-secondary space-y-1">
              <p><span className="text-text-primary font-black">Trip:</span> {selectedTrip.tripNumber || '—'}</p>
              <p><span className="text-text-primary font-black">Driver:</span> {selectedTrip.driverName || '—'}</p>
            </div>
            <TripExpenseSummary postTrip={selectedTrip.postTripExpenses} />
            <FormField label="Paid Amount (₹)" required>
              <Input type="number" min="0.01" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} disabled={submittingPayment} className="font-bold" />
            </FormField>
            <FormField label="UPI Transaction ID" required>
              <Input type="text" value={upiTransactionId} onChange={(e) => setUpiTransactionId(e.target.value)} placeholder="Enter UPI reference after payment" disabled={submittingPayment} className="font-semibold" />
            </FormField>
            <p className="text-[10px] font-semibold text-text-muted">Trip will be closed and vehicle released after confirmation.</p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={detailModalOpen}
        onClose={closeExpenseDetail}
        title={selectedExpense?.expenseCode ? `Expense ${selectedExpense.expenseCode}` : 'Expense details'}
        size="lg"
        footer={
          selectedExpense?.status === 'PENDING' ? (
            <>
              <AdminBtn variant="outline" onClick={closeExpenseDetail} disabled={detailActionLoading}>
                Close
              </AdminBtn>
              <AdminBtn variant="danger" onClick={() => rejectExpenseWithTripSync(selectedExpense)} loading={detailActionLoading}>
                Reject
              </AdminBtn>
              <AdminBtn variant="primary" onClick={() => approveExpenseWithTripSync(selectedExpense)} loading={detailActionLoading}>
                Approve
              </AdminBtn>
            </>
          ) : (
            <AdminBtn variant="outline" onClick={closeExpenseDetail}>
              Close
            </AdminBtn>
          )
        }
      >
        {loadingDetail ? (
          <p className="text-sm text-text-secondary py-8 text-center">Loading expense details…</p>
        ) : selectedExpense ? (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-erp border border-border-strong bg-surface-muted/40">
              <div>
                <span className="text-[9px] font-black uppercase text-text-muted">Type</span>
                <p className="font-bold text-text-primary">{selectedExpense.expenseType || '—'}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-text-muted">Payee</span>
                <p className="font-bold text-text-primary">{selectedExpense.payee || '—'}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-text-muted">Amount</span>
                <p className="font-black text-red-700 tabular-nums">₹{Number(selectedExpense.amount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-text-muted">Status</span>
                <div className="mt-0.5"><StatusBadge status={selectedExpense.status} /></div>
              </div>
            </div>

            {selectedExpense.remarks && (
              <div className="p-3 rounded-erp border border-card-border">
                <span className="text-[9px] font-black uppercase text-text-muted">Remarks</span>
                <p className="mt-1 font-semibold text-text-secondary">{selectedExpense.remarks}</p>
              </div>
            )}

            {detailTrip && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-brand-olive">Linked trip settlement</h4>
                  {detailTapal?._id && (
                    <AdminBtn
                      variant="outline"
                      onClick={() => navigate(`/admin/tapals/${detailTapal._id || detailTapal.id}`)}
                    >
                      <ExternalLink size={12} /> Open tapal
                    </AdminBtn>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-erp border border-card-border bg-white text-[11px]">
                  <p><span className="text-text-muted font-bold">Trip:</span> {detailTrip.tripNumber || '—'}</p>
                  <p><span className="text-text-muted font-bold">Tapal:</span> {detailPostTrip?.tapalNo || detailTapal?.tapalNumber || '—'}</p>
                  <p><span className="text-text-muted font-bold">Driver:</span> {detailPostTrip?.driverName || detailTrip.driverId?.fullName || '—'}</p>
                  <p><span className="text-text-muted font-bold">Vehicle:</span> {detailPostTrip?.vehicleNumber || detailTrip.vehicleId?.plateNumber || '—'}</p>
                  <p><span className="text-text-muted font-bold">Load:</span> {detailPostTrip?.loadingPoint || detailTrip.pickupLocation || '—'}</p>
                  <p><span className="text-text-muted font-bold">Unload:</span> {detailPostTrip?.unloadingPoint || detailTrip.deliveryLocation || '—'}</p>
                  <p><span className="text-text-muted font-bold">KMs:</span> {detailPostTrip?.startingKms ?? '—'} → {detailPostTrip?.endingKms ?? '—'} ({detailPostTrip?.totalKms ?? '—'} km)</p>
                  <p><span className="text-text-muted font-bold">Mileage:</span> {detailPostTrip?.mileage ?? '—'}</p>
                  <p><span className="text-text-muted font-bold">Sheet status:</span> {detailPostTrip?.status || '—'}</p>
                </div>

                {detailPostTrip ? (
                  <>
                    <TripExpenseSummary postTrip={detailPostTrip} />
                    {(detailPostTrip.pumps || []).length > 0 && (
                      <div className="rounded-erp border border-card-border overflow-hidden">
                        <p className="text-[10px] font-black uppercase tracking-wider bg-surface-muted px-3 py-2 border-b border-card-border">Pump entries</p>
                        <ul className="divide-y divide-card-border">
                          {detailPostTrip.pumps.map((p, i) => (
                            <li key={i} className="flex justify-between px-3 py-2 font-semibold">
                              <span>{p.name || `Pump ${i + 1}`} · {p.litres || 0} L</span>
                              <span className="tabular-nums">₹{Number(p.amount || 0).toLocaleString('en-IN')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[11px] text-amber-700 font-semibold p-3 bg-amber-50 border border-amber-200 rounded-erp">
                    No End Trip Sheet on this trip yet — driver must submit from the driver app.
                  </p>
                )}

                {(detailTrip.expenses || []).length > 0 && (
                  <div className="rounded-erp border border-card-border overflow-hidden">
                    <p className="text-[10px] font-black uppercase tracking-wider bg-surface-muted px-3 py-2 border-b border-card-border">Expense line items</p>
                    <ul className="divide-y divide-card-border">
                      {detailTrip.expenses.map((line, i) => (
                        <li key={i} className="flex justify-between px-3 py-2 font-semibold text-[11px]">
                          <span>{line.expenseType} — {line.remarks || '—'}</span>
                          <span className="tabular-nums text-red-700">₹{Number(line.amount || 0).toLocaleString('en-IN')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {detailPostTrip?.status === 'APPROVED' && (detailPostTrip.paymentStatus || 'UNPAID') !== 'PAID' && (
                  <AdminBtn
                    variant="primary"
                    onClick={() => {
                      closeExpenseDetail();
                      openPaymentModal({
                        ...detailTrip,
                        id: detailTrip._id || detailTrip.id,
                        driverName: detailPostTrip.driverName || detailTrip.driverId?.fullName,
                        postTripExpenses: detailPostTrip,
                      });
                    }}
                  >
                    <Wallet size={12} /> Pay via UPI
                  </AdminBtn>
                )}
              </div>
            )}

            {!detailTrip && selectedExpense.linkedTripId && (
              <p className="text-[11px] text-text-secondary">Linked trip could not be loaded. Refresh the page and try again.</p>
            )}

            <p className="text-[10px] text-text-muted">
              Created: {selectedExpense.createdAt ? new Date(selectedExpense.createdAt).toLocaleString('en-IN') : '—'}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ExpenseReviewPage;

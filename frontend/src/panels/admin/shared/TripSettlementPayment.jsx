import React, { useState } from 'react';
import { Wallet, CheckCircle2, IndianRupee } from 'lucide-react';
import { FormField } from '../../../design-system/components/FormField';
import { Input } from '../../../design-system/components/Input';
import { AdminBtn } from '../shared/adminUi';

const EXPENSE_LINES = [
  { key: 'diesel', label: 'Diesel (Self-filled)' },
  { key: 'tollFastag', label: 'Toll / FASTag' },
  { key: 'rtoPcRmc', label: 'RTO / PC / RMC' },
  { key: 'maintenance', label: 'Maintenance' },
  { key: 'driverBatta', label: 'Driver Batta' },
  { key: 'halting', label: 'Halting' },
  { key: 'pumpTotal', label: 'Pump Station' },
];

export const TripExpenseSummary = ({ postTrip, compact = false }) => {
  if (!postTrip) return null;
  const pad = compact ? 'p-2' : 'p-3';

  return (
    <div className={`rounded-erp border border-border-strong bg-surface-muted/50 ${compact ? 'text-[11px]' : 'text-xs'}`}>
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-2 ${pad} border-b border-card-border`}>
        <div>
          <span className="text-[9px] font-black uppercase text-text-muted">Total Expenses</span>
          <p className="font-black text-red-700 tabular-nums">₹{Number(postTrip.totalExpenses || 0).toLocaleString('en-IN')}</p>
        </div>
        <div>
          <span className="text-[9px] font-black uppercase text-text-muted">Less Advance</span>
          <p className="font-black text-text-secondary tabular-nums">₹{Number(postTrip.lessAdvance || 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="sm:col-span-2">
          <span className="text-[9px] font-black uppercase text-text-muted">Net Payable to Driver</span>
          <p className="text-lg font-black text-amber-700 tabular-nums">₹{Number(postTrip.balancePayable || 0).toLocaleString('en-IN')}</p>
        </div>
      </div>
      <ul className={`divide-y divide-card-border ${compact ? 'max-h-40 overflow-y-auto' : ''}`}>
        {EXPENSE_LINES.map(({ key, label }) => (
          <li key={key} className="flex justify-between px-3 py-1.5 font-semibold text-text-secondary">
            <span>{label}</span>
            <span className="tabular-nums">₹{Number(postTrip[key] || 0).toLocaleString('en-IN')}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const TripSettlementPaymentForm = ({
  trip,
  onConfirm,
  loading = false,
  inline = false,
}) => {
  const postTrip = trip?.postTripExpenses;
  const payable = Number(postTrip?.balancePayable || 0);
  const [paidAmount, setPaidAmount] = useState(String(payable || ''));
  const [upiTransactionId, setUpiTransactionId] = useState('');

  if (!postTrip || postTrip.status !== 'APPROVED' || postTrip.paymentStatus === 'PAID') {
    return null;
  }

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const amountNum = parseFloat(paidAmount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) return;
    if (!upiTransactionId.trim()) return;
    await onConfirm(amountNum, upiTransactionId.trim());
  };

  return (
    <div className={`rounded-erp border-2 border-accent/30 bg-white shadow-erp-md ${inline ? 'p-4' : ''}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-9 h-9 rounded-erp bg-accent/15 flex items-center justify-center text-accent">
          <Wallet size={18} />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-brand-olive">Driver Payment — Mark Complete</h4>
          <p className="text-[10px] font-semibold text-text-secondary">Enter UPI transaction ID to close trip & release vehicle</p>
        </div>
      </div>

      <TripExpenseSummary postTrip={postTrip} compact={inline} />

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Paid Amount (₹)" required>
          <div className="relative">
            <IndianRupee size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="number"
              min="0.01"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              disabled={loading}
              className="pl-8 font-bold"
            />
          </div>
        </FormField>
        <FormField label="UPI Transaction ID" required>
          <Input
            type="text"
            value={upiTransactionId}
            onChange={(e) => setUpiTransactionId(e.target.value)}
            placeholder="e.g. 413245678901"
            disabled={loading}
            className="font-semibold"
          />
        </FormField>
        <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
          <AdminBtn variant="primary" type="submit" loading={loading} className="gap-1.5">
            <CheckCircle2 size={14} /> Confirm Payment & Mark Complete
          </AdminBtn>
        </div>
      </form>
    </div>
  );
};

export default TripSettlementPaymentForm;

import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';
import { FieldPageWrap } from '../../design-system/field-app';

const BuyerReconciliation = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerPortalService
      .getReconciliation()
      .then((res) => setData(res?.data || res))
      .catch((err) => toast.error(err?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FieldPageWrap subtitle="Balance & settlement">
      <h1 className="text-lg font-bold">Settlement</h1>
      <p className="text-[11px] fa-muted mb-4">Bills, returns, and balance due</p>

      {loading ? (
        <p className="text-sm fa-muted py-8 text-center">Loading settlement…</p>
      ) : !data ? (
        <div className="fa-empty-state">
          <p className="text-sm font-semibold">Could not load settlement</p>
        </div>
      ) : (
        <div className="fa-surface p-5 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <span className="fa-muted">Total billed</span>
          <span className="font-bold">₹{(data.totalBilled || 0).toLocaleString('en-IN')}</span>
        </div>
        {(data.totalPaid || 0) > 0 && (
          <div className="flex justify-between gap-4">
            <span className="fa-muted">Paid to company</span>
            <span className="font-bold text-emerald-400">
              ₹{(data.totalPaid || 0).toLocaleString('en-IN')}
            </span>
          </div>
        )}
          <div className="flex justify-between gap-4">
            <span className="fa-muted">Returns (completed)</span>
            <span className="font-bold text-[var(--fa-danger)]">
              ₹{(data.totalReturned || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="fa-muted">Pending returns</span>
            <span>₹{(data.pendingReturns || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t border-[var(--fa-border)] pt-3 flex justify-between text-base">
            <span className="font-bold uppercase text-xs">Balance due</span>
            <span className="font-bold fa-amount-positive">
              ₹{(data.balanceDue || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <p className="text-[10px] fa-muted pt-2">
            {data.bills} bills · {data.returns} return requests
          </p>
        </div>
      )}
    </FieldPageWrap>
  );
};

export default BuyerReconciliation;

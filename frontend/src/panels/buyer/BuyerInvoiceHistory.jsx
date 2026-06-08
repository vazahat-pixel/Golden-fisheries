import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { Printer } from 'lucide-react';
import { FieldPageWrap } from '../../design-system/field-app';

const BuyerInvoiceHistory = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printBill, setPrintBill] = useState(null);

  useEffect(() => {
    buyerPortalService
      .listBills()
      .then((res) => setBills(Array.isArray(res?.data) ? res.data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <FieldPageWrap subtitle="Your generated bills">
      <h1 className="text-lg font-bold">Invoice history</h1>
      <p className="text-[11px] fa-muted mb-4">Bills generated after verification</p>

      {loading ? (
        <p className="text-sm fa-muted py-8 text-center">Loading…</p>
      ) : bills.length === 0 ? (
        <div className="fa-empty-state">
          <p className="text-sm font-semibold">No bills yet</p>
          <p className="text-[11px] fa-muted mt-2">Verify a tapal, then generate a bill</p>
        </div>
      ) : (
        <div className="space-y-3 no-print">
          {bills.map((b) => (
            <div key={b._id} className="fa-surface p-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <span className="font-bold text-sm">{b.billNo}</span>
                  <p className="text-[10px] fa-muted mt-1">
                    {b.item} — {b.finalWeight} KG @ ₹{b.ratePerKg}
                  </p>
                  <p className="text-lg font-bold mt-2 fa-amount-positive">
                    ₹{b.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintBill(b)}
                  className="text-[10px] font-bold uppercase flex items-center gap-1 text-[var(--fa-accent)] fa-tap shrink-0"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {printBill && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-[var(--fa-surface)] w-full max-w-lg my-8 rounded-[var(--fa-radius-lg)] border border-[var(--fa-border)]">
            <div className="no-print p-3 flex justify-between border-b border-[var(--fa-border)]">
              <button type="button" onClick={() => setPrintBill(null)} className="text-sm font-bold fa-tap">
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-sm font-bold uppercase flex items-center gap-1 text-[var(--fa-accent)] fa-tap"
              >
                <Printer size={14} /> Print
              </button>
            </div>
            <div className="print-root p-6 border-2 border-black m-4 text-sm bg-white text-black rounded-md">
              <h2 className="text-center font-bold uppercase border-b pb-2 mb-3">Buyer Bill</h2>
              <p>
                <strong>Bill No:</strong> {printBill.billNo}
              </p>
              <p>
                <strong>Tapal:</strong> {printBill.tapal?.tapalNumber || printBill.tapalRef}
              </p>
              <p>
                <strong>Item:</strong> {printBill.item}
              </p>
              <p>
                <strong>Weight:</strong> {printBill.finalWeight} KG
              </p>
              <p>
                <strong>Rate:</strong> ₹{printBill.ratePerKg}/KG
              </p>
              <p className="mt-3 text-lg font-bold border-t pt-2">
                Total: ₹{printBill.totalAmount?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      )}
    </FieldPageWrap>
  );
};

export default BuyerInvoiceHistory;

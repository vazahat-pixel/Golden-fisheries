import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { Printer } from 'lucide-react';

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
    <div className="space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Invoice History</h1>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : bills.length === 0 ? (
        <p className="text-sm text-slate-400">No bills yet</p>
      ) : (
        <div className="space-y-3 no-print">
          {bills.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-black text-sm">{b.billNo}</span>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {b.item} — {b.finalWeight} KG @ ₹{b.ratePerKg}
                  </p>
                  <p className="text-lg font-black text-slate-900 mt-2">
                    ₹{b.totalAmount?.toLocaleString('en-IN')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintBill(b)}
                  className="text-[10px] font-bold uppercase flex items-center gap-1 text-blue-600"
                >
                  <Printer size={14} /> Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {printBill && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg my-8">
            <div className="no-print p-3 flex justify-between border-b">
              <button type="button" onClick={() => setPrintBill(null)} className="text-sm font-bold">
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="text-sm font-bold uppercase flex items-center gap-1"
              >
                <Printer size={14} /> Print
              </button>
            </div>
            <div className="print-root p-6 border-2 border-black m-4 text-sm">
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
    </div>
  );
};

export default BuyerInvoiceHistory;

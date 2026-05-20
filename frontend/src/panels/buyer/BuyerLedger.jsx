import React, { useEffect, useState } from 'react';
import { FileText, IndianRupee } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAdminStore } from '../../store/adminStore';

const BuyerLedger = () => {
  const { invoices, fetchInvoices } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices().finally(() => setLoading(false));
  }, [fetchInvoices]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="border-b border-card-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
          <IndianRupee className="text-brand-yellow" size={24} /> Financial Ledger
        </h1>
        <p className="text-text-secondary text-sm mt-1">View your outstanding balance and past invoices.</p>
      </div>

      <div className="bg-white border border-card-border p-8 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-1">Total Outstanding Balance</p>
          <h2 className="text-3xl font-extrabold text-brand-olive">₹ 0.00</h2>
        </div>
        <button className="bg-brand-olive text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all shadow-sm">
          Pay Now
        </button>
      </div>

      <div className="bg-white border border-card-border shadow-sm overflow-hidden mt-6">
        <div className="p-4 border-b border-card-border">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Invoice History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Invoice No</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Date</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Amount</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Status</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">Loading Invoices...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted italic">No invoices found.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id || inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-black text-brand-olive">#{inv.id || inv.invoiceNumber}</td>
                    <td className="py-4 px-4 font-medium text-text-secondary">{inv.date || 'N/A'}</td>
                    <td className="py-4 px-4 font-extrabold">{inv.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm ${
                        inv.status?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {inv.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toast.success('Invoice preview opened')}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-olive hover:text-brand-yellow transition-colors"
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyerLedger;

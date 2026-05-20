import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { Printer, ArrowLeft } from 'lucide-react';

const BuyerBillView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { invoices, fetchInvoices } = useAdminStore();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (invoices.length === 0) fetchInvoices();
  }, [fetchInvoices, invoices.length]);

  useEffect(() => {
    const found = invoices.find(i => i.id === id || i._id === id);
    if (found) setInvoice(found);
  }, [id, invoices]);

  if (!invoice) return <div className="p-8 text-center text-text-muted">Loading Invoice...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center print:hidden mb-6">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-[#6A7051] transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-brand-olive text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-sm"
        >
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Invoice Paper format */}
      <div className="bg-white border border-card-border p-10 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex justify-between items-start border-b-2 border-brand-olive pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-olive uppercase tracking-tighter">GOLDEN FISHERIES</h1>
            <p className="text-xs font-bold text-text-secondary mt-1">Regd. Office: Karwar Shore, Karnataka</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-brand-olive uppercase tracking-widest">TAX INVOICE</h2>
            <p className="text-sm font-bold text-text-secondary mt-1">Inv No: #{invoice.id || invoice.invoiceNumber}</p>
            <p className="text-sm font-bold text-text-secondary">Date: {invoice.date}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Billed To:</p>
            <p className="text-lg font-extrabold uppercase text-brand-olive">{invoice.client || 'BUYER'}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-text-muted tracking-widest mb-1">Associated Tapal:</p>
            <p className="text-sm font-bold uppercase">TP #{invoice.tapalId || 'N/A'}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-8">
          <thead>
            <tr className="bg-slate-100 border-b border-card-border">
              <th className="py-3 px-4 text-xs font-black uppercase text-brand-olive">Description</th>
              <th className="py-3 px-4 text-xs font-black uppercase text-brand-olive text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            <tr>
              <td className="py-4 px-4 text-sm font-bold uppercase">Fish Sales (Consolidated)</td>
              <td className="py-4 px-4 text-sm font-black text-right">{invoice.amount}</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span>Subtotal:</span>
              <span>{invoice.amount}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-brand-olive border-t-2 border-brand-olive pt-3">
              <span>Total:</span>
              <span>{invoice.amount}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-card-border text-center text-xs text-text-muted font-bold">
          <p>This is a computer generated invoice and does not require a signature.</p>
        </div>
      </div>
    </div>
  );
};

export default BuyerBillView;

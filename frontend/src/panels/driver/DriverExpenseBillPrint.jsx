import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { Printer, ArrowLeft } from 'lucide-react';

const DriverExpenseBillPrint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips } = useAdminStore();
  
  const trip = trips.find(t => t.id === id || t._id === id);

  if (!trip) return <div className="p-8 text-center">Trip not found</div>;

  const totalExpense = trip.expenses?.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12 max-w-2xl mx-auto">
      <div className="flex justify-between items-center print:hidden mb-6">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-[#6A7051] transition-all flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
          <ArrowLeft size={16} /> Back
        </button>
        <button 
          onClick={() => window.print()}
          className="bg-brand-olive text-white px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-sm"
        >
          <Printer size={16} /> Print Voucher
        </button>
      </div>

      <div className="bg-white border border-card-border p-8 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="text-center border-b-2 border-brand-olive pb-4 mb-6">
          <h1 className="text-2xl font-extrabold text-brand-olive uppercase tracking-tighter">GOLDEN FISHERIES</h1>
          <h2 className="text-lg font-black uppercase tracking-widest mt-1">TRIP EXPENSE VOUCHER</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p><span className="font-bold text-text-muted w-24 inline-block uppercase">Trip No:</span> <span className="font-black">{trip.tripNumber || trip.id}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block uppercase">Driver:</span> <span className="font-black uppercase">{trip.driverName}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block uppercase">Vehicle:</span> <span className="font-black uppercase">{trip.vehicle}</span></p>
          </div>
          <div className="text-right">
            <p><span className="font-bold text-text-muted inline-block uppercase mr-2">Status:</span> <span className="font-black uppercase">{trip.status}</span></p>
            <p><span className="font-bold text-text-muted inline-block uppercase mr-2">Route:</span> <span className="font-black uppercase">{trip.pickupLocation?.split(',')[0]} to {trip.deliveryLocation?.split(',')[0]}</span></p>
          </div>
        </div>

        <table className="w-full text-left border-collapse mb-6">
          <thead>
            <tr className="bg-slate-100 border-b border-card-border">
              <th className="py-2 px-3 text-xs font-black uppercase text-brand-olive">Date</th>
              <th className="py-2 px-3 text-xs font-black uppercase text-brand-olive">Category</th>
              <th className="py-2 px-3 text-xs font-black uppercase text-brand-olive">Remarks</th>
              <th className="py-2 px-3 text-xs font-black uppercase text-brand-olive text-right">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border text-sm">
            {trip.expenses?.length > 0 ? trip.expenses.map((exp, idx) => (
              <tr key={idx}>
                <td className="py-3 px-3 font-medium">{new Date().toLocaleDateString()}</td>
                <td className="py-3 px-3 font-black uppercase">{exp.expenseType || exp.type}</td>
                <td className="py-3 px-3 text-text-secondary">{exp.remarks || '-'}</td>
                <td className="py-3 px-3 text-right font-bold">{parseFloat(exp.amount).toFixed(2)}</td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="py-4 text-center italic text-text-muted">No expenses recorded.</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-brand-olive">
              <td colSpan="3" className="py-3 px-3 text-right font-black uppercase">Total Expenses:</td>
              <td className="py-3 px-3 text-right font-black text-lg text-brand-olive">₹{totalExpense.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="flex justify-between mt-16 pt-8 border-t border-card-border text-sm font-bold uppercase text-text-muted">
          <div className="text-center w-32 border-t border-text-muted pt-2">Driver Signature</div>
          <div className="text-center w-32 border-t border-text-muted pt-2">Admin Signature</div>
        </div>
      </div>
    </div>
  );
};

export default DriverExpenseBillPrint;

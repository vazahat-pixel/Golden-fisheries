import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { Receipt, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverTripExpenseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTripExpense } = useAdminStore();
  
  const [expenseType, setExpenseType] = useState('FUEL');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      toast.error('Please enter the expense amount.');
      return;
    }

    const loadToast = toast.loading('Submitting expense...');
    try {
      await addTripExpense(id, { expenseType, amount: parseFloat(amount), remarks });
      toast.success('Expense submitted successfully!', { id: loadToast });
      navigate(-1);
    } catch (err) {
      toast.error('Failed to submit expense.', { id: loadToast });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12 max-w-lg mx-auto">
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate(-1)} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Receipt className="text-brand-yellow" size={24} /> Log Trip Expense
          </h1>
          <p className="text-text-secondary text-sm mt-1">Trip #{id}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-card-border p-6 shadow-sm space-y-6">
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Expense Category</label>
            <select
              value={expenseType}
              onChange={e => setExpenseType(e.target.value)}
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-1 focus:ring-brand-olive outline-none font-bold"
            >
              <option value="FUEL">Fuel</option>
              <option value="TOLL">Toll Tax</option>
              <option value="LOADING">Loading Charges</option>
              <option value="UNLOADING">Unloading Charges</option>
              <option value="MAINTENANCE">Vehicle Maintenance</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Amount (₹)</label>
            <input 
              type="number" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="bg-white border border-card-border px-4 py-3 text-xl focus:ring-1 focus:ring-brand-olive outline-none font-black text-brand-olive"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Remarks / Details</label>
            <textarea 
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows="3"
              placeholder="Optional details..."
              className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-1 focus:ring-brand-olive outline-none resize-none"
            ></textarea>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-brand-olive text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Send size={18} /> Submit Expense
        </button>
      </form>
    </div>
  );
};

export default DriverTripExpenseForm;

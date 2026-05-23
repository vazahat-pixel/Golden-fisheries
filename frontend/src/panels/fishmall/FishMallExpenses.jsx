import React, { useState } from 'react';
import { Wallet, Plus, Trash2, Calendar, Tag, IndianRupee, Filter } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useFishMallStore } from '../../store/fishMallStore';
import { toast } from 'react-hot-toast';

const FishMallExpenses = () => {
  const { expenses, submitExpenseAsync, fetchExpensesAsync, activeSession } = useFishMallStore();
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    fetchExpensesAsync();
  }, [fetchExpensesAsync]);

  const [formData, setFormData] = useState({
    category: 'ICE',
    amount: '',
    payee: '',
    paymentMethod: 'CASH',
    remarks: ''
  });

  const categories = ['ICE', 'PACKING', 'CLEANING', 'TRANSPORT', 'PETROL', 'LABOR', 'MAINTENANCE', 'MISCELLANEOUS'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.payee) {
      toast.error('Please enter both amount and payee');
      return;
    }
    setSubmitting(true);
    try {
      await submitExpenseAsync({
        category: formData.category,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        payee: formData.payee,
        remarks: formData.remarks
      });
      setFormData({ ...formData, amount: '', payee: '', remarks: '' });
      toast.success('Operational expense recorded successfully');
    } catch (err) {
      toast.error(err?.message || 'Failed to save expense');
    } finally {
      setSubmitting(false);
    }
  };

  const totalToday = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  if (!activeSession) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl shadow-xl p-8 text-center space-y-4">
          <Wallet className="mx-auto text-gray-300" size={48} />
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-widest">Shift Closed</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-normal">
            No active open shift session was found. Day cannot start without opening balance. Please open shift on Terminal Dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 border border-gray-100 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
            <Wallet className="text-[#6B7550]" /> Expense Terminal
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Manage local fish mall operational costs</p>
        </div>
        <div className="bg-[#6B7550]/5 px-6 py-3 rounded-xl border border-[#6B7550]/10">
          <p className="text-[9px] font-black text-[#6B7550] uppercase tracking-[0.2em] mb-1">Shift Expenses</p>
          <p className="text-2xl font-black text-gray-900 leading-none">₹{totalToday.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Entry Form */}
        <div className="bg-white p-6 border border-gray-100 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-3">Log New Expense</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Category</label>
              <select 
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-[10px] font-bold uppercase outline-none focus:border-[#6B7550] rounded-xl transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Amount (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input 
                  type="number"
                  placeholder="0.00"
                  required
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3.5 text-[10px] font-bold outline-none focus:border-[#6B7550] rounded-xl transition-all"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payee / Recipient Name</label>
              <input 
                type="text"
                placeholder="e.g. Ice vendor, Transport driver"
                required
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3.5 text-[10px] font-bold outline-none focus:border-[#6B7550] rounded-xl transition-all"
                value={formData.payee}
                onChange={e => setFormData({...formData, payee: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Payment Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {['CASH', 'UPI'].map(method => (
                  <button 
                    type="button"
                    key={method}
                    onClick={() => setFormData({...formData, paymentMethod: method})}
                    className={`py-3 rounded-xl border transition-all text-[9px] font-black uppercase tracking-widest ${
                      formData.paymentMethod === method 
                        ? 'bg-black text-white border-black' 
                        : 'border-gray-200 text-gray-400 bg-gray-50'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Remarks / Description</label>
              <textarea 
                placeholder="Details of expense..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-[10px] font-bold outline-none focus:border-[#6B7550] rounded-xl transition-all h-16 resize-none"
                value={formData.remarks}
                onChange={e => setFormData({...formData, remarks: e.target.value})}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full py-4 bg-[#6B7550] hover:bg-black text-[10px] font-black uppercase tracking-widest gap-2 rounded-xl transition-all">
              <Plus size={16} /> Record Expense
            </Button>
          </form>
        </div>

        {/* Expense Log */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Shift Expense Ledger</h2>
            <span className="text-[8px] font-black text-[#6B7550] uppercase tracking-widest bg-[#6B7550]/5 px-2 py-0.5 rounded">Active Shift</span>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Code</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Category</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Recipient</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Remarks</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Mode</th>
                  <th className="px-6 py-4 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Tag size={40} className="mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No expenses recorded in this shift yet</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense._id || expense.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[10px] font-black text-gray-900">{expense.expenseCode || 'FME-0000'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-[#6B7550]/10 text-[#6B7550]">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase">
                        {expense.payee}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-medium text-gray-500 uppercase tracking-tight max-w-xs truncate">
                        {expense.remarks || 'No remarks'}
                      </td>
                      <td className="px-6 py-4 text-[9px] text-gray-500 font-bold uppercase">
                        {expense.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[11px] font-black text-gray-900 tracking-tight">₹{expense.amount.toLocaleString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishMallExpenses;

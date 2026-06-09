import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseService } from '../../services/expenseService';
import { toast } from 'react-hot-toast';

const DriverAddExpense = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ category: 'DIESEL', amount: '', remarks: '', tripId: '' });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await expenseService.create({
        category: form.category,
        amount: parseFloat(form.amount),
        remarks: form.remarks,
        trip: form.tripId || undefined,
      });
      toast.success('Expense submitted');
      navigate('/driver/expenses');
    } catch (err) {
      toast.error(err?.message || 'Submit failed');
    }
  };

  return (
    <form onSubmit={submit} className="w-full space-y-4">
      <h1 className="text-lg font-black uppercase">Add expense</h1>
      <select
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.category}
        onChange={(e) => setForm({ ...form, category: e.target.value })}
      >
        {['DIESEL', 'TOLL', 'REPAIR', 'HALTING', 'OTHER'].map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <input
        type="number"
        required
        placeholder="Amount (₹)"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
      />
      <input
        placeholder="Trip ID (optional)"
        className="w-full border rounded-lg px-3 py-2 text-sm"
        value={form.tripId}
        onChange={(e) => setForm({ ...form, tripId: e.target.value })}
      />
      <textarea
        className="w-full border rounded-lg px-3 py-2 text-sm"
        rows={2}
        placeholder="Remarks"
        value={form.remarks}
        onChange={(e) => setForm({ ...form, remarks: e.target.value })}
      />
      <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase">
        Submit
      </button>
    </form>
  );
};

export default DriverAddExpense;

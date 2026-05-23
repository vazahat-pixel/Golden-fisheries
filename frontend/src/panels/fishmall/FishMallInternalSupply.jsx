import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowRightLeft, Plus, Trash2, FileText, History } from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';
import { fishmallService } from '../../services/fishmallService';
import { Button } from '../../design-system/components/Button';

const emptyLine = () => ({ fishMallItemId: '', quantity: '', rate: '' });

const FishMallInternalSupply = () => {
  const { stock, fetchStock } = useFishMallStore();
  const [lines, setLines] = useState([emptyLine()]);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState('bill');

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const loadHistory = async () => {
    try {
      const res = await fishmallService.listInternalBills({ limit: 30 });
      const payload = res?.data?.data ?? res?.data;
      setHistory(Array.isArray(payload) ? payload : payload?.docs || []);
    } catch {
      toast.error('Could not load internal bill history');
    }
  };

  useEffect(() => {
    if (tab === 'history') loadHistory();
  }, [tab]);

  const updateLine = (idx, field, value) => {
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l))
    );
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const linePreview = (line) => {
    const item = stock.find((s) => String(s.id) === String(line.fishMallItemId));
    const qty = parseFloat(line.quantity) || 0;
    const rate = parseFloat(line.rate) || item?.rate || 0;
    return { item, amount: qty * rate };
  };

  const total = lines.reduce((sum, l) => sum + linePreview(l).amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const items = lines
      .map((l) => ({
        fishMallItemId: l.fishMallItemId,
        quantity: parseFloat(l.quantity),
        ...(l.rate !== '' && { rate: parseFloat(l.rate) }),
      }))
      .filter((l) => l.fishMallItemId && l.quantity > 0);

    if (!items.length) {
      toast.error('Add at least one valid line');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fishmallService.createInternalBillToRestaurant({
        items,
        remarks: remarks || undefined,
      });
      const bill = res?.data?.data?.bill || res?.data?.bill;
      toast.success(
        bill?.invoiceNumber
          ? `Internal bill ${bill.invoiceNumber} issued — Restaurant stock updated`
          : 'Internal bill issued'
      );
      setLines([emptyLine()]);
      setRemarks('');
      await fetchStock();
      if (tab === 'history') loadHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue internal bill');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="text-emerald-600" />
          Bill Restaurant (Internal Supply)
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Fish Mall stock decreases; Restaurant kitchen stock increases. Procurement inventory is
          not affected.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setTab('bill')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            tab === 'bill'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500'
          }`}
        >
          New Bill
        </button>
        <button
          type="button"
          onClick={() => setTab('history')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1 ${
            tab === 'history'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500'
          }`}
        >
          <History size={16} /> History
        </button>
      </div>

      {tab === 'bill' ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          {lines.map((line, idx) => {
            const { item, amount } = linePreview(line);
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-slate-100 pb-4"
              >
                <div className="md:col-span-5">
                  <label className="text-xs font-medium text-slate-500">Fish Mall SKU</label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={line.fishMallItemId}
                    onChange={(e) => updateLine(idx, 'fishMallItemId', e.target.value)}
                    required
                  >
                    <option value="">Select item</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.qty} KG @ ₹{s.rate}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500">Qty (KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={line.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    required
                  />
                  {item && parseFloat(line.quantity) > item.qty && (
                    <p className="text-xs text-red-600 mt-1">Exceeds available {item.qty} KG</p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500">Rate (₹/KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={item?.rate ?? ''}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={line.rate}
                    onChange={(e) => updateLine(idx, 'rate', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 text-sm font-semibold text-slate-700">
                  ₹{amount.toFixed(2)}
                </div>
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="p-2 text-slate-400 hover:text-red-600"
                    aria-label="Remove line"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}

          <Button type="button" variant="outline" onClick={addLine} className="gap-1">
            <Plus size={16} /> Add line
          </Button>

          <div>
            <label className="text-xs font-medium text-slate-500">Remarks</label>
            <input
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Optional note for kitchen / accounts"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-lg font-bold text-slate-900">Total: ₹{total.toFixed(2)}</span>
            <Button type="submit" disabled={submitting}>
              <FileText size={16} className="mr-2" />
              {submitting ? 'Issuing…' : 'Issue internal bill'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Invoice</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Lines</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No internal bills yet
                  </td>
                </tr>
              ) : (
                history.map((b) => (
                  <tr key={b._id} className="border-t border-slate-100">
                    <td className="p-3 font-mono font-medium">{b.invoiceNumber}</td>
                    <td className="p-3">
                      {b.createdAt ? new Date(b.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="p-3 text-right">₹{(b.totalAmount || 0).toFixed(2)}</td>
                    <td className="p-3 text-slate-600">
                      {(b.lines || []).map((l) => l.itemName).join(', ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FishMallInternalSupply;

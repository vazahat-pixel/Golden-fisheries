import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowRightLeft,
  Plus,
  Trash2,
  FileText,
  History,
  BarChart2,
  Store,
  Eye,
} from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';
import { fishmallService } from '../../services/fishmallService';
import { restaurantOutletService, unwrapOutletList } from '../../services/restaurantOutletService';
import { Button } from '../../design-system/components/Button';

const DEFAULT_DESTINATION = 'GF Restaurant Kitchen';

const emptyLine = () => ({ fishMallItemId: '', quantity: '', rate: '' });

const formatQty = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const FishMallInternalSupply = () => {
  const { stock, fetchStock } = useFishMallStore();
  const [lines, setLines] = useState([emptyLine()]);
  const [remarks, setRemarks] = useState('');
  const [destination, setDestination] = useState(DEFAULT_DESTINATION);
  const [destinations, setDestinations] = useState([{ id: 'RESTAURANT', label: DEFAULT_DESTINATION }]);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [daily, setDaily] = useState(null);
  const [tab, setTab] = useState('bill');
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetchStock();
    // Fetch restaurant outlets dynamically
    restaurantOutletService.list({ active: true })
      .then((res) => {
        const list = unwrapOutletList(res);
        if (list.length > 0) {
          setDestinations(list.map((o) => ({ id: o._id || o.id, label: o.name || o.outletName || 'GF Restaurant Kitchen' })));
          setDestination(list[0].name || list[0].outletName || DEFAULT_DESTINATION);
        }
      })
      .catch(() => {
        // Silently fall back to default
      });
  }, [fetchStock]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fishmallService.listInternalBills({ limit: 50 });
      const payload = res?.data ?? res;
      setHistory(Array.isArray(payload) ? payload : payload?.docs || []);
    } catch {
      toast.error('Could not load internal bill history');
    }
  }, []);

  const loadReports = useCallback(async () => {
    try {
      const [sumRes, dayRes] = await Promise.all([
        fishmallService.getInternalBillSummary(),
        fishmallService.getInternalBillDaily(),
      ]);
      setSummary(sumRes?.data ?? sumRes);
      setDaily(dayRes?.data ?? dayRes);
    } catch {
      setSummary(null);
      setDaily(null);
    }
  }, []);

  useEffect(() => {
    if (tab === 'history') loadHistory();
    if (tab === 'reports') loadReports();
  }, [tab, loadHistory, loadReports]);

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (idx) =>
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));

  const linePreview = (line) => {
    const item = stock.find((s) => String(s.id) === String(line.fishMallItemId));
    const qty = parseFloat(line.quantity) || 0;
    const rate = parseFloat(line.rate) || item?.rate || 0;
    const available = item?.qty ?? 0;
    const over = qty > available;
    return { item, amount: Math.round(qty * rate * 100) / 100, available, over };
  };

  const total = lines.reduce((sum, l) => sum + linePreview(l).amount, 0);
  const hasOverStock = lines.some((l) => linePreview(l).over);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasOverStock) {
      toast.error('One or more lines exceed available Fish Mall stock');
      return;
    }

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
        destinationName: destination,
      });
      const bill = res?.data?.data?.bill ?? res?.data?.bill;
      toast.success(
        bill?.invoiceNumber
          ? `Internal bill ${bill.invoiceNumber} issued — Awaiting Restaurant acceptance`
          : 'Internal bill issued'
      );
      setLines([emptyLine()]);
      setRemarks('');
      await fetchStock();
      setTab('history');
      loadHistory();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to issue internal bill');
    } finally {
      setSubmitting(false);
    }
  };

  const openBill = async (id) => {
    try {
      const res = await fishmallService.getInternalBill(id);
      const bill = res?.data?.bill ?? res?.data?.data?.bill;
      setSelectedBill(bill);
    } catch {
      toast.error('Could not load invoice');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ArrowRightLeft className="text-emerald-600" />
          Internal Bill — Restaurant
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Fish Mall stock decreases; Restaurant kitchen stock increases atomically. Procurement
          inventory is never used.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {[
          { id: 'bill', label: 'New bill', icon: FileText },
          { id: 'history', label: 'History', icon: History },
          { id: 'reports', label: 'Reports', icon: BarChart2 },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px flex items-center gap-1 ${
              tab === id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      {tab === 'bill' && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
                <Store size={12} /> Restaurant destination
              </label>
              <select
                className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-medium"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.label}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <p className="text-xs text-slate-500 pb-2">
                Invoice number is auto-generated (INT-####) on issue.
              </p>
            </div>
          </div>

          {lines.map((line, idx) => {
            const { item, amount, available, over } = linePreview(line);
            return (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end border-b border-slate-100 pb-4"
              >
                <div className="md:col-span-5">
                  <label className="text-xs font-medium text-slate-500">Fish Mall product</label>
                  <select
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    value={line.fishMallItemId}
                    onChange={(e) => updateLine(idx, 'fishMallItemId', e.target.value)}
                    required
                  >
                    <option value="">Select item</option>
                    {stock.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {formatQty(s.qty)} KG @ ₹{s.rate}
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
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    value={line.quantity}
                    onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                    required
                  />
                  {item && (
                    <p className={`text-xs mt-1 ${over ? 'text-red-600 font-bold' : 'text-emerald-700'}`}>
                      Available: {formatQty(available)} KG
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-500">Internal rate (₹/KG)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder={item?.rate != null ? String(item.rate) : ''}
                    className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono"
                    value={line.rate}
                    onChange={(e) => updateLine(idx, 'rate', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 text-sm font-semibold text-slate-700 font-mono">
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
            <label className="text-xs font-medium text-slate-500">Notes</label>
            <input
              className="w-full mt-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Kitchen / accounts note"
            />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-slate-100">
            <span className="text-lg font-bold text-slate-900 font-mono">
              Total: ₹{total.toFixed(2)}
            </span>
            <Button type="submit" disabled={submitting || hasOverStock}>
              <FileText size={16} className="mr-2" />
              {submitting ? 'Issuing…' : 'Issue internal bill'}
            </Button>
          </div>
        </form>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left p-3">Invoice</th>
                <th className="text-left p-3">Destination</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Lines</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500">
                    No internal bills yet
                  </td>
                </tr>
              ) : (
                history.map((b) => (
                  <tr key={b._id} className="border-t border-slate-100">
                    <td className="p-3 font-mono font-medium">{b.invoiceNumber}</td>
                    <td className="p-3">{b.destinationName || 'Restaurant'}</td>
                    <td className="p-3">{formatDate(b.billDate || b.createdAt)}</td>
                    <td className="p-3 text-right font-mono">₹{formatQty(b.totalAmount)}</td>
                    <td className="p-3 text-slate-600 text-xs">
                      {(b.lines || []).map((l) => l.itemName).join(', ')}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openBill(b._id)}
                        className="text-emerald-700 hover:underline flex items-center gap-1 text-xs font-bold"
                      >
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">All-time summary</h3>
            {summary ? (
              <ul className="space-y-2 text-sm font-mono">
                <li>Bills issued: {summary.totalBills ?? 0}</li>
                <li>Total value: ₹{formatQty(summary.totalInternalSupplyValue)}</li>
                <li>Total qty: {formatQty(summary.totalQuantityKg)} KG</li>
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">Loading…</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-3">Today</h3>
            {daily ? (
              <ul className="space-y-2 text-sm font-mono">
                <li>Date: {formatDate(daily.date)}</li>
                <li>Bills: {daily.billCount ?? 0}</li>
                <li>Amount: ₹{formatQty(daily.totalAmount)}</li>
                <li>Qty: {formatQty(daily.totalQuantityKg)} KG</li>
              </ul>
            ) : (
              <p className="text-slate-500 text-sm">Loading…</p>
            )}
          </div>
        </div>
      )}

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-lg w-full rounded-xl border p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="text-lg font-bold font-mono">{selectedBill.invoiceNumber}</h2>
              <button type="button" onClick={() => setSelectedBill(null)} className="text-2xl text-slate-400">
                ×
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              To: {selectedBill.destinationName} · ₹{formatQty(selectedBill.totalAmount)}
            </p>
            <ul className="text-sm space-y-2 border-t pt-3">
              {(selectedBill.lines || []).map((l, i) => (
                <li key={i} className="flex justify-between font-mono">
                  <span>
                    {l.itemName} {formatQty(l.quantity)} {l.unit}
                  </span>
                  <span>₹{formatQty(l.amount)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FishMallInternalSupply;

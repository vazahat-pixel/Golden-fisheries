import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowDownCircle,
  FileText,
  History,
  Package,
  RefreshCw,
} from 'lucide-react';
import { restaurantService } from '../../services/restaurantService';
import { useRestaurantStore } from '../../store/restaurantStore';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';

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

const RestaurantInternalReceives = () => {
  const navigate = useNavigate();
  const { fetchMenu, fetchKitchenStock, markAlertsRead } = useRestaurantStore();
  const [tab, setTab] = useState('bills');
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [receiveLogs, setReceiveLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);

  const loadBills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await restaurantService.listInternalSupplies({ limit: 50 });
      const payload = res?.data ?? res;
      setBills(Array.isArray(payload) ? payload : payload?.docs ?? []);
    } catch {
      setBills([]);
      toast.error('Could not load internal bills');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReceiveLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await restaurantService.getReceiveReport({ limit: 80 });
      const data = res?.data ?? res;
      setReceiveLogs(data?.receiveLogs ?? []);
      setSummary(data?.summary ?? null);
    } catch {
      setReceiveLogs([]);
      toast.error('Could not load receive history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    markAlertsRead?.();
    fetchKitchenStock?.();
    fetchMenu?.();
  }, [markAlertsRead, fetchKitchenStock, fetchMenu]);

  useEffect(() => {
    if (tab === 'bills') loadBills();
    if (tab === 'ledger') loadReceiveLogs();
  }, [tab, loadBills, loadReceiveLogs]);

  const openBill = async (id) => {
    try {
      const res = await restaurantService.getInternalSupply(id);
      const bill = res?.data?.bill ?? res?.data?.data?.bill;
      setSelectedBill(bill);
    } catch {
      toast.error('Could not load bill detail');
    }
  };

  const refreshKitchen = async () => {
    await fetchMenu();
    toast.success('Kitchen stock refreshed');
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 md:p-8 font-sans">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 border border-card-border flex items-center justify-center hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-black">
              Received from Fish Mall
            </h1>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.25em] mt-1">
              Internal billing only — procurement never feeds kitchen directly
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshKitchen} className="text-[10px] font-black uppercase">
            <Package size={14} className="mr-1" /> Refresh stock
          </Button>
          <Button
            variant="outline"
            onClick={() => (tab === 'bills' ? loadBills() : loadReceiveLogs())}
            className="text-[10px] font-black uppercase"
          >
            <RefreshCw size={14} className={`mr-1 ${loading ? 'animate-spin' : ''}`} />
            Reload
          </Button>
        </div>
      </header>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-card-border p-4">
            <p className="text-[9px] font-black uppercase text-text-muted">Internal bills</p>
            <p className="text-2xl font-black">{summary.totalBills ?? 0}</p>
          </div>
          <div className="bg-white border border-card-border p-4">
            <p className="text-[9px] font-black uppercase text-text-muted">Total received (₹)</p>
            <p className="text-2xl font-black">
              ₹{formatQty(summary.totalInternalSupplyValue)}
            </p>
          </div>
          <div className="bg-white border border-card-border p-4 col-span-2 md:col-span-1">
            <p className="text-[9px] font-black uppercase text-text-muted">Qty received (KG)</p>
            <p className="text-2xl font-black">{formatQty(summary.totalQuantityKg)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 border-b border-card-border mb-6">
        <button
          type="button"
          onClick={() => setTab('bills')}
          className={`px-4 py-2 text-[10px] font-black uppercase border-b-2 -mb-px flex items-center gap-1 ${
            tab === 'bills' ? 'border-accent-olive text-accent-olive' : 'border-transparent text-slate-500'
          }`}
        >
          <FileText size={14} /> Invoices
        </button>
        <button
          type="button"
          onClick={() => setTab('ledger')}
          className={`px-4 py-2 text-[10px] font-black uppercase border-b-2 -mb-px flex items-center gap-1 ${
            tab === 'ledger' ? 'border-accent-olive text-accent-olive' : 'border-transparent text-slate-500'
          }`}
        >
          <History size={14} /> Receive ledger
        </button>
      </div>

      {tab === 'bills' && (
        <div className="bg-white border border-card-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-600">
              <tr>
                <th className="text-left p-3">Invoice</th>
                <th className="text-left p-3">From</th>
                <th className="text-left p-3">Date</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Items</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-[11px] uppercase font-bold">
                    No internal bills received yet
                  </td>
                </tr>
              ) : (
                bills.map((b) => (
                  <tr key={b._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold">{b.invoiceNumber}</td>
                    <td className="p-3 text-slate-600">{b.destinationName || 'Restaurant'}</td>
                    <td className="p-3">{formatDate(b.billDate || b.createdAt)}</td>
                    <td className="p-3 text-right font-mono">₹{formatQty(b.totalAmount)}</td>
                    <td className="p-3 text-slate-600 text-xs">
                      {(b.lines || []).map((l) => `${l.itemName} (${formatQty(l.quantity)} KG)`).join(', ')}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openBill(b._id)}
                        className="text-[10px] font-black uppercase text-accent-olive hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'ledger' && (
        <div className="bg-white border border-card-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-600">
              <tr>
                <th className="text-left p-3">When</th>
                <th className="text-left p-3">Item</th>
                <th className="text-left p-3">Type</th>
                <th className="text-right p-3">Change</th>
                <th className="text-right p-3">Balance</th>
                <th className="text-left p-3">Note</th>
              </tr>
            </thead>
            <tbody>
              {receiveLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-[11px] uppercase font-bold">
                    No receive movements yet
                  </td>
                </tr>
              ) : (
                receiveLogs.map((log) => (
                  <tr key={log._id} className="border-t border-slate-100">
                    <td className="p-3 text-xs">{formatDate(log.createdAt)}</td>
                    <td className="p-3 font-bold">{log.itemId?.name || '—'}</td>
                    <td className="p-3">
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[8px]">
                        <ArrowDownCircle size={10} className="inline mr-0.5" />
                        {log.type?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700">
                      +{formatQty(log.quantityChange)}
                    </td>
                    <td className="p-3 text-right font-mono">{formatQty(log.newQuantity)}</td>
                    <td className="p-3 text-xs text-slate-500 max-w-[200px] truncate" title={log.remarks}>
                      {log.remarks}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white max-w-lg w-full border border-card-border shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-black uppercase">{selectedBill.invoiceNumber}</h2>
                <p className="text-xs text-slate-500">{selectedBill.destinationName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBill(null)}
                className="text-slate-400 hover:text-black text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm mb-4">
              <span className="font-bold">Total:</span> ₹{formatQty(selectedBill.totalAmount)} ·{' '}
              {formatDate(selectedBill.billDate || selectedBill.createdAt)}
            </p>
            <ul className="space-y-2 text-sm border-t border-slate-100 pt-4">
              {(selectedBill.lines || []).map((l, i) => (
                <li key={i} className="flex justify-between">
                  <span>
                    {l.itemName} — {formatQty(l.quantity)} {l.unit || 'KG'} @ ₹{formatQty(l.rate)}
                  </span>
                  <span className="font-mono">₹{formatQty(l.amount)}</span>
                </li>
              ))}
            </ul>
            {selectedBill.remarks && (
              <p className="mt-4 text-xs text-slate-600 border-t pt-3">{selectedBill.remarks}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInternalReceives;

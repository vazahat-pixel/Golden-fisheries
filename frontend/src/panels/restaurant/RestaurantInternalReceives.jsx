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
  AlertTriangle,
  ShieldCheck,
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
  const [receivedQtys, setReceivedQtys] = useState({}); // { [fishMallItemId]: quantity }
  const [remarks, setRemarks] = useState('');
  const [submittingAcceptance, setSubmittingAcceptance] = useState(false);

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
      const bill = res?.data?.bill ?? res?.data?.data?.bill ?? res?.data ?? res;
      setSelectedBill(bill);
      if (bill?.status === 'PENDING_ACCEPTANCE') {
        const qtys = {};
        (bill.lines || []).forEach((l) => {
          const idVal = l.fishMallItemId?._id || l.fishMallItemId;
          qtys[idVal] = l.quantity;
        });
        setReceivedQtys(qtys);
        setRemarks('');
      }
    } catch {
      toast.error('Could not load bill detail');
    }
  };

  const handleAcceptBill = async (status) => {
    if (!selectedBill) return;
    if (status === 'REJECTED' && !remarks.trim()) {
      toast.error('Please enter a rejection reason in Remarks');
      return;
    }

    setSubmittingAcceptance(true);
    const loadToast = toast.loading('Submitting acceptance...');

    const payloadLines = selectedBill.lines.map((l) => ({
      fishMallItemId: l.fishMallItemId?._id || l.fishMallItemId,
      receivedQuantity: parseFloat(receivedQtys[l.fishMallItemId?._id || l.fishMallItemId] ?? l.quantity),
    }));

    try {
      await restaurantService.acceptInternalSupply(selectedBill._id || selectedBill.id, {
        status,
        remarks,
        lines: payloadLines,
      });

      toast.success(
        status === 'REJECTED'
          ? `Supply bill ${selectedBill.invoiceNumber} rejected`
          : `Supply bill ${selectedBill.invoiceNumber} accepted successfully!`,
        { id: loadToast }
      );

      setSelectedBill(null);
      loadBills();
      if (fetchKitchenStock) fetchKitchenStock();
      if (fetchMenu) fetchMenu();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || 'Failed to submit acceptance',
        { id: loadToast }
      );
    } finally {
      setSubmittingAcceptance(false);
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
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Items</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 text-[11px] uppercase font-bold">
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
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        b.status === 'PENDING_ACCEPTANCE' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PARTIAL_ACCEPTED' ? 'bg-indigo-100 text-indigo-800' :
                        b.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {b.status?.replace(/_/g, ' ') || 'ISSUED'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-xs">
                      {(b.lines || []).map((l) => `${l.itemName} (${formatQty(l.quantity)} KG)`).join(', ')}
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => openBill(b._id)}
                        className="text-[10px] font-black uppercase text-accent-olive hover:underline"
                      >
                        {b.status === 'PENDING_ACCEPTANCE' ? 'Verify & Receive' : 'View'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="bg-white max-w-2xl w-full border border-card-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto flex flex-col justify-between">
            <div>
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-4 border-b pb-4">
                <div>
                  <h2 className="text-lg font-black uppercase text-slate-900">{selectedBill.invoiceNumber}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Origin: Fish Mall Counter · Destination: {selectedBill.destinationName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    selectedBill.status === 'PENDING_ACCEPTANCE' ? 'bg-amber-100 text-amber-800' :
                    selectedBill.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800' :
                    selectedBill.status === 'PARTIAL_ACCEPTED' ? 'bg-indigo-100 text-indigo-800' :
                    selectedBill.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBill.status?.replace(/_/g, ' ') || 'ISSUED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedBill(null)}
                    className="text-slate-400 hover:text-black text-2xl leading-none ml-2"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* General Telemetry */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-4 text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400">Total Amount</span>
                  <span className="text-sm font-black text-slate-900 font-mono">₹{formatQty(selectedBill.totalAmount)}</span>
                </div>
                <div>
                  <span className="font-bold text-[9px] uppercase tracking-wider block text-slate-400">Issued On</span>
                  <span className="text-slate-950 font-bold">{formatDate(selectedBill.billDate || selectedBill.createdAt)}</span>
                </div>
              </div>

              {/* Lines and Verification Checklist */}
              <div className="space-y-3 mb-6">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-wider border-b pb-1">
                  {selectedBill.status === 'PENDING_ACCEPTANCE' ? 'Line Item Verification Checklist' : 'Received Item Summary'}
                </h3>
                <div className="space-y-2">
                  {(selectedBill.lines || []).map((l, i) => {
                    const itemId = l.fishMallItemId?._id || l.fishMallItemId;
                    const sentQty = l.quantity;
                    const recQtyStr = receivedQtys[itemId] ?? sentQty;
                    const recQty = parseFloat(recQtyStr) || 0;
                    const diff = Math.max(0, sentQty - recQty);

                    const isPending = selectedBill.status === 'PENDING_ACCEPTANCE';

                    return (
                      <div key={i} className="border border-slate-100 p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                        <div className="flex-1">
                          <p className="text-xs font-black uppercase text-slate-800">{l.itemName}</p>
                          <div className="flex flex-wrap gap-4 text-[9px] font-bold uppercase text-slate-400 mt-1">
                            <span>Sent: <strong className="text-slate-700">{sentQty} {l.unit || 'KG'}</strong></span>
                            <span>Rate: <strong className="text-slate-700">₹{formatQty(l.rate)}/KG</strong></span>
                            {!isPending && l.receivedQuantity !== null && (
                              <span>Received: <strong className="text-emerald-700">{l.receivedQuantity} {l.unit || 'KG'}</strong></span>
                            )}
                            {!isPending && l.differenceQuantity > 0 && (
                              <span className="text-rose-600 font-black">Shortage: -{l.differenceQuantity} {l.unit || 'KG'}</span>
                            )}
                            {isPending && diff > 0 && (
                              <span className="text-rose-600 font-black">Shortage: -{diff.toFixed(2)} KG</span>
                            )}
                          </div>
                        </div>

                        {isPending ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <label className="text-[9px] font-black uppercase text-slate-500">Received (KG):</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max={sentQty}
                              value={recQtyStr}
                              disabled={submittingAcceptance}
                              onChange={(e) => {
                                const val = e.target.value;
                                setReceivedQtys((prev) => ({ ...prev, [itemId]: val }));
                              }}
                              className="w-20 text-right border border-card-border px-2 py-1 font-bold text-xs rounded bg-white focus:outline-accent-olive"
                            />
                          </div>
                        ) : (
                          <div className="text-right text-xs font-mono font-bold text-slate-800">
                            ₹{formatQty(l.amount)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Verification Audit details */}
              {selectedBill.status !== 'PENDING_ACCEPTANCE' && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 text-xs text-slate-600 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Verified By</span>
                    <span className="font-bold text-slate-900">{selectedBill.receiverName || 'System'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Verified On</span>
                    <span className="font-bold text-slate-900">{formatDate(selectedBill.acceptedAt)}</span>
                  </div>
                  {selectedBill.remarks && (
                    <div className="border-t pt-2 mt-2">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400 block mb-0.5">Remarks / Shortages note</span>
                      <p className="font-medium text-slate-800 italic">"{selectedBill.remarks}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Remarks Area for Pending Verification */}
              {selectedBill.status === 'PENDING_ACCEPTANCE' && (
                <div className="space-y-1.5 text-left mb-4">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Receiver Verification Remarks</label>
                  <textarea
                    placeholder="Enter shortage notes, delivery quality remarks, or cancellation comments..."
                    value={remarks}
                    disabled={submittingAcceptance}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full bg-slate-50/50 border border-card-border px-3 py-2 text-[10px] font-bold outline-none focus:bg-white focus:border-accent-olive h-16 resize-none rounded"
                  />
                </div>
              )}

              {/* Safety Warning */}
              {selectedBill.status === 'PENDING_ACCEPTANCE' && (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2.5 text-left mb-6">
                  <AlertTriangle size={16} className="text-amber-700 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-[9px] font-black uppercase text-amber-800 tracking-wider">Kitchen Receipt Control Warning</p>
                    <p className="text-[8px] text-amber-700 mt-0.5 leading-relaxed font-bold">
                      Stocks will only update inside the Restaurant kitchen inventory for actual verified quantities. Shortages are logged instantly for corporate accountability and Fish Mall reconciliation.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t pt-4 flex flex-col sm:flex-row gap-2 justify-between items-center bg-white">
              {selectedBill.status === 'PENDING_ACCEPTANCE' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleAcceptBill('REJECTED')}
                    disabled={submittingAcceptance}
                    className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded transition-all disabled:opacity-50"
                  >
                    Reject Whole Supply
                  </button>

                  <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedBill(null)}
                      disabled={submittingAcceptance}
                      className="px-4 py-2 border border-slate-200 bg-white text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all rounded"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const isPartial = selectedBill.lines.some((l) => {
                          const itemId = l.fishMallItemId?._id || l.fishMallItemId;
                          const rec = parseFloat(receivedQtys[itemId] ?? l.quantity) || 0;
                          return rec < l.quantity;
                        });
                        handleAcceptBill(isPartial ? 'PARTIAL_ACCEPTED' : 'ACCEPTED');
                      }}
                      disabled={submittingAcceptance}
                      className="px-5 py-2 bg-accent-olive hover:bg-opacity-90 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all rounded shadow-sm disabled:opacity-50"
                    >
                      <ShieldCheck size={12} /> Verify & Receive Stock
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="w-full px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider hover:bg-slate-100 transition-all rounded text-center"
                >
                  Dismiss Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInternalReceives;

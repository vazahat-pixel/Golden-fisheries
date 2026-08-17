import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  ChefHat,
  Utensils,
  XCircle,
  Ban,
  X,
  Printer,
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { toast } from 'react-hot-toast';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';

const STATUS_LABEL = {
  pending: 'Pending',
  preparing: 'Cooking',
  ready: 'Ready',
  served: 'Served',
  cancelled: 'Voided',
};

const RestaurantKitchen = () => {
  const navigate = useNavigate();
  const { kots, fetchKitchenTickets, updateKOTItemStatus, cancelKitchenTicketAsync, voidKitchenLineAsync, outletSettings, fetchOutletSettingsAsync } = useRestaurantStore();
  const [cancellingId, setCancellingId] = useState(null);
  const [voidLineTarget, setVoidLineTarget] = useState(null); // { kotId, lineId, name }
  const [voidLineReason, setVoidLineReason] = useState('');
  const [voidingLine, setVoidingLine] = useState(false);
  const [kotToPrint, setKotToPrint] = useState(null);

  const load = useCallback(() => {
    fetchKitchenTickets();
    fetchOutletSettingsAsync();
  }, [fetchKitchenTickets, fetchOutletSettingsAsync]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  const activeKots = kots.filter((kot) => kot.status === 'active' || kot.status === 'ACTIVE');

  const handleStatusUpdate = (kotId, itemId, currentStatus) => {
    updateKOTItemStatus(kotId, itemId);
    const flow = ['pending', 'preparing', 'ready', 'served'];
    const idx = flow.indexOf(currentStatus);
    const next = flow[Math.min(idx + 1, flow.length - 1)];
    toast.success(`Marked "${STATUS_LABEL[next] || next}"`);
  };

  const handlePrintKOT = (kot) => {
    setKotToPrint(kot);
    // Instant direct print — without any confirmation popup
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleCancelTicket = async (kot) => {
    if (!window.confirm(`Cancel ticket ${kot.ticketNumber || kot.id} for ${kot.tableLabel}?`)) {
      return;
    }
    setCancellingId(kot.id);
    try {
      await cancelKitchenTicketAsync(kot.id);
      toast.success(`Ticket ${kot.ticketNumber || ''} cancelled and cleared from the board.`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Couldn't cancel this ticket — please try again.");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'ready':
        return 'text-emerald-600 bg-emerald-50 border-emerald-100 animate-pulse';
      case 'served':
        return 'text-slate-400 bg-slate-50 border-slate-100';
      case 'cancelled':
        return 'text-rose-400 bg-rose-50 border-rose-100 opacity-70';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  const handleVoidLineSubmit = async () => {
    if (!voidLineReason.trim()) {
      toast.error('Please say why this dish is being voided.');
      return;
    }
    setVoidingLine(true);
    try {
      await voidKitchenLineAsync(voidLineTarget.kotId, voidLineTarget.lineId, voidLineReason.trim());
      toast.success(`"${voidLineTarget.name}" voided.`);
      setVoidLineTarget(null);
      setVoidLineReason('');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Couldn't void this dish — please try again.");
    } finally {
      setVoidingLine(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] font-sans p-4 md:p-6">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 border border-card-border hover:bg-slate-50 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-serif italic font-black uppercase">
              Kitchen <span className="text-accent-olive">Ops</span>
            </h1>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">
              Live queue · 1-click print KOT · tap line to advance status
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="bg-slate-50 px-5 py-3 border border-card-border">
            <p className="text-[8px] font-black text-slate-400 uppercase">Active KOT</p>
            <p className="text-lg font-black">{activeKots.length}</p>
          </div>
          <button
            type="button"
            onClick={load}
            className="px-4 py-2 border border-card-border text-[10px] font-black uppercase hover:bg-slate-50 cursor-pointer"
          >
            Refresh
          </button>
        </div>
      </header>

      {activeKots.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center opacity-30 border-2 border-dashed">
          <Utensils size={64} className="mb-4" />
          <h2 className="text-xl font-black uppercase tracking-[0.2em]">No active tickets</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activeKots.map((kot) => (
            <Card key={kot.id} padding="none" className="border border-card-border overflow-hidden bg-white">
              <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black">
                    {kot.tableLabel}
                  </div>
                  <div>
                    <p className="text-[10px] font-black font-mono">{kot.ticketNumber || kot.id}</p>
                    <Badge className="text-[7px] mt-1">{kot.orderType}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePrintKOT(kot)}
                    title="Print KOT Slip directly"
                    className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-black text-slate-700 hover:text-black rounded text-[9px] font-black uppercase flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Printer size={12} /> Print KOT
                  </button>
                  <div className="text-right text-[8px] font-bold text-slate-400">
                    <Clock size={10} className="inline mr-1" />
                    {kot.createdAt
                      ? new Date(kot.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '—'}
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {kot.items.map((item) => {
                  const isDone = item.kotStatus === 'served' || item.kotStatus === 'cancelled';
                  return (
                  <div
                    key={item.id}
                    className={`w-full text-left p-3 border transition-all flex items-start gap-2 ${getStatusColor(item.kotStatus)}`}
                  >
                    <button
                      type="button"
                      onClick={() => !isDone && handleStatusUpdate(kot.id, item.id, item.kotStatus)}
                      disabled={isDone}
                      className="flex-1 flex justify-between items-start text-left disabled:cursor-default cursor-pointer"
                    >
                      <div>
                        <p className={`text-sm font-black uppercase ${item.kotStatus === 'cancelled' ? 'line-through' : ''}`}>{item.name}</p>
                        <p className="text-[10px] font-black mt-1 text-slate-900">× {item.qty || item.quantity}</p>
                        {item.notes && (
                          <p className="text-[9px] text-amber-700 bg-amber-50/80 px-1.5 py-0.5 rounded mt-1 italic font-semibold">Note: {item.notes}</p>
                        )}
                        {item.kotStatus === 'cancelled' && item.voidReason && (
                          <p className="text-[9px] text-rose-500 mt-1 italic">Voided: {item.voidReason}</p>
                        )}
                      </div>
                      <span className="text-[9px] font-black uppercase">
                        {STATUS_LABEL[item.kotStatus] || item.kotStatus}
                      </span>
                    </button>
                    {item.kotStatus !== 'served' && item.kotStatus !== 'cancelled' && (
                      <button
                        type="button"
                        onClick={() => { setVoidLineTarget({ kotId: kot.id, lineId: item.id, name: item.name }); setVoidLineReason(''); }}
                        title="Void this dish"
                        className="text-rose-400 hover:text-rose-600 shrink-0 mt-0.5 cursor-pointer"
                      >
                        <Ban size={14} />
                      </button>
                    )}
                  </div>
                  );
                })}
              </div>
              <div className="px-4 py-2 border-t bg-slate-50 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[8px] text-slate-400 font-bold uppercase">
                  <ChefHat size={12} />
                  Tap dish: Cooking → Ready → Served
                </span>
                <button
                  type="button"
                  onClick={() => handleCancelTicket(kot)}
                  disabled={cancellingId === kot.id}
                  className="flex items-center gap-1 text-[8px] font-black uppercase text-red-500 hover:text-red-700 disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <XCircle size={12} /> {cancellingId === kot.id ? 'Cancelling...' : 'Cancel Ticket'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Void Line Reason Modal */}
      {voidLineTarget && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-800">Void "{voidLineTarget.name}"?</h3>
              <button onClick={() => setVoidLineTarget(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={16} /></button>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500">Reason (required)</label>
              <textarea
                value={voidLineReason}
                onChange={(e) => setVoidLineReason(e.target.value)}
                placeholder="e.g. Ran out of this ingredient"
                rows={3}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-400 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVoidLineTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidLineSubmit}
                disabled={voidingLine}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {voidingLine ? 'Voiding...' : 'Void Dish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Thermal KOT Slip (Rendered only on print) */}
      {kotToPrint && (
        <div className="print-root hidden print:block" style={{ width: '80mm', margin: '0 auto', padding: '5mm', fontFamily: 'monospace', color: '#000000' }}>
          <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '6px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 2px 0' }}>KITCHEN ORDER TICKET (KOT)</h2>
            <p style={{ fontSize: '12px', margin: '0', fontWeight: 'bold' }}>{outletSettings?.name || 'GOLDEN SEAFOOD RESTAURANT'}</p>
          </div>

          <div style={{ fontSize: '13px', lineHeight: '1.4', marginBottom: '8px', borderBottom: '1px solid #000', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>KOT #:</strong> {kotToPrint.ticketNumber || kotToPrint.id}</span>
              <span><strong>Type:</strong> {kotToPrint.orderType}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', margin: '4px 0' }}>
              <span>TABLE: {kotToPrint.tableLabel || 'COUNTER'}</span>
              <span>{kotToPrint.createdAt ? new Date(kotToPrint.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
            {kotToPrint.staffName && (
              <div style={{ fontSize: '11px' }}>Server: {kotToPrint.staffName}</div>
            )}
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '4px 0', width: '70%' }}>ITEM</th>
                <th style={{ padding: '4px 0', textAlign: 'right', width: '30%' }}>QTY</th>
              </tr>
            </thead>
            <tbody>
              {kotToPrint.items.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px dotted #ccc' }}>
                  <td style={{ padding: '6px 0' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.name}</div>
                    {item.notes && <div style={{ fontSize: '11px', fontStyle: 'italic' }}>* {item.notes}</div>}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>
                    × {item.qty || item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {kotToPrint.notes && (
            <div style={{ borderTop: '1px solid #000', marginTop: '8px', paddingTop: '4px', fontSize: '12px' }}>
              <strong>Special Instructions:</strong> {kotToPrint.notes}
            </div>
          )}

          <div style={{ textAlign: 'center', borderTop: '2px dashed #000', marginTop: '10px', paddingTop: '6px', fontSize: '10px' }}>
            *** KITCHEN COPY · DISPATCH FAST ***
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantKitchen;


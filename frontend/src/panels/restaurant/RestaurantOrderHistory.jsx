import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Printer, Search, Clock, History, ArrowLeft, Download, FileText, X, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const STATUS_STYLE = {
  PAID: { bar: 'bg-emerald-500', label: 'text-emerald-600', text: 'Paid' },
  PENDING: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Open' },
  PREPARING: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Preparing' },
  SERVED: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Served' },
  CANCELLED: { bar: 'bg-rose-400', label: 'text-rose-500', text: 'Voided' },
};

const fmtRupee = (n) => Number(n ?? 0).toLocaleString('en-IN');

const RestaurantOrderHistory = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, outletSettings, fetchOutletSettingsAsync, voidOrderAsync } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [printOrder, setPrintOrder] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchOutletSettingsAsync();
  }, [fetchOrders, fetchOutletSettingsAsync]);

  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) =>
    !q ||
    (order.orderNumber || '').toLowerCase().includes(q) ||
    (order.tableNumber || '').toLowerCase().includes(q) ||
    order.items.some((item) => item.name.toLowerCase().includes(q))
  );

  const handleVoidSubmit = async () => {
    if (!voidReason.trim()) {
      toast.error('Please explain why this bill is being voided.');
      return;
    }
    setVoiding(true);
    try {
      await voidOrderAsync(voidTarget._id || voidTarget.id, voidReason.trim());
      toast.success(`Bill ${voidTarget.orderNumber} voided — stock and cashbook reversed.`);
      setVoidTarget(null);
      setVoidReason('');
    } catch (err) {
      toast.error(err?.message || "Couldn't void this bill — please try again.");
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-8">
      {/* Tactical Ledger Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-card-border hover:bg-slate-50 rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
                Order <span className="text-accent-olive">Ledger.</span>
              </h1>
              <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase">{orders.length} RECORDS</Badge>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">TRANSACTION ARCHIVE • FINANCIAL AUDIT LOG</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button
            variant="outline"
            className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-card-border shadow-sm"
            onClick={() => toast('Date filtering is coming soon — showing all records for now.')}
           >
             <Calendar size={14} className="mr-2 text-accent-olive" /> FILTER BY DATE
           </Button>
           <Button
            className="h-11 px-6 text-[10px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 transition-all"
            onClick={() => toast('Export is coming soon.')}
           >
             <Download size={14} className="mr-2" /> EXPORT MANIFEST
           </Button>
        </div>
      </header>

      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Search Matrix */}
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="SEARCH BY BILL NO, TABLE, OR DISH NAME..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Tactical Record List */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => {
            const style = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;
            return (
            <Card key={order.id} padding="none" className="bg-white border border-card-border group hover:border-accent-olive transition-all shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex items-center flex-1">
                  {/* Status Indicator Bar */}
                  <div className={`w-1.5 self-stretch ${style.bar}`} />

                  <div className="p-5 flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-50 border border-card-border flex items-center justify-center shrink-0 group-hover:bg-accent-olive group-hover:text-white transition-all duration-300">
                       <FileText size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-black text-black text-sm tracking-tight uppercase italic font-serif">
                          #{order.orderNumber}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-400 text-[7px] font-black border-none px-2 h-4 uppercase">{order.paymentMethod}</Badge>
                        <Badge className="bg-slate-100 text-slate-400 text-[7px] font-black border-none px-2 h-4 uppercase">{order.tableNumber}</Badge>
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase line-clamp-1 mb-2">
                        {order.items.map(i => `${i.name} [x${i.quantity}]`).join(' • ')}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Clock size={10} />
                           <span className="text-[8px] font-black uppercase tracking-widest">{new Date(order.timestamp).toLocaleString().toUpperCase()}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.label}`}>{style.text}</span>
                      </div>
                      {order.status === 'CANCELLED' && order.voidReason && (
                        <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest mt-1">Reason: {order.voidReason}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-8 p-5 lg:pl-0 border-t lg:border-t-0 border-slate-50 bg-slate-50/30 lg:bg-transparent">
                  <div className="text-right min-w-[100px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">SETTLEMENT</p>
                    <p className="text-xl font-serif italic font-black text-black tracking-tight leading-none">₹{fmtRupee(order.total)}</p>
                  </div>
                  <div className="flex gap-1.5">
                     <button
                       onClick={() => setPrintOrder(order)}
                       title="Reprint bill"
                       className="w-9 h-9 border border-card-border bg-white text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center"
                     >
                        <Printer size={14} />
                     </button>
                     {order.status === 'PAID' && (
                       <button
                         onClick={() => { setVoidTarget(order); setVoidReason(''); }}
                         title="Void this bill"
                         className="w-9 h-9 border border-card-border bg-white text-slate-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center"
                       >
                          <Ban size={14} />
                       </button>
                     )}
                  </div>
                </div>
              </div>
            </Card>
            );
          }) : (
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 opacity-20 grayscale grayscale-0">
               <History size={64} className="mb-4 text-slate-300" />
               <h3 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">Zero Transactions.</h3>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-2">No archive records found for current query</p>
            </div>
          )}
        </div>

        {/* Pagination Signal */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col items-center gap-4 pt-10 pb-20">
             <div className="h-px w-24 bg-slate-200" />
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">End of Manifest // Secure Ledger Archive</p>
          </div>
        )}
      </div>

      {/* Reprint Modal */}
      {printOrder && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="no-print p-3 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10">
              <button onClick={() => setPrintOrder(null)} className="text-xs font-black uppercase text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <X size={14} /> Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#6A7051] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                <Printer size={14} /> Print
              </button>
            </div>
            <div className="print-root p-6 space-y-4" style={{ background: '#ffffff', color: '#000000' }}>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black uppercase">{outletSettings?.name || 'Golden Fisheries Restaurant'}</h2>
                {outletSettings?.location && <p className="text-[10px]">{outletSettings.location}</p>}
                <div className="flex flex-col text-[9px]">
                  {outletSettings?.gstin && <span>GSTIN: {outletSettings.gstin}</span>}
                  {outletSettings?.phone && <span>Tel: {outletSettings.phone}</span>}
                </div>
                <p className="text-[9px] font-bold uppercase mt-1">Duplicate Bill / Reprint</p>
              </div>
              <div className="border-t border-b border-black py-2 grid grid-cols-2 gap-y-1 text-xs">
                <span><strong>Bill No:</strong> {printOrder.orderNumber}</span>
                <span className="text-right"><strong>Table:</strong> {printOrder.tableNumber}</span>
                <span><strong>Date:</strong> {new Date(printOrder.timestamp).toLocaleString()}</span>
                <span className="text-right"><strong>Payment:</strong> {printOrder.paymentMethod}</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-1">Item</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">₹{fmtRupee(item.rate * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-black pt-2 text-xs space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{fmtRupee(printOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>CGST + SGST</span><span>₹{fmtRupee((printOrder.cgst || 0) + (printOrder.sgst || 0))}</span></div>
                {printOrder.discountAmount > 0 && (
                  <div className="flex justify-between"><span>Discount</span><span>-₹{fmtRupee(printOrder.discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-base font-black border-t border-black pt-1 mt-1">
                  <span>Total</span><span>₹{fmtRupee(printOrder.total)}</span>
                </div>
              </div>
              {printOrder.status === 'CANCELLED' && (
                <p className="text-center text-[10px] font-black uppercase text-rose-600 border border-rose-300 py-1">
                  This bill was voided{printOrder.voidReason ? ` — ${printOrder.voidReason}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Void Reason Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-800">Void bill {voidTarget.orderNumber}?</h3>
              <button onClick={() => setVoidTarget(null)} className="text-slate-400 hover:text-slate-700"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-500">
              This reverses the ₹{fmtRupee(voidTarget.total)} sale, restores kitchen stock, and reverses the cashbook entry for the currently open shift. This can't be undone.
            </p>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500">Reason (required)</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer billed twice by mistake"
                rows={3}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-400 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVoidTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidSubmit}
                disabled={voiding}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-rose-700 disabled:opacity-50"
              >
                {voiding ? 'Voiding...' : 'Void Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrderHistory;

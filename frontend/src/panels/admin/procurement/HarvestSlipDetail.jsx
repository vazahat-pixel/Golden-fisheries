import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import HarvestBillPrint from './HarvestBillPrint';
import {
  ArrowLeft, MapPin, Phone, Calendar, Truck, MessageCircle,
  CheckCircle, XCircle, RefreshCw, Send, AlertTriangle, Package, Clock, FileDown,
  IndianRupee, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const STATUS_CONFIG = {
  pending:   { label: 'PENDING',   variant: 'warning' },
  sent:      { label: 'SENT',      variant: 'secondary' },
  confirmed: { label: 'CONFIRMED', variant: 'success' },
  rejected:  { label: 'REJECTED',  variant: 'danger' },
  converted: { label: 'CONVERTED', variant: 'primary' },
};

const TIMELINE = [
  { status: 'pending',   label: 'Slip Created', icon: Package },
  { status: 'sent',      label: 'Sent to Farmer', icon: Send },
  { status: 'confirmed', label: 'Farmer Confirmed', icon: CheckCircle },
  { status: 'converted', label: 'Tapal Generated', icon: RefreshCw },
];
const STATUS_ORDER = ['pending', 'sent', 'confirmed', 'converted'];

export default function HarvestSlipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { harvestSlips, updateHarvestStatusAsync, convertSlipToTapalAsync, saveNetRateAsync } = useAdminStore();
  const slip = harvestSlips.find(s => s._id === id || s.id === id);
  const [showBill, setShowBill] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const [partialQtys, setPartialQtys] = useState(() =>
    slip ? Object.fromEntries(slip.products.map(p => [p.id || p._id, p.confirmedQty ?? p.estimatedQty ?? p.quantity])) : {}
  );

  const [rates, setRates] = useState(() =>
    slip ? Object.fromEntries(slip.products.map(p => [p._id || p.id, p.rate || 0])) : {}
  );
  const [transport, setTransport] = useState(() => slip?.deductionTransport || 0);
  const [commission, setCommission] = useState(() => slip?.deductionCommission || 0);
  const [soft, setSoft] = useState(() => slip?.deductionSoft || 0);
  const [other, setOther] = useState(() => slip?.deductionOther || 0);

  if (!slip) return <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Slip not found.</div>;

  // Show print view
  if (showBill) return <HarvestBillPrint slip={slip} onBack={() => setShowBill(false)} />;

  const cfg = STATUS_CONFIG[slip.status] || STATUS_CONFIG.pending;
  const currentStep = STATUS_ORDER.indexOf(slip.status === 'rejected' ? 'pending' : slip.status);
  const totalQty = slip.products.reduce((a, p) => a + (p.confirmedQty ?? p.quantity), 0);
  const totalAmt = slip.products.reduce((a, p) => a + ((p.confirmedQty ?? p.quantity) * (p.rate ?? 0)), 0);

  const handleConfirm = async () => {
    try {
      await updateHarvestStatusAsync(slip._id || slip.id, 'CONFIRMED');
      toast.success('Slip Confirmed Successfully');
    } catch (err) {
      toast.error('Failed to confirm slip');
    }
  };

  const handleSaveNetRate = async () => {
    const grossTotal = slip.products.reduce((a, p) => a + ((p.confirmedQty ?? p.estimatedQty ?? p.quantity) * (rates[p._id || p.id] || 0)), 0);
    const deductions = parseFloat(transport || 0) + parseFloat(commission || 0) + parseFloat(soft || 0) + parseFloat(other || 0);
    const netPayable = grossTotal - deductions;
    const netRate = totalQty > 0 ? (netPayable / totalQty) : 0;

    try {
      toast.loading('Saving settlement details...', { id: 'save-settlement' });
      await saveNetRateAsync(slip._id || slip.id, {
        netRateCalculated: parseFloat(netRate.toFixed(2)),
        totalPayableAmount: parseFloat(netPayable.toFixed(2)),
        totalDeductions: parseFloat(deductions.toFixed(2)),
        deductionTransport: parseFloat(transport || 0),
        deductionCommission: parseFloat(commission || 0),
        deductionSoft: parseFloat(soft || 0),
        deductionOther: parseFloat(other || 0),
        finalNetRate: parseFloat(netRate.toFixed(2)),
        productRates: rates
      });
      toast.success('Net rate settlement saved successfully!', { id: 'save-settlement' });
      setShowCalculator(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save settlement', { id: 'save-settlement' });
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      <button onClick={() => navigate('/admin/procurement/harvest')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" /> BACK TO SLIPS
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">
            Harvest Slip <span className="text-accent-olive">{slip.id}.</span>
          </h1>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mt-1">
            {slip.createdAt} · BY {slip.createdBy}
          </p>
        </div>
        <Badge variant={cfg.variant} className="uppercase text-[9px] font-bold border border-card-border px-4 py-1 shadow-none">{cfg.label}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-2 space-y-3">
          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-3">FARMER</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-bold text-sm border border-black shrink-0 shadow-sm">
                {(slip.farmerId?.fullName || slip.farmer?.name || slip.farmerName || 'S')[0]}
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-black uppercase">
                  {slip.farmerId?.fullName || slip.farmer?.name || slip.farmerName || 'STATION GUEST'}
                </p>
                <p className="text-[9px] text-text-muted font-bold flex items-center gap-1.5">
                  <Phone size={10} className="text-accent-olive" /> {slip.farmerId?.phone || slip.farmer?.mobile || '—'}
                </p>
              </div>
            </div>
          </Card>

          <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden">
            <div className="px-4 py-2 border-b border-card-border bg-olive-50/20">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted">PRODUCTS</h3>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olive-100/10">
                  {['Fish', 'Planned', 'Confirmed', 'Rate', 'Total'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100/30">
                {slip.products.map(p => (
                  <tr key={p.id} className="hover:bg-olive-50/30 transition-colors">
                    <td className="px-4 py-2.5 text-[10px] font-bold text-black uppercase">{p.fishName}</td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-black">{p.quantity} {p.unit}</td>
                    <td className="px-4 py-2.5">
                      {slip.status === 'sent' ? (
                        <input type="number" value={partialQtys[p.id]} onChange={e => setPartialQtys(q => ({ ...q, [p.id]: e.target.value }))}
                          className="w-16 border border-card-border px-1.5 py-0.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive" />
                      ) : <span className="text-[10px] font-bold text-black">{p.confirmedQty ?? '—'}</span>}
                    </td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-text-muted">{p.rate ? `₹${p.rate}` : 'TBD'}</td>
                    <td className="px-4 py-2.5 text-[10px] font-bold text-black">{p.rate && p.confirmedQty ? `₹${(p.confirmedQty * p.rate).toLocaleString()}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
              {totalAmt > 0 && (
                <tfoot>
                  <tr className="bg-black text-white">
                    <td colSpan={3} className="px-4 py-2 text-[9px] font-bold uppercase tracking-widest">TOTAL VALUE</td>
                    <td colSpan={2} className="px-4 py-2 text-right text-[11px] font-bold">₹{totalAmt.toLocaleString()}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </Card>

          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-3">SCHEDULE</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[ ['HARVEST', slip.harvestDate, Calendar], ['PICKUP', slip.pickupDate, Truck], ['TIME', slip.pickupTime || '—', Clock], ['LOCATION', slip.pickupLocation || '—', MapPin] ].map(([l, v, Icon]) => (
                <div key={l} className="space-y-0.5">
                  <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">{l}</p>
                  <p className="text-[10px] font-bold text-black flex items-center gap-1.5 uppercase"><Icon size={10} className="text-accent-olive shrink-0" />{v}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-3">
          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-4">TIMELINE</h3>
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-px before:bg-olive-100">
              {TIMELINE.map((t, i) => {
                const done = i <= currentStep;
                return (
                  <div key={t.status} className="flex items-center gap-3 relative z-10">
                    <div className={clsx('w-7 h-7 flex items-center justify-center border text-[10px] transition-all', done ? 'bg-black border-black text-white' : 'bg-white border-card-border text-text-muted')}><t.icon size={12} /></div>
                    <p className={clsx('text-[9px] font-bold uppercase tracking-widest', done ? 'text-black' : 'text-text-muted')}>{t.label}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="border border-card-border shadow-subtle bg-white p-4">
            <h3 className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-3">ACTIONS</h3>
            <div className="space-y-2">
              {/* Generate Farmer Purchase Bill — always visible */}
              <Button
                onClick={() => setShowBill(true)}
                size="sm"
                className="w-full text-[9px] font-bold h-9 shadow-md bg-[#6B7550] hover:bg-[#5a6340] text-white flex items-center justify-center gap-2"
              >
                <FileDown size={12} /> FARMER PURCHASE BILL
              </Button>
              {/* Net Rate Calculation trigger */}
              {slip.status === 'CONFIRMED' && (
                <Button
                  onClick={() => setShowCalculator(true)}
                  size="sm"
                  className="w-full text-[9px] font-bold h-9 shadow-md bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center gap-2"
                >
                  <IndianRupee size={12} /> CALCULATE NET RATE
                </Button>
              )}
              {(slip.status === 'PENDING' || slip.status === 'sent' || slip.status === 'pending' || slip.status === 'DRAFT') && (
                <>
                  <Button onClick={handleConfirm} size="sm" className="w-full text-[9px] font-bold h-9 shadow-md bg-green-600 hover:bg-green-700">CONFIRM SLIP</Button>
                  <Button onClick={() => updateHarvestStatusAsync(slip._id || slip.id, 'REJECTED')} size="sm" className="w-full text-[9px] font-bold h-9 shadow-md bg-red-600 hover:bg-red-700">REJECT SLIP</Button>
                </>
              )}
              {slip.status === 'CONFIRMED' && <Button onClick={() => convertSlipToTapalAsync(slip._id || slip.id)} size="sm" className="w-full text-[9px] font-bold h-9 shadow-md bg-black text-white">GENERATE TAPAL</Button>}
              {['CONVERTED_TO_TAPAL', 'REJECTED', 'COMPLETED'].includes(slip.status) && <p className="text-[8px] text-text-muted font-bold text-center py-2 uppercase tracking-widest">RECORD LOCKED</p>}
            </div>
          </Card>

          {/* Dynamic Final Settlement Summary card */}
          {slip.netRateCalculated !== undefined && slip.netRateCalculated !== null && (
            <Card className="border border-card-border shadow-subtle bg-white p-4 space-y-3">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#6B7550] border-b pb-1 font-black">FINAL SETTLEMENT SUMMARY</h3>
              <div className="grid grid-cols-2 gap-y-2 text-[10px] font-bold">
                <div className="text-text-muted uppercase">Final Net Rate:</div>
                <div className="font-serif italic font-black text-black text-right">₹{(slip.finalNetRate || slip.netRateCalculated).toFixed(2)} / KG</div>
                
                <div className="text-text-muted uppercase">Gross Amount:</div>
                <div className="text-black text-right">₹{((slip.totalPayableAmount || 0) + (slip.totalDeductions || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                
                <div className="text-text-muted uppercase">Total Deductions:</div>
                <div className="text-red-500 text-right">₹{(slip.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                
                <div className="text-text-muted uppercase">Net Payable Amount:</div>
                <div className="text-emerald-600 text-right font-black text-[11px]">₹{(slip.totalPayableAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                
                <div className="text-text-muted uppercase">Paid Amount:</div>
                <div className="text-black text-right">₹{(slip.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>

                <div className="text-text-muted uppercase">Pending Balance:</div>
                <div className="text-red-600 text-right font-black">₹{(slip.pendingAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Net Rate Calculator Overlay Modal */}
      {showCalculator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-card-border shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-card-border flex justify-between items-center bg-olive-50/10">
              <div>
                <h3 className="text-sm font-serif italic font-bold text-black flex items-center gap-1.5">
                  <IndianRupee size={16} className="text-accent-olive" /> Net Rate &amp; Final Settlement
                </h3>
                <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest mt-0.5">Finalize calculations for {slip.harvestNumber || slip.id}</p>
              </div>
              <button onClick={() => setShowCalculator(false)} className="p-1.5 text-text-muted hover:text-black rounded-lg hover:bg-slate-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="px-6 py-5 overflow-y-auto space-y-4 text-[10px]">
              {/* Product Rate Inputs */}
              <div className="space-y-3">
                <h4 className="font-bold text-black uppercase tracking-widest text-[8px] text-text-muted border-b pb-1">1. Fish Purchase Rates</h4>
                {slip.products.map(p => (
                  <div key={p.id || p._id} className="flex justify-between items-center gap-4 bg-slate-50/50 p-2.5 border border-card-border/60">
                    <div>
                      <p className="font-bold text-black uppercase text-[10px]">{p.fishName}</p>
                      <p className="text-[8px] text-text-muted font-bold">Qty: {p.confirmedQty ?? p.estimatedQty ?? p.quantity} {p.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-text-muted">₹</span>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={rates[p._id || p.id] !== undefined ? rates[p._id || p.id] : (p.rate || '')}
                        onChange={e => setRates(prev => ({ ...prev, [p._id || p.id]: e.target.value }))}
                        className="w-24 border border-card-border px-2.5 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive text-right bg-white rounded-none"
                      />
                      <span className="font-bold text-text-muted">/ KG</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deductions Inputs */}
              <div className="space-y-3">
                <h4 className="font-bold text-black uppercase tracking-widest text-[8px] text-text-muted border-b pb-1">2. Deductions</h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Transport Deduction (₹)', state: transport, setState: setTransport },
                    { label: 'Commission Deduction (₹)', state: commission, setState: setCommission },
                    { label: 'Soft Deduction (₹)', state: soft, setState: setSoft },
                    { label: 'Other/Wastage (₹)', state: other, setState: setOther },
                  ].map(d => (
                    <div key={d.label} className="space-y-1">
                      <label className="font-bold text-text-muted uppercase text-[8px]">{d.label}</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={d.state}
                        onChange={e => d.setState(e.target.value)}
                        className="w-full border border-card-border px-2.5 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent-olive bg-white rounded-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Calculation Summary Preview */}
              {(() => {
                const grossVal = slip.products.reduce((a, p) => a + ((p.confirmedQty ?? p.estimatedQty ?? p.quantity) * (parseFloat(rates[p._id || p.id] !== undefined ? rates[p._id || p.id] : p.rate) || 0)), 0);
                const totalDeds = parseFloat(transport || 0) + parseFloat(commission || 0) + parseFloat(soft || 0) + parseFloat(other || 0);
                const netPay = grossVal - totalDeds;
                const netRt = totalQty > 0 ? (netPay / totalQty) : 0;
                return (
                  <div className="bg-[#6B7550]/5 border border-[#6B7550]/15 p-4 space-y-2">
                    <div className="flex justify-between font-bold text-text-muted">
                      <span>GROSS VALUE:</span>
                      <span>₹{grossVal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between font-bold text-red-500">
                      <span>TOTAL DEDUCTIONS:</span>
                      <span>- ₹{totalDeds.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="h-px bg-[#6B7550]/15 my-1" />
                    <div className="flex justify-between text-[11px] font-bold text-black">
                      <span>NET PAYABLE AMOUNT:</span>
                      <span className="text-[#6B7550]">₹{netPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-bold text-black border-t border-dashed border-[#6B7550]/30 pt-1.5">
                      <span>FINAL COMPUTED NET RATE:</span>
                      <span>₹{netRt.toFixed(2)} / KG</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-card-border bg-slate-50 flex justify-end gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setShowCalculator(false)} className="text-[9px] font-bold uppercase tracking-widest border-card-border h-9">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveNetRate} className="text-[9px] font-bold uppercase tracking-widest bg-[#6B7550] hover:bg-[#5a6340] h-9 text-white">
                Save &amp; Finalize Settlement
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

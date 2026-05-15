import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import {
  ArrowLeft, MapPin, Phone, Calendar, Truck, MessageCircle,
  CheckCircle, XCircle, RefreshCw, Send, AlertTriangle, Package, Clock
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
  const { harvestSlips, updateHarvestStatusAsync, convertSlipToTapalAsync } = useAdminStore();
  const slip = harvestSlips.find(s => s._id === id || s.id === id);

  const [partialQtys, setPartialQtys] = useState(() =>
    slip ? Object.fromEntries(slip.products.map(p => [p.id, p.quantity])) : {}
  );

  if (!slip) return <div className="p-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">Slip not found.</div>;

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
        </div>
      </div>
    </div>
  );
}

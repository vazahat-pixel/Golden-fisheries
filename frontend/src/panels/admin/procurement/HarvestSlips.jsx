import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import {
  Plus, Search, Sprout, CheckCircle, Clock, MessageCircle,
  Eye, ArrowRight, Phone, MapPin, XCircle, RefreshCw,
  ClipboardList, AlertTriangle, Send, Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const STATUS_CONFIG = {
  PENDING:             { label: 'PENDING',   variant: 'warning',   icon: Clock },
  DRAFT:               { label: 'DRAFT',     variant: 'warning',   icon: Clock },
  SENT:                { label: 'SENT',      variant: 'secondary',  icon: Send },
  PENDING_CONFIRMATION:{ label: 'AWAITING',  variant: 'secondary',  icon: Clock },
  CONFIRMED:           { label: 'CONFIRMED', variant: 'success',   icon: CheckCircle },
  REJECTED:            { label: 'REJECTED',  variant: 'danger',    icon: XCircle },
  CONVERTED_TO_TAPAL:  { label: 'CONVERTED', variant: 'primary',   icon: CheckCircle },
  COMPLETED:           { label: 'COMPLETED', variant: 'success',   icon: CheckCircle },
};

const TABS = ['ALL', 'PENDING', 'SENT', 'CONFIRMED', 'REJECTED', 'CONVERTED'];

export default function HarvestSlips() {
  const navigate = useNavigate();
  const { 
    harvestSlips, 
    farmers, 
    fetchHarvestSlips,
    fetchFarmers,
    updateHarvestStatusAsync,
    convertSlipToTapalAsync,
    updateSlipStatus 
  } = useAdminStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  React.useEffect(() => {
    // Fetch all for local filtering (or could pass status to backend if list is huge)
    fetchHarvestSlips();
    fetchFarmers();
  }, [fetchHarvestSlips, fetchFarmers]);

  const filtered = harvestSlips.filter(s => {
    // Status Filter Logic
    let matchTab = activeTab === 'ALL';
    if (!matchTab) {
      if (activeTab === 'CONVERTED') {
        matchTab = s.status === 'CONVERTED_TO_TAPAL';
      } else {
        matchTab = (s.status || '').toUpperCase() === activeTab;
      }
    }

    // Search Filter Logic
    const searchLower = search.toLowerCase();
    const matchSearch =
      (s.id || '').toLowerCase().includes(searchLower) ||
      (s.harvestNumber || '').toLowerCase().includes(searchLower) ||
      (s.farmer?.name || '').toLowerCase().includes(searchLower) ||
      s.products?.some(p => (p.fishName || '').toLowerCase().includes(searchLower));

    return matchTab && matchSearch;
  });

  const handleSendWhatsApp = async (slip) => {
    const slipId = slip._id || slip.id;
    try {
      await updateHarvestStatusAsync(slipId, 'SENT');
      toast.success(`WhatsApp sent & status updated to SENT`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleConfirm = async (slip) => {
    const slipId = slip._id || slip.id;
    try {
      toast.loading('Confirming & Generating Tapal...', { id: 'harvest-action' });
      
      // 1. Update status to CONFIRMED
      await updateHarvestStatusAsync(slipId, 'CONFIRMED');
      
      // 2. Automatically convert to Tapal
      await convertSlipToTapalAsync(slipId);
      
      toast.success(`${slip.harvestNumber || slipId} Confirmed & Tapal Generated`, { id: 'harvest-action' });
      fetchHarvestSlips(); // Refresh for good measure, though socket handles it
    } catch (err) {
      console.error('Confirm/Convert error:', err);
      toast.error(err.response?.data?.message || 'Action failed', { id: 'harvest-action' });
    }
  };

  const handleReject = async (slip) => {
    const slipId = slip._id || slip.id;
    const reason = window.prompt('ENTER REJECTION REASON:');
    if (reason === null) return;
    
    try {
      toast.loading('Rejecting slip...', { id: 'harvest-reject' });
      await updateHarvestStatusAsync(slipId, 'REJECTED');
      toast.error(`${slip.harvestNumber || slipId} Rejected`, { id: 'harvest-reject' });
    } catch (err) {
      toast.error('Failed to reject slip', { id: 'harvest-reject' });
    }
  };

  const handleConvert = async (slip) => {
    const slipId = slip._id || slip.id;
    if (!slipId) {
      toast.error('Invalid Harvest Slip ID');
      return;
    }
    try {
      toast.loading('Converting to Tapal...', { id: 'conv-tapal' });
      await convertSlipToTapalAsync(slipId);
      toast.success('Tapal created successfully!', { icon: '📋', id: 'conv-tapal' });
    } catch (err) {
      toast.error(err.message || 'Failed to convert to tapal', { id: 'conv-tapal' });
    }
  };

  const totalQty = (Array.isArray(harvestSlips) ? harvestSlips : []).reduce((a, s) => {
    const slipProducts = s.products || [];
    return a + slipProducts.reduce((b, p) => b + (parseFloat(p.confirmedQty || p.estimatedQty || p.quantity) || 0), 0);
  }, 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">
            Harvest <span className="text-accent-olive">Slips.</span>
          </h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">
            PROCUREMENT ENTRY • FARMER OPS
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md"
          onClick={() => navigate('/admin/procurement/harvest/new')}
        >
          <Plus size={12} /> NEW HARVEST SLIP
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="TOTAL SLIPS" value={harvestSlips.length.toString()} icon={ClipboardList} trend="ALL TIME" trendType="up" />
        <StatCard title="PENDING" value={harvestSlips.filter(s => ['PENDING','DRAFT','SENT'].includes((s.status||'').toUpperCase())).length.toString()} icon={Clock} trend="AWAITING" trendType="down" />
        <StatCard title="CONFIRMED" value={harvestSlips.filter(s => s.status === 'CONFIRMED').length.toString()} icon={CheckCircle} trend="READY" trendType="up" />
        <StatCard title="TOTAL QTY" value={`${totalQty} KG`} icon={Sprout} trend="PLANNED" trendType="up" />
      </div>

      {/* Slip Table */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        <div className="px-4 py-2 flex flex-col md:flex-row justify-between gap-4 border-b border-card-border bg-white">
          <div className="flex bg-olive-100/30 p-0.5 rounded-none w-fit border border-card-border/50 overflow-x-auto no-scrollbar">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-none text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black hover:bg-white/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input
                type="text"
                placeholder="SEARCH SLIPS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-card-border rounded-none py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-subtle"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 px-3 border-card-border"><Filter size={14} /></Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">ID / Date</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Farmer</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Products</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Schedule</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {filtered.map(slip => {
                const cfg = STATUS_CONFIG[(slip.status || '').toUpperCase()] || STATUS_CONFIG.PENDING;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={slip._id || slip.id} className="hover:bg-olive-50/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <p className="text-[11px] font-bold text-black uppercase">{slip.harvestNumber || slip._id}</p>
                      <p className="text-[8px] text-text-muted font-bold">{slip.createdAt ? new Date(slip.createdAt).toLocaleDateString('en-IN') : 'RECENT'}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[10px] font-bold text-black uppercase">
                        {slip.farmerId?.fullName || slip.farmerName || 'FARMER'}
                      </p>
                      <p className="text-[8px] text-text-muted font-bold flex items-center gap-1">
                        <MapPin size={8} /> {slip.farmerId?.location || slip.pickupLocation || 'FIELD'}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      {(slip.products || []).map((p, i) => (
                        <p key={i} className="text-[9px] font-bold text-black uppercase">
                          {p.fishName} — <span className="text-text-muted font-normal">{p.confirmedQty ?? p.estimatedQty ?? p.quantity} {p.unit || 'KG'}</span>
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[10px] font-bold text-black">
                        {slip.harvestDate ? new Date(slip.harvestDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                      <p className="text-[8px] text-text-muted font-bold uppercase">
                        📦 {slip.pickupDate ? new Date(slip.pickupDate).toLocaleDateString('en-IN') : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-2.5">
                      <select 
                        value={(slip.status || 'PENDING').toUpperCase()}
                        onChange={async (e) => {
                          const newStatus = e.target.value.toUpperCase();
                          const slipId = slip._id || slip.id;
                          
                          if (newStatus === 'CONFIRMED') {
                            await handleConfirm(slip);
                          } else if (newStatus !== (slip.status || '').toUpperCase()) {
                            try {
                              toast.loading(`Updating to ${newStatus}...`, { id: 'status-update' });
                              await updateHarvestStatusAsync(slipId, newStatus);
                              toast.success(`Status updated to ${newStatus}`, { id: 'status-update' });
                            } catch (err) {
                              toast.error('Failed to update status', { id: 'status-update' });
                            }
                          }
                        }}
                        className={clsx(
                          "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border outline-none cursor-pointer transition-all",
                          cfg.variant === 'warning' ? "border-amber-200 bg-amber-50 text-amber-700" :
                          cfg.variant === 'secondary' ? "border-blue-200 bg-blue-50 text-blue-700" :
                          cfg.variant === 'success' ? "border-green-200 bg-green-50 text-green-700" :
                          cfg.variant === 'danger' ? "border-red-200 bg-red-50 text-red-700" :
                          "border-card-border bg-white text-black"
                        )}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="SENT">SENT</option>
                        <option value="CONFIRMED">CONFIRM &amp; TAPAL</option>
                        <option value="REJECTED">REJECT</option>
                        {(slip.status || '').toUpperCase() === 'CONVERTED_TO_TAPAL' && <option value="CONVERTED_TO_TAPAL">CONVERTED</option>}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-all">
                        <button onClick={() => navigate(`/admin/procurement/harvest/${slip._id || slip.id}`)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white shadow-sm" title="View Detail"><Eye size={13} /></button>
                        
                        {/* Case-insensitive check to ensure buttons show regardless of backend casing */}
                        {(() => {
                          const s = (slip.status || '').toUpperCase();
                          if (['PENDING', 'DRAFT', 'SENT', 'PENDING_CONFIRMATION'].includes(s)) {
                            return (
                              <>
                                <button onClick={() => handleSendWhatsApp(slip)} className="p-1.5 text-blue-600 hover:bg-blue-600 hover:text-white transition-all border border-card-border/30 bg-white shadow-sm" title="Mark as Sent">
                                  <Send size={13} />
                                </button>
                                <button onClick={() => handleConfirm(slip)} className="p-1.5 text-green-600 hover:bg-green-600 hover:text-white transition-all border border-card-border/30 bg-white shadow-sm" title="Confirm & Generate Tapal">
                                  <CheckCircle size={13} />
                                </button>
                              </>
                            );
                          }
                          return null;
                        })()}

                        {slip.status === 'CONFIRMED' && (
                          <button onClick={() => handleConvert(slip)} className="p-1.5 text-accent-olive hover:bg-black hover:text-white border border-card-border/30 bg-white shadow-sm" title="Manual Convert to Tapal">
                            <RefreshCw size={13} />
                          </button>
                        )}
                        
                        <button onClick={() => handleReject(slip)} className="p-1.5 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-card-border/30 bg-white shadow-sm" title="Reject">
                          <XCircle size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Farmer Directory */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
          <Sprout className="text-accent-olive" size={16} /> FARMER DIRECTORY
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(farmers.length === 0) && (
            <div className="col-span-3 text-center py-8 text-text-muted text-[9px] font-bold uppercase tracking-widest">
              No farmers registered yet. Add via the harvest slip form.
            </div>
          )}
          {farmers.map((farmer, idx) => (
            <Card key={farmer._id || farmer.id || idx} className="border border-card-border hover:shadow-md transition-all bg-white overflow-hidden group" padding="none">
              <div className="p-3 border-b border-card-border flex justify-between items-start bg-olive-50/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm border border-black">
                    {(farmer.fullName || farmer.name || '?')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-[11px]">{farmer.fullName || farmer.name}</h3>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1"><MapPin size={8} /> {farmer.location}</p>
                  </div>
                </div>
                <Badge variant={farmer.isActive !== false ? 'success' : 'secondary'} className="uppercase text-[7px] font-bold border border-card-border px-1.5">
                  {farmer.isActive !== false ? 'ACTIVE' : 'IDLE'}
                </Badge>
              </div>
              <div className="p-3 flex justify-between items-center bg-white">
                 <div className="text-[9px] font-bold text-black flex items-center gap-1.5"><Phone size={10} className="text-accent-olive" /> {farmer.phone || farmer.mobile}</div>
                 <button onClick={() => { setSearch(farmer.fullName || farmer.name || ''); setActiveTab('ALL'); }} className="text-[8px] font-bold text-accent-olive uppercase tracking-widest hover:underline">VIEW SLIPS →</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

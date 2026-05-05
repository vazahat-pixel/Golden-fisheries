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

const STATUS_CONFIG = {
  pending:   { label: 'PENDING',   variant: 'warning',   icon: Clock },
  sent:      { label: 'SENT',      variant: 'secondary',  icon: Send },
  confirmed: { label: 'CONFIRMED', variant: 'success',   icon: CheckCircle },
  rejected:  { label: 'REJECTED',  variant: 'danger',    icon: XCircle },
  converted: { label: 'CONVERTED', variant: 'primary',   icon: CheckCircle },
};

const TABS = ['ALL', 'PENDING', 'SENT', 'CONFIRMED', 'REJECTED', 'CONVERTED'];

export default function HarvestSlips() {
  const navigate = useNavigate();
  const { harvestSlips, farmers, updateSlipStatus, convertSlipToTapal } = useAdminStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const filtered = harvestSlips.filter(s => {
    const matchTab = activeTab === 'ALL' || s.status.toUpperCase() === activeTab;
    const matchSearch =
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      s.farmer.name.toLowerCase().includes(search.toLowerCase()) ||
      s.products.some(p => p.fishName.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  const handleSendWhatsApp = (slip) => {
    updateSlipStatus(slip.id, 'sent');
    toast.success(`WhatsApp sent to ${slip.farmer.name}`);
  };

  const handleConfirm = (slip) => {
    updateSlipStatus(slip.id, 'confirmed');
    toast.success(`${slip.id} Confirmed`);
  };

  const handleReject = (slip) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;
    updateSlipStatus(slip.id, 'rejected', { rejectedReason: reason || 'No reason given' });
    toast.error(`${slip.id} Rejected`);
  };

  const handleConvert = (slip) => {
    if (slip.status !== 'confirmed') {
      toast.error('Slip must be Confirmed first');
      return;
    }
    convertSlipToTapal(slip.id);
    toast.success('Tapal created successfully!', { icon: '📋' });
  };

  const totalQty = harvestSlips.reduce((a, s) =>
    a + s.products.reduce((b, p) => b + p.quantity, 0), 0);

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
        <StatCard title="PENDING" value={harvestSlips.filter(s => s.status === 'pending').length.toString()} icon={Clock} trend="AWAITING" trendType="down" />
        <StatCard title="CONFIRMED" value={harvestSlips.filter(s => s.status === 'confirmed').length.toString()} icon={CheckCircle} trend="READY" trendType="up" />
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
                const cfg = STATUS_CONFIG[slip.status] || STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <tr key={slip.id} className="hover:bg-olive-50/50 transition-colors group">
                    <td className="px-4 py-2.5">
                      <p className="text-[11px] font-bold text-black uppercase">{slip.id}</p>
                      <p className="text-[8px] text-text-muted font-bold">{slip.createdAt}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[10px] font-bold text-black uppercase">{slip.farmer.name}</p>
                      <p className="text-[8px] text-text-muted font-bold flex items-center gap-1"><MapPin size={8} /> {slip.farmer.location}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      {slip.products.map((p, i) => (
                        <p key={i} className="text-[9px] font-bold text-black uppercase">
                          {p.fishName} — <span className="text-text-muted font-normal">{p.confirmedQty ?? p.quantity} {p.unit}</span>
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-[10px] font-bold text-black">{slip.harvestDate}</p>
                      <p className="text-[8px] text-text-muted font-bold uppercase">📦 {slip.pickupDate}</p>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={cfg.variant} className="uppercase text-[8px] font-bold border border-card-border px-2 py-0.5 flex items-center gap-1 w-fit shadow-none">
                        <StatusIcon size={9} /> {cfg.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 transition-all">
                        <button onClick={() => navigate(`/admin/procurement/harvest/${slip.id}`)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="View"><Eye size={13} /></button>
                        {slip.status === 'pending' && <button onClick={() => handleSendWhatsApp(slip)} className="p-1.5 text-green-600 hover:bg-green-50 transition-all border border-card-border/30 bg-white" title="WhatsApp"><Send size={13} /></button>}
                        {slip.status === 'sent' && (
                          <button onClick={() => handleConfirm(slip)} className="p-1.5 text-green-600 hover:bg-green-50 border border-card-border/30 bg-white" title="Confirm"><CheckCircle size={13} /></button>
                        )}
                        {slip.status === 'confirmed' && (
                          <button onClick={() => handleConvert(slip)} className="p-1.5 text-accent-olive hover:bg-olive-50 border border-card-border/30 bg-white" title="Convert"><RefreshCw size={13} /></button>
                        )}
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
          {farmers.map(farmer => (
            <Card key={farmer.id} className="border border-card-border hover:shadow-md transition-all bg-white overflow-hidden group" padding="none">
              <div className="p-3 border-b border-card-border flex justify-between items-start bg-olive-50/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm border border-black">
                    {farmer.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-black uppercase tracking-tight text-[11px]">{farmer.name}</h3>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest flex items-center gap-1"><MapPin size={8} /> {farmer.location}</p>
                  </div>
                </div>
                <Badge variant={farmer.active ? 'success' : 'secondary'} className="uppercase text-[7px] font-bold border border-card-border px-1.5">
                  {farmer.active ? 'ACTIVE' : 'IDLE'}
                </Badge>
              </div>
              <div className="p-3 flex justify-between items-center bg-white">
                 <div className="text-[9px] font-bold text-black flex items-center gap-1.5"><Phone size={10} className="text-accent-olive" /> {farmer.mobile}</div>
                 <button onClick={() => { setSearch(farmer.name); setActiveTab('ALL'); }} className="text-[8px] font-bold text-accent-olive uppercase tracking-widest hover:underline">VIEW SLIPS →</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { 
  FileText, 
  IndianRupee, 
  Clock, 
  Search,
  Download,
  Filter,
  MoreVertical,
  Plus
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const AdminBilling = () => {
  const { invoices } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'ALL') return matchesSearch;
    if (activeTab === 'OVERDUE') return matchesSearch && inv.status === 'overdue';
    return matchesSearch;
  });

  const totalReceivables = invoices
    .filter(inv => inv.type === 'SALES' && inv.status !== 'paid')
    .reduce((acc, inv) => acc + (inv.numericAmount || 0), 0);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Billing <span className="text-accent-olive">Management.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">FISCAL RECAP • GST INVOICING</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle"
            onClick={() => window.print()}
          >
            <Download size={12} /> EXPORT GST
          </Button>
          <Button size="sm"
            className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md"
            onClick={() => toast.success('New Invoice drafting...')}
          >
            <Plus size={12} /> NEW INVOICE
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="RECEIVABLES" value={`₹${(totalReceivables / 1000).toFixed(1)}K`} icon={IndianRupee} trend="+12%" trendType="up" />
        <StatCard title="PAYABLES" value="₹1.10L" icon={IndianRupee} trend="STABLE" trendType="up" />
        <StatCard title="INVOICES" value={invoices.length.toString()} icon={FileText} trend="ACTIVE" trendType="up" />
        <StatCard title="OVERDUE" value={invoices.filter(i => i.status === 'overdue').length.toString()} icon={Clock} trend="URGENT" trendType="down" />
      </div>

      {/* Table Container */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-2 border-b border-card-border flex flex-col md:flex-row justify-between gap-4 bg-white">
          <div className="flex bg-olive-100/30 p-0.5 rounded-none w-fit border border-card-border/50">
            {['ALL', 'PENDING', 'OVERDUE'].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={clsx('px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all', activeTab === t ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black')}>
                {t}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input type="text" placeholder="SEARCH INVOICES..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive shadow-subtle" />
            </div>
            <Button variant="outline" size="sm" className="h-8 px-3 border-card-border"><Filter size={14} /></Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Invoice</th>
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Client</th>
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Type</th>
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Amount</th>
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="px-4 py-2.5">
                    <p className="text-[11px] font-bold text-black uppercase">{inv.id}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase">{inv.date}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[10px] font-bold text-black uppercase">{inv.client}</p>
                    <p className="text-[7px] text-text-muted font-bold tracking-widest uppercase">ID: {inv.id.split('-')[1]}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={inv.type === 'SALES' ? 'secondary' : 'primary'} className="uppercase text-[7px] font-bold border-none px-1.5 h-4">
                      {inv.type}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[11px] font-bold text-black">{inv.amount}</p>
                    <p className="text-[7px] text-text-muted font-bold uppercase mt-0.5">Incl. GST</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'danger'} 
                      className="uppercase text-[7px] font-bold border border-card-border px-2 py-0.5 shadow-none">
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1 transition-all">
                      <button onClick={() => window.print()} className="p-1.5 text-black hover:bg-black hover:text-white border border-card-border/30 bg-white shadow-subtle active:scale-95"><Download size={13} /></button>
                      <button className="p-1.5 text-black hover:bg-black hover:text-white border border-card-border/30 bg-white shadow-subtle active:scale-95"><MoreVertical size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminBilling;

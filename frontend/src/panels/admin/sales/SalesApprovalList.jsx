import React, { useState, useEffect } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const SalesApprovalList = () => {
  const navigate = useNavigate();
  const { tapals, fetchTapals, loading } = useAdminStore();
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTapals();
  }, [fetchTapals]);

  // Filter for Sales tapals that require Channappa's approval
  const salesTapals = tapals.filter(t => t.type === 'Sale');
  
  const filteredTapals = salesTapals.filter(tapal => {
    const status = tapal.status || '';
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && (status.toLowerCase().includes('pending') || status.toLowerCase().includes('created'))) ||
      (filter === 'approved' && (status.toLowerCase().includes('completed') || status.toLowerCase().includes('approved'))) ||
      (filter === 'rejected' && status.toLowerCase().includes('rejected')) ||
      status.toLowerCase().includes(filter.toLowerCase());

    const party = tapal.partyName || tapal.party || '';
    const number = tapal.tapalNumber || tapal._id || tapal.id || '';
    const matchesSearch = 
      number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusVariant = (status = '') => {
    const s = status.toLowerCase();
    if (s.includes('pending') || s.includes('created')) return 'warning';
    if (s.includes('approved') || s.includes('completed')) return 'success';
    if (s.includes('rejected')) return 'danger';
    if (s.includes('requested')) return 'info';
    return 'secondary';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Sales <span className="text-accent-olive">Approval Queue.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">PENDING REVIEW • CHANNAPPA PANEL</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="warning" className="px-3 py-1 text-[10px] font-bold border border-amber-200 shadow-sm animate-pulse">
            {salesTapals.filter(t => t.status === 'Pending Approval').length} PENDING
          </Badge>
        </div>
      </div>

      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        <div className="px-4 py-2 flex flex-col md:flex-row justify-between gap-4 border-b border-card-border bg-white">
          <div className="flex bg-olive-100/30 p-0.5 rounded-none w-fit border border-card-border/50">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={clsx(
                  'px-3 py-1.5 rounded-none text-[8px] font-bold uppercase tracking-widest transition-all',
                  filter === tab ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black hover:bg-white/50'
                )}
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
                placeholder="SEARCH TAPAL ID, BUYER..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border rounded-none py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">ID / Date</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Buyer Name</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Qty / Amount</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader size={24} className="text-accent-olive animate-spin" />
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Loading Sales Approval Queue...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTapals.length > 0 ? filteredTapals.map((tapal) => (
                <tr key={tapal._id || tapal.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="px-4 py-2.5">
                    <p className="text-[11px] font-bold text-black uppercase">{tapal.tapalNumber || tapal.id}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase">{tapal.date || new Date(tapal.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[10px] font-bold text-black uppercase">{tapal.partyName || tapal.party}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase truncate max-w-[150px]">{tapal.deliveryAddress || 'NO ADDRESS'}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[10px] font-bold text-black">{tapal.qty}</p>
                    <p className="text-[9px] font-serif italic font-bold text-accent-olive">{tapal.amount}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={getStatusVariant(tapal.status)} className="px-2 py-0.5 text-[8px] font-bold border border-card-border shadow-none">
                      {(tapal.status || 'CREATED').toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-[9px] font-bold h-7 px-3 gap-1.5"
                      onClick={() => navigate(`/admin/sales-approval/${tapal._id || tapal.id}`)}
                    >
                      <Eye size={12} /> VIEW & REVIEW
                    </Button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                      <Clock size={32} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">No tapals found in queue</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SalesApprovalList;

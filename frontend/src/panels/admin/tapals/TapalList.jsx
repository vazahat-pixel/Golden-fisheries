import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { Modal } from '../../../design-system/components/Modal';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Truck, 
  FileText,
  Download,
  MoreVertical,
  Pencil,
  Check,
  MessageCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const TapalList = () => {
  const navigate = useNavigate();
  const { tapals: storeTapals, editTapal, drivers } = useAdminStore();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTapal, setEditingTapal] = useState(null);
  const [editFormData, setEditFormData] = useState({ 
    party: '', 
    qty: '', 
    amount: '', 
    type: 'Purchase', 
    driver: '',
    date: '' 
  });

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'in-transit': return 'secondary';
      case 'delivered': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const filteredTapals = storeTapals.filter(tapal => {
    const matchesFilter = filter === 'all' || tapal.type.toLowerCase() === filter.toLowerCase();
    const matchesSearch = 
      tapal.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tapal.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tapal.driver && tapal.driver.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const openEditModal = (tapal) => {
    setEditingTapal(tapal);
    setEditFormData({ 
      party: tapal.party,
      qty: tapal.qty.replace(' KG', ''), 
      amount: tapal.amount.replace('₹', '').replace(/,/g, ''),
      type: tapal.type,
      driver: tapal.driver || 'Unassigned',
      date: tapal.date
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editFormData.party || !editFormData.qty || !editFormData.amount) {
      toast.error('Required fields are missing');
      return;
    }
    
    editTapal(editingTapal.id, {
      party: editFormData.party.toUpperCase(),
      qty: `${editFormData.qty} KG`,
      amount: `₹${Number(editFormData.amount).toLocaleString()}`,
      type: editFormData.type,
      driver: editFormData.driver,
      date: editFormData.date
    });
    
    setIsEditModalOpen(false);
    toast.success('Tapal information updated');
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Tapal <span className="text-accent-olive">System.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">PURCHASE & SALES • LOGISTICS</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle"
            onClick={() => toast.success('Exporting tapal data...')}
          >
            <Download size={12} /> EXPORT
          </Button>
          <div className="flex gap-2">
            <Link to="/admin/tapals/purchase/new">
              <Button size="sm" className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md bg-amber-600 border-amber-600">
                <Plus size={12} /> PURCHASE
              </Button>
            </Link>
            <Link to="/admin/tapals/sales/new">
              <Button size="sm" className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md">
                <Plus size={12} /> SALES
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        {/* Toolbar */}
        <div className="px-4 py-2 flex flex-col md:flex-row justify-between gap-4 border-b border-card-border bg-white">
          <div className="flex bg-olive-100/30 p-0.5 rounded-none w-fit border border-card-border/50">
            {['all', 'purchase', 'sale'].map((tab) => (
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
                placeholder="SEARCH TAPAL ID, PARTY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border rounded-none py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 px-3 border-card-border"><Filter size={14} /></Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/20">
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">ID / Date</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Party / Type</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Qty / Amount</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Logistics</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/50">
              {filteredTapals.map((tapal) => (
                <tr key={tapal.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="px-4 py-2.5">
                    <p className="text-[11px] font-bold text-black uppercase">{tapal.id}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase">{tapal.date}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[10px] font-bold text-black uppercase">{tapal.party}</p>
                    <Badge variant={tapal.type.toLowerCase() === 'purchase' ? 'info' : 'secondary'} className="bg-opacity-10 text-[7px] border-none px-1 h-3.5 mt-0.5">{tapal.type}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <p className="text-[10px] font-bold text-black">{tapal.qty}</p>
                    <p className="text-[9px] font-serif italic font-bold text-accent-olive">{tapal.amount}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <Truck size={10} className={!tapal.driver || tapal.driver === 'Unassigned' ? 'text-text-muted/30' : 'text-accent-olive'} />
                      <span className="text-[9px] font-bold uppercase text-black">{tapal.driver || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                       <Badge variant={getStatusVariant(tapal.status)} className="px-2 py-0.5 text-[8px] font-bold border border-card-border shadow-none">
                         {tapal.status}
                       </Badge>
                       {tapal.suggestedChanges && (
                          <div className="w-5 h-5 bg-accent-olive/10 text-accent-olive rounded-full flex items-center justify-center animate-pulse" title="Manager Feedback Available">
                             <MessageCircle size={10} />
                          </div>
                       )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex justify-end gap-1 transition-all">
                      <button onClick={() => openEditModal(tapal)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="Quick Edit"><Pencil size={13} /></button>
                      <button onClick={() => navigate(`/admin/tapals/${tapal.id}`)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="View"><Eye size={13} /></button>
                      <button onClick={() => window.print()} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="Print"><FileText size={13} /></button>
                      <button className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white"><MoreVertical size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Edit Modal - All Info Editable */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title={`Edit Tapal: ${editingTapal?.id}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">TRANSACTION TYPE</label>
              <select 
                value={editFormData.type} 
                onChange={(e) => setEditFormData({...editFormData, type: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none bg-white appearance-none"
              >
                <option value="Purchase">PURCHASE</option>
                <option value="Sale">SALE</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">DATE</label>
              <input 
                type="text" 
                value={editFormData.date} 
                onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none uppercase"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">PARTY NAME</label>
            <input 
              type="text" 
              value={editFormData.party} 
              onChange={(e) => setEditFormData({...editFormData, party: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none uppercase"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">QUANTITY (KG)</label>
              <input 
                type="number" 
                value={editFormData.qty} 
                onChange={(e) => setEditFormData({...editFormData, qty: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">AMOUNT (₹)</label>
              <input 
                type="number" 
                value={editFormData.amount} 
                onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">ASSIGNED DRIVER</label>
            <select 
              value={editFormData.driver} 
              onChange={(e) => setEditFormData({...editFormData, driver: e.target.value})}
              className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none bg-white appearance-none"
            >
              <option value="Unassigned">UNASSIGNED</option>
              {drivers.map(d => (
                <option key={d.id} value={d.name}>{d.name.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 text-[9px] font-bold h-9" onClick={() => setIsEditModalOpen(false)}>CANCEL</Button>
            <Button className="flex-1 text-[9px] font-bold h-9 gap-2" onClick={handleSaveEdit}><Check size={14} /> UPDATE RECORD</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TapalList;

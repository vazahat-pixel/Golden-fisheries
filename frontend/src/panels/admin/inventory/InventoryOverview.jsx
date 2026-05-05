import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Search, 
  Package, 
  Layers,
  AlertCircle,
  Plus,
  Filter,
  History,
  MoreVertical,
  MinusCircle,
  PlusCircle,
  Truck,
  ArrowRight,
  Clock
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const InventoryOverview = () => {
  const { inventory, updateInventoryQty, addInventoryItem, incomingStock } = useAdminStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filteredInventory = inventory.filter(item => {
    const matchesTab = activeTab === 'All' || 
                      (activeTab === 'Low' && item.status === 'low-stock') ||
                      (activeTab === 'Out' && item.status === 'out-of-stock');
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleAddNew = () => {
    const name = prompt("Enter product name:");
    if (!name) return;
    const category = prompt("Enter category (FRESHWATER/SEAFOOD):", "FRESHWATER");
    const qty = parseInt(prompt("Initial quantity:", "0"));
    const price = parseInt(prompt("Price per unit (₹):", "100"));
    
    if (name && category && !isNaN(qty) && !isNaN(price)) {
      addInventoryItem({
        name: name.toUpperCase(),
        category: category.toUpperCase(),
        qty,
        unit: 'KG',
        price,
        status: qty === 0 ? 'out-of-stock' : qty < 50 ? 'low-stock' : 'in-stock'
      });
      toast.success(`${name} added to inventory`);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'in-stock': return 'success';
      case 'low-stock': return 'warning';
      case 'out-of-stock': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Inventory <span className="text-accent-olive">Control.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">STOCK MANAGEMENT • REAL-TIME TRACKING</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle bg-white"
            onClick={() => toast.success('Stock history loading...')}
          >
            <History size={12} /> HISTORY
          </Button>
          <Button 
            size="sm"
            className="gap-2 text-[9px] font-bold uppercase tracking-widest px-4 h-9 shadow-md"
            onClick={handleAddNew}
          >
            <Plus size={12} /> ADD NEW ITEM
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="TOTAL STOCK" value={inventory.reduce((acc, curr) => acc + curr.qty, 0).toLocaleString() + ' KG'} icon={Package} trend="TOTAL" trendType="up" />
        <StatCard title="LOW STOCK" value={inventory.filter(i => i.status === 'low-stock').length.toString()} icon={AlertCircle} trend="CRITICAL" trendType="down" />
        <StatCard title="CATEGORIES" value={new Set(inventory.map(i => i.category)).size.toString()} icon={Layers} trend="ACTIVE" trendType="up" />
        <StatCard title="INCOMING" value={incomingStock.filter(i => i.status === 'in-transit').length.toString()} icon={Truck} trend="AWAITING" trendType="up" />
      </div>

      {/* Main Tabs */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        <div className="px-4 py-2 flex flex-col md:flex-row justify-between gap-4 border-b border-card-border bg-white">
          <div className="flex bg-olive-100/30 p-0.5 rounded-none w-fit border border-card-border/50">
            {['All', 'Low', 'Out', 'Incoming'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'px-3 py-1.5 rounded-none text-[8px] font-bold uppercase tracking-widest transition-all',
                  activeTab === tab ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black hover:bg-white/50'
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
                placeholder="SEARCH INVENTORY..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border rounded-none py-2 pl-9 pr-4 text-[9px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 px-3 border-card-border"><Filter size={14} /></Button>
          </div>
        </div>

        {activeTab === 'Incoming' ? (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-olive-100/10">
                   <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Expected Date</th>
                   <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Tapal ID</th>
                   <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Product</th>
                   <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Exp. Qty</th>
                   <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-olive-100/30">
                 {incomingStock.filter(i => i.status === 'in-transit').length === 0 ? (
                   <tr><td colSpan={5} className="px-4 py-12 text-center text-[10px] font-bold text-text-muted uppercase">No incoming shipments at the moment.</td></tr>
                 ) : (
                   incomingStock.filter(i => i.status === 'in-transit').map((item) => (
                     <tr key={item.id} className="hover:bg-olive-50/30 transition-colors">
                       <td className="px-4 py-3 text-[10px] font-bold text-black flex items-center gap-2"><Clock size={12} className="text-accent-olive" /> TODAY</td>
                       <td className="px-4 py-3 text-[10px] font-bold text-black uppercase tracking-tight underline cursor-pointer">{item.tapalId}</td>
                       <td className="px-4 py-3 text-[10px] font-bold text-black uppercase">{item.productName}</td>
                       <td className="px-4 py-3 text-[10px] font-bold text-black text-right">{item.expectedQty}</td>
                       <td className="px-4 py-3 text-center">
                          <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-200 uppercase text-[7px] font-bold italic shadow-none">IN TRANSIT</Badge>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olive-100/10">
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Product Name</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Category</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Current Qty</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Price/Unit</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100/30">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-olive-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="text-[10px] font-bold text-black uppercase tracking-tight">{item.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-[10px] font-bold text-black">{item.qty} {item.unit}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={getStatusVariant(item.status)} className="uppercase text-[7px] font-bold border border-card-border px-1.5 h-4">
                        {item.status.replace('-', ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-[9px] font-serif italic font-bold text-accent-olive">₹{item.price}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => updateInventoryQty(item.id, 50)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="Add Stock"><PlusCircle size={13} /></button>
                        <button onClick={() => updateInventoryQty(item.id, -50)} className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white" title="Reduce Stock"><MinusCircle size={13} /></button>
                        <button className="p-1.5 text-black hover:bg-black hover:text-white transition-all border border-card-border/30 bg-white"><MoreVertical size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default InventoryOverview;

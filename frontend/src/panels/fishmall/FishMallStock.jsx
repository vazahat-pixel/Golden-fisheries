import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  ClipboardList, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Scale, 
  Search,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallStock = () => {
  const { stock, updateStockQty, bills } = useFishMallStore();
  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(stock[0]?.id || '');
  const [inflowQty, setInflowQty] = useState('');

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalItems = stock.filter(i => i.qty < 50).length;

  const handleInflow = () => {
    if (!selectedProduct || !inflowQty) return;
    updateStockQty(parseInt(selectedProduct), parseFloat(inflowQty));
    toast.success('Stock replenished');
    setInflowQty('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 selection:bg-black selection:text-white">
      {/* Inventory Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 border border-black/5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
            Inventory <span className="text-[#6B7550]">Console.</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-text-muted text-[8px] font-black uppercase tracking-[0.3em]">Real-time Mall Stock Monitoring</p>
            <div className="h-1 w-1 rounded-full bg-black/20" />
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#6B7550]">Last Synced: Just Now</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-[9px] font-black border-black/10 uppercase tracking-[0.2em] px-6 py-5 bg-white hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => toast.success('Reconstructing archival logs...')}
          >
            <History size={14} className="mr-2" /> Export Audit
          </Button>
          <Button 
            className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-5 bg-black text-white hover:bg-[#6B7550] border-none shadow-xl active:scale-95 transition-all"
            onClick={() => toast.success('Registry Broadcasted!')}
          >
            <ClipboardList size={14} className="mr-2" /> Broadcast Stock
          </Button>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Stock Level', value: `${totalStockKg} KG`, sub: 'Total Weight', icon: ClipboardList },
          { label: 'Settled Transactions', value: `${bills.length}`, sub: 'Daily Count', icon: CheckCircle2 },
          { label: 'Registry Load', value: 'High', sub: 'System Status', icon: Scale },
          { label: 'Alert Frequency', value: criticalItems.toString(), sub: 'Low Stock SKU', icon: AlertCircle, alert: criticalItems > 0 }
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 border border-black/5 shadow-subtle bg-white group hover:border-[#6B7550]/20 transition-all">
            <div className="flex justify-between items-start mb-2">
              <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em]">{stat.label}</p>
              <stat.icon size={14} className={stat.alert ? 'text-red-500 animate-pulse' : 'text-black/10 group-hover:text-black transition-colors'} />
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-xl font-black tracking-tighter ${stat.alert ? 'text-red-500' : 'text-black'}`}>{stat.value}</h3>
              <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">{stat.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="border border-black/5 shadow-sm bg-white overflow-hidden">
            <div className="border-b border-black/5 bg-gray-50/30 flex">
              {[
                { id: 'inventory', label: 'LIVE INVENTORY', icon: ClipboardList },
                { id: 'history', label: 'TRANSACTION LOGS', icon: History }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white border-b-2 border-black text-black' : 'text-black/40 hover:text-black hover:bg-gray-100/50'}`}
                >
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 border-b border-black/5 bg-white flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={14} />
                <input 
                  type="text" 
                  placeholder="QUICK SEARCH REGISTRY..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-black transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-black/5">
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-text-muted">SKU Identification</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-text-muted text-center">Net Weight</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-text-muted text-center">Status</th>
                    <th className="px-6 py-4 text-[8px] font-black uppercase tracking-[0.3em] text-text-muted text-right">Last Movement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {activeTab === 'inventory' ? (
                    filteredStock.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{item.name}</p>
                          <p className="text-[7px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60">{item.category}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-lg font-serif italic font-black text-black tracking-tighter">{item.qty}</span>
                            <span className="text-[7px] font-black text-text-muted uppercase mt-1">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Badge className={`font-black uppercase tracking-widest text-[7px] px-3 py-1 border-none ${item.qty < 50 ? 'bg-red-500 text-white' : 'bg-[#6B7550] text-white shadow-[0_0_10px_rgba(107,117,80,0.3)]'}`}>
                            {item.qty < 50 ? 'CRITICAL' : 'OPTIMAL'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[9px] font-black text-black/30 uppercase tracking-widest group-hover:text-black transition-colors">{item.lastSync}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    bills.slice(0, 10).map((bill, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{bill.id.slice(0, 8)}</p>
                          <p className="text-[7px] text-text-muted font-black uppercase tracking-widest mt-1">{bill.paymentMethod}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <p className="text-lg font-serif italic font-black text-black tracking-tighter">₹{bill.total.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-2 text-[#6B7550] font-black text-[7px] uppercase tracking-widest bg-[#6B7550]/10 px-3 py-1">
                            <CheckCircle2 size={10} /> SETTLED
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-[9px] font-black text-text-muted group-hover:text-black uppercase tracking-widest transition-colors">
                          {new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                  {((activeTab === 'inventory' && filteredStock.length === 0) || (activeTab === 'history' && bills.length === 0)) && (
                    <tr>
                      <td colSpan="4" className="px-6 py-20 text-center opacity-10">
                         <p className="text-[10px] font-black uppercase tracking-widest">No registry data detected</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-black text-white p-8 relative overflow-hidden group border-none shadow-2xl">
            <div className="relative z-10 h-full flex flex-col">
              <h3 className="text-2xl font-serif italic font-black mb-6 uppercase tracking-tight leading-none">Stock<br/>Inflow.</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Variety Selector</label>
                  <div className="relative">
                    <select 
                      value={selectedProduct}
                      onChange={e => setSelectedProduct(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-white appearance-none text-white hover:bg-white/10 transition-all"
                    >
                      {stock.map(item => <option key={item.id} value={item.id} className="text-black">{item.name}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <ArrowDownCircle size={14} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40">Replenishment Weight (KG)</label>
                  <input 
                    type="number" 
                    value={inflowQty}
                    onChange={e => setInflowQty(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 px-4 py-3.5 text-[10px] font-black outline-none focus:border-white text-white hover:bg-white/10 transition-all placeholder:text-white/10"
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black border-none font-black mt-4 shadow-xl hover:bg-[#6B7550] hover:text-white py-4 text-[10px] uppercase tracking-[0.3em] active:scale-95 transition-all"
                  onClick={handleInflow}
                >
                  Commit to Registry
                </Button>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rotate-12 group-hover:scale-125 transition-transform duration-1000" />
            <ArrowUpCircle className="absolute top-6 right-6 text-white/10" size={64} />
          </Card>

          <Card className="p-6 border border-black/5 shadow-subtle bg-white relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif italic font-black text-black uppercase tracking-tight text-base leading-none">Critical Reorder</h3>
              <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {stock.filter(i => i.qty < 50).slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-red-50/50 border border-red-100/50 group hover:bg-red-500 transition-all cursor-pointer">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-black uppercase tracking-tight group-hover:text-white">{item.name}</p>
                    <p className="text-[8px] text-red-600 font-black uppercase tracking-widest group-hover:text-white/80">{item.qty} {item.unit} REMAINING</p>
                  </div>
                  <Badge className="bg-red-500 text-white text-[7px] font-black uppercase px-2 py-1 border-none shadow-sm">CRITICAL</Badge>
                </div>
              ))}
              {criticalItems === 0 && (
                <div className="py-20 text-center opacity-10">
                   <CheckCircle2 size={40} className="mx-auto mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Registry Stable</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FishMallStock;

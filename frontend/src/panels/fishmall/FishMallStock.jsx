import React, { useState } from 'react';
import { 
  ClipboardList, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Scale, 
  Search,
  History,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Plus,
  Clock,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFishMallStore } from '../../store/fishMallStore';
import { Button } from '../../design-system/components/Button';

const FishMallStock = () => {
  const { stock, updateStockQty, stockLogs, addStockItem, fetchStock } = useFishMallStore();
  
  React.useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(stock[0]?.id || '');
  const [inflowQty, setInflowQty] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Premium', rate: '', qty: '' });

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalItems = stock.filter(i => i.qty < 50).length;

  const handleInflow = () => {
    if (!selectedProduct || !inflowQty) {
      toast.error('Select product and enter weight');
      return;
    }
    updateStockQty(parseInt(selectedProduct), parseFloat(inflowQty));
    toast.success('Stock replenished');
    setInflowQty('');
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.rate || !newItem.qty) {
      toast.error('Please fill all fields');
      return;
    }
    addStockItem({
      ...newItem,
      qty: parseFloat(newItem.qty),
      rate: parseFloat(newItem.rate),
      unit: 'KG',
      lastSync: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    setNewItem({ name: '', category: 'Premium', rate: '', qty: '' });
    toast.success('New variety added to registry');
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 animate-in fade-in duration-300 font-sans">
      {/* Minimal Header */}
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            Inventory Console
            <span className="text-[8px] bg-black text-white px-1.5 py-0.5 font-black">SYNC</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Mall Stock Monitoring • Terminal: #FM-02</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="text-[8px] font-black uppercase tracking-widest px-4 py-2 bg-black text-white border-none shadow-lg transition-all rounded-lg gap-2"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={12} /> Add New Variety
          </Button>
        </div>
      </header>

      {/* KPI Matrix */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Stock', value: `${totalStockKg.toFixed(1)} KG`, icon: ClipboardList, color: 'bg-[#6B7550]/10 text-[#6B7550]' },
          { label: 'Movement Logs', value: stockLogs.length, icon: History, color: 'bg-blue-50 text-blue-500' },
          { label: 'Varieties', value: stock.length, icon: Layers, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Alerts', value: criticalItems, icon: AlertCircle, alert: criticalItems > 0, color: criticalItems > 0 ? 'bg-rose-50 text-rose-500' : 'bg-gray-50 text-gray-400' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 border border-gray-200 shadow-sm rounded-2xl flex items-center gap-4 group hover:border-[#6B7550] transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={16} className={stat.alert ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-base font-black tracking-tight text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
          {/* Tabs */}
          <div className="border-b border-gray-100 bg-gray-50/50 flex">
            {[
              { id: 'inventory', label: 'LIVE INVENTORY', icon: ClipboardList },
              { id: 'history', label: 'MOVEMENT LOGS', icon: History }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 relative ${activeTab === tab.id ? 'bg-white text-[#6B7550]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <tab.icon size={14} /> 
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6B7550]" />}
              </button>
            ))}
          </div>

          <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH REGISTRY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-[#6B7550] transition-all rounded-xl"
              />
            </div>
            {activeTab === 'history' && (
              <Button variant="outline" size="sm" className="h-10 text-[9px] font-black uppercase tracking-widest px-4 border-gray-200">
                Download PDF
              </Button>
            )}
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Identification</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Weight Status</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Health</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTab === 'inventory' ? (
                  filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{item.category}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-base font-black text-gray-900">{item.qty.toFixed(1)}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${item.qty < 50 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                           {item.qty < 50 ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                           {item.qty < 50 ? 'REFILL REQ.' : 'OPTIMAL'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-[9px] font-black text-gray-300 group-hover:text-gray-600 transition-colors uppercase tracking-widest">{item.lastSync}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{log.productName}</p>
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase mt-1 ${log.type === 'INFLOW' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           {log.type === 'INFLOW' ? <ArrowDownCircle size={8} /> : <ArrowUpCircle size={8} />}
                           {log.type}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[11px] font-black ${log.type === 'INFLOW' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {log.type === 'INFLOW' ? '+' : '-'}{log.delta.toFixed(1)} KG
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                         <div className="inline-flex items-center gap-1.5 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                            <Clock size={10} /> VERIFIED
                         </div>
                      </td>
                      <td className="px-6 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
                {(activeTab === 'inventory' ? filteredStock : stockLogs).length === 0 && (
                   <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center opacity-10">
                        <ClipboardList size={64} className="mb-4" />
                        <p className="text-xl font-black uppercase tracking-[0.2em]">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {/* Stock Inflow Terminal */}
          <div className="bg-black text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-black uppercase tracking-tighter leading-none italic">Inflow Terminal</h3>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.2em]">Manual weight registry update</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Species Selection</label>
                  <select 
                    value={selectedProduct}
                    onChange={e => setSelectedProduct(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-4 py-4 text-[11px] font-black uppercase tracking-widest outline-none focus:border-white text-white rounded-2xl appearance-none"
                  >
                    {stock.map(item => <option key={item.id} value={item.id} className="text-black">{item.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase tracking-widest text-white/40 ml-1">Cargo Weight (KG)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                    <input 
                      type="number" 
                      value={inflowQty}
                      onChange={e => setInflowQty(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-4 text-[11px] font-black outline-none focus:border-white text-white rounded-2xl placeholder:text-white/10"
                    />
                  </div>
                </div>
                <Button 
                  className="w-full bg-[#6B7550] text-white border-none font-black py-5 text-[10px] uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all rounded-2xl mt-4 shadow-xl shadow-[#6B7550]/20"
                  onClick={handleInflow}
                >
                  Confirm Movement
                </Button>
              </div>
            </div>
            <ArrowDownCircle className="absolute -right-8 -bottom-8 text-white/5" size={180} />
          </div>

          {/* Quick Stats / Refill Needed */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-[40px] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Restock Priority</h3>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black ${criticalItems > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {criticalItems > 0 ? 'ACTION REQ.' : 'STABLE'}
              </div>
            </div>
            <div className="space-y-3">
              {stock.filter(i => i.qty < 50).slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-rose-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-rose-400 rounded-full" />
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                      <p className="text-[8px] text-gray-400 font-bold uppercase">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-black text-rose-500 tracking-tight">{item.qty.toFixed(1)} KG</p>
                    <p className="text-[7px] text-gray-300 font-black uppercase">REMAINING</p>
                  </div>
                </div>
              ))}
              {criticalItems === 0 && (
                <div className="py-12 text-center">
                   <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                     <CheckCircle2 size={32} />
                   </div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Inventory Saturated</p>
                   <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">Next restock due in 24h</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add New Variety Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="bg-[#6B7550] p-8 text-white flex justify-between items-start">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">New Registry</h2>
                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Registering a new species into stock</p>
                 </div>
                 <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                    <Plus size={24} className="rotate-45" />
                 </button>
              </div>
              <form onSubmit={handleAddNew} className="p-8 space-y-5">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Species Name</label>
                    <input 
                      autoFocus
                      placeholder="E.G. ATLANTIC SALMON"
                      className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-[11px] font-black uppercase outline-none focus:border-[#6B7550] rounded-2xl"
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-[11px] font-black uppercase outline-none focus:border-[#6B7550] rounded-2xl"
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value})}
                      >
                        {['Premium', 'Regular', 'Shellfish', 'Exotic'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Market Rate (₹/KG)</label>
                      <input 
                        type="number"
                        placeholder="0.00"
                        className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-[11px] font-black outline-none focus:border-[#6B7550] rounded-2xl"
                        value={newItem.rate}
                        onChange={e => setNewItem({...newItem, rate: e.target.value})}
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Opening Stock (KG)</label>
                    <input 
                      type="number"
                      placeholder="0.0"
                      className="w-full bg-gray-50 border border-gray-100 px-5 py-4 text-[11px] font-black outline-none focus:border-[#6B7550] rounded-2xl"
                      value={newItem.qty}
                      onChange={e => setNewItem({...newItem, qty: e.target.value})}
                    />
                 </div>
                 <Button type="submit" className="w-full py-6 bg-black text-white hover:bg-[#6B7550] text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl mt-4">
                    Commit to Registry
                 </Button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FishMallStock;

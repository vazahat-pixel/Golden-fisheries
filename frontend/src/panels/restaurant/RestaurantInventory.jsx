import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, AlertTriangle, ArrowLeft, History, Package, DollarSign, Filter, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantInventory = () => {
  const navigate = useNavigate();
  const { menuItems, updateMenuItem, addMenuItem, deleteMenuItem, updateStock } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Main Course',
    image: '🍛',
    stock: ''
  });

  const filteredInventory = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = menuItems.filter(i => i.stock < 10);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };

    if (editingItem) {
      updateMenuItem({ ...data, id: editingItem.id });
      toast.success('Item updated');
    } else {
      addMenuItem(data);
      toast.success('Item added');
    }
    setIsAdding(false);
    setEditingItem(null);
    setFormData({ name: '', price: '', category: 'Main Course', image: '🍛', stock: '' });
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-8">
      {/* Tactical Inventory Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-card-border hover:bg-slate-50 rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
                Stock <span className="text-accent-olive">Manifest.</span>
              </h1>
              <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black">{menuItems.length} SKU</Badge>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">KITCHEN RESOURCE REGISTRY • ASSET MONITORING</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
            variant="outline"
            className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-card-border shadow-sm"
            onClick={() => setIsAdding(true)}
           >
             <Plus size={14} className="mr-2" /> ADD ASSET
           </Button>
        </div>
      </header>

      <div className="space-y-6">
        {/* Search & Alerts Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH ASSET REGISTRY..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none transition-all shadow-sm"
            />
          </div>
          <div className="bg-white border border-card-border p-4 px-6 flex items-center justify-between min-w-[240px] shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-full ${lowStockItems.length > 0 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-50 text-slate-300'}`}>
                 <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">CRITICAL ALERTS</p>
                <p className={`text-lg font-black font-serif italic ${lowStockItems.length > 0 ? 'text-red-600' : 'text-black'}`}>
                  {lowStockItems.length} <span className="text-[10px] font-bold uppercase tracking-widest opacity-30 italic">Items</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* High-Density Tactical Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInventory.map((item) => (
            <Card key={item.id} padding="none" className="bg-white border border-card-border shadow-sm flex flex-col hover:border-accent-olive transition-all group overflow-hidden">
              <div className="aspect-[16/9] bg-slate-50 flex items-center justify-center text-4xl relative group-hover:bg-slate-100 transition-colors">
                {item.image}
                <div className="absolute top-3 left-3">
                  <Badge className={`text-[7px] font-black border-none px-2 h-4 ${item.stock < 10 ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                    {item.stock < 10 ? 'CRITICAL' : 'NOMINAL'}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setEditingItem(item);
                          setFormData({
                            name: item.name,
                            price: item.price.toString(),
                            category: item.category,
                            image: item.image,
                            stock: item.stock.toString()
                          });
                        }}
                        className="w-7 h-7 bg-white border border-card-border flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm"
                      >
                         <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm('Erase asset from registry?')) deleteMenuItem(item.id);
                        }}
                        className="w-7 h-7 bg-white border border-card-border flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm"
                      >
                         <Trash2 size={12} />
                      </button>
                   </div>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-[8px] text-accent-olive font-black uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="text-xs font-black text-black uppercase tracking-tight line-clamp-1 italic font-serif">{item.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 border border-card-border divide-x divide-card-border">
                  <div className="p-2.5 text-center bg-slate-50/50">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">INVENTORY</p>
                     <p className="text-sm font-serif italic font-black text-black">{item.stock}</p>
                  </div>
                  <div className="p-2.5 text-center">
                     <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">UNIT RATE</p>
                     <p className="text-sm font-serif italic font-black text-accent-olive">₹{item.price}</p>
                  </div>
                </div>
              </div>
              
              <div className="px-4 pb-4">
                 <button 
                  onClick={() => {
                    setEditingItem(item);
                    setFormData({...item, price: item.price.toString(), stock: item.stock.toString()});
                  }}
                  className="w-full py-2 bg-slate-50 border border-card-border text-[8px] font-black uppercase tracking-[0.2em] hover:bg-black hover:text-white hover:border-black transition-all"
                 >
                   MANAGE ASSET
                 </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Procurement Alert */}
      {lowStockItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right duration-500">
           <Card padding="none" className="bg-black text-white p-4 flex items-center gap-6 shadow-2xl border-l-4 border-red-600">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-red-600/20 text-red-500 flex items-center justify-center animate-pulse">
                    <AlertTriangle size={20} />
                 </div>
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest">STOCK_CRITICAL</p>
                    <p className="text-[7px] text-white/40 font-bold uppercase tracking-widest">{lowStockItems.length} UNITS REQUIRE ATTENTION</p>
                 </div>
              </div>
              <Button className="h-9 px-6 bg-white text-black text-[8px] font-black uppercase tracking-widest border-none hover:bg-accent-olive hover:text-white transition-all">
                 RESOLVE NOW
              </Button>
           </Card>
        </div>
      )}

      {/* Registry Entry Modal */}
      {(isAdding || editingItem) && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md bg-white border border-card-border shadow-2xl">
            <div className="p-6 border-b border-card-border flex justify-between items-center bg-slate-50/50">
              <div>
                <p className="text-[8px] font-black text-accent-olive uppercase tracking-[0.3em]">SECURE_REGISTRY</p>
                <h2 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">
                  {editingItem ? 'Update Asset' : 'New Entry'}
                </h2>
              </div>
              <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="w-10 h-10 border border-card-border flex items-center justify-center hover:bg-slate-100 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Asset Identity</label>
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-50 border border-card-border p-3 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive transition-all" 
                    placeholder="E.G. FRESH POMFRET LARGE"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Unit Rate (₹)</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      className="w-full bg-slate-50 border border-card-border p-3 text-sm font-black font-serif italic outline-none focus:ring-1 focus:ring-accent-olive transition-all" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Initial Stock</label>
                    <input 
                      required 
                      type="number" 
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})} 
                      className="w-full bg-slate-50 border border-card-border p-3 text-sm font-black font-serif italic outline-none focus:ring-1 focus:ring-accent-olive transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-slate-400">Asset Category</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="w-full bg-slate-50 border border-card-border p-3 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-1 focus:ring-accent-olive transition-all appearance-none cursor-pointer"
                  >
                    <option>Main Course</option>
                    <option>Sea Food</option>
                    <option>Starters</option>
                    <option>Drinks</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full py-4 text-[10px] font-black uppercase tracking-[0.3em] bg-black text-white hover:bg-accent-olive border-none shadow-xl active:scale-95 transition-all">
                  {editingItem ? 'AUTHORIZE UPDATE' : 'EXECUTE ENTRY'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantInventory;

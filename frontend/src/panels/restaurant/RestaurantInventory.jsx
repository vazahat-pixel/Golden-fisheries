import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantInventory = () => {
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
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Kitchen Inventory</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Registry Management • {menuItems.length} Total Units</p>
          </div>
          <Button 
            className="text-[10px] font-bold uppercase tracking-widest px-8 py-3 bg-black text-white hover:bg-[#6B7550] border-none shadow-sm transition-all"
            onClick={() => setIsAdding(true)}
          >
            Add New Item
          </Button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Search & Stats Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:border-[#6B7550] outline-none transition-all shadow-sm"
            />
          </div>
          <div className="bg-white border border-gray-200 p-3 px-6 flex items-center justify-between min-w-[200px] shadow-sm">
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Critical Stock</p>
              <p className={`text-lg font-black ${lowStockItems.length > 0 ? 'text-red-500' : 'text-gray-900'}`}>
                {lowStockItems.length} <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Alerts</span>
              </p>
            </div>
            <AlertTriangle size={18} className={lowStockItems.length > 0 ? 'text-red-500 animate-pulse' : 'text-gray-200'} />
          </div>
        </div>

        {/* High-Density Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredInventory.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 shadow-sm flex flex-col group hover:border-[#6B7550] transition-all relative overflow-hidden">
              <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center text-4xl">
                {item.image}
                <div className="absolute top-3 left-3">
                  <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 border ${item.stock < 10 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-900 text-white border-transparent'}`}>
                    {item.stock < 10 ? 'LOW STOCK' : 'IN STOCK'}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-[8px] text-[#6B7550] font-bold uppercase tracking-widest mb-1">{item.category}</p>
                  <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-tight line-clamp-1">{item.name}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-px bg-gray-100 border border-gray-100">
                  <div className="bg-white p-2 text-center">
                     <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Qty</p>
                     <p className="text-sm font-black text-gray-900">{item.stock}</p>
                  </div>
                  <div className="bg-white p-2 text-center">
                     <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">Rate</p>
                     <p className="text-sm font-black text-gray-900">₹{item.price}</p>
                  </div>
                </div>

                <div className="flex gap-1 pt-2">
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
                    className="flex-1 py-2 text-[8px] font-bold uppercase tracking-widest bg-gray-900 text-white hover:bg-[#6B7550] transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Confirm item deletion?')) deleteMenuItem(item.id);
                    }}
                    className="w-10 h-10 bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center border border-gray-100"
                  >
                    <AlertTriangle size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Simple Procurement Bar */}
        {lowStockItems.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-6">
            <div className="bg-gray-900 text-white shadow-2xl p-4 flex items-center justify-between border-t-2 border-[#6B7550]">
              <div className="flex items-center gap-4">
                <AlertTriangle size={20} className="text-[#6B7550]" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Supply Warning</p>
                  <p className="text-[8px] text-gray-400 uppercase tracking-widest">{lowStockItems.length} units below threshold</p>
                </div>
              </div>
              <button className="bg-white text-black px-6 py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-[#6B7550] hover:text-white transition-all">
                Order Supply
              </button>
            </div>
          </div>
        )}

        {/* Modal Form */}
        {(isAdding || editingItem) && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white p-8 shadow-2xl border-t-4 border-[#6B7550]">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-[9px] font-bold text-[#6B7550] uppercase tracking-widest">Registry Protocol</p>
                  <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">
                    {editingItem ? 'Update Item' : 'New Registry Entry'}
                  </h2>
                </div>
                <button onClick={() => { setIsAdding(false); setEditingItem(null); }} className="text-gray-400 hover:text-gray-900">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Item Name</label>
                    <input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#6B7550] transition-all" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Rate (₹)</label>
                      <input 
                        required 
                        type="number" 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-black outline-none focus:border-[#6B7550] transition-all" 
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Stock</label>
                      <input 
                        required 
                        type="number" 
                        value={formData.stock} 
                        onChange={e => setFormData({...formData, stock: e.target.value})} 
                        className="w-full bg-gray-50 border border-gray-200 p-3 text-sm font-black outline-none focus:border-[#6B7550] transition-all" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Category</label>
                    <select 
                      value={formData.category} 
                      onChange={e => setFormData({...formData, category: e.target.value})} 
                      className="w-full bg-gray-50 border border-gray-200 p-3 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#6B7550] transition-all"
                    >
                      <option>Main Course</option>
                      <option>Sea Food</option>
                      <option>Starters</option>
                      <option>Drinks</option>
                      <option>Desserts</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" className="w-full py-4 text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-[#6B7550] border-none shadow-sm transition-all">
                  {editingItem ? 'Commit Changes' : 'Execute Entry'}
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantInventory;

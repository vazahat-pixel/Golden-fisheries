import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  Package, 
  Plus, 
  Minus, 
  Search, 
  AlertTriangle, 
  ArrowDown, 
  RefreshCcw,
  UtensilsCrossed
} from 'lucide-react';

const mockInventory = [
  { id: 1, name: 'King Fish (Fresh)', qty: '12.5 KG', min: '5 KG', status: 'In Stock' },
  { id: 2, name: 'Prawns (Medium)', qty: '8.0 KG', min: '10 KG', status: 'Low Stock' },
  { id: 3, name: 'Coconut Oil', qty: '4 Liters', min: '2 Liters', status: 'In Stock' },
  { id: 4, name: 'Rice (Sona Masoori)', qty: '45 KG', min: '20 KG', status: 'In Stock' },
  { id: 5, name: 'Basmati Rice', qty: '2.0 KG', min: '5 KG', status: 'Low Stock' },
];

const RestaurantInventory = () => {
  const [inventory, setInventory] = React.useState(mockInventory);
  const [searchQuery, setSearchQuery] = React.useState('');

  const adjustStock = (id, amount) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const [val, unit] = item.qty.split(' ');
        const [minVal, minUnit] = item.min.split(' ');
        const newVal = Math.max(0, parseFloat(val) + amount);
        const newStatus = newVal <= parseFloat(minVal) ? 'Low Stock' : 'In Stock';
        return { ...item, qty: `${newVal} ${unit}`, status: newStatus };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const lowStockItems = inventory.filter(i => i.status === 'Low Stock');

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Kitchen Inventory</h1>
          <p className="text-gray-500 font-bold text-sm md:text-base">Track ingredients and stock levels for your restaurant.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2 py-3 rounded-xl border-blue-100">
            <RefreshCcw size={18} /> <span className="hidden xs:inline">Request Stock</span>
          </Button>
          <Button className="flex-1 md:flex-none gap-2 py-3 rounded-xl shadow-xl shadow-primary/20">
            <Plus size={18} /> <span className="hidden xs:inline">Add Item</span>
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search ingredients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="hover:border-primary/40 transition-all group overflow-hidden border-none shadow-xl flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                <UtensilsCrossed size={28} />
              </div>
              <Badge variant={item.status === 'In Stock' ? 'success' : 'warning'} className="font-black uppercase tracking-widest text-[9px] px-3 py-1">
                {item.status}
              </Badge>
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{item.name}</h3>
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-black text-primary tracking-tighter">{item.qty.split(' ')[0]}</span>
              <span className="text-gray-400 font-black text-xs uppercase tracking-widest">{item.qty.split(' ')[1]}</span>
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Min. Limit</span>
                <span className="text-sm font-black text-gray-900">{item.min}</span>
              </div>
  
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => adjustStock(item.id, -1)}
                  className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-red-400 hover:text-red-500 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-sm"
                >
                  <Minus size={16} /> Deduct
                </button>
                <button 
                  onClick={() => adjustStock(item.id, 1)}
                  className="flex items-center justify-center gap-2 py-4 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-lg shadow-primary/20"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-l-4 border-l-amber-500 bg-amber-50/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-bold text-amber-900">Critical Stock Warning</h4>
              <p className="text-sm text-amber-700">
                {lowStockItems.map(i => i.name).join(', ')} {lowStockItems.length > 1 ? 'are' : 'is'} below the minimum threshold. Please reorder immediately.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RestaurantInventory;

const itemAlerts = [1, 2]; // Mock alert IDs

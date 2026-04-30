import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Package, 
  Layers,
  AlertCircle
} from 'lucide-react';

const mockInventory = [
  { id: 1, name: 'Rohu Fish', category: 'Freshwater', qty: 450, unit: 'KG', price: 85, status: 'in-stock' },
  { id: 2, name: 'Catla Fish', category: 'Freshwater', qty: 320, unit: 'KG', price: 90, status: 'in-stock' },
  { id: 3, name: 'Tiger Prawns', category: 'Seafood', qty: 15, unit: 'KG', price: 450, status: 'low-stock' },
  { id: 4, name: 'Squid', category: 'Seafood', qty: 0, unit: 'KG', price: 280, status: 'out-of-stock' },
  { id: 5, name: 'Mrigal', category: 'Freshwater', qty: 180, unit: 'KG', price: 75, status: 'in-stock' },
];

const InventoryOverview = () => {
  const [inventory, setInventory] = React.useState(mockInventory);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const adjustStock = (id, amount) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + amount);
        let newStatus = 'in-stock';
        if (newQty === 0) newStatus = 'out-of-stock';
        else if (newQty < 50) newStatus = 'low-stock';
        return { ...item, qty: newQty, status: newStatus };
      }
      return item;
    }));
  };

  const filteredInventory = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 font-medium">Real-time stock tracking and warehouse operations.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <History size={18} /> Logs
          </Button>
          <Button className="gap-2">
            <Package size={18} /> Update Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Stock Value" value="₹12.5L" trend="+5.2%" icon={Layers} />
        <StatCard title="Low Stock Items" value={inventory.filter(i => i.status === 'low-stock').length.toString()} trend="Needs action" icon={AlertCircle} variant="warning" />
        <StatCard title="Recent Inflow" value="1,200 KG" trend="+400 today" icon={ArrowUpRight} variant="success" />
      </div>

      <Card className="mb-6" padding="none">
        <div className="p-4 flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products, categories..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-blue-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', 'Freshwater', 'Seafood', 'Frozen'].map((cat) => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-primary border-primary text-white' : 'border-blue-100 text-blue-600 hover:bg-blue-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="relative group hover:border-primary/30 transition-all duration-300 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                🐟
              </div>
              <Badge variant={item.status === 'in-stock' ? 'success' : item.status === 'low-stock' ? 'warning' : 'danger'}>
                {item.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1">{item.name}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase mb-4">{item.category}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Current Stock</p>
                <p className="text-xl font-black text-primary">{item.qty} <span className="text-sm font-bold">{item.unit}</span></p>
              </div>
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-50">
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Price / {item.unit}</p>
                <p className="text-xl font-black text-gray-900">₹{item.price}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-gray-100">
              <Button onClick={() => adjustStock(item.id, 10)} variant="secondary" size="sm" className="flex-1 gap-2">
                <ArrowUpRight size={14} /> Add
              </Button>
              <Button onClick={() => adjustStock(item.id, -10)} variant="outline" size="sm" className="flex-1 gap-2">
                <ArrowDownLeft size={14} /> Deduct
              </Button>
            </div>

            {item.status === 'out-of-stock' && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
                <Badge variant="danger" className="scale-150">Out of Stock</Badge>
              </div>
            )}
          </Card>
        ))}
        
        <button className="border-2 border-dashed border-blue-200 rounded-[var(--radius-card)] flex flex-col items-center justify-center gap-3 py-12 text-blue-400 hover:border-primary hover:text-primary transition-all bg-white/50">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Package size={24} />
          </div>
          <span className="font-bold">Add New Product</span>
        </button>
      </div>
    </div>
  );
};

export default InventoryOverview;

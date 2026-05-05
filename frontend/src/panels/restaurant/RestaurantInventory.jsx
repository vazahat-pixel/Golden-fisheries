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
  UtensilsCrossed,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const mockInventory = [
  { id: 1, name: 'KING FISH (FRESH)', qty: '12.5 KG', min: '5 KG', status: 'In Stock' },
  { id: 2, name: 'PRAWNS (MEDIUM)', qty: '8.0 KG', min: '10 KG', status: 'Low Stock' },
  { id: 3, name: 'COCONUT OIL', qty: '4 LITERS', min: '2 LITERS', status: 'In Stock' },
  { id: 4, name: 'RICE (SONA MASOORI)', qty: '45 KG', min: '20 KG', status: 'In Stock' },
  { id: 5, name: 'BASMATI RICE', qty: '2.0 KG', min: '5 KG', status: 'Low Stock' },
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
        
        toast.success(`${item.name} stock updated to ${newVal} ${unit}`);
        
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
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Kitchen <span className="text-accent-olive">Inventory.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">TRACK INGREDIENTS • STOCK LEVELS • KITCHEN OPERATIONS</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="gap-3 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle"
            onClick={() => toast.success('Stock request initiated...')}
          >
            <RefreshCcw size={14} /> REQUEST STOCK
          </Button>
          <Button 
            className="gap-3 text-[10px] font-black uppercase tracking-widest px-6 shadow-md"
            onClick={() => toast.success('Open add item modal')}
          >
            <Plus size={14} /> ADD ITEM
          </Button>
        </div>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
        <input 
          type="text" 
          placeholder="SEARCH INGREDIENTS..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-card-border rounded-none py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.map((item) => (
          <Card key={item.id} className="p-4 border border-card-border shadow-subtle flex flex-col bg-white group hover:shadow-wapixo transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 bg-olive-100/50 border border-card-border flex items-center justify-center text-accent-olive shadow-sm group-hover:scale-105 transition-transform duration-300">
                <UtensilsCrossed size={24} />
              </div>
              <Badge variant={item.status === 'In Stock' ? 'success' : 'warning'} className="font-black uppercase tracking-widest text-[9px] px-3 py-1 shadow-sm border border-card-border">
                {item.status}
              </Badge>
            </div>
            
            <h3 className="text-xl font-serif italic font-black text-black mb-4 uppercase tracking-tight">{item.name}</h3>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-xl font-black text-black tracking-tighter">{item.qty.split(' ')[0]}</span>
              <span className="text-text-muted font-black text-xs uppercase tracking-[0.2em]">{item.qty.split(' ')[1]}</span>
            </div>
            
            <div className="mt-auto space-y-4">
              <div className="flex items-center justify-between p-4 bg-olive-50/50 border border-card-border">
                <span className="text-[10px] text-text-muted font-black uppercase tracking-widest">MIN. LIMIT</span>
                <span className="text-sm font-black text-black uppercase">{item.min}</span>
              </div>
  
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => adjustStock(item.id, -1)}
                  variant="outline"
                  className="py-2.5 border-card-border hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <Minus size={14} className="mr-2" /> DEDUCT
                </Button>
                <Button 
                  onClick={() => adjustStock(item.id, 1)}
                  className="py-2.5"
                >
                  <Plus size={14} className="mr-2" /> ADD STOCK
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border border-red-200 bg-red-50/50 shadow-subtle p-4 overflow-hidden relative">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center shadow-md animate-pulse">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h4 className="font-black text-red-600 uppercase tracking-[0.3em] text-sm">Critical Stock Warning</h4>
              <p className="text-[11px] font-black text-red-600/70 uppercase tracking-widest mt-2 leading-relaxed">
                {lowStockItems.map(i => i.name).join(', ')} ARE BELOW THE MINIMUM THRESHOLD. PLEASE REORDER IMMEDIATELY.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RestaurantInventory;

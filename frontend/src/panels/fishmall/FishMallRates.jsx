import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Plus, 
  Save,
  ArrowRight,
  History,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FishMallRates = () => {
  const [rates, setRates] = useState([
    { id: 1, name: 'ROHU (SMALL)', current: 120, min: 110, max: 135, trend: 'up' },
    { id: 2, name: 'ROHU (LARGE)', current: 140, min: 130, max: 155, trend: 'stable' },
    { id: 3, name: 'CATLA', current: 130, min: 120, max: 145, trend: 'down' },
    { id: 4, name: 'TIGER PRAWNS', current: 650, min: 600, max: 700, trend: 'up' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  const updateRate = (id, newRate) => {
    setRates(prev => prev.map(item => {
      if (item.id === id) {
        const val = parseFloat(newRate) || 0;
        let newTrend = 'stable';
        if (val > item.current) newTrend = 'up';
        else if (val < item.current) newTrend = 'down';
        return { ...item, current: val, trend: newTrend };
      }
      return item;
    }));
  };

  const filteredRates = rates.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Live <span className="text-accent-olive">Rate Card.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">DAILY MARKET PRICES • RETAIL MALL OPERATIONS</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="gap-3 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle"
            onClick={() => toast.success('Opening rate history...')}
          >
            <History size={14} /> VIEW HISTORY
          </Button>
          <Button 
            className="gap-3 text-[10px] font-black uppercase tracking-widest px-6 shadow-md"
            onClick={() => toast.success('Rates published successfully!')}
          >
            <Save size={14} /> PUBLISH RATES
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border border-card-border shadow-subtle bg-white">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">LAST UPDATED</p>
          <h3 className="text-xl font-serif italic font-black text-black tracking-tight">Today, 06:00 AM</h3>
        </Card>
        <Card className="p-4 border border-card-border shadow-subtle bg-white">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">ITEMS TRACKED</p>
          <h3 className="text-xl font-serif italic font-black text-black tracking-tight">{rates.length} Varieties</h3>
        </Card>
        <Card className="p-4 border border-card-border shadow-subtle bg-white">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">MARKET TREND</p>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-serif italic font-black text-green-600 tracking-tight">+4.2%</h3>
            <TrendingUp size={20} className="text-green-600" />
          </div>
        </Card>
        <Card className="p-4 border border-card-border shadow-subtle bg-white">
          <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4">AVG. MARGIN</p>
          <h3 className="text-xl font-serif italic font-black text-black tracking-tight">18%</h3>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden border border-card-border shadow-subtle bg-white">
        <div className="p-4 border-b border-card-border flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY VARIETY NAME..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border rounded-none py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle transition-all"
            />
          </div>
          <Button variant="secondary" className="gap-3 py-2.5 border-card-border" onClick={() => toast.success('Add new variety modal')}>
            <Plus size={16} /> ADD NEW VARIETY
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/50">
                <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product Details</th>
                <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Market Range</th>
                <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-center">Live Selling Rate</th>
                <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Market Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y border-t border-card-border">
              {filteredRates.length > 0 ? (
                filteredRates.map((item) => (
                  <tr key={item.id} className="hover:bg-olive-50 transition-colors group">
                    <td className="px-6 py-2.5 border-b border-card-border">
                      <p className="text-xl font-black text-black uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">FRESHWATER CATEGORY</p>
                    </td>
                    <td className="px-6 py-2.5 border-b border-card-border">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[11px] font-black text-text-muted">₹{item.min}</span>
                        <div className="h-1 w-16 bg-olive-100 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-olive w-full"></div>
                        </div>
                        <span className="text-[11px] font-black text-text-muted">₹{item.max}</span>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 border-b border-card-border">
                      <div className="flex justify-center">
                        <div className="relative group/input">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-black text-[11px]">₹</span>
                          <input 
                            type="number" 
                            className="w-36 bg-white border border-card-border rounded-none pl-8 pr-4 py-3 text-lg font-serif italic font-black text-black focus:ring-1 focus:ring-accent-olive outline-none transition-all text-center group-hover/input:shadow-subtle"
                            value={item.current}
                            onChange={(e) => updateRate(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2.5 text-right border-b border-card-border">
                      <Badge variant={item.trend === 'up' ? 'success' : item.trend === 'down' ? 'danger' : 'secondary'} className="px-4 py-2 shadow-sm border border-card-border">
                        <div className="flex items-center gap-2">
                          {item.trend === 'up' ? <TrendingUp size={14} /> : 
                           item.trend === 'down' ? <TrendingDown size={14} /> : <Zap size={14} />}
                          {item.trend}
                        </div>
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-24 text-center">
                    <p className="text-text-muted font-black uppercase tracking-widest text-sm">No Varieties Found</p>
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

export default FishMallRates;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

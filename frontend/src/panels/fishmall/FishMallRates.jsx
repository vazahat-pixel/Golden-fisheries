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
  ArrowRight
} from 'lucide-react';

const FishMallRates = () => {
  const [rates, setRates] = useState([
    { id: 1, name: 'Rohu (Small)', current: 120, min: 110, max: 135, trend: 'up' },
    { id: 2, name: 'Rohu (Large)', current: 140, min: 130, max: 155, trend: 'stable' },
    { id: 3, name: 'Catla', current: 130, min: 120, max: 145, trend: 'down' },
    { id: 4, name: 'Tiger Prawns', current: 650, min: 600, max: 700, trend: 'up' },
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
    <div className="pb-10 space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Rate Card</h1>
          <p className="text-gray-500 font-medium">Update daily market prices for the retail mall.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">History</Button>
          <Button className="gap-2">
            <Save size={18} /> Publish Rates
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-blue-600 text-white p-6">
          <p className="text-xs font-bold uppercase mb-1 opacity-80">Last Updated</p>
          <h3 className="text-2xl font-black">Today, 06:00 AM</h3>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Items Tracked</p>
          <h3 className="text-2xl font-black text-gray-900">{rates.length} Varieties</h3>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Market Trend</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-black text-green-600">+4.2%</h3>
            <TrendingUp size={20} className="text-green-600" />
          </div>
        </Card>
        <Card className="p-6">
          <p className="text-xs text-gray-400 font-bold uppercase mb-1">Avg. Margin</p>
          <h3 className="text-2xl font-black text-primary">18%</h3>
        </Card>
      </div>

      <Card padding="none" className="overflow-hidden border-none shadow-xl">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-6 bg-blue-50/20">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by variety name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
            />
          </div>
          <Button variant="secondary" className="gap-2 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs">
            <Plus size={18} /> Add New Variety
          </Button>
        </div>
        
        <div className="p-4 md:p-0">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Market Range</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Live Selling Rate</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Market Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRates.length > 0 ? (
                  filteredRates.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-base font-black text-gray-900">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Freshwater Category</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-xs font-black text-gray-400">₹{item.min}</span>
                          <div className="h-1 w-10 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-200 w-full"></div>
                          </div>
                          <span className="text-xs font-black text-gray-400">₹{item.max}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <div className="relative group/input">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xs">₹</span>
                            <input 
                              type="number" 
                              className="w-32 bg-gray-50 border-2 border-gray-100 rounded-xl pl-6 pr-4 py-2.5 text-base font-black text-primary focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-center"
                              value={item.current}
                              onChange={(e) => updateRate(item.id, e.target.value)}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className={clsx(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest',
                          item.trend === 'up' ? 'bg-green-50 text-green-600' : 
                          item.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                        )}>
                          {item.trend === 'up' ? <TrendingUp size={14} /> : 
                          item.trend === 'down' ? <TrendingDown size={14} /> : <Zap size={14} />}
                          {item.trend}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-24 text-center">
                      <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No Varieties Found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredRates.map((item) => (
              <div key={item.id} className="p-5 rounded-[28px] bg-gray-50 border border-gray-100 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-black text-gray-900 leading-tight">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Freshwater</p>
                  </div>
                  <div className={clsx(
                    'flex items-center gap-1 px-2 py-1 rounded-lg text-[8px] font-black uppercase',
                    item.trend === 'up' ? 'bg-green-50 text-green-600' : 
                    item.trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                  )}>
                    {item.trend}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Market Range</p>
                    <p className="text-xs font-black text-gray-900">₹{item.min} - ₹{item.max}</p>
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1">Selling Price</p>
                    <div className="flex items-center gap-1">
                      <span className="text-primary font-black text-base">₹</span>
                      <input 
                        type="number" 
                        value={item.current}
                        onChange={(e) => updateRate(item.id, e.target.value)}
                        className="w-full bg-transparent font-black text-primary text-base outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FishMallRates;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

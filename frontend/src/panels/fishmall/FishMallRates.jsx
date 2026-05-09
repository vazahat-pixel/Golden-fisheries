import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { History, Save, TrendingUp, Search, Plus, ArrowRight } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallRates = () => {
  const { stock, updateRate } = useFishMallStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRates = stock.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRateChange = (id, value) => {
    const newRate = parseFloat(value);
    if (!isNaN(newRate)) {
      updateRate(id, newRate);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 animate-in fade-in duration-300 font-sans">
      {/* Sleek Minimal Header */}
      <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            Market Index
            <span className="text-[8px] bg-[#6B7550] text-white px-1.5 py-0.5 font-black">ACTIVE</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Live Terminal Sync • Today, 09:15 AM</p>
        </div>
        <div className="flex gap-2">
          <Button 
            className="text-[8px] font-black uppercase tracking-widest px-3 py-2 bg-white text-gray-900 border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all"
            onClick={() => toast.success('Archival logs accessed.')}
          >
            <History size={12} className="mr-1.5" /> History
          </Button>
          <Button 
            className="text-[8px] font-black uppercase tracking-widest px-4 py-2 bg-black text-white border-none shadow-lg active:scale-95 transition-all"
            onClick={() => toast.success('Rates Broadcasted!')}
          >
            <Save size={12} className="mr-1.5" /> Publish
          </Button>
        </div>
      </header>

      {/* Tighter KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'Varieties', value: stock.length, sub: 'Listed' },
          { label: 'Avg Rate', value: '₹450', sub: 'Mean' },
          { label: 'Variance', value: '+2.4%', sub: 'Trend', trend: true },
          { label: 'Index', value: 'High', sub: 'Stability' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-3 border border-gray-200 shadow-sm rounded-xl">
            <p className="text-[7px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className={`text-sm font-black tracking-tight ${stat.trend ? 'text-[#6B7550]' : 'text-gray-900'}`}>{stat.value}</h3>
              <span className="text-[7px] font-bold text-gray-400 uppercase">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Matrix */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 group max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={12} />
            <input 
              type="text" 
              placeholder="SEARCH VARIETY REGISTRY..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 py-2.5 pl-9 pr-3 text-[9px] font-black uppercase tracking-widest focus:border-[#6B7550] outline-none transition-all rounded-xl"
            />
          </div>
          <Button 
            className="text-[9px] font-black uppercase tracking-widest py-2.5 px-4 bg-[#6B7550]/10 text-[#6B7550] border border-[#6B7550]/20 hover:bg-[#6B7550] hover:text-white transition-all rounded-xl"
            onClick={() => toast.success('Entry Terminal Active')}
          >
            <Plus size={12} className="mr-1.5" /> Add New
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-4 py-3 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">SKU Details</th>
                <th className="px-4 py-3 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Benchmark Range</th>
                <th className="px-4 py-3 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">Live Rate</th>
                <th className="px-4 py-3 text-[8px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 text-right">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRates.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                    <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[8px] font-black text-gray-300">₹{(item.rate * 0.9).toFixed(0)}</span>
                      <div className="h-1 w-16 bg-gray-100 rounded-full overflow-hidden relative">
                         <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-[#6B7550]/30 border-x border-[#6B7550]" />
                      </div>
                      <span className="text-[8px] font-black text-gray-300">₹{(item.rate * 1.1).toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <div className="relative group/input max-w-[100px] w-full">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black group-focus-within/input:text-[#6B7550]">₹</span>
                        <input 
                          type="number" 
                          className="w-full bg-white border border-gray-200 pl-6 pr-2 py-2 text-xs font-black text-gray-900 focus:border-[#6B7550] outline-none transition-all text-center rounded-lg"
                          value={item.rate}
                          onChange={(e) => handleRateChange(item.id, e.target.value)}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-900 px-2 py-1 rounded-md text-[7px] font-black uppercase tracking-widest group-hover:bg-[#6B7550] group-hover:text-white transition-all">
                      <TrendingUp size={10} /> 
                      Stable
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FishMallRates;

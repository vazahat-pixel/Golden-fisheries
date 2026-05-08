import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { History, Save, TrendingUp, Search, Plus } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
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
    <div className="space-y-6 animate-in fade-in duration-500 selection:bg-black selection:text-white">
      {/* Index Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 border border-black/5 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
            Market <span className="text-[#6B7550]">Index.</span>
          </h1>
          <div className="flex items-center gap-3">
            <p className="text-text-muted text-[8px] font-black uppercase tracking-[0.3em]">Live Selling Rates & Benchmarks</p>
            <div className="h-1 w-1 rounded-full bg-black/20" />
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#6B7550]">Last Sync: Today, 09:15 AM</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="text-[9px] font-black border-black/10 uppercase tracking-[0.2em] px-6 py-5 bg-white hover:bg-gray-50 transition-all shadow-sm"
            onClick={() => toast.success('Accessing archival rate data...')}
          >
            <History size={14} className="mr-2" /> View History
          </Button>
          <Button 
            className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-5 bg-black text-white hover:bg-[#6B7550] border-none shadow-xl active:scale-95 transition-all"
            onClick={() => toast.success('Rates Broadcasted to Terminals!')}
          >
            <Save size={14} className="mr-2" /> Publish Live
          </Button>
        </div>
      </div>

      {/* Market Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Variety Count', value: stock.length.toString(), sub: 'Categories Listed' },
          { label: 'Avg. Market Rate', value: '₹450', sub: 'Calculated Mean' },
          { label: 'Variance Trend', value: '+2.4%', sub: 'Market Fluctuation', trend: true },
          { label: 'Index Stability', value: 'High', sub: 'System Integrity' }
        ].map((stat, idx) => (
          <Card key={idx} className="p-4 border border-black/5 shadow-subtle bg-white group hover:border-[#6B7550]/20 transition-all">
            <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={`text-xl font-serif italic font-black tracking-tight ${stat.trend ? 'text-[#6B7550]' : 'text-black'}`}>{stat.value}</h3>
              <span className="text-[8px] font-black text-black/20 uppercase tracking-widest">{stat.sub}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Rates Table */}
      <Card padding="none" className="overflow-hidden border border-black/5 shadow-sm bg-white">
        <div className="p-4 border-b border-black/5 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-xl group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 group-focus-within:text-black transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH VARIETY REGISTRY..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-black/5 py-3.5 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest focus:border-black outline-none transition-all"
            />
          </div>
          <Button 
            className="text-[9px] font-black uppercase tracking-[0.2em] py-3.5 px-8 bg-gray-50 text-black border border-black/5 hover:bg-black hover:text-white transition-all shadow-sm"
            onClick={() => toast.success('New Registry Modal')}
          >
            <Plus size={14} className="mr-2" /> Add Variety
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-6 py-4 text-[8px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-black/5">SKU Identification</th>
                <th className="px-6 py-4 text-[8px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-black/5 text-center">Market Benchmark Range</th>
                <th className="px-6 py-4 text-[8px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-black/5 text-center">Terminal Selling Rate</th>
                <th className="px-6 py-4 text-[8px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-black/5 text-right">Market Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredRates.length > 0 ? (
                filteredRates.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-5">
                      <p className="text-xs font-black text-black uppercase tracking-tight group-hover:translate-x-1 transition-transform">{item.name}</p>
                      <p className="text-[7px] text-text-muted font-black uppercase tracking-widest mt-1 opacity-60">{item.category}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-4">
                        <span className="text-[9px] font-black text-black/30">₹{(item.rate * 0.9).toFixed(0)}</span>
                        <div className="h-1 w-20 bg-gray-100 relative overflow-hidden">
                          <div className="absolute inset-0 bg-[#6B7550]/10" />
                          <div className="absolute top-0 bottom-0 left-1/4 right-1/4 bg-[#6B7550] shadow-[0_0_10px_rgba(107,117,80,0.5)]" />
                        </div>
                        <span className="text-[9px] font-black text-black/30">₹{(item.rate * 1.1).toFixed(0)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <div className="relative group/input max-w-[140px] w-full">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/20 font-black text-[11px] group-focus-within/input:text-[#6B7550]">₹</span>
                          <input 
                            type="number" 
                            className="w-full bg-white border border-black/5 pl-8 pr-4 py-3 text-lg font-serif italic font-black text-black focus:border-[#6B7550] outline-none transition-all text-center shadow-sm group-hover/input:border-black/20"
                            value={item.rate}
                            onChange={(e) => handleRateChange(item.id, e.target.value)}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Badge className="px-3 py-1.5 text-[7px] font-black uppercase tracking-widest bg-gray-100 text-black border-none group-hover:bg-[#6B7550] group-hover:text-white transition-all">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp size={10} className="group-hover:text-white text-[#6B7550]" /> 
                          {Math.random() > 0.5 ? 'Stable' : 'Volatile'}
                        </div>
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center opacity-10">
                    <TrendingUp size={48} className="mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No registry matches found</p>
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

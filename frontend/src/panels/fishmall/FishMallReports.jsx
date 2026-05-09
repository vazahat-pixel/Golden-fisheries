import React, { useState } from 'react';
import { BarChart2, TrendingUp, Package, PieChart, ArrowUpRight, ArrowDownRight, Layers, FileText } from 'lucide-react';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallReports = () => {
  const { stock, bills, expenses } = useFishMallStore();
  const [activeTab, setActiveTab] = useState('sales');

  const totalSales = bills.reduce((acc, b) => acc + b.total, 0);
  const totalWeight = bills.reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + i.weight, 0), 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - totalExpenses; // Simplified

  // Fish-wise sales calculation
  const fishSales = {};
  bills.forEach(bill => {
    bill.items.forEach(item => {
      if (!fishSales[item.name]) {
        fishSales[item.name] = { weight: 0, revenue: 0 };
      }
      fishSales[item.name].weight += item.weight;
      fishSales[item.name].revenue += item.total;
    });
  });

  const sortedFishSales = Object.entries(fishSales).sort((a, b) => b[1].revenue - a[1].revenue);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
            <BarChart2 className="text-[#6B7550]" /> Business Analytics
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time fish mall performance metrics</p>
        </div>
      </div>

      {/* High Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `₹${totalSales.toLocaleString()}`, sub: '+12.5% vs LW', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Total Weight Sold', value: `${totalWeight.toFixed(1)} KG`, sub: 'Active Trading', icon: Package, color: 'text-[#6B7550]' },
          { label: 'Operational Costs', value: `₹${totalExpenses.toLocaleString()}`, sub: 'Ice & Transport', icon: PieChart, color: 'text-amber-500' },
          { label: 'Net Profit Margin', value: `₹${netProfit.toLocaleString()}`, sub: 'After Expenses', icon: Layers, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl bg-gray-50 ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <span className="text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Live</span>
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-xl font-black text-gray-900 tracking-tight">{stat.value}</h3>
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-50 px-4">
          {['sales', 'stock', 'profit'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest relative transition-all ${
                activeTab === tab ? 'text-black' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab} Analytics
              {activeTab === tab && <div className="absolute bottom-0 left-6 right-6 h-1 bg-[#6B7550] rounded-t-full" />}
            </button>
          ))}
        </div>

        <div className="p-8 flex-1">
          {activeTab === 'sales' && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Sales Breakdown List */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <TrendingUp size={12} /> Fish-Wise Sales Distribution
                  </h3>
                  <div className="space-y-4">
                    {sortedFishSales.slice(0, 6).map(([name, data]) => {
                      const percentage = (data.revenue / totalSales) * 100;
                      return (
                        <div key={name} className="space-y-2">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{name}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">₹{data.revenue.toLocaleString()}</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full bg-[#6B7550] rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Table Breakdown */}
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText size={12} /> Granular Sales Data
                  </h3>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-[8px] font-black text-gray-400 uppercase tracking-widest">Species</th>
                          <th className="px-6 py-4 text-[8px] font-black text-gray-400 uppercase tracking-widest text-right">KG Sold</th>
                          <th className="px-6 py-4 text-[8px] font-black text-gray-400 uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {sortedFishSales.map(([name, data]) => (
                          <tr key={name}>
                            <td className="px-6 py-4 text-[10px] font-bold text-gray-700 uppercase tracking-tight">{name}</td>
                            <td className="px-6 py-4 text-[10px] font-black text-gray-900 text-right">{data.weight.toFixed(1)} KG</td>
                            <td className="px-6 py-4 text-[10px] font-black text-[#6B7550] text-right">₹{data.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
             <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-in fade-in duration-500">
                <Package size={64} className="mb-4 text-[#6B7550]" />
                <p className="text-[10px] font-black uppercase tracking-widest">Generating Stock Flux Reports...</p>
                <p className="text-[8px] font-bold uppercase mt-2 tracking-widest text-gray-400">Available in full version</p>
             </div>
          )}

          {activeTab === 'profit' && (
             <div className="flex flex-col items-center justify-center py-20 opacity-30 animate-in fade-in duration-500">
                <TrendingUp size={64} className="mb-4 text-[#6B7550]" />
                <p className="text-[10px] font-black uppercase tracking-widest">Margin Analysis Underway...</p>
                <p className="text-[8px] font-bold uppercase mt-2 tracking-widest text-gray-400">Processing purchase data</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FishMallReports;

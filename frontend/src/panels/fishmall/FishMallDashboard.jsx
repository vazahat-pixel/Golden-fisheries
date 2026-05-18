import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, TrendingUp, Layers, ClipboardCheck, ArrowRight } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallDashboard = () => {
  const { stock, bills, fetchStock } = useFishMallStore();

  React.useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const totalVolume = bills.reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + i.weight, 0), 0);
  const totalSales = bills.reduce((acc, b) => acc + b.total, 0);
  const liveStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalStock = stock.filter(i => i.qty < 50).length;

  return (
    <div className="bg-[#F9FAFB] min-h-screen animate-in fade-in duration-300 p-4">
      {/* Sleek Minimal Header */}
      <header className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            Terminal Dash
            <span className="text-[8px] bg-black text-white px-1.5 py-0.5 font-black">LIVE</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Sector: Retail Mall • ID: #FM-02</p>
        </div>
        <Link to="/fishmall/billing">
          <Button className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-[#6B7550] text-white border-none shadow-lg shadow-[#6B7550]/20 active:scale-95 transition-all">
            New Billing
          </Button>
        </Link>
      </header>

      <div className="space-y-4">
        {/* Compact Grid Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { title: 'Vol (KG)', value: totalVolume.toFixed(1), icon: Scale, color: 'text-gray-900' },
            { title: 'Gross (₹)', value: totalSales.toLocaleString(), icon: TrendingUp, color: 'text-[#6B7550]' },
            { title: 'Stock (KG)', value: liveStockKg.toLocaleString(), icon: Layers, color: 'text-gray-900' },
            { title: 'Alerts', value: criticalStock, icon: ClipboardCheck, color: criticalStock > 0 ? 'text-rose-500' : 'text-gray-900' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-3 border border-gray-200 shadow-sm flex items-center gap-3 group hover:border-[#6B7550] transition-all">
              <div className="w-8 h-8 bg-gray-50 flex items-center justify-center rounded-lg group-hover:bg-[#6B7550]/5">
                <kpi.icon size={14} className="text-gray-400 group-hover:text-[#6B7550]" />
              </div>
              <div>
                <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">{kpi.title}</p>
                <h3 className={`text-sm font-black tracking-tight ${kpi.color}`}>{kpi.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Active Index */}
          <div className="lg:col-span-3 bg-white border border-gray-200 shadow-sm">
            <div className="px-4 py-2.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-[9px] uppercase tracking-widest">Active Market Index</h3>
              <Link to="/fishmall/rates" className="text-[8px] font-black uppercase text-[#6B7550] flex items-center gap-1 hover:underline">
                Edit Rates <ArrowRight size={10} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30 border-b border-gray-100">
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Product</th>
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center">Rate</th>
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stock.slice(0, 8).map((fish, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-all">
                      <td className="px-4 py-2.5">
                        <p className="text-[9px] font-black text-gray-900 uppercase">{fish.name}</p>
                        <p className="text-[7px] text-gray-400 font-bold uppercase">{fish.category}</p>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[10px] font-black text-gray-900">₹{fish.rate}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-[9px] font-black ${fish.qty < 50 ? 'text-rose-500 bg-rose-50 px-1' : 'text-gray-900'}`}>{fish.qty} {fish.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity & Action */}
          <div className="space-y-3">
            <div className="bg-[#6B7550] p-4 shadow-sm flex flex-col justify-between h-[120px] rounded-xl relative overflow-hidden group">
              <div className="z-10">
                <h3 className="text-white text-xs font-black tracking-widest uppercase">Inflow Registry</h3>
                <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-1">Record Arrivals</p>
              </div>
              <Link to="/fishmall/stock" className="z-10">
                <Button className="w-full bg-white text-[#6B7550] text-[9px] font-black uppercase py-2 border-none hover:bg-black hover:text-white transition-all rounded-lg">
                  Record Stock
                </Button>
              </Link>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Layers size={80} color="white" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-[9px] uppercase tracking-widest">Recent Sales</h3>
              </div>
              <div className="p-2 space-y-1">
                {bills.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-2 hover:bg-gray-50 transition-all rounded-lg">
                    <div>
                      <p className="text-[9px] font-black text-gray-900 uppercase">₹{bill.total.toLocaleString()}</p>
                      <p className="text-[7px] text-gray-400 font-bold uppercase">{new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-[7px] font-black text-[#6B7550] uppercase tracking-widest bg-[#6B7550]/5 px-1.5 py-0.5 rounded border border-[#6B7550]/10">Paid</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishMallDashboard;

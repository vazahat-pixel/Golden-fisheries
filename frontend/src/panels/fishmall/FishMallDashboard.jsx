import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, TrendingUp, Layers, ClipboardCheck } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Badge } from '../../design-system/components/Badge';
import { useFishMallStore } from '../../store/fishMallStore';

const FishMallDashboard = () => {
  const navigate = useNavigate();
  const { stock, bills } = useFishMallStore();

  const totalVolume = bills.reduce((acc, b) => acc + b.items.reduce((sum, i) => sum + i.weight, 0), 0);
  const totalSales = bills.reduce((acc, b) => acc + b.total, 0);
  const liveStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalStock = stock.filter(i => i.qty < 50).length;

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300 px-4 py-6 md:px-8">
      {/* Simple Compact Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 border border-gray-200 rounded-none shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-3">
            Fish Mall Dashboard
            <span className="text-[10px] bg-[#6B7550]/10 text-[#6B7550] px-2 py-0.5 rounded-none font-black tracking-widest border border-[#6B7550]/20">FM-CONSOLE</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Operational Terminal: #FM-02 • Sector: Retail</p>
        </div>
        <Link to="/fishmall/billing">
          <Button className="text-[10px] font-black uppercase tracking-widest px-6 py-4 bg-black text-white hover:bg-[#6B7550] border-none shadow-sm active:scale-95 transition-all">
            Open Billing Port
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Compact Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Volume Handled', value: `${totalVolume.toFixed(1)} KG`, icon: Scale, trend: 'Daily', color: '#111827' },
            { title: 'Gross Revenue', value: `₹${totalSales.toLocaleString()}`, icon: TrendingUp, trend: 'Net', color: '#6B7550' },
            { title: 'In-Mall Stock', value: `${liveStockKg.toLocaleString()} KG`, icon: Layers, trend: 'Live', color: '#111827' },
            { title: 'Stock Alerts', value: criticalStock.toString(), icon: ClipboardCheck, trend: criticalStock > 0 ? 'Critical' : 'Stable', color: criticalStock > 0 ? '#EF4444' : '#111827' }
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#6B7550] transition-all">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{kpi.title}</p>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter" style={{ color: kpi.color }}>{kpi.value}</h3>
                <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: kpi.color }}>{kpi.trend}</p>
              </div>
              <div className="p-3 bg-gray-50 group-hover:bg-[#6B7550]/5 transition-all">
                <kpi.icon size={18} className="text-gray-400 group-hover:text-[#6B7550] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Market Rates Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Active Market Index</h3>
                <Link to="/fishmall/rates" className="text-[10px] font-bold uppercase text-[#6B7550] hover:underline">Edit Rates</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Product</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-center">Rate/KG</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stock.slice(0, 6).map((fish, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-6 py-4">
                          <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">{fish.name}</p>
                          <p className="text-[8px] text-gray-400 font-bold uppercase mt-0.5">{fish.category}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-[11px] font-black text-gray-900">₹{fish.rate}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`text-[10px] font-bold ${fish.qty < 50 ? 'text-red-500' : 'text-gray-900'}`}>{fish.qty} {fish.unit}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-black p-6 shadow-sm flex flex-col justify-between h-[180px]">
              <div>
                <h3 className="text-white text-lg font-bold tracking-tight uppercase">Inflow Registry</h3>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Log new inventory arrivals</p>
              </div>
              <Link to="/fishmall/stock">
                <Button className="w-full bg-white text-black text-[10px] font-black uppercase py-3 border-none hover:bg-[#6B7550] hover:text-white transition-all">
                  Record New Stock
                </Button>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Recent Activity</h3>
              </div>
              <div className="p-4 space-y-2">
                {bills.slice(0, 4).map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 group hover:bg-[#6B7550]/5 transition-all">
                    <div>
                      <p className="text-[10px] font-black text-gray-900 uppercase leading-none mb-1">₹{bill.total.toLocaleString()}</p>
                      <p className="text-[7px] text-gray-400 font-bold uppercase">{new Date(bill.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <span className="text-[8px] font-bold text-[#6B7550] uppercase tracking-widest bg-[#6B7550]/5 px-2 py-0.5 border border-[#6B7550]/10">Paid</span>
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

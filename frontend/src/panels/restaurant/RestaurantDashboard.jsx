import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Flame, Utensils } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { orders, menuItems } = useRestaurantStore();

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = orders.filter(o => o.timestamp.startsWith(today));
  const totalSales = todayOrders.reduce((acc, o) => acc + o.total, 0);
  const criticalStock = menuItems.filter(i => i.stock < 10).length;

  const recentOrders = orders.slice(0, 4);

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300 px-4 py-6 md:px-8">
      {/* Simple Compact Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 border border-gray-200 rounded-none shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-3">
            Kitchen Dashboard
            <span className="text-[10px] bg-[#6B7550]/10 text-[#6B7550] px-2 py-0.5 rounded-none font-black tracking-widest border border-[#6B7550]/20">LIVE</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Operational Station: HQ-MKE-01</p>
        </div>
        <Link to="/restaurant/pos">
          <Button className="text-[10px] font-black uppercase tracking-widest px-6 py-4 bg-black text-white hover:bg-[#6B7550] border-none shadow-sm active:scale-95 transition-all">
            Launch POS Terminal
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {/* Compact Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Daily Revenue', value: `₹${totalSales.toLocaleString()}`, icon: TrendingUp, color: '#6B7550' },
            { label: 'Order Volume', value: todayOrders.length.toString(), icon: Utensils, color: '#111827' },
            { label: 'Low Stock SKU', value: criticalStock.toString(), icon: Flame, color: criticalStock > 0 ? '#EF4444' : '#111827' },
            { label: 'Avg Order Value', value: `₹${todayOrders.length > 0 ? Math.round(totalSales / todayOrders.length).toLocaleString() : 0}`, icon: ShoppingCart, color: '#111827' }
          ].map((metric, idx) => (
            <div key={idx} className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#6B7550] transition-all">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{metric.label}</p>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter" style={{ color: metric.color }}>{metric.value}</h3>
              </div>
              <div className="p-3 bg-gray-50 group-hover:bg-[#6B7550]/5 transition-all">
                <metric.icon size={18} className="text-gray-400 group-hover:text-[#6B7550] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Operations Table */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Recent Activity Log</h3>
                <Link to="/restaurant/history" className="text-[10px] font-bold uppercase text-[#6B7550] hover:underline">View All</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Order ID</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Time</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400">Items</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-gray-400 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-all">
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-gray-900 uppercase tracking-tight">#{order.id.slice(-8)}</span>
                        </td>
                        <td className="px-6 py-4 text-[10px] text-gray-400 font-medium">
                          {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold text-gray-600">{order.items.length} Items</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-[11px] font-black text-gray-900">₹{order.total.toLocaleString()}</span>
                        </td>
                      </tr>
                    ))}
                    {recentOrders.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em]">No Recent Records</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions & Low Stock */}
          <div className="space-y-6">
            <div className="bg-black p-6 shadow-sm flex flex-col justify-between h-[180px]">
              <div>
                <h3 className="text-white text-lg font-bold tracking-tight uppercase">Inventory Sync</h3>
                <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mt-1">Manage kitchen stock levels</p>
              </div>
              <Link to="/restaurant/inventory">
                <Button className="w-full bg-white text-black text-[10px] font-black uppercase py-3 border-none hover:bg-[#6B7550] hover:text-white transition-all">
                  Open Manifest
                </Button>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">Status Alerts</h3>
              <div className="space-y-3">
                {criticalStock > 0 ? (
                  <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-100">
                    <Flame size={16} className="text-red-500" />
                    <div>
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-tight">{criticalStock} Items Low</p>
                      <p className="text-[8px] text-red-400 font-bold uppercase mt-0.5">Replenishment Required</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100">
                    <Utensils size={16} className="text-[#6B7550]" />
                    <div>
                      <p className="text-[10px] font-black text-[#6B7550] uppercase tracking-tight">System Optimal</p>
                      <p className="text-[8px] text-[#6B7550]/60 font-bold uppercase mt-0.5">All stock levels normal</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

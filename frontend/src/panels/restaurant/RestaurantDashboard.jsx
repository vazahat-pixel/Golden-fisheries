import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingCart, Flame, Utensils, Activity, Plus, LayoutGrid, History, Settings, Package } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const orderDisplayId = (order) => {
  const raw = order?.orderNumber || order?.id || order?._id;
  if (!raw) return '—';
  const s = String(raw);
  return s.startsWith('#') ? s : `#${s.length > 12 ? s.slice(-8) : s}`;
};

const RestaurantDashboard = () => {
  const { orders, menuItems, alerts, fetchOrders, fetchMenu, fetchKitchenStock, markAlertsRead } =
    useRestaurantStore();

  useEffect(() => {
    fetchOrders?.();
    fetchMenu?.();
    fetchKitchenStock?.();
  }, [fetchOrders, fetchMenu, fetchKitchenStock]);

  const latestSupply = alerts.find((a) => a.type === 'INTERNAL_SUPPLY' && !a.read);

  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeMenu = Array.isArray(menuItems) ? menuItems : [];

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = safeOrders.filter((o) => {
    const ts = o.timestamp || o.createdAt;
    if (!ts) return false;
    const day = typeof ts === 'string' ? ts.slice(0, 10) : new Date(ts).toISOString().slice(0, 10);
    return day === today;
  });
  const totalSales = todayOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const criticalStock = safeMenu.filter((i) => (i.stock ?? 999) < 10).length;

  const recentOrders = safeOrders.slice(0, 5);

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 px-4 py-6 md:px-8 font-sans">
      {/* Tactical Restaurant Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
              Kitchen <span className="text-accent-olive">Command.</span>
            </h1>
            <div className="flex items-center gap-1.5 bg-accent-olive/10 px-2 py-0.5 border border-accent-olive/20">
               <div className="w-1.5 h-1.5 bg-accent-olive rounded-full animate-pulse"></div>
               <span className="text-[8px] font-black text-accent-olive uppercase tracking-widest">STATION_LIVE</span>
            </div>
          </div>
          <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">OPERATIONAL HUB • HQ-MKE-01 • GOLDEN FISHERIES</p>
        </div>
        <div className="flex gap-2">
          <Link to="/restaurant/kitchen">
            <Button variant="outline" className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-card-border gap-2 shadow-sm">
              <LayoutGrid size={14} /> LIVE QUEUE
            </Button>
          </Link>
          <Link to="/restaurant/pos">
            <Button className="h-11 px-6 text-[10px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl shadow-black/10 active:scale-95 transition-all gap-2">
              <Plus size={14} /> LAUNCH TERMINAL
            </Button>
          </Link>
        </div>
      </div>

      {latestSupply && (
        <Link
          to="/restaurant/received-stock"
          onClick={() => markAlertsRead?.()}
          className="mb-4 block bg-emerald-50 border border-emerald-200 p-4 rounded-xl hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Package size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">{latestSupply.title}</p>
              <p className="text-[9px] text-emerald-700 font-bold mt-1">{latestSupply.message}</p>
            </div>
          </div>
        </Link>
      )}

      <div className="space-y-6">
        {/* Compact Metric Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="DAILY REVENUE" value={`₹${totalSales.toLocaleString()}`} icon={TrendingUp} trend="+12.5%" trendType="up" />
          <StatCard title="ORDER VOLUME" value={todayOrders.length.toString()} icon={Utensils} trend="ACTIVE" trendType="up" />
          <StatCard title="LOW STOCK" value={criticalStock.toString()} icon={Flame} trend="REPLENISH" trendType={criticalStock > 0 ? "danger" : "up"} />
          <StatCard title="AVG TICKET" value={`₹${todayOrders.length > 0 ? Math.round(totalSales / todayOrders.length).toLocaleString() : 0}`} icon={ShoppingCart} trend="YTD" trendType="up" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Operations Table - High Density */}
          <div className="lg:col-span-2">
            <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
              <div className="px-6 py-4 border-b border-card-border flex justify-between items-center bg-slate-50/50">
                <h3 className="font-black text-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <History size={14} className="text-accent-olive" /> Recent Activity Log
                </h3>
                <Link to="/restaurant/history" className="text-[9px] font-black uppercase text-accent-olive tracking-widest hover:underline">Full Manifest</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/30 border-b border-card-border">
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Identity</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Payload</th>
                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          No orders yet today
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => {
                        const rowKey = order.id || order._id || order.orderNumber || Math.random();
                        const ts = order.timestamp || order.createdAt;
                        return (
                          <tr key={rowKey} className="hover:bg-accent-olive/[0.02] transition-all group">
                            <td className="px-6 py-3">
                              <span className="text-[10px] font-black text-black uppercase tracking-tight italic font-serif">
                                {orderDisplayId(order)}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                              {ts
                                ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : '—'}
                            </td>
                            <td className="px-6 py-3">
                              <Badge variant="secondary" className="text-[7px] font-black bg-slate-100 border-none px-2 h-4">
                                {(order.items?.length ?? 0)} UNITS
                              </Badge>
                            </td>
                            <td className="px-6 py-3 text-right">
                              <span className="text-[11px] font-black text-black italic font-serif">
                                ₹{(Number(order.total) || 0).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-3 bg-slate-50/30 border-t border-card-border">
                 <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic opacity-50 text-center">SYSTEM_SECURE // AUTH_LEVEL_RESTRICTED</p>
              </div>
            </Card>
          </div>

          {/* Side Panels */}
          <div className="space-y-4">
            <Card padding="none" className="bg-black p-6 shadow-xl flex flex-col justify-between h-[160px] relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                 <Activity size={80} className="text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-white text-lg font-serif italic font-black tracking-tight uppercase leading-none">Inventory Sync.</h3>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Manage kitchen stock levels</p>
              </div>
              <Link to="/restaurant/inventory" className="relative z-10">
                <Button className="w-full bg-accent-olive text-white text-[9px] font-black uppercase py-3 border-none hover:bg-white hover:text-black transition-all tracking-widest shadow-lg">
                  OPEN MANIFEST
                </Button>
              </Link>
            </Card>

            <Card className="bg-white border border-card-border p-6 shadow-sm">
              <h3 className="font-black text-black text-[10px] uppercase tracking-widest mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Settings size={14} className="text-slate-400" /> Operational Status
              </h3>
              <div className="space-y-3">
                {criticalStock > 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-100">
                    <Flame size={16} className="text-red-500" />
                    <div>
                      <p className="text-[9px] font-black text-red-600 uppercase tracking-tight leading-none">{criticalStock} ASSETS LOW</p>
                      <p className="text-[7px] text-red-400 font-bold uppercase mt-1 tracking-widest">REPLENISHMENT REQ.</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100">
                    <Activity size={16} className="text-emerald-500" />
                    <div>
                      <p className="text-[9px] font-black text-emerald-600 uppercase tracking-tight leading-none">SYSTEM OPTIMAL</p>
                      <p className="text-[7px] text-emerald-400 font-bold uppercase mt-1 tracking-widest">NOMINAL LEVELS</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100">
                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-100">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight leading-none">SERVER ONLINE</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase mt-1 tracking-widest">PONG: 42MS</p>
                   </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

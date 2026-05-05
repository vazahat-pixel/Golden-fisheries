import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { WelcomeBanner } from '../../design-system/components/WelcomeBanner';
import { StatCard } from '../../design-system/components/StatCard';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  TrendingUp, 
  Utensils, 
  ShoppingCart, 
  Flame, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import mockData from '../../data/mockData.json';

const { liveOrders, stockAlerts } = mockData.restaurant;

const RestaurantDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <WelcomeBanner name="Restaurant Manager" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="TODAY'S SALES" 
          value="₹18,500" 
          icon={TrendingUp} 
          trend="+5% FROM YESTERDAY" 
          trendType="up" 
        />
        <StatCard 
          title="ACTIVE TABLES" 
          value="8 / 12" 
          icon={Utensils} 
          trend="BUSY" 
          trendType="up" 
        />
        <StatCard 
          title="ORDERS TODAY" 
          value="42" 
          icon={ShoppingCart} 
        />
        <StatCard 
          title="TOP DISH" 
          value="PRAWN GHEE ROAST" 
          icon={Flame} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden border border-card-border shadow-subtle bg-white">
            <div className="p-4 border-b border-card-border flex justify-between items-center bg-white">
              <h3 className="font-serif italic font-black text-black text-xl uppercase tracking-tight">Active Live Orders</h3>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-[10px] font-black px-6 border-card-border"
                onClick={() => toast.success('Switching to KDS view...')}
              >
                VIEW KDS
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {liveOrders.map((order, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-card-border group hover:bg-olive-50 transition-all gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-black shadow-md group-hover:scale-105 transition-transform text-xl">
                      {order.table.split(' ')[1]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-black text-xl leading-tight uppercase tracking-tight">{order.table}</p>
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">{order.items}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-4 sm:pt-0 border-card-border">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-3 flex items-center justify-start sm:justify-end gap-2">
                        <Clock size={12} /> {order.time}
                      </p>
                      <Badge variant={order.status === 'ready' ? 'success' : 'warning'} className="uppercase text-[10px] px-4 py-1.5 font-black tracking-widest shadow-sm">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-black text-white p-4 relative overflow-hidden group border border-card-border shadow-subtle">
            <div className="relative z-10">
              <h3 className="text-xl font-serif italic font-black mb-4 uppercase tracking-tight">Ready for Billing?</h3>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">Launch the POS interface for new orders and billing.</p>
              <Link to="/restaurant/pos">
                <Button className="w-full bg-white text-black border-none shadow-xl font-black py-2.5 group-hover:scale-105 transition-transform">
                  OPEN RESTAURANT POS
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 border border-card-border shadow-subtle bg-white">
            <h3 className="font-serif italic font-black text-black mb-4 uppercase tracking-tight text-xl">Stock Alerts</h3>
            <div className="space-y-4">
              {stockAlerts.map((alert, i) => (
                <div key={i} className={clsx(
                  "flex justify-between items-center p-4 border shadow-sm font-black text-[10px] uppercase tracking-widest transition-all",
                  alert.level === 'danger' ? "bg-red-600 text-white border-red-700" : "bg-white text-black border-card-border hover:bg-olive-50"
                )}>
                  <span>{alert.product}</span>
                  <span>{alert.status} ({alert.value})</span>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-8 text-[10px] font-black uppercase tracking-widest py-2.5 border-card-border hover:bg-black hover:text-white transition-all shadow-md active:scale-95"
              onClick={() => navigate('/restaurant/inventory')}
            >
              MANAGE STOCK
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

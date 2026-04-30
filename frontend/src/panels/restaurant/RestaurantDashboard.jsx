import { Link } from 'react-router-dom';
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
  Clock 
} from 'lucide-react';

const RestaurantDashboard = () => {
  return (
    <div className="pb-10 space-y-6 md:space-y-8">
      <WelcomeBanner name="MKE Restaurant Manager" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard title="Today's Sales" value="₹18,500" icon={TrendingUp} trend="+5% from yesterday" />
        <StatCard title="Active Tables" value="8 / 12" icon={Utensils} trend="Busy" variant="info" />
        <StatCard title="Orders Today" value="42" icon={ShoppingCart} />
        <StatCard title="Top Dish" value="Prawn Ghee Roast" icon={Flame} variant="primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none" className="overflow-hidden border-none shadow-xl">
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/20">
              <h3 className="font-black text-gray-900 text-lg md:text-xl">Active Live Orders</h3>
              <Button variant="ghost" size="sm" className="text-primary font-black hover:bg-blue-50 rounded-xl px-4">View KDS</Button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {[
                { table: 'Table 4', items: 'Fish Thali (2), Fish Fry (1)', time: '12 mins ago', status: 'cooking' },
                { table: 'Table 2', items: 'Prawn Roast (1), Steam Rice (2)', time: '5 mins ago', status: 'ready' },
                { table: 'Table 9', items: 'Crab Masala (1)', time: '20 mins ago', status: 'cooking' },
              ].map((order, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-[24px] bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white border-2 border-blue-100 flex items-center justify-center font-black text-primary shadow-sm group-hover:scale-110 transition-transform text-lg">
                      {order.table.split(' ')[1]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-black text-gray-900 text-base md:text-lg leading-tight">{order.table}</p>
                      <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wide line-clamp-1 mt-0.5">{order.items}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100/50">
                    <div className="text-left sm:text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 flex items-center justify-start sm:justify-end gap-1.5">
                        <Clock size={12} /> {order.time}
                      </p>
                      <Badge variant={order.status === 'ready' ? 'success' : 'warning'} className="uppercase text-[9px] md:text-[10px] px-3 py-1 font-black">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 md:p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Ready for Billing?</h3>
              <p className="text-blue-100 text-sm mb-6">Launch the POS interface for new orders and billing.</p>
              <Link to="/restaurant/pos">
                <Button className="w-full bg-white text-primary hover:bg-blue-50 border-none shadow-xl font-black py-4 group-hover:scale-105 transition-transform">
                  Open Restaurant POS
                </Button>
              </Link>
            </div>
            <Utensils className="absolute -right-4 -bottom-4 text-white/10" size={140} />
          </Card>

          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-gray-900 mb-4">Stock Alerts</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100">
                <span className="text-xs font-bold text-red-700">King Fish</span>
                <span className="text-xs font-black text-red-700">LOW (2 KG)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                <span className="text-xs font-bold text-amber-700">Coconut Oil</span>
                <span className="text-xs font-black text-amber-700">4 Liters</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4 text-xs font-bold border-gray-100">Manage Stock</Button>
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

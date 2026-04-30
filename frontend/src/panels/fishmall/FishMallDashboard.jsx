import React from 'react';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { WelcomeBanner } from '../../design-system/components/WelcomeBanner';
import { 
  TrendingUp, 
  Scale, 
  Layers, 
  ClipboardCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FishMallDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="pb-10 space-y-6 md:space-y-8">
      <WelcomeBanner name="Fish Mall Manager" />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Today's Volume" value="850 KG" icon={Scale} trend="+120 KG today" />
        <StatCard title="Total Sales" value="₹1.2L" icon={TrendingUp} trend="+15% vs yesterday" />
        <StatCard title="Live Stock" value="1,400 KG" icon={Layers} />
        <StatCard title="Pending Slips" value="5" icon={ClipboardCheck} variant="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none" className="overflow-hidden border-none shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-blue-50/20">
              <h3 className="font-black text-gray-900 text-lg">Today's Rate Card</h3>
              <Link to="/fishmall/rates">
                <Button size="sm" variant="ghost" className="text-primary font-black hover:bg-blue-50 rounded-xl px-4">
                  <Zap size={16} className="mr-1" /> Update Rates
                </Button>
              </Link>
            </div>
            
            <div className="p-4 md:p-6">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Rate</th>
                      <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Market Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: 'Rohu (Large)', rate: '₹140/KG', trend: 'up' },
                      { name: 'Catla', rate: '₹130/KG', trend: 'stable' },
                      { name: 'Sea Bass', rate: '₹450/KG', trend: 'down' },
                      { name: 'Tiger Prawns', rate: '₹650/KG', trend: 'up' },
                    ].map((fish, i) => (
                      <tr key={i} className="hover:bg-blue-50/10 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="font-black text-gray-900">{fish.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Freshwater</p>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-lg font-black text-primary tracking-tight">{fish.rate}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <Badge variant={fish.trend === 'up' ? 'success' : fish.trend === 'down' ? 'danger' : 'warning'} className="font-black uppercase tracking-widest text-[9px]">
                            {fish.trend}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {[
                  { name: 'Rohu (Large)', rate: '₹140/KG', trend: 'up' },
                  { name: 'Catla', rate: '₹130/KG', trend: 'stable' },
                  { name: 'Sea Bass', rate: '₹450/KG', trend: 'down' },
                  { name: 'Tiger Prawns', rate: '₹650/KG', trend: 'up' },
                ].map((fish, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div>
                      <p className="font-black text-gray-900 text-sm">{fish.name}</p>
                      <p className="text-primary font-black text-lg mt-0.5">{fish.rate}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={fish.trend === 'up' ? 'success' : fish.trend === 'down' ? 'danger' : 'warning'} className="font-black uppercase tracking-widest text-[8px]">
                        {fish.trend}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-primary text-white p-8 overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">Weight Billing</h3>
              <p className="text-blue-100 text-sm mb-6">Launch specialized weight-based billing for whole fish sales.</p>
              <Link to="/fishmall/billing">
                <Button className="w-full bg-white text-primary border-none font-black shadow-xl group-hover:scale-105 transition-transform">
                  Start Mall Billing
                </Button>
              </Link>
            </div>
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex justify-between items-center">
              Stock Inflow Today
              <Link to="/fishmall/stock" className="text-xs text-primary hover:underline">View All</Link>
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <Scale size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900">400 KG</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Rohu - From Ramu Farms</p>
                </div>
                <span className="text-xs text-gray-400 font-medium">10:30 AM</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FishMallDashboard;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

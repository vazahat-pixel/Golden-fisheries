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
import mockData from '../../data/mockData.json';

const { rateCard, stockInflow } = mockData.fishmall;

const FishMallDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <WelcomeBanner name="Fish Mall Manager" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="TODAY'S VOLUME" 
          value="850 KG" 
          icon={Scale} 
          trend="+120 KG TODAY" 
          trendType="up" 
        />
        <StatCard 
          title="TOTAL SALES" 
          value="₹1.2L" 
          icon={TrendingUp} 
          trend="+15% VS YESTERDAY" 
          trendType="up" 
        />
        <StatCard 
          title="LIVE STOCK" 
          value="1,400 KG" 
          icon={Layers} 
        />
        <StatCard 
          title="PENDING SLIPS" 
          value="5" 
          icon={ClipboardCheck} 
          trend="REVIEW NEEDED"
          trendType="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="overflow-hidden border border-card-border shadow-subtle rounded-none bg-white">
            <div className="p-4 border-b border-card-border flex justify-between items-center bg-white">
              <h3 className="font-serif italic font-black text-black text-xl uppercase tracking-tight">Today's Rate Card</h3>
              <Link to="/fishmall/rates">
                <Button size="sm" variant="outline" className="text-[10px] font-black px-6 border-card-border">
                  <Zap size={14} className="mr-2" /> UPDATE RATES
                </Button>
              </Link>
            </div>
            
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Product</th>
                    <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Live Rate</th>
                    <th className="px-6 py-2.5 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] text-right">Market Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t border-card-border">
                  {rateCard.map((fish, i) => (
                    <tr key={i} className="hover:bg-olive-50/50 transition-colors group">
                      <td className="px-6 py-8 border-b border-card-border">
                        <p className="font-black text-black uppercase tracking-tight">{fish.name}</p>
                        <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">Freshwater</p>
                      </td>
                      <td className="px-6 py-8 border-b border-card-border">
                        <span className="text-xl font-serif italic font-black text-black tracking-tighter">{fish.rate}</span>
                      </td>
                      <td className="px-6 py-8 text-right border-b border-card-border">
                        <Badge variant={fish.trend === 'up' ? 'success' : fish.trend === 'down' ? 'danger' : 'warning'} className="font-black uppercase tracking-widest text-[10px] px-4 py-2 shadow-sm border border-card-border">
                          {fish.trend}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-black text-white p-4 overflow-hidden relative group rounded-none border border-card-border shadow-subtle">
            <div className="relative z-10">
              <h3 className="text-xl font-serif italic font-black mb-4 uppercase tracking-tight">Weight Billing</h3>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">Launch specialized weight-based billing for whole fish sales.</p>
              <Link to="/fishmall/billing">
                <Button className="w-full bg-white text-black border-none font-black shadow-lg py-2.5 group-hover:scale-105 transition-transform">
                  START MALL BILLING
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-4 rounded-none border border-card-border shadow-subtle bg-white">
            <h3 className="font-serif italic font-black text-black mb-4 flex justify-between items-center uppercase tracking-tight text-xl">
              Stock Inflow
              <Link to="/fishmall/stock" className="text-[10px] text-text-muted hover:text-black font-black tracking-widest transition-colors">VIEW ALL</Link>
            </h3>
            <div className="space-y-4">
              {stockInflow.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 border border-card-border hover:bg-olive-50 transition-all cursor-pointer group">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                    <Scale size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-black uppercase tracking-tight">{item.weight}</p>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest truncate mt-1">{item.product} • {item.source}</p>
                  </div>
                  <span className="text-[10px] text-text-muted font-black uppercase tracking-widest whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FishMallDashboard;

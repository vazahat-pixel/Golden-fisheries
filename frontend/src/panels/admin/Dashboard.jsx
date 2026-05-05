import React from 'react';
import { WelcomeBanner } from '../../design-system/components/WelcomeBanner';
import { StatCard } from '../../design-system/components/StatCard';
import { Card } from '../../design-system/components/Card';
import { useAdminStore } from '../../store/adminStore';
import { 
  IndianRupee, 
  ClipboardList, 
  Package, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const chartData = [
  { name: 'Mon', revenue: 45000 },
  { name: 'Tue', revenue: 52000 },
  { name: 'Wed', revenue: 48000 },
  { name: 'Thu', revenue: 61000 },
  { name: 'Fri', revenue: 55000 },
  { name: 'Sat', revenue: 67000 },
  { name: 'Sun', revenue: 72000 },
];

const topProducts = [
  { name: 'Rohu', value: 85 },
  { name: 'Catla', value: 65 },
  { name: 'Prawns', value: 45 },
  { name: 'Others', value: 30 },
];

const AdminDashboard = () => {
  const { tapals, inventory, invoices, transactions } = useAdminStore();

  const weeklyRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <WelcomeBanner name="Mahesh" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="WEEKLY REVENUE" 
          value={`₹${(weeklyRevenue / 1000).toFixed(1)}K`} 
          icon={IndianRupee} 
          trend="+14.5%" 
          trendType="up" 
        />
        <StatCard 
          title="ACTIVE TAPALS" 
          value={tapals.filter(t => t.status === 'Pending').length.toString()} 
          icon={ClipboardList} 
          trend="+2 TODAY" 
          trendType="up" 
        />
        <StatCard 
          title="STOCK ITEMS" 
          value={inventory.length.toString()} 
          icon={Package} 
          trend={`${inventory.filter(i => i.status === 'low-stock').length} LOW STOCK`} 
          trendType="down" 
        />
        <StatCard 
          title="PENDING INVOICES" 
          value={invoices.filter(i => i.status !== 'paid').length.toString()} 
          icon={AlertTriangle} 
          trend="ACTION REQUIRED" 
          trendType="down" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Card className="lg:col-span-2 p-6 bg-white border border-card-border shadow-subtle overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif italic font-bold text-black uppercase tracking-tight">Revenue Analysis</h2>
            <button className="text-[9px] font-bold text-accent-olive hover:text-black transition-colors uppercase tracking-widest flex items-center gap-2">
              VIEW FULL REPORT <ArrowRight size={14} />
            </button>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5F6846" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#5F6846" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E8E', fontSize: 9, fontWeight: 700 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#8E8E8E', fontSize: 9, fontWeight: 700 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: '1px solid #D1C9B0', 
                    boxShadow: '2px 2px 0px 0px #E8E1C8',
                    fontSize: '9px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#5F6846" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-card-border shadow-subtle">
          <h2 className="text-xl font-serif italic font-bold text-black uppercase tracking-tight mb-6">Top Products</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#000000', fontSize: 10, fontWeight: 700 }}
                  width={60}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    borderRadius: '0px', 
                    border: '1px solid #D1C9B0', 
                    fontSize: '9px',
                    fontWeight: '700'
                  }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={16}>
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#5F6846' : '#8C9375'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-olive-100/50">
             <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">MOST PROFITABLE: ROHU FISH (85% VOLUME)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;



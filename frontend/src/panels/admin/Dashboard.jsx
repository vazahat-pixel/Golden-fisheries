import React from 'react';
import { WelcomeBanner } from '../../design-system/components/WelcomeBanner';
import { StatCard } from '../../design-system/components/StatCard';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  IndianRupee, 
  ClipboardList, 
  Package, 
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock
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

const revenueData = [
  { name: 'Mon', revenue: 45000 },
  { name: 'Tue', revenue: 52000 },
  { name: 'Wed', revenue: 48000 },
  { name: 'Thu', revenue: 61000 },
  { name: 'Fri', revenue: 55000 },
  { name: 'Sat', revenue: 67000 },
  { name: 'Sun', revenue: 72000 },
];

const inventoryData = [
  { name: 'Rohu', value: 400, color: '#0066FF' },
  { name: 'Catla', value: 300, color: '#3385FF' },
  { name: 'Prawns', value: 200, color: '#66A3FF' },
  { name: 'Others', value: 100, color: '#99C2FF' },
];

const recentTapals = [
  { id: 'TRP-001', type: 'Purchase', party: 'Ramu Fisheries', amount: '₹40,000', status: 'pending' },
  { id: 'TRP-002', type: 'Sale', party: 'Golden Restaurant', amount: '₹12,500', status: 'confirmed' },
  { id: 'TRP-003', type: 'Purchase', party: 'Deep Sea Farms', amount: '₹65,000', status: 'confirmed' },
  { id: 'TRP-004', type: 'Sale', party: 'Channappa Buyer', amount: '₹22,000', status: 'pending' },
];

const AdminDashboard = () => {
  return (
    <div className="pb-10 space-y-6 md:space-y-8">
      <WelcomeBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard 
          title="Weekly Revenue" 
          value="₹4,20,000" 
          trend="+14.5%" 
          icon={IndianRupee} 
          trendType="up"
        />
        <StatCard 
          title="Active Tapals" 
          value="12" 
          trend="+2 today" 
          icon={ClipboardList} 
          trendType="up"
        />
        <StatCard 
          title="Stock Items" 
          value="84" 
          trend="-3 below min" 
          icon={Package} 
          trendType="down"
        />
        <StatCard 
          title="Pending Alerts" 
          value="3" 
          trend="Action required" 
          icon={AlertTriangle} 
          trendType="down"
          variant="danger"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2" padding="none">
          <div className="p-4 md:p-6 border-b border-card-border flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-lg text-gray-900">Revenue Analysis</h3>
            <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold">
              <span className="hidden xs:inline">Last 7 Days</span> <ArrowRight size={14} />
            </Button>
          </div>
          <div className="p-4 md:p-6 h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5F0FF" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="none" className="overflow-hidden">
          <div className="p-4 md:p-6 border-b border-card-border bg-gray-50/30">
            <h3 className="font-bold text-lg text-gray-900">Top Products</h3>
          </div>
          <div className="p-4 md:p-6 h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 600}} width={70} />
                <Tooltip cursor={{fill: 'rgba(0, 102, 255, 0.05)'}} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={24}>
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" padding="none">
          <div className="p-4 md:p-6 border-b border-card-border flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-lg text-gray-900">Recent Tapals</h3>
            <Button variant="secondary" size="sm" className="font-bold">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-blue-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Party</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-blue-900 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTapals.map((tapal) => (
                  <tr key={tapal.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-primary group-hover:underline cursor-pointer">{tapal.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">{tapal.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{tapal.party}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-black">{tapal.amount}</td>
                    <td className="px-6 py-4">
                      <Badge variant={tapal.status === 'confirmed' ? 'success' : 'warning'} className="uppercase text-[10px]">
                        {tapal.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card padding="none">
          <div className="p-4 md:p-6 border-b border-card-border flex justify-between items-center bg-gray-50/30">
            <h3 className="font-bold text-lg text-gray-900">Driver Status</h3>
            <span className="text-xs text-green-600 flex items-center gap-1.5 font-bold bg-green-50 px-2 py-1 rounded-lg">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> 4 Online
            </span>
          </div>
          <div className="p-4 md:p-6 space-y-4">
            {[
              { name: 'Ramu K.', status: 'On Trip', time: '45 mins ago', task: 'Delivery to Mall' },
              { name: 'Suresh M.', status: 'Idle', time: 'Now', task: 'Available' },
              { name: 'Vicky P.', status: 'On Trip', time: '1 hr ago', task: 'Pickup from Farm' },
            ].map((driver, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100 group">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${driver.name}&background=E5F0FF&color=0066FF`} alt={driver.name} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{driver.name}</p>
                  <p className="text-xs text-gray-500 truncate font-medium">{driver.task}</p>
                </div>
                <div className="text-right shrink-0">
                  <Badge variant={driver.status === 'On Trip' ? 'info' : 'success'} className="mb-1 text-[10px] px-2 py-0.5 uppercase">
                    {driver.status}
                  </Badge>
                  <p className="text-[10px] text-gray-400 font-bold flex items-center justify-end gap-1 uppercase">
                    <Clock size={10} /> {driver.time}
                  </p>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2 text-sm font-bold py-3 rounded-xl border-blue-100 hover:bg-blue-50 hover:border-blue-200">
              Monitor Logistics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;

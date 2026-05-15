import React from 'react';
import { WelcomeBanner } from '../../design-system/components/WelcomeBanner';
import { StatCard } from '../../design-system/components/StatCard';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
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
  const { tapals, inventory, invoices, transactions, fetchDashboardStats, dashboardStats, loading } = useAdminStore();
  const { user } = useAuthStore();

  React.useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const weeklyRevenue = dashboardStats?.totalCumulativeRevenue || transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingApprovals = tapals.filter(t => t.type === 'Sale' && t.status === 'Pending Approval').length;

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300 px-4 py-6 md:px-8">
      {/* Simple Compact Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-6 border border-gray-200 rounded-none shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase flex items-center gap-3">
            Admin Overview
            <span className="text-[10px] bg-[#6B7550]/10 text-[#6B7550] px-2 py-0.5 rounded-none font-black tracking-widest border border-[#6B7550]/20">HQ-SYSTEM</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Operator: {user?.name || 'ADMIN-HQ'} • Role: {user?.role || 'SUPER-USER'}</p>
        </div>
        <div className="flex gap-2">
          <Button className="text-[10px] font-black uppercase tracking-widest px-6 py-4 bg-black text-white hover:bg-[#6B7550] border-none shadow-sm active:scale-95 transition-all">
            Generate Report
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Compact Metric Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Weekly Revenue", value: `₹${(weeklyRevenue / 1000).toFixed(1)}K`, icon: IndianRupee, trend: "+14.5%", color: "#6B7550" },
            { 
              title: user?.role === 'MANAGER' ? "Approvals" : "Active Tapals", 
              value: user?.role === 'MANAGER' ? pendingApprovals.toString() : tapals.filter(t => t.status === 'Pending').length.toString(), 
              icon: ClipboardList, 
              trend: "Priority",
              color: "#111827"
            },
            { title: "Inventory Items", value: inventory.length.toString(), icon: Package, trend: "Stable", color: "#111827" },
            { title: "Due Invoices", value: invoices.filter(i => i.status !== 'paid').length.toString(), icon: AlertTriangle, trend: "Action", color: "#EF4444" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white p-5 border border-gray-200 shadow-sm flex items-center justify-between group hover:border-[#6B7550] transition-all">
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.title}</p>
                <h3 className="text-xl font-black text-gray-900 tracking-tighter" style={{ color: stat.color }}>{stat.value}</h3>
                <p className="text-[8px] font-bold uppercase tracking-widest mt-1" style={{ color: stat.color }}>{stat.trend}</p>
              </div>
              <div className="p-3 bg-gray-50 group-hover:bg-[#6B7550]/5 transition-all">
                <stat.icon size={18} className="text-gray-400 group-hover:text-[#6B7550] transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Revenue Analytics</h3>
                <button className="text-[10px] font-bold uppercase text-[#6B7550] hover:underline">Full Report</button>
              </div>
              <div className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6B7550" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6B7550" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0px', 
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '10px',
                        fontWeight: '700'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#6B7550" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div>
            <div className="bg-white border border-gray-200 shadow-sm h-full">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-gray-900 text-[11px] uppercase tracking-widest">Top Products</h3>
              </div>
              <div className="p-6 h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }}
                      width={60}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ 
                        backgroundColor: '#FFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '0px',
                        fontSize: '10px'
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                      {topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#6B7550' : '#E5E7EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 pt-4 border-t border-gray-100">
                   <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Primary Yield: ROHU FISH</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

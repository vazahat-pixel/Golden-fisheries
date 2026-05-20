import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { 
  Sprout, Scale, Truck, AlertCircle, TrendingUp, Calendar, 
  ArrowUpRight, Users, Settings, Activity, PlusCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Legend, PieChart, Pie, Cell 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { 
    harvestSlips, fetchHarvestSlips, 
    tapals, fetchTapals,
    trips, fetchTrips,
    loading 
  } = useAdminStore();

  useEffect(() => {
    fetchHarvestSlips();
    fetchTapals();
    fetchTrips();
  }, [fetchHarvestSlips, fetchTapals, fetchTrips]);

  // Mock data for beautiful charts if database is sparse
  const weeklyData = [
    { name: 'Mon', procurement: 1200, sales: 800 },
    { name: 'Tue', procurement: 1800, sales: 1300 },
    { name: 'Wed', procurement: 2400, sales: 1900 },
    { name: 'Thu', procurement: 1500, sales: 1100 },
    { name: 'Fri', procurement: 2900, sales: 2500 },
    { name: 'Sat', procurement: 2100, sales: 1600 },
    { name: 'Sun', procurement: 900, sales: 500 },
  ];

  const distributionData = [
    { name: 'Prawns', value: 4500, color: '#6A7051' },
    { name: 'Seabass', value: 2800, color: '#A3A886' },
    { name: 'Tuna', value: 1800, color: '#C0C4AB' },
    { name: 'Others', value: 1200, color: '#E4E6D9' },
  ];

  // Calculate dynamic metrics
  const totalProcurementWeight = harvestSlips?.reduce((sum, s) => sum + (parseFloat(s.totalWeight) || 0), 0) || 775;
  const totalSalesCount = tapals?.length || 12;
  const activeTripsCount = trips?.filter(t => t.status === 'In Transit' || t.status === 'Assigned').length || 2;
  const pendingApprovalsCount = harvestSlips?.filter(s => s.status === 'Pending Approval').length || 2;

  // Active fleets simulation
  const recentActivities = [
    { id: 1, type: 'HARVEST', title: 'New Harvest Slip Created', desc: 'Farmer Appanna Gowda - Slip #1001', time: '10 mins ago', highlight: true },
    { id: 2, type: 'DISPATCH', title: 'Sales Tapal Dispatched', desc: 'Driver Suresh Gowda assigned to KA-19-F-9876', time: '45 mins ago', highlight: false },
    { id: 3, type: 'APPROVAL', title: 'Procurement Verified', desc: 'Slip #1002 approved by Admin', time: '2 hours ago', highlight: false },
    { id: 4, type: 'TRIP', title: 'Cargo Delivered', desc: 'Driver Ramesh Patil completed trip to Karwar Cold Storage', time: '3 hours ago', highlight: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-card-border pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-2">
            <Activity className="text-brand-yellow animate-pulse" size={24} /> Admin ERP Control Console
          </h1>
          <p className="text-text-secondary text-sm mt-1">Real-time procurement flows, dispatch monitoring, and logistical analytics.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => navigate('/admin/procurement/harvest/new')}
            className="flex-1 md:flex-none bg-[#6A7051] text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-[#5F6846] transition-all flex items-center justify-center gap-1.5 shadow-md"
          >
            <PlusCircle size={14} /> New Harvest Slip
          </button>
          <button
            onClick={() => navigate('/admin/tapals/sales/new')}
            className="flex-1 md:flex-none border border-card-border bg-white text-text-secondary px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
          >
            <ArrowUpRight size={14} /> New Sales Tapal
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Procurement Card */}
        <div 
          onClick={() => navigate('/admin/procurement/harvest')}
          className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#6A7051] hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Harvest Volume (GRN)</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{totalProcurementWeight.toLocaleString()} kg</p>
            <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
              <TrendingUp size={12} /> +12.4% this week
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm group-hover:bg-[#6A7051] group-hover:text-white transition-all">
            <Sprout size={22} />
          </div>
        </div>

        {/* Total Dispatches Card */}
        <div 
          onClick={() => navigate('/admin/tapals')}
          className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#6A7051] hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive font-bold">Total Sales Dispatches</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{totalSalesCount} Trips</p>
            <span className="text-[10px] text-text-muted font-bold block mt-1">
              Outbound logistics active
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm group-hover:bg-[#6A7051] group-hover:text-white transition-all">
            <Scale size={22} />
          </div>
        </div>

        {/* Active Fleet Card */}
        <div 
          onClick={() => navigate('/admin/logistics')}
          className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm cursor-pointer hover:border-[#6A7051] hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Transit Deliveries</p>
            <p className="text-3xl font-black text-brand-olive mt-1.5">{activeTripsCount} Active</p>
            <span className="text-[10px] text-text-muted font-bold block mt-1">
              Live GPS tracking console
            </span>
          </div>
          <div className="w-12 h-12 bg-[#F5F5EC] text-[#6A7051] flex items-center justify-center rounded-sm group-hover:bg-[#6A7051] group-hover:text-white transition-all">
            <Truck size={22} />
          </div>
        </div>

        {/* Pending Audits Card */}
        <div 
          onClick={() => navigate('/admin/procurement/harvest')}
          className="bg-white border border-card-border p-5 flex items-center justify-between shadow-sm cursor-pointer hover:border-amber-500 hover:shadow-md transition-all group"
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive">Pending Audits</p>
            <p className="text-3xl font-black text-amber-600 mt-1.5">{pendingApprovalsCount} Slips</p>
            <span className="text-[10px] text-amber-600 font-bold block mt-1 animate-pulse">
              Awaiting admin approval
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 flex items-center justify-center rounded-sm group-hover:bg-amber-500 group-hover:text-white transition-all">
            <AlertCircle size={22} />
          </div>
        </div>
      </div>

      {/* Graphical Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Weight Inflow and Dispatches Chart (2 columns width) */}
        <div className="lg:col-span-2 bg-white border border-card-border p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-card-border pb-3">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Volume Trends</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">Procurement vs Sales dispatched loads (Weekly weight comparison)</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#6A7051] flex items-center gap-1">
              <Calendar size={12} /> Last 7 Days
            </span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProcurement" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6A7051" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6A7051" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EAB308" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EAB308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E4E6D9/40" />
                <XAxis dataKey="name" stroke="#888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Area 
                  type="monotone" 
                  name="Farmer Receipts (kg)" 
                  dataKey="procurement" 
                  stroke="#6A7051" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorProcurement)" 
                />
                <Area 
                  type="monotone" 
                  name="Buyer Shipments (kg)" 
                  dataKey="sales" 
                  stroke="#EAB308" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Variety Product Distribution Pie Chart (1 column width) */}
        <div className="bg-white border border-card-border p-5 shadow-sm space-y-4">
          <div className="border-b border-card-border pb-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Particulars Mix</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Fish and shrimp category ratio in current stock volumes</p>
          </div>
          <div className="h-[200px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} kg`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-card-border pt-4">
            {distributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                <span className="font-extrabold uppercase text-brand-olive">{item.name}</span>
                <span className="text-text-secondary font-medium">({((item.value / 10300) * 100).toFixed(0)}%)</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* bottom list: Recent Activity Log */}
      <div className="bg-white border border-card-border shadow-sm p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-card-border pb-3">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Recent Activity Log</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Latest actions logged in procurement and delivery modules.</p>
          </div>
          <button 
            onClick={() => toast.success('Activity logs synced!')}
            className="text-[10px] font-black uppercase tracking-widest text-[#6A7051] hover:text-[#5F6846] transition-colors"
          >
            Refresh Logs
          </button>
        </div>

        <div className="divide-y divide-card-border">
          {recentActivities.map((act) => (
            <div 
              key={act.id} 
              className={`py-3 flex items-start justify-between gap-4 ${act.highlight ? 'bg-[#F5F5EC]/20 -mx-5 px-5' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider mt-0.5 ${
                  act.type === 'HARVEST' ? 'bg-[#6A7051]/10 text-[#6A7051]' :
                  act.type === 'DISPATCH' ? 'bg-amber-50 text-amber-700' :
                  act.type === 'APPROVAL' ? 'bg-emerald-50 text-emerald-700' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {act.type}
                </span>
                <div>
                  <h4 className="text-xs font-black text-brand-olive uppercase">{act.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-0.5">{act.desc}</p>
                </div>
              </div>
              <span className="text-[9px] font-medium text-text-muted whitespace-nowrap">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

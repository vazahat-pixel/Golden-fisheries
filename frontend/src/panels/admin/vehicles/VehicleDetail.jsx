import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import { 
  ChevronLeft, 
  Truck, 
  FileText, 
  Wrench, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Calendar,
  Clock,
  Navigation,
  ExternalLink,
  IndianRupee,
  Trash2,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vehicles, maintenanceLogs, vehiclePerformance } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, DOCUMENTS, MAINTENANCE, REPORTS
  
  const vehicle = vehicles.find(v => v.id === id);
  const logs = maintenanceLogs.filter(l => l.vehicleId === id);
  const perf = vehiclePerformance.find(p => p.vehicleId === id) || { 
    fuelConsumption: [
      { month: 'Jan', liters: 100, cost: 10000 },
      { month: 'Feb', liters: 120, cost: 12000 },
      { month: 'Mar', liters: 110, cost: 11000 }
    ],
    profitability: { revenue: 50000, expenses: 20000, net: 30000 }
  };

  if (!vehicle) {
    return (
      <div className="p-12 text-center space-y-4">
        <AlertTriangle size={48} className="text-red-500 mx-auto" />
        <h2 className="text-xl font-black uppercase italic tracking-tighter">Asset Not Found</h2>
        <Button onClick={() => navigate('/admin/vehicles')}>Back to Fleet</Button>
      </div>
    );
  }

  const getDocStatusColor = (status) => {
    switch (status) {
      case 'VALID': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'EXPIRING': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'EXPIRED': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/vehicles')} className="p-2.5 bg-white border border-card-border hover:bg-slate-50 shadow-sm transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight">{vehicle.vehicleNumber}</h1>
              <Badge variant={vehicle.status === 'Active' ? 'success' : 'warning'} className="text-[8px] font-black uppercase tracking-widest px-3 h-5 border-none shadow-sm">
                {vehicle.status}
              </Badge>
            </div>
            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.3em] mt-1">{vehicle.type} // {vehicle.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="border-card-border h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-3 shadow-subtle">
             <Wrench size={14} /> LOG SERVICE
           </Button>
           <Button className="bg-black text-white border-none h-11 px-6 text-[10px] font-black uppercase tracking-widest gap-3 shadow-md">
             <Activity size={14} /> GPS LIVE
           </Button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="bg-white border border-card-border shadow-subtle">
        <div className="flex overflow-x-auto no-scrollbar">
          {['OVERVIEW', 'DOCUMENTS', 'MAINTENANCE', 'REPORTS'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                activeTab === tab ? 'text-black' : 'text-slate-400 hover:text-black'
              }`}
            >
              {tab}
              {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
            <div className="lg:col-span-2 space-y-6">
               <Card className="border border-card-border bg-white shadow-sm p-8">
                  <div className="flex justify-between items-start mb-8">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] italic border-l-4 border-accent-olive pl-4">Tactical Identity</h3>
                    <Button variant="outline" size="sm" className="h-8 border-card-border text-[8px] font-black">EDIT INFO</Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                     <div>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Deployment Type</p>
                       <p className="text-sm font-black text-black uppercase">{vehicle.type}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Payload Max</p>
                       <p className="text-sm font-black text-black uppercase">{vehicle.capacity}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Fuel Protocol</p>
                       <p className="text-sm font-black text-black uppercase">{vehicle.fuelType}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Telemetry ID</p>
                       <p className="text-sm font-black text-black uppercase font-mono tracking-tighter">{vehicle.gpsId}</p>
                     </div>
                     <div>
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Reg. Authority</p>
                       <p className="text-sm font-black text-black uppercase">KA-RTO-NORTH</p>
                     </div>
                  </div>
               </Card>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border border-card-border bg-white shadow-sm p-6 flex items-center justify-between group cursor-pointer hover:border-black transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-black uppercase tracking-tight">Active Insurance</p>
                           <p className="text-[8px] text-text-muted font-bold uppercase mt-1">Expiry: {vehicle.documents.insurance.expiry}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-200" />
                  </Card>
                  <Card className="border border-card-border bg-white shadow-sm p-6 flex items-center justify-between group cursor-pointer hover:border-black transition-all">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                           <Calendar size={24} />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-black uppercase tracking-tight">Pollution Control</p>
                           <p className="text-[8px] text-text-muted font-bold uppercase mt-1">Expiry: {vehicle.documents.pollution.expiry}</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className="text-slate-200" />
                  </Card>
               </div>
            </div>

            <div className="space-y-6">
               <Card className="border border-card-border bg-black text-white p-8 shadow-xl relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 opacity-10">
                    <Truck size={120} />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <div>
                       <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em] mb-2 italic">Current Pilot</p>
                       <h3 className="text-xl font-serif italic font-black text-accent-olive tracking-tight">{vehicle.assignedDriverName || 'UNASSIGNED'}</h3>
                       <p className="text-[10px] font-black text-white/60 mt-1 uppercase tracking-widest">DRV-ID: {vehicle.assignedDriverId || '---'}</p>
                     </div>
                     <div className="h-[1px] bg-white/10 w-full" />
                     <div className="space-y-3">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-white/40">Duty Status</span>
                           <span className="text-emerald-400">OPERATIONAL</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                           <span className="text-white/40">Efficiency Rating</span>
                           <span className="text-accent-olive">94.2%</span>
                        </div>
                     </div>
                     <Button className="w-full bg-white text-black border-none h-11 text-[9px] font-black uppercase tracking-widest hover:bg-accent-olive transition-colors">
                       REASSIGN PILOT
                     </Button>
                  </div>
               </Card>

               <Card className="border border-card-border bg-white shadow-sm p-6 space-y-4">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Asset Health</h4>
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase">Engine Load</p>
                        <p className="text-[10px] font-black italic">65%</p>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '65%' }} />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <div className="flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase">Tyre Wear</p>
                        <p className="text-[10px] font-black italic">32%</p>
                     </div>
                     <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: '32%' }} />
                     </div>
                  </div>
               </Card>
            </div>
          </div>
        )}

        {activeTab === 'DOCUMENTS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
            {Object.entries(vehicle.documents).map(([key, doc]) => (
              <Card key={key} className="border border-card-border bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-card-border flex justify-between items-center bg-slate-50/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white border border-card-border flex items-center justify-center text-slate-400 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase tracking-widest">{key}</h4>
                  </div>
                  <Badge className={`text-[7px] font-bold px-2 h-4 border uppercase ${getDocStatusColor(doc.status)}`}>
                    {doc.status}
                  </Badge>
                </div>
                <div className="p-6 space-y-4 flex-1">
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Valid Until</span>
                     <span className="text-black font-black">{doc.expiry}</span>
                   </div>
                   <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                     <span className="text-slate-400">Verification</span>
                     <span className="text-emerald-600">CERTIFIED</span>
                   </div>
                </div>
                <div className="p-3 bg-black grid grid-cols-2 gap-2">
                   <button className="py-2 text-[8px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors border-r border-white/10">VIEW SCAN</button>
                   <button className="py-2 text-[8px] font-black uppercase tracking-widest text-white/70 hover:text-white transition-colors">UPDATE DOC</button>
                </div>
              </Card>
            ))}
            <button className="border-2 border-dashed border-slate-200 rounded-none p-12 flex flex-col items-center justify-center gap-4 text-slate-300 hover:border-accent-olive hover:text-accent-olive transition-all group">
               <Plus size={32} className="group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Add Custom Document</span>
            </button>
          </div>
        )}

        {activeTab === 'MAINTENANCE' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
             <div className="lg:col-span-2 space-y-4">
                <Card padding="none" className="bg-white border border-card-border shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-card-border bg-olive-50/10 flex justify-between items-center">
                    <h3 className="text-[10px] font-black uppercase tracking-widest">Service Log History</h3>
                    <p className="text-[8px] font-bold text-text-muted uppercase italic">Sorted by Recency</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-6 py-4 text-[9px] font-bold text-text-muted uppercase tracking-widest">Date</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-text-muted uppercase tracking-widest">Service Type</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-text-muted uppercase tracking-widest">Cost</th>
                          <th className="px-6 py-4 text-[9px] font-bold text-text-muted uppercase tracking-widest text-right">Reference</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-[11px] font-black text-black">{log.date}</p>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">{log.odometer} KM</p>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-olive" />
                                <p className="text-[10px] font-black text-black uppercase">{log.type}</p>
                              </div>
                              <p className="text-[9px] text-slate-400 font-bold truncate max-w-[200px]">{log.notes}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-[11px] font-black text-black">₹{log.cost.toLocaleString()}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button className="text-[9px] font-black uppercase text-accent-olive hover:underline">View Invoice</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
             </div>
             
             <div className="space-y-6">
                <Card className="border border-card-border bg-white shadow-sm p-6 space-y-6">
                   <h4 className="text-[10px] font-black uppercase tracking-widest italic border-l-4 border-black pl-4">Next Maintenance</h4>
                   <div className="p-4 bg-amber-50 border border-amber-100 rounded-none space-y-3">
                      <div className="flex items-center gap-3">
                        <Clock size={16} className="text-amber-600" />
                        <div>
                          <p className="text-[10px] font-black text-amber-900 uppercase">Oil Change Protocol</p>
                          <p className="text-[9px] font-bold text-amber-700">Due in ~1,250 KM</p>
                        </div>
                      </div>
                      <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none h-10 text-[8px] font-black uppercase tracking-widest shadow-md">
                        SCHEDULE NOW
                      </Button>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Maintenance Metrics</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="text-center p-4 bg-slate-50 border border-slate-100">
                           <p className="text-xl font-serif italic font-black text-black">12.4K</p>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Total Spent (₹)</p>
                         </div>
                         <div className="text-center p-4 bg-slate-50 border border-slate-100">
                           <p className="text-xl font-serif italic font-black text-black">04</p>
                           <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Annual Services</p>
                         </div>
                      </div>
                   </div>
                </Card>
             </div>
          </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 duration-300">
             <Card className="bg-white border border-card-border shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-widest italic">Fuel Consumption (Liters)</h4>
                   <Badge variant="secondary" className="text-[7px] font-bold">2026 YTD</Badge>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={perf.fuelConsumption}>
                      <defs>
                        <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6B7550" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#6B7550" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} tickLine={false} 
                        tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: '0px', fontSize: '10px' }} 
                      />
                      <Area type="monotone" dataKey="liters" stroke="#6B7550" strokeWidth={2} fill="url(#colorFuel)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </Card>

             <Card className="bg-white border border-card-border shadow-sm p-6 space-y-6">
                <div className="flex justify-between items-center">
                   <h4 className="text-[10px] font-black uppercase tracking-widest italic">Monthly Profitability (₹)</h4>
                   <Badge variant="success" className="text-[7px] font-bold">+18.5% PROFIT</Badge>
                </div>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'Revenue', value: perf.profitability.revenue, fill: '#111827' },
                      { name: 'Expenses', value: perf.profitability.expenses, fill: '#E5E7EB' },
                      { name: 'Net Profit', value: perf.profitability.net, fill: '#6B7550' }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#4B5563', fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 9, fontWeight: 700 }} />
                      <Tooltip contentStyle={{ borderRadius: '0px', fontSize: '10px' }} />
                      <Bar dataKey="value" barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </Card>

             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black text-white p-6 shadow-md flex flex-col justify-between">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-4">Cost Per KM</p>
                   <div>
                     <h3 className="text-3xl font-black italic tracking-tighter">₹8.42</h3>
                     <p className="text-[8px] font-bold text-accent-olive uppercase tracking-[0.2em] mt-1">Optimization Required</p>
                   </div>
                </div>
                <div className="bg-white border border-card-border p-6 shadow-md flex flex-col justify-between">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Fuel Cost</p>
                   <div>
                     <h3 className="text-3xl font-black italic tracking-tighter text-black">₹{perf.fuelConsumption.reduce((acc, f) => acc + f.cost, 0).toLocaleString()}</h3>
                     <p className="text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Current Fiscal Period</p>
                   </div>
                </div>
                <div className="bg-emerald-600 text-white p-6 shadow-md flex flex-col justify-between">
                   <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-4">Operational Profit</p>
                   <div>
                     <h3 className="text-3xl font-black italic tracking-tighter">₹{perf.profitability.net.toLocaleString()}</h3>
                     <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mt-1">Vehicle Efficiency: HIGH</p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleDetail;

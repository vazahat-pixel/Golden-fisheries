import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Truck, 
  AlertTriangle, 
  ShieldCheck, 
  Calendar, 
  Plus, 
  ArrowRight, 
  Search,
  Filter,
  MoreVertical,
  Activity,
  Wrench
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const VehicleDashboard = () => {
  const navigate = useNavigate();
  const { vehicles, maintenanceLogs } = useAdminStore();

  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'Active').length;
  
  // Logic to find expiring documents (within 30 days - for demo we'll use 'EXPIRING' status)
  const expiringDocs = (vehicles || []).reduce((acc, v) => {
    const expiring = Object.values(v?.documents || {}).filter(d => d?.status === 'EXPIRING' || d?.status === 'EXPIRED');
    return acc + expiring.length;
  }, 0);

  const pendingMaintenance = maintenanceLogs.length; // Simplified for demo

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'In Transit': return 'info';
      case 'In Maintenance': return 'warning';
      case 'Retired': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-500">
      {/* Header Area - Compact */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight flex items-center gap-2">
            Vehicle <span className="text-accent-olive">Fleet.</span>
          </h1>
          <p className="text-text-muted text-[8px] font-bold uppercase tracking-[0.2em] mt-0.5">COMMAND CENTER • COMPLIANCE CONTROL</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2 text-[8px] font-black border-card-border uppercase tracking-widest px-4 shadow-subtle active:scale-95 transition-all h-9"
            onClick={() => toast.success('Exporting Fleet Report...')}
          >
            <Activity size={12} /> EXPORT
          </Button>
          <Button 
            className="gap-2 text-[8px] font-black uppercase tracking-widest px-4 shadow-md active:scale-95 transition-all h-9 bg-black text-white border-none"
            onClick={() => navigate('/admin/vehicles/new')}
          >
            <Plus size={12} /> ADD VEHICLE
          </Button>
        </div>
      </div>

      {/* Stats Cards - Tightened */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <StatCard title="TOTAL FLEET" value={totalVehicles.toString()} icon={Truck} trend="OPERATIONAL" trendType="up" />
        <StatCard title="ACTIVE NOW" value={activeVehicles.toString()} icon={Activity} trend="ON DUTY" trendType="up" />
        <StatCard title="DOCS ALERT" value={expiringDocs.toString()} icon={AlertTriangle} trend="RENEWAL" trendType="danger" />
        <StatCard title="SERVICE" value={pendingMaintenance.toString()} icon={Wrench} trend="MAINTENANCE" trendType="warning" />
      </div>

      {/* Alert Strip - Minimalist */}
      {expiringDocs > 0 && (
        <div className="space-y-2">
          <div className="bg-red-50 border border-red-100 p-3 px-4 rounded-none flex items-center justify-between">
             <div className="flex items-center gap-2">
               <AlertTriangle size={14} className="text-red-600" />
               <p className="text-[9px] font-black text-red-900 uppercase tracking-widest leading-none">
                  Compliance Alert: {expiringDocs} documents require immediate renewal
               </p>
             </div>
          </div>
          
          {/* Detailed Document Expiry Breakdown Card */}
          <div className="bg-white border border-red-100 p-4 rounded-2xl shadow-subtle space-y-3">
            <h3 className="text-[9px] font-black text-red-700 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar size={12} /> Compliance Expiry Log
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {vehicles.map(v => {
                const expiring = Object.entries(v?.documents || {})
                  .filter(([_, d]) => d?.status === 'EXPIRING' || d?.status === 'EXPIRED');
                if (expiring.length === 0) return null;
                return (
                  <div key={v.id} className="p-3 bg-red-50/30 border border-red-100/50 rounded-xl space-y-2">
                    <p className="text-[10px] font-black text-black uppercase tracking-tight">{v.vehicleNumber}</p>
                    <div className="space-y-1">
                      {expiring.map(([type, doc]) => (
                        <div key={type} className="flex justify-between items-center text-[8px] font-bold uppercase tracking-wider">
                          <span className="text-slate-500">{type}</span>
                          <span className={doc.status === 'EXPIRED' ? 'text-red-600 font-black' : 'text-amber-600 font-black'}>
                            {doc.expiry} ({doc.status})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Fleet Table - High Density */}
      <Card padding="none" className="bg-white border border-card-border shadow-subtle overflow-hidden">
        <div className="px-4 py-2 flex flex-col md:flex-row justify-between gap-3 border-b border-card-border bg-olive-50/10">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input 
              type="text" 
              placeholder="SEARCH FLEET..." 
              className="w-full bg-white border border-card-border rounded-none py-2 pl-10 pr-3 text-[9px] font-bold uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-sm transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 px-3 gap-2 text-[8px] font-bold border-card-border uppercase">
              <Filter size={12} /> FILTER
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-olive-100/10">
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Identity</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Pilot</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Compliance</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em]">Status</th>
                <th className="px-4 py-2.5 text-[9px] font-bold text-text-muted uppercase tracking-[0.1em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-olive-100/30">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-olive-50/50 transition-colors group">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-black text-white flex items-center justify-center border border-black">
                        <Truck size={14} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-black uppercase tracking-tight italic font-serif leading-none">{vehicle.vehicleNumber}</p>
                        <p className="text-[7px] text-text-muted font-black tracking-widest uppercase mt-0.5">{vehicle.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <ShieldCheck size={10} className="text-accent-olive" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-black uppercase tracking-tight leading-none">{vehicle.assignedDriverName?.split(' ')[0] || 'NONE'}</p>
                        <p className="text-[7px] text-text-muted font-bold uppercase tracking-widest">Pilot</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                       {Object.entries(vehicle?.documents || {}).map(([key, doc]) => (
                         <div 
                           key={key} 
                           className={`w-5 h-5 flex items-center justify-center text-[6px] font-black rounded-sm border ${
                             doc?.status === 'VALID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             doc?.status === 'EXPIRING' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                           }`}
                           title={`${key.toUpperCase()}: ${doc?.expiry}`}
                         >
                           {key.substring(0, 1).toUpperCase()}
                         </div>
                       ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Badge variant={getStatusVariant(vehicle.status)} className="px-2 py-0.5 text-[7px] font-black border border-card-border uppercase tracking-widest h-4">
                      {vehicle.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1.5">
                       <Button 
                        size="icon" 
                        variant="outline" 
                        className="w-7 h-7 border-card-border hover:bg-black hover:text-white transition-all shadow-none"
                        onClick={() => navigate(`/admin/vehicles/${vehicle.id}`)}
                       >
                         <ArrowRight size={12} />
                       </Button>
                       <Button 
                        size="icon" 
                        variant="outline" 
                        className="w-7 h-7 border-card-border hover:bg-slate-100 transition-all shadow-none"
                       >
                         <MoreVertical size={12} />
                       </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-2 bg-slate-50/50 border-t border-card-border flex justify-between items-center">
           <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Cap: {vehicles.reduce((acc, v) => acc + parseInt(v.capacity), 0)} KG</p>
           <p className="text-[8px] font-black text-text-muted uppercase tracking-widest italic opacity-50">GF Logistics v4.0</p>
        </div>
      </Card>
    </div>
  );
};

export default VehicleDashboard;

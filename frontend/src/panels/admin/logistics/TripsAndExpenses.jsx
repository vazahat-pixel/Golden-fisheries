import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Truck, 
  MapPin, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  ArrowRight,
  History,
  FileText,
  Navigation,
  Check,
  X,
  UserPlus
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const TripsAndExpenses = () => {
  const navigate = useNavigate();
  const { trips, driverAcceptTrip, driverRejectTrip } = useAdminStore();

  const totalActiveTrips = trips.filter(t => t.status === 'assigned' || t.status === 'accepted').length;
  const totalCompletedTrips = trips.filter(t => t.status === 'completed').length;
  const totalExpenses = trips.reduce((acc, trip) => {
    return acc + (trip.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0);
  }, 0);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'assigned': return 'warning';
      case 'accepted': return 'info';
      case 'completed': return 'success';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-3 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-bold text-black tracking-tight">Trips & <span className="text-accent-olive">Logistics.</span></h1>
          <p className="text-text-muted text-[9px] font-bold uppercase tracking-[0.2em] mt-1">ACTIVE MONITORING • EXPENSE SETTLEMENTS</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-accent-olive text-accent-olive hover:bg-accent-olive hover:text-white uppercase tracking-widest px-4 h-9 shadow-subtle"
            onClick={() => navigate('/admin/logistics/drivers')}
          >
            <UserPlus size={12} /> MANAGE FLEET
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 text-[9px] font-bold border-card-border uppercase tracking-widest px-4 h-9 shadow-subtle"
            onClick={() => toast.success('Viewing trip history...')}
          >
            <History size={12} /> HISTORY
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <StatCard title="ACTIVE TRIPS" value={totalActiveTrips.toString()} icon={Truck} trend="IN PROGRESS" trendType="up" />
        <StatCard title="COMPLETED" value={totalCompletedTrips.toString()} icon={CheckCircle2} trend="TODAY" trendType="up" />
        <StatCard title="TOTAL EXPENSES" value={`₹${totalExpenses.toLocaleString()}`} icon={IndianRupee} trend="REIMBURSABLE" trendType="down" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Active Trips Table */}
        <Card padding="none" className="lg:col-span-3 border border-card-border bg-white shadow-subtle overflow-hidden">
          <div className="px-4 py-2 border-b border-card-border bg-olive-50/20 flex items-center gap-2">
            <Navigation size={12} className="text-accent-olive" />
            <h2 className="text-[9px] font-bold text-text-muted uppercase tracking-widest">ACTIVE DISPATCHES</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-olive-100/10">
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">ID / Driver</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Route / Site</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-4 py-2.5 text-[8px] font-bold text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-olive-100/30">
                {trips.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No active trips at the moment.</td></tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-olive-50/30 transition-colors group">
                      <td className="px-4 py-3">
                        <p className="text-[10px] font-bold text-black uppercase tracking-tight">{trip.id}</p>
                        <p className="text-[8px] text-text-muted font-bold uppercase">{trip.driverName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                           <MapPin size={10} className="text-accent-olive" />
                           <p className="text-[10px] font-bold text-black uppercase">{trip.pickupLocation}</p>
                        </div>
                        <p className="text-[8px] text-text-muted font-bold ml-4">CREATED AT: {trip.createdAt}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(trip.status)} className="uppercase text-[7px] font-bold border border-card-border px-1.5 h-4 shadow-none">
                          {trip.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          {trip.status === 'assigned' && (
                            <>
                              <button onClick={() => { driverAcceptTrip(trip.id); toast.success('Trip accepted'); }} className="p-1.5 text-green-600 hover:bg-green-600 hover:text-white border border-card-border/30 bg-white" title="Accept"><Check size={13} /></button>
                              <button onClick={() => { if(confirm('Reject trip?')) { driverRejectTrip(trip.id); toast.error('Trip rejected'); } }} className="p-1.5 text-red-500 hover:bg-red-500 hover:text-white border border-card-border/30 bg-white" title="Reject"><X size={13} /></button>
                            </>
                          )}
                          <button className="p-1.5 text-black hover:bg-black hover:text-white border border-card-border/30 bg-white" title="Details"><ArrowRight size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Expense Quick List */}
        <Card padding="none" className="border border-card-border bg-white shadow-subtle overflow-hidden flex flex-col">
          <div className="px-4 py-2 border-b border-card-border bg-olive-50/20 flex items-center gap-2">
            <IndianRupee size={12} className="text-accent-olive" />
            <h2 className="text-[9px] font-bold text-text-muted uppercase tracking-widest">TRIP EXPENSES</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {trips.every(t => !t.expenses || t.expenses.length === 0) ? (
              <div className="px-4 py-12 text-center">
                 <AlertCircle size={24} className="text-olive-100 mx-auto mb-2" />
                 <p className="text-[8px] font-bold text-text-muted uppercase">No pending expenses.</p>
              </div>
            ) : (
              <div className="divide-y divide-olive-100/30">
                {trips.flatMap(trip => (trip.expenses || []).map((exp, idx) => (
                  <div key={`${trip.id}-${idx}`} className="p-3 hover:bg-olive-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] font-bold text-black uppercase">{exp.type}</p>
                      <p className="text-[10px] font-bold text-accent-olive font-serif italic">₹{exp.amount}</p>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-[7px] text-text-muted font-bold uppercase tracking-widest">{trip.id} · {trip.driverName.split(' ')[0]}</p>
                       <Badge variant="secondary" className="text-[6px] px-1 h-3 border-none bg-olive-50/50">{exp.method || 'CASH'}</Badge>
                    </div>
                  </div>
                )))}
              </div>
            )}
          </div>
          <div className="p-3 border-t border-card-border bg-white">
             <Button variant="outline" className="w-full text-[8px] font-bold uppercase tracking-widest border-card-border h-8">SETTLE ALL</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TripsAndExpenses;

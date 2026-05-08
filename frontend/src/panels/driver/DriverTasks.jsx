import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, driverAcceptTrip, driverRejectTrip } = useAdminStore();

  const myTrips = trips.filter(t => t.driverName === (user?.name || 'JAGRATI DOD') && !['Delivered', 'Expense Submitted', 'Closed'].includes(t.status));
  const pendingCount = myTrips.filter(t => t.status === 'Assigned').length;
  const activeCount = myTrips.filter(t => t.status === 'Accepted' || t.status === 'In Transit').length;

  const handleAccept = (tapalId) => {
    driverAcceptTrip(tapalId);
    toast.success('Task Accepted! Head to pickup.');
  };

  const handleReject = (tripId) => {
    driverRejectTrip(tripId);
    toast.error('Task Rejected');
  };

  const handleStart = () => {
    navigate('/driver/active-trip');
  };

  if (myTrips.length === 0) {
    return (
      <div className="p-8 space-y-6 bg-page-bg min-h-screen flex flex-col items-center justify-center text-center">
         <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-subtle border border-[#E6E2C8] relative mb-4">
            <Package size={40} className="text-[#E6E2C8]" />
            <div className="absolute inset-0 border-2 border-dashed border-[#6B7550]/20 rounded-full animate-[spin_10s_linear_infinite]"></div>
         </div>
         <div>
            <h2 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">Standby <span className="text-[#6B7550]">Mode</span></h2>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 max-w-[200px] mx-auto leading-relaxed">System is scanning for new logistics assignments in your perimeter.</p>
         </div>
         <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-[#E6E2C8] text-black font-black text-[10px] uppercase tracking-widest px-8">Refresh Feed</Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-32 animate-in fade-in duration-500 selection:bg-black selection:text-white">
      {/* Registry Header */}
      <div className="bg-black text-white p-8">
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif italic font-black text-white tracking-tight uppercase leading-none">
              Duty <span className="text-[#6B7550]">Roster.</span>
            </h2>
            <div className="flex items-center gap-3">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Logistics Flow Pipeline</p>
              <div className="h-1 w-1 rounded-full bg-white/20" />
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#6B7550]">Operator: {user?.name || 'FLEET-7'}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="bg-white/5 border border-white/10 px-5 py-2 flex flex-col items-center min-w-[70px]">
              <span className="text-2xl font-black leading-none text-white">{pendingCount}</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-[#6B7550] mt-1">Pending</span>
            </div>
            <div className="bg-[#6B7550] text-white px-5 py-2 flex flex-col items-center min-w-[70px]">
              <span className="text-2xl font-black leading-none">{activeCount}</span>
              <span className="text-[7px] font-black uppercase tracking-widest text-white/50 mt-1">Active</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6 -mt-10">
        {myTrips.map((task) => (
          <Card key={task.id} padding="none" className="overflow-hidden border border-black/5 bg-white shadow-2xl group transition-all hover:border-black/20">
            <div className="p-8">
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-black/5">
                <div className="space-y-2">
                   <div className="flex items-center gap-3">
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.3em]">{task.id}</span>
                      <div className="w-1 h-1 bg-black/10 rounded-full" />
                      <span className="text-[8px] font-black text-[#6B7550] uppercase tracking-[0.3em]">{task.tapalId}</span>
                   </div>
                   <h3 className="text-xl font-black text-black uppercase tracking-tight leading-none group-hover:translate-x-1 transition-transform">{task.product || 'Logistics Assignment'}</h3>
                </div>
                <Badge className={`font-black uppercase tracking-[0.4em] text-[7px] px-4 py-2 border-none shadow-sm ${
                  task.status === 'Assigned' ? 'bg-[#6B7550] text-white' : 'bg-black text-white'
                }`}>
                  {task.status}
                </Badge>
              </div>

              {/* High-Density Logistics Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="space-y-6">
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-black">
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.4em] mb-2">Primary Manifest Point</p>
                    <p className="text-[11px] font-black text-black uppercase tracking-tight">{task.pickupLocation}</p>
                  </div>
                  <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#6B7550]">
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.4em] mb-2">Final Settlement Hub</p>
                    <p className="text-[11px] font-black text-black uppercase tracking-tight">{task.deliveryLocation || 'CENTRAL STORAGE'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-5 space-y-2 group-hover:bg-black transition-all">
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] group-hover:text-[#6B7550]">Cargo Mass</p>
                    <p className="text-[13px] font-black text-black group-hover:text-white">{task.expectedQty}</p>
                  </div>
                  <div className="bg-gray-50 p-5 space-y-2 group-hover:bg-black transition-all">
                    <p className="text-[7px] font-black text-text-muted uppercase tracking-[0.3em] group-hover:text-[#6B7550]">Timestamp</p>
                    <p className="text-[13px] font-black text-black group-hover:text-white uppercase truncate">{task.createdAt}</p>
                  </div>
                </div>
              </div>

              {task.status === 'Assigned' ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleAccept(task.tapalId)} 
                    className="flex-[3] py-6 bg-black text-white font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-[#6B7550] active:scale-95 transition-all shadow-xl border-none"
                  >
                    <CheckCircle2 size={18} /> Commit To Route
                  </button>
                  <button 
                    onClick={() => handleReject(task.id)} 
                    className="flex-1 py-6 bg-white text-black border border-black/10 font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <Button 
                  onClick={handleStart} 
                  className="w-full py-6 bg-black text-white hover:bg-[#6B7550] border-none font-black text-[12px] uppercase tracking-[0.5em] flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all"
                >
                  {task.status === 'Accepted' ? 'Engage Transit' : 'Resume Mission'} <ArrowRight size={20} />
                </Button>
              )}
            </div>
          </Card>
        ))}

        {myTrips.length === 0 && (
          <div className="py-32 text-center space-y-8 opacity-10">
             <Package size={80} className="mx-auto" />
             <p className="text-[12px] font-black uppercase tracking-[0.5em]">No Pending Manifests</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverTasks;



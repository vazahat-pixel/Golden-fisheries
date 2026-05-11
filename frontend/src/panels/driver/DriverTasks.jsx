import React from 'react';
import { Badge } from '../../design-system/components/Badge';
import { 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck,
  Navigation
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, driverAcceptTrip, driverRejectTrip } = useAdminStore();

  const myTrips = trips.filter(t => t.driverName === (user?.name || 'RAJESH KUMAR') && !['Delivered', 'Expense Submitted', 'Closed'].includes(t.status));
  
  const dummyTasks = [
    {
      id: 'TRP-8821',
      tapalId: 'TAPAL-8821',
      status: 'Assigned',
      product: 'VANNAMEI SHRIMPS',
      pickupLocation: 'SOUTH BAY FARM - GATE 2',
      deliveryLocation: 'COLD STORAGE HUB',
      expectedQty: '450 KG',
      customer: { name: 'JOHN DOE', phone: '+91 9887766554' },
      instructions: 'Handle with care.',
      createdAt: '10:30 AM'
    },
    {
      id: 'TRP-8825',
      tapalId: 'TAPAL-8825',
      status: 'Accepted',
      product: 'MACKEREL (LARGE)',
      pickupLocation: 'MAIN DOCK TERMINAL',
      deliveryLocation: 'RETAIL OUTLET - SECTOR A',
      expectedQty: '1,200 KG',
      customer: { name: 'SARAH SMITH', phone: '+91 9900887766' },
      instructions: 'Deliver before 4 PM.',
      createdAt: '09:15 AM'
    }
  ];

  const displayTasks = myTrips.length > 0 ? myTrips : dummyTasks;

  const handleAccept = (tapalId) => {
    driverAcceptTrip(tapalId);
    toast.success('Task Accepted!');
  };

  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Duty Roster</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Active Deployment Pipeline</p>
        </div>
        <div className="bg-black text-white px-3 py-1.5 rounded-xl shadow-lg flex items-baseline gap-1.5">
          <span className="text-sm font-black italic leading-none">{displayTasks.length}</span>
          <span className="text-[7px] font-bold text-white/50 uppercase tracking-widest">Tasks</span>
        </div>
      </div>

      <div className="space-y-3">
        {displayTasks.map((task) => (
          <div key={task.id} className="glass-card rounded-[1.5rem] p-4 shadow-soft space-y-3 border-none relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-black text-white bg-black px-1.5 py-0.5 rounded-lg tracking-tight">{task.id}</span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase tracking-widest">{task.createdAt}</span>
                </div>
                <h3 className="text-sm font-black text-black uppercase tracking-tight leading-none">{task.product}</h3>
              </div>
              <Badge className={`text-[7px] font-black uppercase px-2 py-0.5 border-none ${task.status === 'Assigned' ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-500 text-white'}`}>
                {task.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-2 relative z-10">
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin size={12} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em]">Pickup</p>
                  <p className="text-[9px] font-bold text-black uppercase truncate">{task.pickupLocation}</p>
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                  <Navigation size={12} className="text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[7px] font-bold text-gray-400 uppercase tracking-[0.1em]">Target</p>
                  <p className="text-[9px] font-bold text-black uppercase truncate">{task.deliveryLocation || 'Warehouse'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-black/5 relative z-10">
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                    <Package size={10} className="text-gray-400" />
                    <span className="text-[9px] font-black text-black uppercase">{task.expectedQty}</span>
                 </div>
                 <div className="w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
                 <p className="text-[8px] font-bold text-gray-500 uppercase truncate max-w-[80px]">{task.customer?.name || 'GENERIC CLIENT'}</p>
               </div>
               <button 
                 onClick={() => window.open(`tel:${task.customer?.phone || '9876543210'}`)}
                 className="p-2 bg-emerald-50 text-emerald-600 rounded-lg active:scale-95 transition-all"
               >
                 <Phone size={12} />
               </button>
            </div>

            <div className="flex gap-2 pt-1 relative z-10">
              {task.status === 'Assigned' ? (
                <button 
                  onClick={() => handleAccept(task.tapalId)}
                  className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                >
                  Accept Mission
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => navigate('/driver/tracking')}
                    className="flex-1 py-3 bg-white border border-black text-black rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    Route
                  </button>
                  <button 
                    onClick={() => navigate('/driver/active-trip')}
                    className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    Console
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverTasks;

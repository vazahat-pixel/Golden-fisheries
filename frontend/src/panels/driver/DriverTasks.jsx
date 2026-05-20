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
  Navigation,
  Check
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useAdminStore();
  const {
    incomingAssignment,
    clearIncomingAssignment,
    acceptTripAsync,
    rejectTripAsync
  } = useDriverStore();

  React.useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const driverName = user?.fullName || user?.name || 'Unknown Driver';
  const myTrips = trips.filter(t => {
    const matchById = user?.id && t.driverId === user.id;
    const matchByName = t.driverName?.toUpperCase().trim() === driverName?.toUpperCase().trim();
    return (matchById || matchByName) && !['Delivered', 'Expense Submitted', 'Closed', 'REJECTED'].includes(t.status);
  });

  const displayTasks = myTrips;

  const handleAccept = async (tapalIdArg) => {
    const tId = tapalIdArg || incomingAssignment?.tapalId;
    if (!tId) return;

    try {
      await acceptTripAsync(tId);
      if (incomingAssignment) clearIncomingAssignment();
      toast.success('Trip Accepted! You can now start the trip.');
      navigate('/driver/active-trip');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to accept trip');
    }
  };

  const handleReject = async (tapalIdArg) => {
    const tId = tapalIdArg || incomingAssignment?.tapalId;
    if (!tId) return;

    try {
      await rejectTripAsync(tId, 'Driver rejected');
      if (incomingAssignment) clearIncomingAssignment();
      toast.success('Trip Rejected');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reject trip');
    }
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
              <Badge className={`text-[7px] font-black uppercase px-2 py-0.5 border-none ${task.status === 'ASSIGNED' ? 'bg-red-500 text-white animate-pulse' : task.status === 'ACCEPTED' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
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
              {task.status === 'ASSIGNED' ? (
                <>
                  <button
                    onClick={() => handleReject(task.tapalId)}
                    className="py-3 px-4 bg-rose-50 text-rose-600 rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] border border-rose-200 active:scale-95 transition-all"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAccept(task.tapalId)}
                    className="flex-1 py-3 bg-black text-white rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
                  >
                    Accept Trip
                  </button>
                </>
              ) : task.status === 'ACCEPTED' ? (
                <>
                  <button
                    onClick={() => navigate('/driver/tracking')}
                    className="flex-1 py-3 bg-white border border-black text-black rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    Route
                  </button>
                  <button
                    onClick={() => navigate('/driver/active-trip')}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95"
                  >
                    Start Trip
                  </button>
                </>
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

      {/* Real-time Fullscreen Incoming Assignment Popup */}
      {incomingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <AlertCircle size={24} className="text-accent-olive animate-pulse" />
              </div>
            </div>

            <div className="mt-6 text-center space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Incoming Tapal Assignment</p>
              <h2 className="text-xl font-black text-black tracking-tight">{incomingAssignment.tapalNumber}</h2>
              <Badge className="bg-amber-100 text-amber-700 uppercase font-black text-[9px] border-none px-3 mt-2">{incomingAssignment.type}</Badge>
            </div>

            <div className="mt-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Party</p>
                  <p className="text-[10px] font-black text-slate-900 uppercase">{incomingAssignment.partyName}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Quantity</p>
                  <p className="text-[10px] font-black text-slate-900">{incomingAssignment.qty}</p>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pickup</p>
                  <p className="text-[10px] font-black text-slate-900 uppercase text-right truncate max-w-[150px]">{incomingAssignment.pickupLocation}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivery</p>
                  <p className="text-[10px] font-black text-slate-900 uppercase text-right truncate max-w-[150px]">{incomingAssignment.deliveryLocation}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleReject}
                  className="flex-1 py-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-widest hover:bg-rose-100 active:scale-95 transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAccept()}
                  className="flex-[2] py-4 rounded-xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Check size={16} /> Accept Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverTasks;

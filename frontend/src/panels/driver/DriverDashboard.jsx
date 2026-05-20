import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { Truck, MapPin, Package, Navigation, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips().finally(() => setLoading(false));
  }, [fetchTrips]);

  // Find the active trip for the logged-in driver (status Assigned, Accepted, In Transit, Picked)
  const activeTrips = trips.filter(t => 
    (t.driverId === user?.id || t.driverName === user?.name) &&
    ['Assigned', 'Accepted', 'In Transit', 'Picked'].includes(t.status)
  );

  const activeTrip = activeTrips.length > 0 ? activeTrips[0] : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="border-b border-card-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
          Driver Dashboard
        </h1>
        <p className="text-text-secondary text-sm mt-1">Welcome back, {user?.name || 'Driver'}!</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-text-muted">Loading your trips...</div>
      ) : activeTrip ? (
        <div className="bg-white border border-card-border shadow-md overflow-hidden">
          <div className="bg-brand-olive p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Truck size={20} className="text-brand-yellow" />
              <h2 className="font-black uppercase tracking-widest text-sm">Active Trip: {activeTrip.tripNumber || activeTrip.id}</h2>
            </div>
            <span className="bg-white/20 px-3 py-1 text-xs font-black uppercase rounded-sm">{activeTrip.status}</span>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-brand-yellow/30 p-2 rounded-full"><MapPin size={20} className="text-brand-olive" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Pickup Location</p>
                  <p className="font-extrabold text-lg text-brand-olive uppercase">{activeTrip.pickupLocation || 'FARM SITE'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-emerald-100 p-2 rounded-full"><Navigation size={20} className="text-emerald-800" /></div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Delivery Location</p>
                  <p className="font-extrabold text-lg text-emerald-900 uppercase">{activeTrip.deliveryLocation || 'BUYER SITE'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 border border-slate-200 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Cargo</p>
                <p className="font-bold text-sm uppercase">{activeTrip.product || 'Fish Load'} • {activeTrip.expectedQty || 'TBD'} kg</p>
              </div>
              <button
                onClick={() => navigate(`/driver/trip/${activeTrip.id}`)}
                className="bg-brand-olive text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all shadow-sm"
              >
                Manage Trip →
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-card-border p-12 text-center shadow-sm">
          <div className="mx-auto bg-slate-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <Clock size={32} className="text-slate-400" />
          </div>
          <h2 className="text-lg font-black text-brand-olive uppercase">No Active Trips</h2>
          <p className="text-sm text-text-secondary mt-2">You currently have no assigned trips. Please wait for dispatch.</p>
        </div>
      )}

      <div className="bg-white border border-card-border shadow-sm p-6 mt-8">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => navigate('/driver/history')} className="border border-card-border p-4 text-center hover:bg-slate-50 transition-colors">
            <FileText className="mx-auto text-brand-olive mb-2" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-olive">Trip History</span>
          </button>
          <button onClick={() => toast('Profile settings coming soon.')} className="border border-card-border p-4 text-center hover:bg-slate-50 transition-colors">
            <Truck className="mx-auto text-brand-olive mb-2" size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-olive">Vehicle Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

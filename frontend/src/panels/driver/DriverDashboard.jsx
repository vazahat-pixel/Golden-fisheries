import React, { useState, useEffect } from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import {
   Navigation,
   MapPin,
   AlertCircle,
   Clock,
   CheckCircle2,
   Package,
   Phone,
   Mail,
   ChevronLeft,
   MoreHorizontal,
   Check,
   User,
   Radar,
   ShieldCheck,
   Zap,
   Activity,
   Truck
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import driverMockData from '../../data/driverMockData.json';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, driverAcceptTrip, vehicles } = useAdminStore();

  const assignedVehicle = vehicles.find(v => v.assignedDriverId === user?.id || v.assignedDriverName === user?.name);

  const pilotStats = driverMockData.profile.stats;

  const myTrips = Array.isArray(trips) ? trips.filter(t => {
    const matchById = user?.id && t.driverId === user.id;
    const matchByName = t.driverName?.toUpperCase().trim() === (user?.name || driverMockData.profile.name).toUpperCase().trim();
    return matchById || matchByName || t.status === 'Assigned';
  }) : [];

  const newAssignment = myTrips.find(t => t.status === 'Assigned');
  const liveTrip = myTrips.find(t => ['Accepted', 'In Transit', 'Picked'].includes(t.status));

  const handleAccept = () => {
    if (newAssignment) {
      driverAcceptTrip(newAssignment.tapalId);
      toast.success('Task Accepted!');
      navigate('/driver/active-trip');
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 selection:bg-black selection:text-white animate-in fade-in duration-700 font-sans">
      {/* Light Tactical Map */}
      <div className="absolute inset-0 z-0">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'grayscale(0.4) contrast(1.1) brightness(1.05)' }}
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </div>

      {/* Ultra-Compact Top HUD */}
      <div className="absolute top-4 left-0 right-0 z-20 px-4 safe-top flex justify-between items-center pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md border border-slate-200/50 p-1 rounded-full flex items-center gap-2 pr-3 shadow-sm">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white shadow-md">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} className="w-full h-full object-cover rounded-full" alt="" />
              ) : (
                <User size={14} />
              )}
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-900 leading-none tracking-tight">{user?.name || driverMockData.profile.name}</p>
            </div>
          </div>
        </div>

        <div className="pointer-events-auto flex gap-1.5">
           <div className="bg-white/90 backdrop-blur-md border border-slate-200/50 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
             <Activity size={10} className="text-emerald-500" />
             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Live</p>
           </div>
        </div>
      </div>

      {/* Compact Central Action Deck */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-4">
        <div className="bg-white rounded-[2rem] p-5 border border-slate-200/50 shadow-xl relative overflow-hidden group">
          
          {(newAssignment || liveTrip) ? (
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Current Deployment</p>
                </div>
                <Badge className={`text-[8px] font-black uppercase px-2 py-0.5 border-none ${newAssignment ? 'bg-black text-white' : 'bg-emerald-500 text-white'}`}>
                  {newAssignment ? 'New' : 'Live'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Pickup Node</p>
                   <p className="text-[10px] font-black text-slate-900 uppercase truncate">{newAssignment?.pickupLocation || liveTrip?.pickupLocation}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl space-y-1">
                   <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Payload</p>
                   <p className="text-[10px] font-black text-slate-900 uppercase truncate">{newAssignment?.product || liveTrip?.product}</p>
                </div>
              </div>

              <button 
                onClick={newAssignment ? handleAccept : () => navigate('/driver/active-trip')}
                className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.3em] shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-3 ${
                  newAssignment ? 'bg-black text-white' : 'bg-emerald-500 text-white shadow-emerald-500/20'
                }`}
              >
                {newAssignment ? <Zap size={14} /> : <Navigation size={14} />}
                {newAssignment ? 'Accept Assignment' : 'Command Console'}
              </button>
            </div>
          ) : (
            <div className="text-center py-2 space-y-5 relative z-10">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 relative mb-3">
                  <div className="absolute inset-0 rounded-2xl border-2 border-emerald-500/20 animate-ping [animation-duration:3s]" />
                  <Radar size={20} className="text-slate-300 animate-spin [animation-duration:5s]" />
                </div>
                <h2 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Perimeter Scan</h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.1em] mt-1">Awaiting Dispatch Orders</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
                  <p className="text-lg font-black text-slate-900 italic leading-none mb-1">{pilotStats.tripsToday}</p>
                  <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest leading-none">Trips Today</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                  <p className="text-lg font-black text-emerald-600 italic leading-none mb-1">{pilotStats.safetyScore}</p>
                  <p className="text-[7px] text-slate-400 font-black uppercase tracking-widest leading-none">Pilot Score</p>
                </div>
              </div>

              {assignedVehicle && (
                <div className="bg-black rounded-2xl p-4 flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-accent-olive">
                       <Truck size={16} />
                    </div>
                    <div className="text-left">
                       <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Assigned Asset</p>
                       <p className="text-[10px] font-black text-white uppercase tracking-tight">{assignedVehicle.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[7px] font-black text-white/40 uppercase tracking-widest">Type</p>
                     <p className="text-[9px] font-bold text-accent-olive uppercase">{assignedVehicle.type}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;

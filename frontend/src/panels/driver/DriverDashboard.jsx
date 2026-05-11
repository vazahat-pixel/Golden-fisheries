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
   User
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, driverAcceptTrip } = useAdminStore();

  const myTrips = Array.isArray(trips) ? [
    ...trips.filter(t => 
      t.driverName === (user?.name || 'RAJESH KUMAR') || 
      t.id === 'TRP-9001' || 
      t.status === 'Assigned'
    ),
    {
      id: 'TRP-DEMO',
      tapalId: 'DEMO-123',
      status: 'Assigned',
      pickupLocation: 'FARM SITE - NORTH',
      product: 'DEMO FISH',
      expectedQty: '250 KG',
      distance: '4.2 KM'
    }
  ] : [];

  const newAssignment = myTrips.find(t => t.status === 'Assigned');
  const liveTrip = myTrips.find(t => ['Accepted', 'In Transit', 'Picked'].includes(t.status));

  const handleAccept = () => {
    if (newAssignment) {
      driverAcceptTrip(newAssignment.tapalId);
      toast.success('Task Accepted! Head to pickup location.');
      navigate('/driver/active-trip');
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50 selection:bg-black selection:text-white animate-in fade-in duration-700">
      {/* Dynamic Map Background */}
      <div className="absolute inset-0 z-0">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'grayscale(0.3) contrast(1.1) brightness(1.02)' }}
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </div>

      {/* Top Floating Stats - Centered & Enhanced */}
      <div className="absolute top-4 left-0 right-0 z-20 px-6 safe-top pointer-events-none">
        <div className="flex justify-center gap-3 pointer-events-auto">
          <div className="glass px-5 py-2.5 rounded-[1.4rem] shadow-extra-soft border border-white/60 flex items-center gap-3 bg-white/40 backdrop-blur-md">
            <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
              <Package size={14} />
            </div>
            <div>
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Manifest</p>
              <p className="text-sm font-black text-black leading-none italic">{myTrips.length} <span className="text-[8px] not-italic text-gray-400 ml-0.5">ASSIGNED</span></p>
            </div>
          </div>
          
          <div className="glass px-5 py-2.5 rounded-[1.4rem] shadow-extra-soft border border-white/60 flex items-center gap-3 bg-white/40 backdrop-blur-md">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200/50">
              <CheckCircle2 size={14} />
            </div>
            <div>
              <p className="text-[7px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">Pilot</p>
              <p className="text-sm font-black text-emerald-600 leading-none uppercase italic tracking-tight">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Deck - Floating Bottom Card */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-4 animate-in slide-in-from-bottom-8 duration-1000 delay-200">
        <div className="glass-card rounded-[2rem] p-5 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
             <Navigation size={80} className="text-black" />
          </div>

          {(newAssignment || liveTrip) ? (
            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-[0.4em] mb-0.5">Active Assignment</p>
                  <h2 className="text-lg font-black text-black tracking-tighter uppercase leading-none">MISSION_CRITICAL</h2>
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${newAssignment ? 'bg-red-500 text-white animate-pulse' : 'bg-black text-white'}`}>
                  {newAssignment ? 'New Request' : 'In Transit'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-3 rounded-[1.2rem] border border-black/5">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin size={12} className="text-emerald-500" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Pickup</p>
                  </div>
                  <p className="text-[10px] font-bold text-black uppercase line-clamp-1">{newAssignment?.pickupLocation || liveTrip?.pickupLocation}</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-[1.2rem] border border-black/5">
                  <div className="flex items-center gap-2 mb-1">
                    <Package size={12} className="text-black" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Load</p>
                  </div>
                  <p className="text-[10px] font-bold text-black uppercase line-clamp-1">{newAssignment?.product || liveTrip?.product}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center shadow-lg border border-white overflow-hidden">
                    {user?.profilePhoto ? (
                      <img src={user.profilePhoto} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={14} className="text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-black leading-none mb-0.5">{user?.name || 'RAJESH KUMAR'}</p>
                    <p className="text-[8px] text-emerald-600 font-bold uppercase tracking-widest">Verified Pilot</p>
                  </div>
                </div>

                <div className="flex gap-2">
                   {newAssignment ? (
                    <button 
                      onClick={handleAccept}
                      className="bg-black text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      Accept
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate('/driver/active-trip')}
                      className="bg-emerald-500 text-white px-5 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                    >
                      Console
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 space-y-4 relative z-10">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto shadow-inner border border-black/5">
                <Navigation size={20} className="text-gray-300 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-black text-black tracking-tighter uppercase mb-1 italic">Scanning Perimeter</h2>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.1em] leading-relaxed max-w-[180px] mx-auto">
                  Awaiting central dispatch assignments...
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-black/5">
                  <p className="text-xl font-black text-black italic leading-none mb-1">{myTrips.length - 1}</p>
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Trips Today</p>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                  <p className="text-xl font-black text-emerald-600 italic leading-none mb-1">4.9</p>
                  <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Pilot Rating</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default DriverDashboard;

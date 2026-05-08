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
         expectedQty: '250 KG'
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
    <div className="relative h-screen w-full overflow-hidden bg-[#F9FAFB] selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Map Surface */}
      <div className="absolute inset-0 z-0">
        <iframe 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          style={{ border: 0, filter: 'grayscale(0.6) contrast(1.1) brightness(0.95)' }}
          src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15551.4682052163!2d74.8427776!3d12.8701056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1714811800000!5m2!1sen!2sin"
          allowFullScreen
        ></iframe>
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between pointer-events-none">
        <button className="w-12 h-12 bg-white text-gray-900 shadow-lg flex items-center justify-center pointer-events-auto active:scale-95 transition-all border border-gray-100" onClick={() => navigate('/launchpad')}>
          <ChevronLeft size={20} />
        </button>
        <div className="bg-white/95 backdrop-blur-sm px-6 py-2 shadow-lg pointer-events-auto border border-gray-200">
          <h1 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Fleet Pilot Console</h1>
        </div>
        <button className="w-12 h-12 bg-white text-gray-900 shadow-lg flex items-center justify-center pointer-events-auto active:scale-95 transition-all border border-gray-100">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Fleet Action Deck */}
      <div className="absolute bottom-0 left-0 right-0 z-30 animate-in slide-in-from-bottom-12 duration-500">
        <div className="bg-white shadow-2xl p-6 pb-8 border-t border-gray-100">
          {(newAssignment || liveTrip) ? (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">Mission Registry</p>
                  <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Active Assignment</h2>
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 border ${newAssignment ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-[#6B7550]/10 text-[#6B7550] border-[#6B7550]/20'}`}>
                  {newAssignment ? 'New Request' : 'In Progress'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin size={12} className="text-[#6B7550]" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Pickup Point</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 uppercase">{newAssignment?.pickupLocation || liveTrip?.pickupLocation}</p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package size={12} className="text-gray-900" />
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Load Info</p>
                  </div>
                  <p className="text-[10px] font-bold text-gray-900 uppercase">
                    {newAssignment ? `${newAssignment.product}` : `${liveTrip.product}`}
                  </p>
                </div>
              </div>

              {/* Pilot Info & Action */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-none flex items-center justify-center border border-gray-200">
                    {user?.profilePhoto ? <img src={user.profilePhoto} className="w-full h-full object-cover" alt="Pilot" /> : <User size={18} className="text-gray-400" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-900 uppercase leading-none mb-1">{user?.name || 'RAJESH KUMAR'}</p>
                    <p className="text-[7px] text-[#6B7550] font-bold uppercase tracking-widest">Verified Fleet Pilot</p>
                  </div>
                </div>

                {newAssignment ? (
                  <Button 
                    onClick={handleAccept}
                    className="bg-black text-white px-8 py-3 font-bold text-[9px] uppercase tracking-widest hover:bg-[#6B7550] transition-all border-none"
                  >
                    Accept Task
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate('/driver/active-trip')}
                    className="bg-[#6B7550] text-white px-8 py-3 font-bold text-[9px] uppercase tracking-widest hover:bg-black transition-all border-none"
                  >
                    Open Console
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-6">
                <Navigation size={24} className="text-[#6B7550] opacity-40" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 uppercase tracking-tight mb-2">On Standby</h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                Awaiting central dispatch for logistics assignments in your sector...
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gray-50 p-4 border border-gray-100">
                  <p className="text-2xl font-black text-gray-900">{myTrips.length}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Trips Total</p>
                </div>
                <div className="bg-gray-50 p-4 border border-gray-100">
                  <p className="text-2xl font-black text-[#6B7550]">0.0</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">Pilot Rank</p>
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

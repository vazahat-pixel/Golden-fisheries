import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { ArrowLeft, MapPin, Navigation, PackageCheck, Receipt, Camera, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActiveTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, fetchTrips, driverAcceptTrip, driverStartTrip, confirmPickup, completeTrip } = useAdminStore();
  const [trip, setTrip] = useState(null);

  // Modals / forms state
  const [actualQty, setActualQty] = useState('');
  const [showPickupForm, setShowPickupForm] = useState(false);
  
  useEffect(() => {
    if (trips.length === 0) fetchTrips();
  }, [fetchTrips, trips.length]);

  useEffect(() => {
    const found = trips.find(t => t.id === id || t._id === id);
    if (found) setTrip(found);
  }, [id, trips]);

  if (!trip) return <div className="p-8 text-center text-text-muted">Loading Trip Details...</div>;

  const handleAction = async (actionType) => {
    try {
      if (actionType === 'accept') {
        await driverAcceptTrip(trip.id || trip.tapalId);
        toast.success('Trip Accepted!');
      } else if (actionType === 'start') {
        await driverStartTrip(trip.id || trip.tapalId);
        toast.success('Trip Started! Drive Safely.');
      } else if (actionType === 'deliver') {
        await completeTrip(trip.id || trip.tapalId);
        toast.success('Delivery Completed Successfully!');
        navigate('/driver');
      }
      // re-fetch to get latest status
      fetchTrips();
    } catch (err) {
      toast.error('Action failed. Please try again.');
    }
  };

  const handlePickupSubmit = async (e) => {
    e.preventDefault();
    if (!actualQty) {
      toast.error('Please enter actual pickup weight');
      return;
    }
    try {
      await confirmPickup(trip.id || trip.tapalId, { actualQty, quality: 'Good', photo: null, signature: null });
      toast.success('Pickup Confirmed!');
      setShowPickupForm(false);
      fetchTrips();
    } catch (err) {
      toast.error('Pickup confirmation failed.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/driver')} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            Active Trip #{trip.tripNumber || trip.id}
          </h1>
          <p className="text-text-secondary text-sm mt-1">Status: {trip.status}</p>
        </div>
      </div>

      {/* Progress Tracker UI */}
      <div className="bg-white border border-card-border shadow-sm p-6 mb-6">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive mb-6 text-center">Trip Progress</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2"></div>
          
<<<<<<< HEAD
          {['Assigned', 'In Transit', 'Picked', 'Delivered'].map((step, idx) => {
            const isActive = trip.status === step;
            const isPast = ['Assigned', 'Accepted', 'In Transit', 'Picked', 'Delivered'].indexOf(trip.status) >= ['Assigned', 'In Transit', 'Picked', 'Delivered'].indexOf(step);
            
            return (
              <div key={step} className="flex flex-col items-center bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isPast ? 'bg-brand-olive text-white' : 'bg-slate-200 text-slate-500'} ${isActive ? 'ring-4 ring-brand-yellow/30' : ''}`}>
                  {isPast ? <Check size={16} /> : idx + 1}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isPast ? 'text-brand-olive' : 'text-text-muted'}`}>{step}</span>
              </div>
            );
          })}
        </div>
=======
          <div className="flex items-center justify-between text-center relative px-2">
            {/* Background progress bar */}
            <div className="absolute top-3.5 left-8 right-8 h-1 bg-slate-200 z-0">
              <div className={`h-full bg-[#6A7051] transition-all duration-500`} style={{
                width: isAssigned ? '0%' : isInTransit ? '33%' : isPicked ? '66%' : '100%'
              }}></div>
            </div>

            {/* Step 1: Assigned */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                isAssigned ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
              }`}>
                {!isAssigned ? <Check size={14} /> : '1'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Assigned</span>
            </div>

            {/* Step 2: Transit */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                isAssigned ? 'bg-white border-slate-300 text-slate-400' :
                isInTransit ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
              }`}>
                {isPicked || isDelivered ? <Check size={14} /> : '2'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Transit</span>
            </div>

            {/* Step 3: Loaded */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                isAssigned || isInTransit ? 'bg-white border-slate-300 text-slate-400' :
                isPicked ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
              }`}>
                {isDelivered ? <Check size={14} /> : '3'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Loaded</span>
            </div>

            {/* Step 4: Complete */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${
                isDelivered ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-400'
              }`}>
                4
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Done</span>
            </div>
          </div>
        </div>

        <div className="pt-1">
          {/* ASSIGNED — driver can start trip */}
          {trip.status === 'ASSIGNED' && (
            <button onClick={handleStartTrip} className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              <Navigation size={14} className="animate-pulse" /> Start Trip
            </button>
          )}

          {/* STARTED — driver can log pickup weight */}
          {trip.status === 'STARTED' && (
            <button onClick={() => setIsPickupModalOpen(true)} className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              <PackageCheck size={14} /> Log Pickup Weight
            </button>
          )}

          {/* PICKED — driver can confirm delivery */}
          {trip.status === 'PICKED' && (
            <button onClick={() => setIsDeliveryModalOpen(true)} className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
              <CheckCircle2 size={14} /> Confirm Delivery
            </button>
          )}

          {/* DELIVERED / CLOSED — await admin trip closure */}
          {['DELIVERED', 'CLOSED'].includes(trip.status) && (
            <div className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Delivered — Awaiting Admin Closure
            </div>
          )}
        </div>
      </div>

        {/* Location Routing Coordinates */}
        <div className="bg-white border border-card-border p-4 rounded-xl shadow-sm space-y-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-olive block border-b border-card-border pb-1">Route Waypoints</span>
          <div className="space-y-2.5 pl-1.5 pt-1 text-[11px] text-text-secondary uppercase">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#6A7051]" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-widest block">Dock Location</span>
                <span className="font-extrabold text-brand-olive">{trip.pickupLocation}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-dashed border-card-border pt-2">
              <Navigation size={14} className="text-brand-yellow animate-pulse" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-widest block">Delivery Site</span>
                <span className="font-extrabold text-brand-olive">{trip.deliveryLocation}</span>
              </div>
            </div>
          </div>
        </div>

>>>>>>> 47e56edf97dd57b0a9064bf17d38f96d6611b953
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-card-border p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
            Route Details
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1"><MapPin size={20} className="text-text-muted" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">From (Pickup)</p>
                <p className="font-extrabold text-brand-olive uppercase">{trip.pickupLocation || 'FARM SITE'}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="mt-1"><Navigation size={20} className="text-text-muted" /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">To (Delivery)</p>
                <p className="font-extrabold text-brand-olive uppercase">{trip.deliveryLocation || 'BUYER SITE'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-card-border p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
            Cargo & Instructions
          </h3>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold text-text-muted w-32 inline-block">Product:</span> <span className="font-black uppercase">{trip.product || 'Fish Load'}</span></p>
            <p><span className="font-bold text-text-muted w-32 inline-block">Expected Qty:</span> <span className="font-bold">{trip.expectedQty || 'TBD'} kg</span></p>
            {trip.actualQty && (
              <p><span className="font-bold text-text-muted w-32 inline-block">Picked Qty:</span> <span className="font-black text-brand-olive">{trip.actualQty} kg</span></p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons based on Status */}
      <div className="bg-white border border-card-border p-6 shadow-sm flex flex-col items-center justify-center gap-4">
        {trip.status === 'Assigned' && (
          <button onClick={() => handleAction('accept')} className="w-full max-w-md bg-brand-olive text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all shadow-md">
            Accept Trip
          </button>
        )}

        {(trip.status === 'Accepted' || trip.status === 'Assigned') && (
          <button onClick={() => handleAction('start')} className="w-full max-w-md bg-brand-yellow text-brand-olive py-4 text-sm font-black uppercase tracking-widest hover:bg-[#D4A373]/90 transition-all shadow-md">
            Start Trip (In Transit)
          </button>
        )}

        {trip.status === 'In Transit' && !showPickupForm && (
          <button onClick={() => setShowPickupForm(true)} className="w-full max-w-md bg-brand-olive text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all shadow-md flex items-center justify-center gap-2">
            <PackageCheck size={18} /> Confirm Cargo Pickup
          </button>
        )}

        {trip.status === 'In Transit' && showPickupForm && (
          <form onSubmit={handlePickupSubmit} className="w-full max-w-md space-y-4 border border-card-border p-6 bg-slate-50">
            <h4 className="text-xs font-black uppercase tracking-wider text-brand-olive mb-2">Record Actual Weight</h4>
            <div>
              <label className="text-[10px] font-black uppercase text-text-muted mb-1 block">Actual Weight Picked (KG)</label>
              <input 
                type="number" 
                value={actualQty} 
                onChange={e => setActualQty(e.target.value)} 
                className="w-full border border-card-border px-4 py-3 text-sm focus:ring-1 focus:ring-brand-olive outline-none font-bold"
                placeholder="e.g. 500"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowPickupForm(false)} className="flex-1 bg-white border border-card-border text-text-secondary py-3 text-xs font-black uppercase">Cancel</button>
              <button type="submit" className="flex-1 bg-brand-olive text-white py-3 text-xs font-black uppercase shadow-sm">Save & Continue</button>
            </div>
          </form>
        )}

        {trip.status === 'Picked' && (
          <div className="w-full max-w-md space-y-4">
            <button onClick={() => handleAction('deliver')} className="w-full bg-emerald-700 text-white py-4 text-sm font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md flex items-center justify-center gap-2">
              <Check size={18} /> Complete Delivery
            </button>
            <button onClick={() => navigate(`/driver/expense/${trip.id}`)} className="w-full border border-card-border bg-white text-brand-olive py-4 text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
              <Receipt size={18} /> Log Trip Expense
            </button>
          </div>
        )}

        {trip.status === 'Delivered' && (
          <div className="text-center w-full max-w-md p-6 bg-emerald-50 border border-emerald-100 rounded-sm">
            <Check size={32} className="mx-auto text-emerald-600 mb-2" />
            <h3 className="font-black text-emerald-800 uppercase tracking-widest">Trip Completed</h3>
            <p className="text-sm text-emerald-700 mt-2">Awaiting admin closure.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTrip;

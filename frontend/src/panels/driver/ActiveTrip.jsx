import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Modal } from '../../design-system/components/Modal';
import {
  Truck,
  MapPin,
  IndianRupee,
  Camera,
  CheckCircle2,
  Navigation,
  Fuel,
  Info,
  PackageCheck,
  Signature,
  Scale,
  ArrowRight,
  ShieldCheck,
  Phone,
  Map as MapIcon
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ActiveTrip = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    activeTrip: myTrip, 
    startTripAsync, 
    pickupAsync, 
    deliverAsync,
    fetchMyTrips
  } = useDriverStore();



  // Use active trip from driverStore — no dummy fallback to avoid masking real errors
  const trip = myTrip;

  // ALL hooks MUST be declared before any conditional returns (React Rules of Hooks)
  const [pickupForm, setPickupForm] = useState({ actualQty: '', quality: 'A', photo: null, signature: null });
  const [otp, setOtp] = useState('');
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);

  if (!trip) {
    return (
      <div className="p-8 text-center space-y-3 min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
          <Truck size={24} className="text-slate-300" />
        </div>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">No Active Assignment</p>
        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">Awaiting dispatch orders from admin</p>
      </div>
    );
  }

  const simulateCamera = () => {
    toast.loading('Activating Camera...', { duration: 1000 });
    setTimeout(() => {
      setPickupForm(prev => ({ ...prev, photo: 'CAPTURED_PROOF_IMG_URL' }));
      toast.success('Photo Logged');
    }, 1200);
  };

  const simulateSignature = () => {
    setPickupForm(prev => ({ ...prev, signature: 'E_SIGN_DATA' }));
    toast.success('Signature Captured');
  };

  const handleStartTrip = async () => {
    try {
      // startTripAsync expects the Tapal _id (not Trip _id)
      // trip.tapalId is populated from fetchMyTrips response
      const tapalId = trip.tapalId?._id || trip.tapalId || trip._id;
      await startTripAsync(tapalId);
      toast.success('Trip Started! Drive safe.');
      await fetchMyTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to start trip');
    }
  };

  const handlePickupComplete = async () => {
    if (!pickupForm.actualQty) return toast.error('Please enter actual weight at pickup');
    try {
      // pickupAsync expects the Tapal _id
      const tapalId = trip.tapalId?._id || trip.tapalId || trip._id;
      await pickupAsync(tapalId, parseFloat(pickupForm.actualQty));
      setIsPickupModalOpen(false);
      toast.success('Pickup weight logged successfully');
      await fetchMyTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to log pickup');
    }
  };

  const handleDeliver = async () => {
    if (!pickupForm.actualQty) return toast.error('Please enter delivered weight');
    try {
      // deliverAsync expects the Tapal _id and actual delivered weight
      const tapalId = trip.tapalId?._id || trip.tapalId || trip._id;
      await deliverAsync(
        tapalId,
        parseFloat(pickupForm.actualQty || trip.expectedQty),
        pickupForm.photo || '',
        pickupForm.signature || ''
      );
      setIsDeliveryModalOpen(false);
      toast.success('Delivery Confirmed! Proof of Delivery recorded.');
      await fetchMyTrips();
    } catch (err) {
      toast.error(err?.message || 'Failed to confirm delivery');
    }
  };

  const handleFinish = () => {
    // Finished trips are handled by admin closing them
    toast.success('Trip finalized on your end!');
    navigate('/driver/dashboard');
  };

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Mission Console</h2>
          <div className="flex items-center gap-1.5 mt-1.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
             <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none">Active Signal: GF-FLEET-01</p>
          </div>
        </div>
        <Badge className="bg-black text-white text-[8px] font-bold px-2 py-0.5 rounded-lg border-none">
          {trip.status}
        </Badge>
      </div>

      <div className="glass-card rounded-[1.8rem] p-5 shadow-extra-soft space-y-5 border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
           <Truck size={60} className="text-black" />
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/40 p-3 rounded-xl border border-white/50">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cargo Payload</p>
            <p className="text-[10px] font-black text-black truncate uppercase leading-tight">{trip.product}</p>
          </div>
          <div className="bg-white/40 p-3 rounded-xl border border-white/50 text-right">
            <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Weight</p>
            <p className="text-[10px] font-black text-black leading-tight">{trip.expectedQty} KG</p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex gap-3 items-start">
            <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center shrink-0">
              <MapPin size={14} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Origin</p>
              <p className="text-[10px] font-bold text-black uppercase leading-tight line-clamp-1">{trip.pickupLocation}</p>
            </div>
          </div>

          <div className="flex gap-3 items-start ml-3.5 pl-3.5 border-l-2 border-dashed border-gray-100 py-1">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
              <Navigation size={14} className="text-black" />
            </div>
            <div className="flex-1">
              <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Target</p>
              <p className="text-[10px] font-bold text-black uppercase leading-tight line-clamp-1">{trip.deliveryLocation}</p>
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

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => navigate('/driver/tracking')} className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2 shadow-soft active:scale-95 transition-all border-none">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
            <MapIcon size={16} />
          </div>
          <span className="text-[8px] font-bold text-black uppercase tracking-widest">Live Route</span>
        </button>
        <button onClick={() => window.open(`tel:${trip.customer?.phone || '9876543210'}`)} className="glass-card p-4 rounded-2xl flex flex-col items-center gap-2 shadow-soft active:scale-95 transition-all border-none">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
            <Phone size={16} />
          </div>
          <span className="text-[8px] font-bold text-black uppercase tracking-widest">Call Client</span>
        </button>
      </div>

      {/* Pickup Modal */}
      <Modal isOpen={isPickupModalOpen} onClose={() => setIsPickupModalOpen(false)} title="VERIFICATION">
        <div className="space-y-5 p-2">
          <div className="glass-dark p-6 rounded-[1.5rem] text-center shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mb-1.5">Manifest Weight</p>
              <h3 className="text-3xl font-black text-white italic tracking-tighter">{trip.expectedQty} <span className="text-sm opacity-40">KG</span></h3>
            </div>
            <Scale size={40} className="absolute -right-2 -bottom-2 text-white/10" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Actual Scale Reading</label>
              <input
                type="number"
                value={pickupForm.actualQty}
                onChange={(e) => setPickupForm({ ...pickupForm, actualQty: e.target.value })}
                className="w-full bg-slate-50 border border-black/5 rounded-xl p-4 text-2xl font-black text-black outline-none focus:ring-2 focus:ring-emerald-500/20 text-center"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={simulateCamera}
                className={`h-20 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${pickupForm.photo ? 'bg-emerald-500 text-white border-none shadow-lg' : 'bg-white border-black/5 text-gray-400 hover:bg-black hover:text-white'}`}
              >
                <Camera size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">{pickupForm.photo ? 'Photo Logged' : 'Photo'}</span>
              </button>
              <button 
                onClick={simulateSignature}
                className={`h-20 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all ${pickupForm.signature ? 'bg-emerald-500 text-white border-none shadow-lg' : 'bg-white border-black/5 text-gray-400 hover:bg-black hover:text-white'}`}
              >
                <Signature size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">{pickupForm.signature ? 'Sign Captured' : 'Sign'}</span>
              </button>
            </div>

            <button onClick={handlePickupComplete} className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">
              Submit Log
            </button>
          </div>
        </div>
      </Modal>

      {/* Delivery Modal */}
      <Modal isOpen={isDeliveryModalOpen} onClose={() => setIsDeliveryModalOpen(false)} title="SETTLEMENT">
        <div className="space-y-5 p-2">
          <div className="p-6 bg-emerald-500 rounded-[1.5rem] text-center text-white shadow-lg relative overflow-hidden">
             <div className="relative z-10">
               <p className="text-[8px] font-bold text-white/60 uppercase tracking-[0.2em] mb-1.5">Security Auth</p>
               <h3 className="text-xl font-black italic tracking-tight">OTP VERIFICATION</h3>
             </div>
             <ShieldCheck size={60} className="absolute -right-4 -bottom-4 text-white/10" />
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest ml-2">Client OTP</label>
              <input
                type="text"
                maxLength={4}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-slate-50 border border-black/5 rounded-xl p-4 text-3xl font-black text-black outline-none tracking-[0.8em] text-center"
                placeholder="****"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="h-20 bg-white border border-black/5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <Camera size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Photo POD</span>
              </button>
              <button className="h-20 bg-white border border-black/5 rounded-xl flex flex-col items-center justify-center gap-1.5 text-gray-400">
                <Signature size={18} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Signature</span>
              </button>
            </div>

            <button onClick={handleDeliver} className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] shadow-lg">
              Finalize Delivery
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActiveTrip;

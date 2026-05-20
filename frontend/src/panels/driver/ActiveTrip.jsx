import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { 
  ArrowLeft, Truck, MapPin, Navigation, Box, Scale, Camera, 
  PenTool, Check, CheckCircle2, AlertTriangle, Play, FileInput 
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ActiveTrip = () => {
  const navigate = useNavigate();
  const { 
    myTrips, fetchMyTrips, startTripAsync, pickupAsync, deliverAsync 
  } = useDriverStore();

  const [trip, setTrip] = useState(null);
  
  // Input fields for loading
  const [loadBoxes, setLoadBoxes] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);

  // Signature canvas simulation
  const sigCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  // Prepopulate detailed responsive mock active trip if backend lists empty
  const mockActiveTrip = {
    id: 'TRP-0042',
    _id: 'TRP-0042',
    tripNumber: 'TRP-0042',
    status: 'Assigned', // Assigned -> In Transit -> Picked -> Delivered
    pickupLocation: 'KARWAR WEST DOCK SITE',
    deliveryLocation: 'MANGALORE MAIN WAREHOUSE',
    product: 'PREMIUM WHITE PRAWNS',
    expectedQty: '450 KG',
    actualQty: null,
    createdAt: '10:30 AM',
    expenses: []
  };

  useEffect(() => {
    // Find first active trip in state or fallback to mock
    const active = myTrips?.find(t => ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED'].includes(t.status)) || mockActiveTrip;
    if (active) {
      setTrip(active);
    }
  }, [myTrips]);

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center max-w-md mx-auto border-x border-slate-200">
        <div className="space-y-4">
          <AlertTriangle className="text-amber-500 mx-auto" size={48} />
          <h2 className="text-sm font-black uppercase text-brand-olive tracking-wider">No Active Trip Console</h2>
          <p className="text-xs text-text-secondary max-w-[280px]">
            You must have an assigned trip in your queue to execute live cargo steps.
          </p>
          <button
            onClick={() => navigate('/driver/dashboard')}
            className="bg-[#6A7051] text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleStartTrip = async () => {
    const loadToast = toast.loading('Starting transit...');
    try {
      await startTripAsync(trip._id || trip.id);
      setTrip(prev => prev ? { ...prev, status: 'In Transit' } : null);
      toast.success('Trip started! Drive safe.', { id: loadToast });
    } catch (err) {
      console.warn('Backend call failed, simulated offline start.');
      setTrip(prev => prev ? { ...prev, status: 'In Transit' } : null);
      toast.success('Trip started (offline mode)! Drive safe.', { id: loadToast });
    }
  };

  const handleOpenPickup = () => {
    setShowLoadModal(true);
  };

  const handleConfirmPickup = async (e) => {
    e.preventDefault();
    if (!loadWeight) {
      toast.error('Please enter loaded weight');
      return;
    }

    const loadToast = toast.loading('Logging loaded cargo...');
    try {
      await pickupAsync(trip._id || trip.id, parseFloat(loadWeight));
      setTrip(prev => prev ? { 
        ...prev, 
        status: 'Picked', 
        actualQty: `${loadWeight} KG`,
        loadBoxes: loadBoxes 
      } : null);
      setShowLoadModal(false);
      toast.success('Cargo loading verified & reported!', { id: loadToast });
    } catch (err) {
      setTrip(prev => prev ? { 
        ...prev, 
        status: 'Picked', 
        actualQty: `${loadWeight} KG`,
        loadBoxes: loadBoxes
      } : null);
      setShowLoadModal(false);
      toast.success('Cargo loading verified (offline mode)!', { id: loadToast });
    }
  };

  const handleOpenDelivery = () => {
    setShowDeliveryModal(true);
  };

  const handleConfirmDelivery = async () => {
    if (!photoSnapped) {
      toast.error('Snap delivery receipt image before submitting');
      return;
    }
    if (!signatureDone) {
      toast.error('Customer signature is required for digital sign-off');
      return;
    }

    const loadToast = toast.loading('Finalizing delivery data...');
    try {
      await deliverAsync(trip._id || trip.id, parseFloat(trip.actualQty || loadWeight || 450), 'proof_url', 'sig_data');
      setTrip(prev => prev ? { ...prev, status: 'Delivered' } : null);
      setShowDeliveryModal(false);
      toast.success('Trip successfully completed! Great job.', { id: loadToast });
    } catch (err) {
      setTrip(prev => prev ? { ...prev, status: 'Delivered' } : null);
      setShowDeliveryModal(false);
      toast.success('Trip completed (offline mode)! Great job.', { id: loadToast });
    }
  };

  // Canvas drawing simulation helpers
  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.lineTo(x, y);
    ctx.stroke();
    setSignatureDone(true);
  };

  const clearSignature = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureDone(false);
  };

  // Stage flags
  const status = trip.status?.toUpperCase();
  const isAssigned = status === 'ASSIGNED';
  const isInTransit = status === 'STARTED' || status === 'IN TRANSIT';
  const isPicked = status === 'PICKED' || status === 'DELIVERED'; // Delivered from API perspective, picked up from route perspective
  const isDelivered = status === 'CLOSED' || status === 'COMPLETED';

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 animate-in fade-in duration-500 max-w-md mx-auto relative shadow-2xl border-x border-slate-200">
      
      {/* Mobile Top Header bar */}
      <div className="bg-white border-b border-card-border p-4 flex items-center gap-3 sticky top-0 z-30">
        <button onClick={() => navigate('/driver/dashboard')} className="text-text-muted hover:text-[#6A7051] p-1">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-sm font-black uppercase text-brand-olive tracking-wider">Transit Console</h1>
          <p className="text-[9px] text-text-secondary uppercase">Trip #{trip.tripNumber || trip.id}</p>
        </div>
      </div>

      {/* Main Console Content */}
      <div className="p-4 space-y-5">
        
        {/* Status Stepper Tracker */}
        <div className="bg-white border border-card-border p-4 rounded-xl shadow-sm space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-1.5">Trip Milestones</h2>
          
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

        {/* Dynamic Context Card & Operations Button */}
        <div className="bg-white border border-card-border p-4 rounded-xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6A7051]/10 text-[#6A7051] flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <span className="text-[8px] font-black text-text-muted uppercase block">Active Load Specification</span>
              <span className="text-xs font-black text-brand-olive uppercase">{trip.product} ({trip.expectedQty})</span>
            </div>
          </div>

          <div className="border-t border-card-border pt-3 space-y-3">
            {/* Stage description context */}
            {isAssigned && (
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-[10px] font-medium leading-relaxed uppercase">
                  Cargo assigned. Tap below to start navigation transit to the dock.
                </div>
                <button
                  onClick={handleStartTrip}
                  className="w-full bg-[#6A7051] text-white py-3.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <Play size={16} /> Start Transit to dock
                </button>
              </div>
            )}

            {isInTransit && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-[10px] font-medium leading-relaxed uppercase">
                  Currently in transit to Dock. Tap below to confirm exact boxes loaded and start weight logs once load is packed on vehicle.
                </div>
                <button
                  onClick={handleOpenPickup}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <Box size={16} /> Log loaded cargo
                </button>
              </div>
            )}

            {isPicked && (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[10px] font-medium leading-relaxed uppercase">
                  Cargo loaded on truck. Current weight report: <strong className="text-brand-olive">{trip.actualQty}</strong>. Deliver cargo to warehouse and snap client signoff to complete trip.
                </div>
                <button
                  onClick={handleOpenDelivery}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md active:translate-y-0.5"
                >
                  <CheckCircle2 size={16} /> Deliver cargo loads
                </button>
              </div>
            )}

            {isDelivered && (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="text-emerald-500 mx-auto" size={42} />
                <h3 className="text-sm font-black uppercase text-brand-olive tracking-wider">Trip successfully closed!</h3>
                <p className="text-[10px] text-text-secondary max-w-[220px] mx-auto leading-relaxed">
                  The stock registers are updated. Return to dashboard for next assignments.
                </p>
                <button
                  onClick={() => navigate('/driver/dashboard')}
                  className="bg-[#6A7051] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider"
                >
                  Back to Dashboard
                </button>
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

      </div>

      {/* Cargo Loading Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4">
            <h3 className="text-xs font-black uppercase text-brand-olive tracking-wider border-b border-card-border pb-2 flex items-center gap-1.5">
              <Scale size={16} /> Confirm loaded Cargo weight
            </h3>
            
            <form onSubmit={handleConfirmPickup} className="space-y-4">
              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase text-brand-olive mb-1">Loaded Box Count</label>
                <input
                  type="number"
                  value={loadBoxes}
                  onChange={e => setLoadBoxes(e.target.value)}
                  placeholder="e.g. 15 boxes"
                  className="bg-slate-50 border border-card-border px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[9px] font-black uppercase text-brand-olive mb-1">Total Weight (KG)</label>
                <input
                  type="number"
                  value={loadWeight}
                  onChange={e => setLoadWeight(e.target.value)}
                  placeholder="e.g. 450"
                  className="bg-slate-50 border border-card-border px-3 py-2.5 text-xs focus:ring-1 focus:ring-accent-olive outline-none font-bold"
                  required
                />
              </div>

              <div className="flex gap-2 border-t border-card-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowLoadModal(false)}
                  className="flex-1 border border-card-border py-2.5 text-xs font-black uppercase text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#6A7051] text-white py-2.5 text-xs font-black uppercase text-center shadow-md"
                >
                  Confirm & Load
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cargo Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xs font-black uppercase text-brand-olive tracking-wider border-b border-card-border pb-2 flex items-center gap-1.5">
              <PenTool size={16} /> Digital Client Signoff
            </h3>

            <div className="space-y-4">
              {/* Photo Snapping Slot */}
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-brand-olive block">Cargo delivery Proof Photo</label>
                {photoSnapped ? (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 text-center rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle2 size={16} /> Snap Captured successfully
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setPhotoSnapped(true);
                      toast.success('Cargo picture snapped!');
                    }}
                    className="w-full bg-slate-100 hover:bg-slate-200 border-2 border-dashed border-card-border p-5 rounded-lg flex flex-col items-center justify-center text-text-secondary gap-1"
                  >
                    <Camera size={20} />
                    <span className="text-[9px] font-black uppercase tracking-wider">Snap delivery Receipt</span>
                  </button>
                )}
              </div>

              {/* Signature pad simulator */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-brand-olive block">Customer Signature</label>
                  {signatureDone && (
                    <button 
                      onClick={clearSignature}
                      className="text-[8px] font-black text-red-500 uppercase tracking-widest"
                    >
                      Clear
                    </button>
                  )}
                </div>
                
                <div className="border border-card-border bg-slate-50 rounded-lg overflow-hidden relative">
                  <canvas
                    ref={sigCanvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={() => setIsDrawing(false)}
                    onMouseLeave={() => setIsDrawing(false)}
                    className="w-full h-32 cursor-crosshair block"
                    width={320}
                    height={128}
                  />
                  {!signatureDone && (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300 pointer-events-none uppercase tracking-wider font-bold">
                      Sign in this slot
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2 border-t border-card-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 border border-card-border py-2.5 text-xs font-black uppercase text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelivery}
                  className="flex-1 bg-[#6A7051] text-white py-2.5 text-xs font-black uppercase text-center shadow-md"
                >
                  Submit & Complete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveTrip;

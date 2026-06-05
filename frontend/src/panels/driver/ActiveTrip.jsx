import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import {
  ArrowLeft, MapPin, Navigation, Scale, Camera,
  PenTool, Check, CheckCircle2, AlertTriangle, PackageCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { socketService } from '../../services/socketService';
import { mapsService } from '../../services/mapsService';
import { FieldPageWrap } from '../../design-system/field-app';
import { useSystemSettingsStore } from '../../store/systemSettingsStore';

/** Cargo totals from linked purchase tapal (driver should confirm, not re-enter). */
function getTapalCargoSummary(trip) {
  if (!trip) return { boxes: 0, weightKg: 0, tapalNumber: '—', partyName: '', productLines: [] };
  const tapal =
    trip.tapalId && typeof trip.tapalId === 'object'
      ? trip.tapalId
      : trip.tapal && typeof trip.tapal === 'object'
        ? trip.tapal
        : null;
  const products = tapal?.products || [];
  const boxesFromTapal = products.reduce((s, p) => s + (Number(p.boxQty) || 0), 0);
  const weightFromLines = products.reduce(
    (s, p) => s + (Number(p.totalWeight) || Number(p.numericQty) || 0),
    0
  );
  const weightKg =
    Number(trip.expectedQty) ||
    Number(tapal?.numericQty) ||
    weightFromLines ||
    parseFloat(String(tapal?.qty || trip.qty || '').replace(/[^\d.]/g, '')) ||
    0;

  return {
    tapalNumber: tapal?.tapalNumber || trip.tapalNumber || '—',
    partyName: tapal?.partyName || trip.partyName || '',
    boxes: trip.expectedBoxes ?? boxesFromTapal ?? 0,
    weightKg,
    qtyLabel: tapal?.qty || trip.qty || (weightKg ? `${weightKg} KG` : '—'),
    productLines: products.map((p) => ({
      name: p.name,
      boxes: p.boxQty,
      weight: p.totalWeight || p.qty,
    })),
  };
}

const ActiveTrip = () => {
  const navigate = useNavigate();
  const {
    myTrips, fetchMyTrips, startTripAsync, pickupAsync, deliverAsync
  } = useDriverStore();
  const driverPanel = useSystemSettingsStore((s) => s.settings?.panels?.driver);

  const [trip, setTrip] = useState(null);

  // Input fields for loading
  const [loadBoxes, setLoadBoxes] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);

  const [showLoadModal, setShowLoadModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [allowManualLoadEdit, setAllowManualLoadEdit] = useState(false);

  // Signature canvas simulation
  const sigCanvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [proofPhotoData, setProofPhotoData] = useState('');
  const fileInputRef = useRef(null);

  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProofPhotoData(uploadEvent.target.result);
      setPhotoSnapped(true);
      toast.success('Cargo picture uploaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  useEffect(() => {
    const active = myTrips?.find((t) =>
      ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED'].includes(t.status)
    );
    setTrip(active || null);
  }, [myTrips]);

  // Live GPS ping while trip is in transit
  useEffect(() => {
    const tripId = trip?._id || trip?.id;
    const st = (trip?.status || '').toUpperCase();
    if (!tripId || !['STARTED', 'IN TRANSIT'].includes(st)) return;
    if (!navigator.geolocation) return;

    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          socketService.emitDriverLocation(tripId, latitude, longitude);
          mapsService.postDriverLocation(tripId, latitude, longitude, accuracy).catch(() => { });
        },
        () => { },
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 }
      );
    };

    ping();
    const ms = Math.max(5, Number(driverPanel?.gpsPingIntervalSec) || 15) * 1000;
    const timer = setInterval(ping, ms);
    return () => clearInterval(timer);
  }, [trip?._id, trip?.id, trip?.status, driverPanel?.gpsPingIntervalSec]);

  if (!trip) {
    return (
      <FieldPageWrap subtitle="Active trip">
        <div className="fa-surface p-8 text-center space-y-4">
          <AlertTriangle className="text-[var(--fa-accent)] mx-auto" size={48} />
          <h2 className="text-sm font-bold uppercase tracking-wider">No active trip</h2>
          <p className="text-xs fa-muted max-w-[280px] mx-auto">
            You need an assigned trip in your queue to run live cargo steps.
          </p>
          <button
            type="button"
            onClick={() => navigate('/driver/dashboard')}
            className="fa-btn-primary px-5 py-2.5 text-xs font-bold uppercase fa-tap"
          >
            Go to dashboard
          </button>
        </div>
      </FieldPageWrap>
    );
  }

  const handleStartTrip = async () => {
    const loadToast = toast.loading('Starting transit...');
    try {
      await startTripAsync(trip);
      setTrip(prev => prev ? { ...prev, status: 'In Transit' } : null);
      toast.success('Trip started! Drive safe.', { id: loadToast });
    } catch (err) {
      toast.error(err?.message || 'Failed to start trip', { id: loadToast });
    }
  };

  const cargoSummary = getTapalCargoSummary(trip);

  const handleOpenPickup = () => {
    const cargo = getTapalCargoSummary(trip);
    setLoadBoxes(cargo.boxes ? String(cargo.boxes) : '');
    setLoadWeight(cargo.weightKg ? String(cargo.weightKg) : '');
    setAllowManualLoadEdit(false);
    setShowLoadModal(true);
  };

  const handleConfirmPickup = async (e) => {
    e.preventDefault();
    const weight = parseFloat(loadWeight);
    if (!weight || Number.isNaN(weight) || weight <= 0) {
      toast.error('Tapal load weight missing — contact dispatch');
      return;
    }

    const loadToast = toast.loading('Logging loaded cargo...');
    try {
      await pickupAsync(trip, weight);
      setTrip(prev => prev ? {
        ...prev,
        status: 'Picked',
        actualQty: `${loadWeight} KG`,
        loadBoxes: loadBoxes
      } : null);
      setShowLoadModal(false);
      toast.success('Cargo loading verified & reported!', { id: loadToast });
    } catch (err) {
      toast.error(err?.message || 'Failed to log pickup', { id: loadToast });
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

    const canvas = sigCanvasRef.current;
    const finalSignatureData = canvas ? canvas.toDataURL('image/png') : 'sig_data';
    if (!proofPhotoData) {
      toast.error('Delivery proof photo is required');
      return;
    }

    const loadToast = toast.loading('Finalizing delivery data...');
    const qty = parseFloat(String(trip.actualQty || loadWeight).replace(/[^\d.]/g, ''));
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      toast.error('Valid delivered quantity is required');
      return;
    }
    try {
      await deliverAsync(trip, qty, proofPhotoData, finalSignatureData);
      await fetchMyTrips();
      setShowDeliveryModal(false);
      toast.success('Trip successfully completed! Great job.', { id: loadToast });
    } catch (err) {
      console.error('[ActiveTrip] deliver error:', err);
      toast.error(err?.message || 'Failed to complete delivery', { id: loadToast });
    }
  };

  // Canvas drawing helpers for mouse + mobile touch gestures
  const getCoordinates = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    // For touch events
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    // For mouse events
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (e.cancelable) e.preventDefault();
    setIsDrawing(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (e.cancelable) e.preventDefault();
    if (!isDrawing) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 2;
    ctx.lineTo(coords.x, coords.y);
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
  const isAssigned = status === 'ASSIGNED' || trip.status === 'Assigned';
  const isInTransit =
    status === 'STARTED' ||
    status === 'IN TRANSIT' ||
    trip.status === 'In Transit';
  const isPicked = status === 'PICKED';
  const isDelivered = status === 'DELIVERED' || status === 'CLOSED' || status === 'COMPLETED';

  const tapalRef = trip.tapalId && typeof trip.tapalId === 'object' ? trip.tapalId : trip.tapal;
  const deliveryLabel =
    trip.deliveryLocation && trip.deliveryLocation !== 'BUYER'
      ? trip.deliveryLocation
      : tapalRef?.destination || tapalRef?.unloadingPoint || trip.deliveryLocation || '—';

  return (
    <FieldPageWrap subtitle={`Trip #${trip.tripNumber || trip.id || '—'}`}>
      <button
        type="button"
        onClick={() => navigate('/driver/dashboard')}
        className="fa-muted flex items-center gap-2 text-xs font-semibold uppercase mb-2 fa-tap"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-lg font-bold mb-4">Transit console</h1>

      <div className="space-y-5">

        {/* Status Stepper Tracker */}
        <div className="fa-surface p-4 space-y-4">
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
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${isAssigned ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
                }`}>
                {!isAssigned ? <Check size={14} /> : '1'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Assigned</span>
            </div>

            {/* Step 2: Transit */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${isAssigned ? 'bg-white border-slate-300 text-slate-400' :
                  isInTransit ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
                }`}>
                {isPicked || isDelivered ? <Check size={14} /> : '2'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Transit</span>
            </div>

            {/* Step 3: Loaded */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${isAssigned || isInTransit ? 'bg-white border-slate-300 text-slate-400' :
                  isPicked ? 'bg-[#6A7051] border-[#6A7051] text-white animate-pulse' : 'bg-emerald-500 border-emerald-500 text-white'
                }`}>
                {isDelivered ? <Check size={14} /> : '3'}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Loaded</span>
            </div>

            {/* Step 4: Complete */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold text-xs ${isDelivered ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-400'
                }`}>
                4
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider mt-1 text-brand-olive">Done</span>
            </div>
          </div>
        </div>

        <div className="pt-1 space-y-3">
          {isAssigned && (
            <button
              type="button"
              onClick={handleStartTrip}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <Navigation size={14} className="animate-pulse" /> Start Trip
            </button>
          )}

          {isInTransit && (
            <button
              type="button"
              onClick={handleOpenPickup}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <PackageCheck size={14} /> Log Pickup Weight
            </button>
          )}

          {isPicked && !isDelivered && (
            <button
              type="button"
              onClick={handleOpenDelivery}
              className="w-full py-4 bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              <CheckCircle2 size={14} /> Confirm Delivery
            </button>
          )}

          {status === 'DELIVERED' && (
            <button
              type="button"
              onClick={() => navigate(`/driver/trip-expense/${trip._id || trip.id}`)}
              className="w-full py-4 bg-[#6A7051] text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={14} /> End Trip Sheet
            </button>
          )}

          {status === 'CLOSED' && (
            <div className="w-full py-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Trip Closed
            </div>
          )}
        </div>

        <div className="bg-white border border-card-border p-4 rounded-xl shadow-sm space-y-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-olive block border-b border-card-border pb-1">
            Route Waypoints
          </span>
          <div className="space-y-2.5 pl-1.5 pt-1 text-[11px] text-text-secondary uppercase">
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#6A7051]" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-widest block">Dock Location</span>
                <span className="font-extrabold text-brand-olive">{trip.pickupLocation || '—'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 border-t border-dashed border-card-border pt-2">
              <Navigation size={14} className="text-brand-yellow animate-pulse" />
              <div>
                <span className="text-[8px] font-black text-text-muted tracking-widest block">Delivery Site</span>
                <span className="font-extrabold text-brand-olive">{deliveryLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cargo Loading Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white text-gray-900 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 [&_input]:text-gray-900 [&_input]:bg-white">
            <h3 className="text-xs font-black uppercase text-[#5f6846] tracking-wider border-b border-gray-200 pb-2 flex items-center gap-1.5">
              <Scale size={16} /> Confirm load from tapal
            </h3>

            <form onSubmit={handleConfirmPickup} className="space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2 text-sm">
                <p className="text-[10px] font-bold uppercase text-gray-500">Purchase tapal</p>
                <p className="font-bold text-[#1a1a1a]">
                  #{cargoSummary.tapalNumber}
                  {cargoSummary.partyName ? ` · ${cargoSummary.partyName}` : ''}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Boxes</p>
                    <p className="text-lg font-bold text-[#1a1a1a]">{cargoSummary.boxes || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-gray-500">Weight</p>
                    <p className="text-lg font-bold text-[#1a1a1a]">
                      {cargoSummary.weightKg ? `${cargoSummary.weightKg} kg` : cargoSummary.qtyLabel}
                    </p>
                  </div>
                </div>
                {cargoSummary.productLines.length > 0 && (
                  <ul className="text-[11px] text-gray-600 border-t border-gray-200 pt-2 space-y-1">
                    {cargoSummary.productLines.map((line, i) => (
                      <li key={i}>
                        {line.name}
                        {line.boxes ? ` · ${line.boxes} boxes` : ''}
                        {line.weight ? ` · ${line.weight}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Loaded qty comes from admin tapal. Tap confirm if it matches the dock weighment.
                </p>
              </div>

              {allowManualLoadEdit ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-[#5f6846] mb-1">Box count (override)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={loadBoxes}
                      onChange={(e) => setLoadBoxes(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#6A7051]/40"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[9px] font-black uppercase text-[#5f6846] mb-1">Weight kg (override)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={loadWeight}
                      onChange={(e) => setLoadWeight(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-[#6A7051]/40"
                      required
                    />
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setAllowManualLoadEdit(true)}
                  className="text-[10px] font-semibold text-[#6A7051] underline fa-tap"
                >
                  Weight at dock is different? Override
                </button>
              )}

              <div className="flex gap-2 border-t border-gray-200 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLoadModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2.5 text-xs font-black uppercase text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#6A7051] text-white rounded-lg py-2.5 text-xs font-black uppercase text-center shadow-md"
                >
                  Confirm & load
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
                  <div className="flex flex-col gap-1.5">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 text-center rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} /> Snap Captured successfully
                    </div>
                    {proofPhotoData && (
                      <div className="mt-1 border border-card-border p-1 bg-white flex justify-center rounded-lg overflow-hidden max-h-32">
                        <img src={proofPhotoData} alt="Preview" className="max-h-24 object-contain" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoSnapped(false);
                        setProofPhotoData('');
                      }}
                      className="text-[9px] font-black text-red-500 uppercase tracking-widest text-center mt-1"
                    >
                      Remove Photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-slate-100 hover:bg-slate-200 border border-card-border p-3.5 rounded-lg flex flex-col items-center justify-center text-text-secondary gap-1 transition-colors erp-interactive"
                  >
                    <Camera size={18} className="text-brand-olive" />
                    <span className="text-[8px] font-black uppercase tracking-wider">Take photo / upload file</span>
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoFileChange}
                  className="hidden"
                />
              </div>
 
              {/* Signature pad simulator */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black uppercase text-brand-olive block">Customer Signature</label>
                  {signatureDone && (
                    <button
                      type="button"
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
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={() => setIsDrawing(false)}
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

    </FieldPageWrap>
  );
};

export default ActiveTrip;

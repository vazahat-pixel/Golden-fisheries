import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore, resolveTapalIdFromTrip } from '../../store/driverStore';
import {
  ArrowLeft, MapPin, Navigation, Scale, Camera,
  PenTool, CheckCircle2, AlertTriangle, PackageCheck, FileCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { socketService } from '../../services/socketService';
import { mapsService } from '../../services/mapsService';
import { tapalService } from '../../services/tapalService';
import { FieldPageWrap } from '../../design-system/field-app';
import { useSystemSettingsStore } from '../../store/systemSettingsStore';
import { TripExpenseFields } from './TripExpenseFields';
import { useTripExpenseForm } from './useTripExpenseForm';

function parseTapalLineKg(p) {
  const tw = Number(p?.totalWeight);
  if (Number.isFinite(tw) && tw > 0) return tw;
  const nq = Number(p?.numericQty);
  if (Number.isFinite(nq) && nq > 0) return nq;
  const fromQty = parseFloat(String(p?.qty || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(fromQty) && fromQty > 0 ? fromQty : 0;
}

export function getTapalCargoSummary(trip) {
  if (!trip) return { boxes: 0, weightKg: 0, tapalNumber: '—', partyName: '', productLines: [] };
  const tapal =
    trip.tapalId && typeof trip.tapalId === 'object'
      ? trip.tapalId
      : trip.tapal && typeof trip.tapal === 'object'
        ? trip.tapal
        : null;
  const products = tapal?.products || [];

  const productLines = products
    .map((p) => {
      const weightKg = parseTapalLineKg(p);
      return {
        name: p.name,
        boxes: Number(p.boxQty) || 0,
        weightKg,
        weightLabel: weightKg ? `${weightKg} kg` : p.qty || '',
      };
    })
    .filter((line) => line.weightKg > 0 || line.name);

  const boxesFromTapal = productLines.reduce((s, line) => s + line.boxes, 0);
  const weightFromLines = productLines.reduce((s, line) => s + line.weightKg, 0);

  const weightKg =
    weightFromLines ||
    Number(tapal?.numericQty) ||
    Number(trip.expectedQty) ||
    parseFloat(String(tapal?.qty || trip.qty || '').replace(/[^\d.]/g, '')) ||
    0;

  return {
    tapalNumber: tapal?.tapalNumber || trip.tapalNumber || '—',
    partyName: tapal?.partyName || trip.partyName || '',
    boxes: boxesFromTapal || Number(trip.expectedBoxes) || 0,
    weightKg,
    qtyLabel: tapal?.qty || trip.qty || (weightKg ? `${weightKg} KG` : '—'),
    productLines,
  };
}

function normalizeStatus(status) {
  return String(status || '').toUpperCase().replace(/\s+/g, '_');
}

const ActiveTrip = () => {
  const navigate = useNavigate();
  const { myTrips, fetchMyTrips, startTripAsync } = useDriverStore();
  const driverPanel = useSystemSettingsStore((s) => s.settings?.panels?.driver);

  const [trip, setTrip] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [starting, setStarting] = useState(false);

  const [loadBoxes, setLoadBoxes] = useState('');
  const [loadWeight, setLoadWeight] = useState('');
  const [allowManualLoadEdit, setAllowManualLoadEdit] = useState(false);
  const [photoSnapped, setPhotoSnapped] = useState(false);
  const [signatureDone, setSignatureDone] = useState(false);
  const [proofPhotoData, setProofPhotoData] = useState('');

  const sigCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const expense = useTripExpenseForm(trip);

  useEffect(() => {
    fetchMyTrips();
  }, [fetchMyTrips]);

  useEffect(() => {
    const active = myTrips?.find((t) =>
      ['Assigned', 'In Transit', 'Picked', 'ASSIGNED', 'STARTED', 'PICKED', 'DELIVERED'].includes(t.status)
    );
    setTrip(active || null);
  }, [myTrips]);

  useEffect(() => {
    if (!trip) return;
    const cargo = getTapalCargoSummary(trip);
    setLoadBoxes(cargo.boxes ? String(cargo.boxes) : '');
    setLoadWeight(cargo.weightKg ? String(cargo.weightKg) : '');
    if (trip.proofPhotoUrl) {
      setProofPhotoData(trip.proofPhotoUrl);
      setPhotoSnapped(true);
    }
    if (trip.signatureUrl) {
      setSignatureDone(true);
    }
  }, [trip?._id, trip?.id]);

  useEffect(() => {
    const tripId = trip?._id || trip?.id;
    const st = normalizeStatus(trip?.status);
    if (!tripId || !['STARTED', 'PICKED'].includes(st)) return;
    if (!navigator.geolocation) return;

    const ping = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          socketService.emitDriverLocation(tripId, latitude, longitude);
          mapsService.postDriverLocation(tripId, latitude, longitude, accuracy).catch(() => {});
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 15000, timeout: 12000 }
      );
    };

    ping();
    const ms = Math.max(5, Number(driverPanel?.gpsPingIntervalSec) || 15) * 1000;
    const timer = setInterval(ping, ms);
    return () => clearInterval(timer);
  }, [trip?._id, trip?.id, trip?.status, driverPanel?.gpsPingIntervalSec]);

  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setProofPhotoData(uploadEvent.target.result);
      setPhotoSnapped(true);
      toast.success('Delivery photo added');
    };
    reader.readAsDataURL(file);
  };

  const getCoordinates = (e) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
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

  const handleStartTrip = async () => {
    setStarting(true);
    const loadToast = toast.loading('Starting trip...');
    try {
      await startTripAsync(trip);
      setTrip((prev) => (prev ? { ...prev, status: 'STARTED' } : null));
      toast.success('Trip started — fill details below and submit when done', { id: loadToast });
    } catch (err) {
      toast.error(err?.message || 'Failed to start trip', { id: loadToast });
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    if (!trip) return;

    const weight = parseFloat(loadWeight);
    if (!weight || Number.isNaN(weight) || weight <= 0) {
      toast.error('Enter valid pickup weight (kg)');
      return;
    }

    const st = normalizeStatus(trip.status);
    const needsDelivery = !['DELIVERED', 'CLOSED', 'COMPLETED'].includes(st);

    if (needsDelivery) {
      if (!photoSnapped || !proofPhotoData) {
        toast.error('Add delivery proof photo');
        return;
      }
      if (!signatureDone) {
        toast.error('Customer signature is required');
        return;
      }
    }

    const canvas = sigCanvasRef.current;
    const finalSignatureData = canvas ? canvas.toDataURL('image/png') : trip.signatureUrl || 'sig_data';
    const tapalId = resolveTapalIdFromTrip(trip);
    const tripId = trip._id || trip.id;

    if (!tapalId || !tripId) {
      toast.error('Trip reference missing');
      return;
    }

    setSubmitting(true);
    const loadToast = toast.loading('Submitting complete trip...');

    try {
      let currentStatus = st;

      if (currentStatus === 'ASSIGNED') {
        throw new Error('Start the trip first');
      }

      if (['STARTED', 'IN_TRANSIT'].includes(currentStatus)) {
        await tapalService.pickup(tapalId, weight);
        currentStatus = 'PICKED';
      }

      if (!['DELIVERED', 'CLOSED', 'COMPLETED'].includes(currentStatus)) {
        await tapalService.deliver(tapalId, weight, proofPhotoData, finalSignatureData);
        currentStatus = 'DELIVERED';
      }

      await tapalService.submitPostTripExpense(tripId, expense.buildPayload());
      await fetchMyTrips();

      toast.success('Trip submitted successfully!', { id: loadToast });
      navigate(`/driver/trip-expense/${tripId}/bill`);
    } catch (err) {
      console.error('[ActiveTrip] complete trip error:', err);
      toast.error(err?.message || 'Failed to submit trip', { id: loadToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (!trip) {
    return (
      <FieldPageWrap subtitle="Active trip">
        <div className="fa-surface p-8 text-center space-y-4">
          <AlertTriangle className="text-[var(--fa-accent)] mx-auto" size={48} />
          <h2 className="text-sm font-bold uppercase tracking-wider">No active trip</h2>
          <p className="text-xs fa-muted max-w-[280px] mx-auto">
            You need an assigned trip in your queue.
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

  const status = normalizeStatus(trip.status);
  const isAssigned = status === 'ASSIGNED';
  const isInProgress = ['STARTED', 'PICKED', 'IN_TRANSIT'].includes(status);
  const isDelivered = ['DELIVERED'].includes(status);
  const isClosed = ['CLOSED', 'COMPLETED'].includes(status);
  const hasExpenseSheet = Boolean(trip.postTripExpenses?.submittedAt || trip.postTripExpenses?.totalExpenses != null);
  const cargoSummary = getTapalCargoSummary(trip);

  const tapalRef = trip.tapalId && typeof trip.tapalId === 'object' ? trip.tapalId : trip.tapal;
  const deliveryLabel =
    trip.deliveryLocation && trip.deliveryLocation !== 'BUYER'
      ? trip.deliveryLocation
      : tapalRef?.destination || tapalRef?.unloadingPoint || trip.deliveryLocation || '—';

  const showTripForm = !isAssigned && !isClosed;
  const showSubmit = showTripForm && (!isDelivered || !hasExpenseSheet);

  return (
    <FieldPageWrap subtitle={`Trip #${trip.tripNumber || trip.id || '—'}`}>
      <button
        type="button"
        onClick={() => navigate('/driver/dashboard')}
        className="fa-muted flex items-center gap-2 text-xs font-semibold uppercase mb-2 fa-tap"
      >
        <ArrowLeft size={16} /> Back
      </button>
      <h1 className="text-lg font-bold mb-4">Active trip</h1>

      <div className="space-y-4">
        {/* Route summary */}
        <div className="fa-surface p-4 space-y-3 text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-olive block border-b border-card-border pb-1">
            Route
          </span>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#6A7051]" />
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-widest block">Pickup</span>
              <span className="font-extrabold text-brand-olive">{trip.pickupLocation || '—'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-dashed border-card-border pt-2">
            <Navigation size={14} className="text-brand-yellow" />
            <div>
              <span className="text-[8px] font-black text-text-muted tracking-widest block">Delivery</span>
              <span className="font-extrabold text-brand-olive">{deliveryLabel}</span>
            </div>
          </div>
        </div>

        {/* Step 1: Start only */}
        {isAssigned && (
          <button
            type="button"
            onClick={handleStartTrip}
            disabled={starting}
            className="w-full py-3 fa-btn-primary rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all"
          >
            <Navigation size={14} className="animate-pulse" />
            {starting ? 'Starting...' : 'Start Trip'}
          </button>
        )}

        {isInProgress && (
          <div className="fa-surface px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg">
            Trip in progress — complete all sections below, then submit
          </div>
        )}

        {showTripForm && (
          <form onSubmit={handleCompleteTrip} className="space-y-4">
            {/* Pickup / cargo */}
            <section className="fa-surface p-4 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5 border-b border-card-border pb-1.5">
                <PackageCheck size={14} /> Pickup weight
              </h2>
              <div className="rounded-lg border border-card-border bg-slate-50 p-3 text-sm space-y-1">
                <p className="font-bold text-brand-olive">
                  #{cargoSummary.tapalNumber}
                  {cargoSummary.partyName ? ` · ${cargoSummary.partyName}` : ''}
                </p>
                <p className="text-[11px] fa-muted">
                  {cargoSummary.boxes ? `${cargoSummary.boxes} boxes · ` : ''}
                  {cargoSummary.weightKg ? `${cargoSummary.weightKg} kg` : cargoSummary.qtyLabel}
                </p>
              </div>
              {allowManualLoadEdit ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-brand-olive mb-1 block">Boxes</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={loadBoxes}
                      onChange={(e) => setLoadBoxes(e.target.value)}
                      className="w-full border border-card-border rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-brand-olive mb-1 block">Weight (kg)</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      value={loadWeight}
                      onChange={(e) => setLoadWeight(e.target.value)}
                      className="w-full border border-card-border rounded-lg px-3 py-2 text-sm font-bold"
                      required
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setAllowManualLoadEdit(true)}
                  className="text-[10px] font-semibold text-[#6A7051] underline fa-tap"
                >
                  Weight different at dock? Edit manually
                </button>
              )}
            </section>

            {/* Delivery proof */}
            {!isDelivered && (
              <section className="fa-surface p-4 space-y-3">
                <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5 border-b border-card-border pb-1.5">
                  <Camera size={14} /> Delivery proof
                </h2>
                {photoSnapped ? (
                  <div className="space-y-2">
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2 text-center rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={14} /> Photo added
                    </div>
                    {proofPhotoData && (
                      <div className="border border-card-border p-1 rounded-lg overflow-hidden max-h-32 flex justify-center">
                        <img src={proofPhotoData} alt="Delivery proof" className="max-h-24 object-contain" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => { setPhotoSnapped(false); setProofPhotoData(''); }}
                      className="text-[9px] font-black text-red-500 uppercase"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-slate-100 border border-card-border p-3 rounded-lg flex flex-col items-center gap-1 fa-tap"
                  >
                    <Camera size={18} className="text-brand-olive" />
                    <span className="text-[8px] font-black uppercase">Take / upload photo</span>
                  </button>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoFileChange} className="hidden" />

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black uppercase text-brand-olive flex items-center gap-1">
                      <PenTool size={12} /> Customer signature
                    </label>
                    {signatureDone && (
                      <button type="button" onClick={clearSignature} className="text-[8px] font-black text-red-500 uppercase">
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
                      className="w-full h-28 cursor-crosshair block"
                      width={320}
                      height={112}
                    />
                    {!signatureDone && (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-300 pointer-events-none uppercase font-bold">
                        Sign here
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* End trip sheet — fill during trip */}
            <section className="fa-surface p-4 space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5 border-b border-card-border pb-1.5">
                <Scale size={14} /> End trip sheet
              </h2>
              <TripExpenseFields
                variant="field"
                form={expense.form}
                setForm={expense.setForm}
                set={expense.set}
                totalExpenses={expense.totalExpenses}
                balancePayable={expense.balancePayable}
              />
            </section>

            {showSubmit && (
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 fa-btn-primary rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md sticky bottom-4 z-20"
              >
                <FileCheck size={16} />
                {submitting ? 'Submitting...' : 'Submit Complete Trip'}
              </button>
            )}
          </form>
        )}

        {isClosed && (
          <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
            <CheckCircle2 size={14} /> Trip closed
          </div>
        )}

        {isDelivered && hasExpenseSheet && (
          <button
            type="button"
            onClick={() => navigate(`/driver/trip-expense/${trip._id || trip.id}/bill`)}
            className="w-full py-3 bg-[#6A7051] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <FileCheck size={14} /> View trip bill
          </button>
        )}
      </div>
    </FieldPageWrap>
  );
};

export default ActiveTrip;

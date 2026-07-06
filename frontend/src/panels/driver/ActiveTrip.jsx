import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDriverStore, resolveTapalIdFromTrip } from '../../store/driverStore';
import {
  ArrowLeft, MapPin, Navigation, Scale, Camera,
  PenTool, CheckCircle2, AlertTriangle, PackageCheck, FileCheck, Gauge, X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { socketService } from '../../services/socketService';
import { mapsService } from '../../services/mapsService';
import { tapalService } from '../../services/tapalService';
import { tripService } from '../../services/tripService';
import { FieldPageWrap } from '../../design-system/field-app';
import { useSystemSettingsStore } from '../../store/systemSettingsStore';
import { TripExpenseFields } from './TripExpenseFields';
import { useTripExpenseForm } from './useTripExpenseForm';
import { normalizeTripStops, tripStopsSummary } from '../../utils/tripStopsDisplay';

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

  const [startOdometerKm, setStartOdometerKm] = useState('');
  const [startMeterPhotoData, setStartMeterPhotoData] = useState('');
  const [meterPhotoSnapped, setMeterPhotoSnapped] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const sigCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const meterFileInputRef = useRef(null);
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
    const odo = trip.tripStartOdometer;
    if (odo?.photoUrl) {
      setStartMeterPhotoData(odo.photoUrl);
      setMeterPhotoSnapped(true);
    }
    if (odo?.odometerKm != null) {
      setStartOdometerKm(String(odo.odometerKm));
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

  const handleMeterPhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setStartMeterPhotoData(uploadEvent.target.result);
      setMeterPhotoSnapped(true);
      toast.success('Odometer photo added');
    };
    reader.readAsDataURL(file);
  };

  const handleStartTrip = async () => {
    const km = parseFloat(startOdometerKm);
    if (!meterPhotoSnapped || !startMeterPhotoData) {
      toast.error('Upload odometer / meter photo before starting');
      return;
    }
    if (!Number.isFinite(km) || km < 0) {
      toast.error('Enter valid starting km reading');
      return;
    }

    setStarting(true);
    const loadToast = toast.loading('Starting trip...');
    try {
      await startTripAsync(trip, {
        startMeterPhotoUrl: startMeterPhotoData,
        startOdometerKm: km,
      });
      setTrip((prev) =>
        prev
          ? {
              ...prev,
              status: 'STARTED',
              tripStartOdometer: {
                photoUrl: startMeterPhotoData,
                odometerKm: km,
                recordedAt: new Date().toISOString(),
              },
            }
          : null
      );
      toast.success('Trip started — fill details below and submit when done', { id: loadToast });
    } catch (err) {
      toast.error(err?.message || 'Failed to start trip', { id: loadToast });
    } finally {
      setStarting(false);
    }
  };

  const handleCompleteStop = async (sequence) => {
    const qty = parseFloat(loadWeight);
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      toast.error('Enter valid weight (kg) for this stop');
      return;
    }

    const currentActiveStop = routeStops.find((s) => s.sequence === Number(sequence));
    if (!currentActiveStop) return;

    let finalProofPhoto = null;

    if (currentActiveStop.stopType === 'TAPAL_DELIVERY') {
      if (!photoSnapped || !proofPhotoData) {
        toast.error('Add delivery proof photo');
        return;
      }
      finalProofPhoto = proofPhotoData;
    }

    setSubmitting(true);
    const loadToast = toast.loading(`Completing Stop #${sequence}...`);
    try {
      await tripService.completeStop(trip._id || trip.id, sequence, {
        actualQty: qty,
        proofPhotoUrl: finalProofPhoto || undefined,
      });

      toast.success(`Stop #${sequence} completed successfully!`, { id: loadToast });
      setLoadWeight('');
      setProofPhotoData('');
      setPhotoSnapped(false);
      clearSignature();
      await fetchMyTrips();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to complete stop', { id: loadToast });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteTrip = async (e) => {
    e.preventDefault();
    if (!trip) return;

    const tripId = trip._id || trip.id;
    setSubmitting(true);
    const loadToast = toast.loading('Submitting post trip expenses...');
    try {
      await tapalService.submitPostTripExpense(tripId, expense.buildPayload());
      await fetchMyTrips();
      toast.success('Trip expenses submitted successfully!', { id: loadToast });
      navigate(`/driver/trip-expense/${tripId}/bill`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to submit expenses', { id: loadToast });
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

  const routeStops = normalizeTripStops(trip);
  const stopsSummary = tripStopsSummary(trip);
  const activeStop = routeStops.find((s) => s.status === 'PENDING') || null;

  const status = normalizeStatus(trip.status);
  const isAssigned = status === 'ASSIGNED';
  const isInProgress = ['STARTED', 'PICKED', 'IN_TRANSIT', 'DELIVERED'].includes(status) && activeStop !== null;
  const isDelivered = ['DELIVERED'].includes(status) && activeStop === null;
  const isClosed = ['CLOSED', 'COMPLETED'].includes(status);
  const hasExpenseSheet = Boolean(trip.postTripExpenses?.submittedAt);
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
            Route {stopsSummary ? `· ${stopsSummary}` : ''}
          </span>

          {routeStops.length > 0 ? (
            <ol className="space-y-2">
              {routeStops.map((stop) => {
                const isCompleted = stop.status === 'COMPLETED';
                const isActive = activeStop && activeStop.sequence === stop.sequence;
                return (
                  <li
                    key={`${stop.sequence}-${stop.title}`}
                    className={`flex gap-2 border rounded-lg p-2.5 relative transition-all ${
                      isCompleted
                        ? 'border-emerald-900 bg-emerald-950/20'
                        : isActive
                        ? 'border-2 border-[#C5A021] bg-[#1f1f22]'
                        : 'border-[var(--fa-border)] bg-[#1f1f22]/50 opacity-60'
                    }`}
                  >
                    <span className={`shrink-0 w-6 h-6 rounded-full text-[10px] font-black flex items-center justify-center ${
                      isCompleted ? 'bg-emerald-800 text-white' : isActive ? 'bg-[#C5A021] text-brand-dark' : 'bg-zinc-700 text-zinc-300'
                    }`}>
                      {stop.sequence}
                    </span>
                    <div className="min-w-0 flex-1 relative">
                      <p className={`text-[8px] font-black uppercase tracking-widest ${
                        isCompleted ? 'text-emerald-400' : isActive ? 'text-[#C5A021]' : 'text-zinc-500'
                      }`}>
                        {stop.isPickup ? 'Procurement pickup' : 'Sale delivery'}
                      </p>
                      <p className="font-extrabold text-zinc-100 truncate pr-12">{stop.title}</p>
                      {stop.party ? <p className="text-[10px] text-zinc-400">{stop.party}</p> : null}
                      <p className="text-[10px] flex items-center gap-1 mt-0.5 text-zinc-400">
                        <MapPin size={10} className={`shrink-0 ${isCompleted ? 'text-emerald-500' : isActive ? 'text-[#C5A021]' : 'text-zinc-500'}`} />
                        <span className="truncate">{stop.location || '—'}</span>
                      </p>
                      <div className="flex gap-2 items-center mt-1">
                        {stop.qtyLabel ? (
                          <span className="text-[10px] font-bold text-zinc-300">Expected: {stop.qtyLabel}</span>
                        ) : null}
                        {isCompleted && stop.actualQty && (
                          <span className="text-[10px] font-black text-emerald-400">
                            Actual: {stop.actualQty} KG
                          </span>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[7px] font-black uppercase text-[#C5A021] border border-[#C5A021] rounded px-1 py-0.5 bg-[#C5A021]/10 absolute top-2 right-2">
                        Active
                      </span>
                    )}
                    {isCompleted && (
                      <span className="text-[7px] font-black uppercase text-emerald-400 border border-emerald-900 rounded px-1 py-0.5 bg-emerald-950/20 absolute top-2 right-2">
                        Completed
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Step 1: Odometer + start */}
        {isAssigned && (
          <section className="fa-surface p-4 space-y-3">
            <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-olive flex items-center gap-1.5 border-b border-card-border pb-1.5">
              <Gauge size={14} /> Starting odometer (required)
            </h2>
            <p className="text-[11px] fa-muted">
              Before starting, photograph the vehicle meter showing the current km reading.
            </p>
            <div>
              <label className="text-[9px] font-black uppercase text-brand-olive mb-1 block">
                Starting km reading
              </label>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                min="0"
                value={startOdometerKm}
                onChange={(e) => setStartOdometerKm(e.target.value)}
                placeholder="e.g. 45230"
                className="w-full border border-card-border rounded-lg px-3 py-2.5 text-sm font-bold"
              />
            </div>
            <input
              ref={meterFileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleMeterPhotoFileChange}
            />
            {meterPhotoSnapped && startMeterPhotoData ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2">
                <img
                  src={startMeterPhotoData}
                  alt="Odometer"
                  className="max-h-36 w-full object-contain rounded"
                />
                <button
                  type="button"
                  onClick={() => meterFileInputRef.current?.click()}
                  className="text-[10px] font-semibold text-[#6A7051] underline mt-2 fa-tap"
                >
                  Retake photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => meterFileInputRef.current?.click()}
                className="w-full py-3 border-2 border-dashed border-[#6A7051]/40 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#6A7051] flex items-center justify-center gap-2 fa-tap"
              >
                <Camera size={16} /> Upload meter / odometer photo
              </button>
            )}
            <button
              type="button"
              onClick={handleStartTrip}
              disabled={
                starting ||
                !meterPhotoSnapped ||
                !startMeterPhotoData ||
                !startOdometerKm.trim()
              }
              className="w-full py-3 fa-btn-primary rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Navigation size={14} className="animate-pulse" />
              {starting ? 'Starting...' : 'Start Trip'}
            </button>
          </section>
        )}

        {!isAssigned && trip.tripStartOdometer?.photoUrl && (
          <div className="fa-surface p-4 space-y-2 text-xs">
            <p className="text-[10px] font-black uppercase text-brand-olive">Trip start odometer</p>
            <p className="font-bold">{trip.tripStartOdometer.odometerKm} km</p>
            <img
              src={trip.tripStartOdometer.photoUrl}
              alt="Start odometer"
              className="max-h-32 w-full object-contain rounded border border-card-border"
            />
          </div>
        )}


        {isInProgress && activeStop && (
          <div className="space-y-4">
            <div className="fa-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-[#C5A021] bg-[#C5A021]/10 border border-[#C5A021]/30 rounded-lg flex items-center gap-1.5 animate-pulse">
              <Navigation size={14} className="shrink-0" />
              Active Stop: Stop #{activeStop.sequence} ({activeStop.isPickup ? 'PICKUP' : 'DELIVERY'})
            </div>

            <section className="fa-surface p-4 space-y-4">
              <h2 className="text-[11px] font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 flex items-center justify-between">
                <span>Complete Stop #{activeStop.sequence}</span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#1f1f22] text-[var(--fa-accent)] font-bold border border-[var(--fa-border)]">
                  {activeStop.isPickup ? 'Pickup' : 'Delivery'}
                </span>
              </h2>

              <div className="bg-[#1f1f22] border border-[var(--fa-border)] p-3 rounded-lg text-xs space-y-1">
                <p className="font-extrabold text-[var(--fa-accent)]">
                  {activeStop.title}
                </p>
                {activeStop.party ? <p className="text-[10px] text-zinc-400">{activeStop.party}</p> : null}
                <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                  <MapPin size={10} className="shrink-0 text-zinc-500" />
                  <span>{activeStop.location || '—'}</span>
                </p>
                {activeStop.qtyLabel ? (
                  <p className="text-[10px] font-bold text-zinc-300 mt-1">Expected: {activeStop.qtyLabel}</p>
                ) : null}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                  Actual Weight (KG) Recorded
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={loadWeight}
                  onChange={(e) => setLoadWeight(e.target.value)}
                  placeholder="Enter scale weight in kg"
                  className="w-full bg-[#161618] border border-[var(--fa-border)] rounded-lg px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-[#C5A021]"
                  required
                />
              </div>

              {!activeStop.isPickup && (
                <div className="space-y-4 border-t border-card-border pt-4">
                  {/* Delivery proof photo */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 block">
                      Delivery Proof Photo (Required)
                    </label>
                    {photoSnapped && proofPhotoData ? (
                      <div className="space-y-2">
                        <div className="bg-emerald-950/40 border border-emerald-900 text-emerald-400 p-2 text-center rounded-lg text-[10px] font-bold uppercase flex items-center justify-center gap-1.5">
                          <CheckCircle2 size={14} /> Photo added
                        </div>
                        <div className="border border-[var(--fa-border)] p-1 rounded-lg overflow-hidden max-h-32 flex justify-center bg-[#161618]">
                          <img src={proofPhotoData} alt="Delivery proof" className="max-h-24 object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => { setPhotoSnapped(false); setProofPhotoData(''); }}
                          className="text-[9px] font-black text-red-500 uppercase fa-tap"
                        >
                          Remove photo
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full bg-[#161618] border border-dashed border-[#6A7051]/40 p-4 rounded-lg flex flex-col items-center gap-1.5 fa-tap text-slate-400 hover:text-white transition-colors"
                      >
                        <Camera size={20} className="text-[#6A7051]" />
                        <span className="text-[9px] font-black uppercase">Take / upload delivery photo</span>
                      </button>
                    )}
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handlePhotoFileChange} className="hidden" />
                  </div>

                </div>
              )}

              <button
                type="button"
                onClick={() => handleCompleteStop(activeStop.sequence)}
                disabled={submitting || !loadWeight.trim() || (!activeStop.isPickup && !photoSnapped)}
                className="w-full py-3.5 bg-[#C5A021] text-brand-dark rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md disabled:opacity-40 transition-opacity"
              >
                <CheckCircle2 size={16} />
                {submitting ? 'Completing...' : `Complete Stop #${activeStop.sequence}`}
              </button>
            </section>
          </div>
        )}

        {isInProgress && !activeStop && (
          <div className="fa-surface px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-900 rounded-lg flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
            All stops completed! Fill ending metrics and expenses below to close trip.
          </div>
        )}

        {showTripForm && !activeStop && (
          <div className="space-y-4">
            {hasExpenseSheet ? (
              <div className="fa-surface p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-950/40 border border-emerald-900 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Trip Pending Review</h3>
                <p className="text-xs text-zinc-400 max-w-[280px] mx-auto">
                  You have successfully completed all stops and submitted your end-trip expenses sheet. The trip is now pending admin approval.
                </p>
                {isDelivered && (
                  <button
                    type="button"
                    onClick={() => navigate(`/driver/trip-expense/${trip._id || trip.id}/bill`)}
                    className="w-full py-3 bg-[#6A7051] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#5F6846] transition-colors"
                  >
                    <FileCheck size={14} /> View trip bill
                  </button>
                )}
              </div>
            ) : (
              <div className="fa-surface p-6 text-center space-y-4">
                <div className="w-12 h-12 bg-[#C5A021]/10 border border-[#C5A021]/30 rounded-full flex items-center justify-center mx-auto text-[#C5A021] animate-bounce">
                  <Scale size={24} />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Stops Completed!</h3>
                <p className="text-xs text-zinc-400 max-w-[280px] mx-auto">
                  All stops on this trip have been completed. Please fill out the final trip sheet with ending metrics and expenses to close this trip.
                </p>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(true)}
                  className="w-full py-3.5 fa-btn-primary rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <FileCheck size={16} /> Enter Trip Expenses & Close
                </button>
              </div>
            )}
          </div>
        )}

        {isClosed && (
          <div className="space-y-3">
            <div className="w-full py-3 bg-emerald-950/20 border border-emerald-900 text-emerald-400 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2">
              <CheckCircle2 size={14} /> Trip closed
            </div>
            <button
              type="button"
              onClick={() => navigate(`/driver/trip-expense/${trip._id || trip.id}/bill`)}
              className="w-full py-3 bg-[#6A7051] text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#5F6846] transition-colors"
            >
              <FileCheck size={14} /> View trip bill
            </button>
          </div>
        )}

        {/* Beautiful, premium, dark-themed Modal Overlay */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#161618] border border-[var(--fa-border)] w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-5 py-4 border-b border-[var(--fa-border)] flex justify-between items-center bg-[#1f1f22] rounded-t-2xl">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#C5A021] flex items-center gap-1.5">
                  <Scale size={16} /> End Trip Sheet
                </h3>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-4 no-scrollbar flex-1">
                <form
                  onSubmit={async (e) => {
                    await handleCompleteTrip(e);
                    setShowExpenseModal(false);
                  }}
                  className="space-y-4"
                >
                  <TripExpenseFields
                    variant="field"
                    form={expense.form}
                    setForm={expense.setForm}
                    set={expense.set}
                    totalExpenses={expense.totalExpenses}
                    balancePayable={expense.balancePayable}
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 fa-btn-primary rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 shadow-md sticky bottom-0 z-20 mt-4"
                  >
                    <FileCheck size={16} />
                    {submitting ? 'Submitting...' : 'Submit Expenses & Close Trip'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </FieldPageWrap>
  );
};

export default ActiveTrip;

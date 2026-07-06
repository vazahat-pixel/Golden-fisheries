import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tripService } from '../../../services/tripService';
import { userService } from '../../../services/userService';
import { AdminPageHeader, AdminDataTable, StatusBadge } from '../shared/adminUi';
import { toast } from 'react-hot-toast';
import {
  Truck,
  Plus,
  Trash2,
  MapPin,
  Sprout,
  Package,
  Loader2,
  CheckCircle2,
  GripVertical,
  ArrowLeft,
} from 'lucide-react';

const DEFAULT_STOP_COUNT = 5;
const STOP_TYPES = [
  { value: 'HARVEST_PICKUP', label: 'Procurement pickup (harvest slip)' },
  { value: 'TAPAL_DELIVERY', label: 'Sale delivery (tapal)' },
];

function emptyStop(sequence) {
  return {
    sequence,
    stopType: sequence <= 3 ? 'HARVEST_PICKUP' : 'TAPAL_DELIVERY',
    harvestId: '',
    tapalId: '',
    location: '',
    label: '',
  };
}

function harvestOptionLabel(h) {
  const no = h.harvestNumber || h.hNo || '—';
  return `${no}`;
}

function tapalOptionLabel(t) {
  return `${t.tapalNumber || '—'} — ${t.partyName || 'Party'} (${t.qty || t.numericQty || '—'})`;
}

const TapalAssignDriver = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    harvestSlips,
    tapals,
    fetchHarvestSlips,
    fetchTapals,
    fetchVehicles,
    vehicles,
    trips,
    fetchTrips,
  } = useAdminStore();

  const [view, setView] = useState('list'); // 'list' or 'create'

  const [stops, setStops] = useState(() =>
    Array.from({ length: DEFAULT_STOP_COUNT }, (_, i) => emptyStop(i + 1))
  );
  const [tripNotes, setTripNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const [plannedTrips, setPlannedTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loadingTrips, setLoadingTrips] = useState(true);

  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assigningTrip, setAssigningTrip] = useState(null);

  const loadPlannedTrips = async () => {
    setLoadingTrips(true);
    try {
      const res = await tripService.planned();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPlannedTrips(list);
      if (!selectedTripId && list.length) {
        setSelectedTripId(String(list[0]._id || list[0].id));
      }
    } catch (err) {
      toast.error(err?.message || 'Could not load planned trips');
      setPlannedTrips([]);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    fetchHarvestSlips({ limit: 500 });
    fetchTapals({ limit: 500 });
    fetchVehicles();
    fetchTrips();
    userService
      .drivers()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDrivers(list.filter((d) => d.isActive !== false));
      })
      .catch(() => setDrivers([]));
    loadPlannedTrips();
  }, [fetchHarvestSlips, fetchTapals, fetchVehicles, fetchTrips]);

  useEffect(() => {
    if (location.state?.selectedTripId) {
      setSelectedTripId(location.state.selectedTripId);
      setView('create');
    }
    if (location.state?.view) {
      setView(location.state.view);
    }
  }, [location.state?.selectedTripId, location.state?.view]);

  const harvestOptions = useMemo(() => {
    return (harvestSlips || []).filter((h) => {
      if (['CLOSED', 'COMPLETED', 'CONVERTED_TO_TAPAL'].includes(h.status)) return false;
      const totalEst =
        h.products?.reduce((sum, item) => sum + (item.estimatedQty || item.totalWeight || 0), 0) || 0;
      const available = h.availableQty || totalEst;
      const remaining = available - (h.allocatedQty || 0);
      return remaining > 0 && ['CONFIRMED', 'OPEN', 'PARTIAL_USED', 'PARTIALLY_CONVERTED'].includes(h.status);
    });
  }, [harvestSlips]);

  const tapalOptions = useMemo(() => {
    return (tapals || []).filter((t) => ['CREATED', 'ASSIGNED', 'CONFIRMED'].includes((t.status || '').toUpperCase()));
  }, [tapals]);

  const selectedTrip = plannedTrips.find((t) => String(t._id || t.id) === String(selectedTripId));

  const availableVehicles = (vehicles || []).filter((v) => {
    const s = (v.status || '').toUpperCase();
    return s === 'AVAILABLE' || s === 'ACTIVE';
  });

  const updateStop = (index, patch) => {
    setStops((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    if (stops.length >= 8) {
      toast.error('Maximum 8 stops per trip');
      return;
    }
    setStops((prev) => [...prev, emptyStop(prev.length + 1)]);
  };

  const removeStop = (index) => {
    if (stops.length <= 2) {
      toast.error('At least 2 stops required');
      return;
    }
    setStops((prev) =>
      prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, sequence: i + 1 }))
    );
  };

  const buildStopsPayload = () => {
    return stops.map((stop, index) => {
      const stopType = stop.stopType;
      let location = stop.location?.trim() || '';
      let label = stop.label?.trim() || '';

      if (stopType === 'HARVEST_PICKUP' && stop.harvestId) {
        const h = harvestOptions.find((x) => String(x._id || x.id) === String(stop.harvestId));
        if (h && !location) location = h.pickupLocation || h.farmerId?.location || '';
        if (h && !label) label = harvestOptionLabel(h);
      }
      if (stopType === 'TAPAL_DELIVERY' && stop.tapalId) {
        const t = tapalOptions.find((x) => String(x._id || x.id) === String(stop.tapalId));
        if (t && !location) location = t.destination || t.unloadingPoint || '';
        if (t && !label) label = tapalOptionLabel(t);
      }

      return {
        sequence: index + 1,
        stopType,
        harvestId: stopType === 'HARVEST_PICKUP' ? stop.harvestId || undefined : undefined,
        tapalId: stopType === 'TAPAL_DELIVERY' ? stop.tapalId || undefined : undefined,
        location: location || (stopType === 'HARVEST_PICKUP' ? 'FARM PICKUP' : 'DELIVERY'),
        label,
      };
    });
  };

  const canCreateTrip = useMemo(() => {
    const filled = stops.filter((s) => {
      if (s.stopType === 'HARVEST_PICKUP') return Boolean(s.harvestId);
      if (s.stopType === 'TAPAL_DELIVERY') return Boolean(s.tapalId);
      return false;
    });
    return filled.length >= 2;
  }, [stops]);

  const handleCreateTrip = async () => {
    if (!canCreateTrip) {
      toast.error('Add at least 2 stops with harvest slips or tapals selected');
      return;
    }
    setCreating(true);
    try {
      const res = await tripService.create({
        stops: buildStopsPayload(),
        tripNotes,
      });
      const trip = res?.data?.trip || res?.trip || res?.data;
      toast.success(`Trip ${trip?.tripNumber || ''} created — assign driver below`);
      setTripNotes('');
      setStops(Array.from({ length: DEFAULT_STOP_COUNT }, (_, i) => emptyStop(i + 1)));
      await loadPlannedTrips();
      if (trip?._id || trip?.id) setSelectedTripId(String(trip._id || trip.id));
      fetchTapals({ limit: 500 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create trip');
    } finally {
      setCreating(false);
    }
  };

  const handleAssignDriver = async () => {
    if (!selectedTripId) {
      toast.error('Select a planned trip');
      return;
    }
    if (!driverId && !driverName.trim()) {
      toast.error('Select a driver or enter driver name');
      return;
    }
    setAssigning(true);
    try {
      await tripService.assignDriver(
        selectedTripId,
        driverId || null,
        vehicleId || undefined,
        driverName.trim() || undefined
      );
      toast.success('Driver assigned — trip sent to driver app');
      setDriverId('');
      setDriverName('');
      setVehicleId('');
      await loadPlannedTrips();
      fetchTapals({ limit: 500 });
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Assign failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {view === 'list' ? (
        <>
          <AdminPageHeader
            title="Trips & Driver Assignment"
            subtitle="List of all trips, driver assignments, and odometer tracking logs."
            badge="Logistics"
            actions={
              <button
                type="button"
                onClick={() => setView('create')}
                className="bg-[#6A7051] text-white px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded hover:bg-[#5F6846] flex items-center gap-1.5"
              >
                <Plus size={12} /> Create New Trip & Assign
              </button>
            }
          />

          <section className="border border-card-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-black uppercase mb-3">All trips list</h2>
            <AdminDataTable
              loading={loadingTrips}
              emptyMessage="No trips found. Create a planned trip first."
              columns={[
                { key: 'tripNumber', label: 'Trip No' },
                { key: 'driverName', label: 'Driver' },
                { key: 'vehicle', label: 'Vehicle' },
                {
                  key: 'route',
                  label: 'Route',
                  render: (r) => (
                    <span className="font-semibold text-brand-olive">
                      {r.pickupLocation} → {r.deliveryLocation}
                    </span>
                  )
                },
                {
                  key: 'expectedQty',
                  label: 'Est Qty (kg)',
                  render: (r) => r.expectedQty ? `${r.expectedQty} kg` : '—'
                },
                {
                  key: 'actualQty',
                  label: 'Delivered (kg)',
                  render: (r) => r.actualQty ? `${r.actualQty} kg` : '—'
                },
                {
                  key: 'createdAt',
                  label: 'Date/Time'
                },
                {
                  key: 'status',
                  label: 'Status',
                  render: (r) => <StatusBadge status={r.status} />
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (r) => {
                    if (r.status === 'PLANNED') {
                      return (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssigningTrip(r);
                            setDriverId('');
                            setDriverName('');
                            setVehicleId('');
                          }}
                          className="bg-[#C5A021] text-brand-dark px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider rounded hover:bg-[#b08f1a] transition-all flex items-center gap-1"
                        >
                          <Truck size={10} /> Assign Driver
                        </button>
                      );
                    }
                    return '—';
                  }
                }
              ]}
              rows={trips || []}
              onRowClick={(r) => {
                if (['PLANNED', 'ASSIGNED'].includes(r.status)) {
                  setSelectedTripId(String(r._id || r.id));
                  setView('create');
                  toast.success(`Selected trip ${r.tripNumber} for driver assignment`);
                } else if (r.tapalId) {
                  navigate(`/admin/tapals/${r.tapalId}`);
                }
              }}
            />
          </section>
        </>
      ) : (
        <>
          <AdminPageHeader
            title="Create trip & assign driver"
            subtitle="Procurement pickups first (harvest slips), then sale deliveries (tapals). Create the route, then assign driver."
            badge="Logistics"
            actions={
              <button
                type="button"
                onClick={() => setView('list')}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-[10px] font-black uppercase tracking-wider rounded hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft size={12} /> Back to list
              </button>
            }
          />

          <section className="border border-card-border bg-white p-5 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-sm font-black uppercase tracking-wider text-[#6A7051] flex items-center gap-2">
                <MapPin size={16} /> Step 1 — Build multi-stop trip
              </h2>
              <button
                type="button"
                onClick={addStop}
                className="text-[10px] font-black uppercase tracking-widest border border-[#6A7051] px-3 py-2 flex items-center gap-1 hover:bg-[#6A7051]/5"
              >
                <Plus size={12} /> Add stop
              </button>
            </div>

            <p className="text-[11px] text-text-secondary">
              Typical route: stops 1–3 harvest pickups (procurement), then tapal deliveries (sales). You can change type and order per stop.
            </p>

            <div className="space-y-3">
              {stops.map((stop, index) => (
                <div key={index} className="border border-slate-200 bg-slate-50/80 p-3 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
                  <div className="lg:col-span-1 flex items-center gap-1 text-[10px] font-black text-slate-500 pt-2">
                    <GripVertical size={14} />
                    #{index + 1}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="text-[9px] font-black uppercase text-text-muted">Stop type</label>
                    <select
                      className="w-full border border-card-border bg-white px-2 py-2 text-sm mt-1"
                      value={stop.stopType}
                      onChange={(e) =>
                        updateStop(index, {
                          stopType: e.target.value,
                          harvestId: '',
                          tapalId: '',
                        })
                      }
                    >
                      {STOP_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-4">
                    <label className="text-[9px] font-black uppercase text-text-muted flex items-center gap-1">
                      {stop.stopType === 'HARVEST_PICKUP' ? (
                        <>
                          <Sprout size={10} /> Harvest slip
                        </>
                      ) : (
                        <>
                          <Package size={10} /> Tapal
                        </>
                      )}
                    </label>
                    {stop.stopType === 'HARVEST_PICKUP' ? (
                      <select
                        className="w-full border border-card-border bg-white px-2 py-2 text-sm mt-1"
                        value={stop.harvestId}
                        onChange={(e) => updateStop(index, { harvestId: e.target.value })}
                      >
                        <option value="">— Select harvest slip —</option>
                        {harvestOptions.map((h) => (
                          <option key={h._id || h.id} value={h._id || h.id}>
                            {harvestOptionLabel(h)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <select
                        className="w-full border border-card-border bg-white px-2 py-2 text-sm mt-1"
                        value={stop.tapalId}
                        onChange={(e) => updateStop(index, { tapalId: e.target.value })}
                      >
                        <option value="">— Select tapal —</option>
                        {tapalOptions.map((t) => (
                          <option key={t._id || t.id} value={t._id || t.id}>
                            {tapalOptionLabel(t)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="lg:col-span-3">
                    <label className="text-[9px] font-black uppercase text-text-muted">Location (optional)</label>
                    <input
                      className="w-full border border-card-border bg-white px-2 py-2 text-sm mt-1"
                      value={stop.location}
                      onChange={(e) => updateStop(index, { location: e.target.value })}
                      placeholder="Auto-filled from slip/tapal"
                    />
                  </div>

                  <div className="lg:col-span-1 flex justify-end pt-6">
                    <button
                      type="button"
                      onClick={() => removeStop(index)}
                      className="p-2 text-red-600 hover:bg-red-50"
                      title="Remove stop"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <textarea
              className="w-full border border-card-border px-3 py-2 text-sm"
              rows={2}
              placeholder="Trip notes (optional)"
              value={tripNotes}
              onChange={(e) => setTripNotes(e.target.value)}
            />

            <button
              type="button"
              onClick={handleCreateTrip}
              disabled={creating || !canCreateTrip}
              className="bg-[#6A7051] text-white px-5 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
            >
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Create trip
            </button>
          </section>

          <section className="border border-card-border bg-white p-5 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider text-[#6A7051] flex items-center gap-2">
              <Truck size={16} /> Step 2 — Assign driver to planned trip
            </h2>

            {loadingTrips ? (
              <p className="text-sm text-text-secondary flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Loading planned trips…
              </p>
            ) : plannedTrips.length === 0 ? (
              <p className="text-sm text-text-secondary p-4 bg-amber-50 border border-amber-200">
                No trips waiting for driver. Create a trip above first.
              </p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 space-y-2 max-h-[360px] overflow-y-auto">
                  {plannedTrips.map((t) => {
                    const id = t._id || t.id;
                    const active = String(selectedTripId) === String(id);
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() => setSelectedTripId(String(id))}
                        className={`w-full text-left p-4 border transition-all ${
                          active ? 'border-[#6A7051] bg-[#6A7051]/5 border-l-4 border-l-brand-yellow' : 'border-card-border'
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase text-text-muted">{t.tripNumber}</span>
                        <p className="text-sm font-black text-brand-olive">
                          {t.pickupLocation} → {t.deliveryLocation}
                        </p>
                        <p className="text-[10px] text-text-secondary">
                          {t.stopsCount || t.stops?.length || 0} stops · PLANNED
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-7 space-y-4">
                  {selectedTrip ? (
                    <>
                      <div className="bg-slate-50 border border-slate-200 p-3 text-xs space-y-1">
                        <p className="font-black uppercase text-[10px] text-slate-500">Route</p>
                        <ol className="list-decimal list-inside space-y-1">
                          {(selectedTrip.stops || []).map((s, i) => (
                            <li key={s._id || i}>
                              <span className="font-bold">{s.stopType === 'HARVEST_PICKUP' ? 'Pickup' : 'Delivery'}:</span>{' '}
                              {s.label || s.location}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <label className="text-[10px] font-black uppercase text-text-muted">Registered driver</label>
                          <select
                            className="w-full border border-card-border bg-white px-3 py-2.5 text-sm mt-1"
                            value={driverId}
                            onChange={(e) => {
                              setDriverId(e.target.value);
                              if (e.target.value) setDriverName('');
                            }}
                          >
                            <option value="">— Select driver —</option>
                            {drivers.map((d) => (
                              <option key={d._id} value={d._id}>
                                {d.fullName} · {d.phone}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-text-muted">Or driver name</label>
                          <input
                            className="w-full border border-card-border bg-white px-3 py-2.5 text-sm mt-1"
                            value={driverName}
                            onChange={(e) => {
                              setDriverName(e.target.value);
                              if (e.target.value) setDriverId('');
                            }}
                            placeholder="Name-only if not registered"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase text-text-muted">Select Vehicle</label>
                          <select
                            className="w-full border border-card-border bg-white px-3 py-2.5 text-sm mt-1"
                            value={vehicleId}
                            onChange={(e) => setVehicleId(e.target.value)}
                          >
                            <option value="">— Select vehicle —</option>
                            {availableVehicles.map((v) => (
                              <option key={v._id || v.id} value={v._id || v.id}>
                                {v.vehicleNumber} ({v.model || v.type || 'N/A'})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAssignDriver}
                        disabled={assigning}
                        className="bg-[#C5A021] text-brand-dark px-5 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 flex items-center gap-2"
                      >
                        {assigning ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Assign driver & launch trip
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {assigningTrip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-card-border p-6 max-w-md w-full space-y-4 shadow-xl rounded">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-[#6A7051]">
                Assign Driver to {assigningTrip.tripNumber}
              </h3>
              <button
                type="button"
                onClick={() => setAssigningTrip(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Registered Driver</label>
                <select
                  className="w-full border border-card-border bg-white px-3 py-2 text-sm mt-1"
                  value={driverId}
                  onChange={(e) => {
                    setDriverId(e.target.value);
                    if (e.target.value) setDriverName('');
                  }}
                >
                  <option value="">— Select driver —</option>
                  {drivers.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.fullName} · {d.phone}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Or Enter Driver Name</label>
                <input
                  className="w-full border border-card-border bg-white px-3 py-2 text-sm mt-1"
                  value={driverName}
                  onChange={(e) => {
                    setDriverName(e.target.value);
                    if (e.target.value) setDriverId('');
                  }}
                  placeholder="Name-only if not registered"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500">Select Vehicle</label>
                <select
                  className="w-full border border-card-border bg-white px-3 py-2 text-sm mt-1"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                >
                  <option value="">— Select vehicle —</option>
                  {availableVehicles.map((v) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.vehicleNumber} ({v.model || v.type || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setAssigningTrip(null)}
                className="px-4 py-2 border text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!driverId && !driverName.trim()) {
                    toast.error('Select a driver or enter driver name');
                    return;
                  }
                  if (!vehicleId) {
                    toast.error('Select a vehicle');
                    return;
                  }
                  setAssigning(true);
                  try {
                    await tripService.assignDriver(
                      assigningTrip._id || assigningTrip.id,
                      driverId || null,
                      vehicleId || undefined,
                      driverName.trim() || undefined
                    );
                    toast.success('Driver assigned successfully');
                    setAssigningTrip(null);
                    setDriverId('');
                    setDriverName('');
                    setVehicleId('');
                    await loadPlannedTrips();
                    fetchTrips();
                  } catch (err) {
                    toast.error(err?.response?.data?.message || err?.message || 'Assign failed');
                  } finally {
                    setAssigning(false);
                  }
                }}
                disabled={assigning}
                className="bg-[#C5A021] text-brand-dark px-4 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-[#b08f1a] transition-all disabled:opacity-50"
              >
                {assigning ? 'Assigning...' : 'Assign & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TapalAssignDriver;

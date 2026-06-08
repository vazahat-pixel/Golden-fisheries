import React, { useEffect, useState } from 'react';
import { Truck, User, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { tapalService } from '../../../services/tapalService';
import { userService } from '../../../services/userService';
import { useAdminStore } from '../../../store/adminStore';

const ASSIGNABLE = ['CREATED', 'ASSIGNED', 'CONFIRMED'];

const AssignDriverPanel = ({ tapal, onAssigned }) => {
  const { vehicles, fetchVehicles } = useAdminStore();
  const [drivers, setDrivers] = useState([]);
  const [driverId, setDriverId] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const tapalId = tapal?._id || tapal?.id;
  const status = (tapal?.status || '').toUpperCase();
  const canAssign = ASSIGNABLE.includes(status);
  const alreadyAssigned = ['DRIVER_ASSIGNED', 'DRIVER_ACCEPTED', 'TRIP_STARTED', 'IN_TRANSIT', 'DELIVERED'].includes(status);

  useEffect(() => {
    fetchVehicles();
    userService
      .drivers()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDrivers(list);
      })
      .catch(() => toast.error('Could not load drivers'))
      .finally(() => setLoadingDrivers(false));
  }, [fetchVehicles]);

  const isVehicleAvailable = (v) => {
    const s = (v.status || '').toUpperCase();
    return s === 'AVAILABLE' || s === 'ACTIVE' || s === 'available' || s === 'active';
  };

  const availableVehicles = (vehicles || []).filter(isVehicleAvailable);

  const handleAssign = async () => {
    if (!tapalId || !driverId) {
      toast.error('Select a driver');
      return;
    }
    setLoading(true);
    try {
      await tapalService.assignDriver(tapalId, driverId, vehicleId || undefined);
      toast.success('Driver assigned — trip created. Driver will see it on mobile login.');
      onAssigned?.();
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Assign failed');
    } finally {
      setLoading(false);
    }
  };

  if (!tapal) return null;

  if (alreadyAssigned) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 p-4 text-sm">
        <p className="font-black uppercase text-[10px] text-emerald-800 tracking-wider">Driver assigned</p>
        <p className="mt-1 text-emerald-900">
          {tapal.driver || 'Driver'} {tapal.driverPhone ? `· ${tapal.driverPhone}` : ''}
          {tapal.vehicleNumber ? ` · ${tapal.vehicleNumber}` : ''}
        </p>
        <p className="text-[10px] text-emerald-700 mt-2">Status: {tapal.status}</p>
      </div>
    );
  }

  if (!canAssign) {
    return (
      <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
        Driver cannot be assigned while tapal status is <strong>{tapal.status}</strong>.
      </div>
    );
  }

  return (
    <div className="border-2 border-[#6A7051]/30 bg-[#F5F5EC]/40 p-5 space-y-4">
      <div>
        <h3 className="text-sm font-black uppercase tracking-wider text-[#6A7051] flex items-center gap-2">
          <Truck size={16} className="text-[#C5A021]" /> Assign driver to this tapal
        </h3>
        <p className="text-[11px] text-text-secondary mt-1">
          Trip is created automatically. Driver logs in at Driver Login and opens Active Trip to start.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
            <User size={12} /> Driver (required)
          </label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            disabled={loadingDrivers}
            className="w-full border border-card-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
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
          <label className="text-[10px] font-black uppercase tracking-widest text-text-muted flex items-center gap-1 mb-1">
            <Truck size={12} /> Vehicle (optional)
          </label>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="w-full border border-card-border bg-white px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#6A7051]"
          >
            <option value="">— No vehicle / assign later —</option>
            {availableVehicles.map((v) => (
              <option key={v.id || v._id} value={v.id || v._id}>
                {v.plateNumber || v.vehicleNumber} {v.type ? `· ${v.type}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={handleAssign}
        disabled={loading || !driverId}
        className="bg-[#C5A021] text-brand-dark px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 disabled:opacity-50 flex items-center gap-2"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
        Assign driver & launch trip
      </button>
    </div>
  );
};

export default AssignDriverPanel;

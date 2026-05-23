import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, User, MapPin, Package, CheckCircle2, Search, ArrowRight, ChevronDown } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { tapalService } from '../../services/tapalService';
import { userService } from '../../services/userService';
import { toast } from 'react-hot-toast';

const BuyerAssignDriver = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tapals, fetchTapals, vehicles, fetchVehicles, fetchBuyerTrips } = useAdminStore();
  const [drivers, setDrivers] = useState([]);

  const [selectedTapal, setSelectedTapal] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTapal, setSearchTapal] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [step, setStep] = useState(1); // 1: select tapal, 2: select driver, 3: select vehicle, 4: confirm

  useEffect(() => {
    fetchTapals();
    fetchVehicles();
    userService.drivers().then((res) => {
      setDrivers(Array.isArray(res?.data) ? res.data : []);
    }).catch(() => setDrivers([]));
  }, [fetchTapals, fetchVehicles]);

  // Filter tapals that belong to this buyer and are assignable
  const myTapals = tapals.filter(t => {
    const isBuyer = t.buyerName === (user?.fullName || user?.name) ||
                    t.buyerPhone === user?.phone ||
                    t.buyerId === (user?._id || user?.id);
    const isAssignable = ['CREATED', 'ASSIGNED', 'CONFIRMED'].includes((t.status || '').toUpperCase());
    return isBuyer && isAssignable;
  }).filter(t =>
    !searchTapal || t.tapalNumber?.toLowerCase().includes(searchTapal.toLowerCase()) ||
    t.partyName?.toLowerCase().includes(searchTapal.toLowerCase())
  );

  const availableDrivers = drivers.filter((d) =>
    !searchDriver ||
    d.fullName?.toLowerCase().includes(searchDriver.toLowerCase()) ||
    d.phone?.includes(searchDriver)
  );

  // Available vehicles
  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE' || v.status === 'available');

  const handleAssign = async () => {
    if (!selectedTapal || !selectedDriver) {
      toast.error('Please select tapal and driver');
      return;
    }

    setAssigning(true);
    try {
      await tapalService.assignDriver(
        selectedTapal.id || selectedTapal._id,
        selectedDriver._id || selectedDriver.id,
        selectedVehicle?.id || selectedVehicle?._id || undefined
      );
      toast.success('Driver assigned — trip sent to driver app');
      await fetchTapals();
      navigate('/admin/logistics/assign-driver');
    } catch (err) {
      toast.error(err?.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3, 4].map(s => (
        <React.Fragment key={s}>
          <div className={`w-8 h-8 flex items-center justify-center text-xs font-black transition-all border ${
            step >= s
              ? 'bg-black text-white border-black'
              : 'bg-white text-text-muted border-card-border'
          }`}>{s}</div>
          {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-black' : 'bg-card-border'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-olive mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Assign Driver</h1>
        <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">
          Select a tapal, driver, and vehicle to create a trip
        </p>
      </div>

      <StepIndicator />

      {/* Step 1: Select Tapal */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Select Tapal</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search tapals..."
              value={searchTapal}
              onChange={(e) => setSearchTapal(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-card-border rounded-none text-sm outline-none focus:ring-1 focus:ring-accent-olive focus:border-accent-olive transition-all"
            />
          </div>
          <div className="grid gap-3">
            {myTapals.length === 0 ? (
              <div className="text-center py-12 bg-white border border-card-border">
                <Package size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm font-bold text-text-muted">No assignable tapals found</p>
                <p className="text-xs text-text-muted mt-1">Tapals must be in CREATED or CONFIRMED status</p>
              </div>
            ) : myTapals.map(tapal => (
              <button
                key={tapal.id || tapal._id}
                onClick={() => { setSelectedTapal(tapal); setStep(2); }}
                className={`p-4 bg-white border-2 text-left transition-all hover:shadow-wapixo ${
                  selectedTapal?.id === tapal.id
                    ? 'border-accent-olive shadow-glow'
                    : 'border-card-border hover:border-accent-olive'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-black bg-olive-100 text-text-secondary px-2 py-0.5">{tapal.tapalNumber}</span>
                    <h3 className="text-sm font-black text-slate-900 mt-1.5">{tapal.partyName}</h3>
                  </div>
                  <span className="text-[9px] font-bold bg-[#F5F5EC] text-accent-olive px-2 py-1 uppercase border border-card-border">{tapal.type}</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-[10px] text-text-muted">
                  <span className="flex items-center gap-1"><Package size={12} /> {tapal.qty || tapal.quantity || 'N/A'}</span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {tapal.pickupLocation || 'TBD'}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Driver */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Select Driver</h2>
            <button onClick={() => setStep(1)} className="text-xs text-accent-olive font-black uppercase tracking-wider hover:text-brand-olive transition-colors">← Back</button>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search drivers..."
              value={searchDriver}
              onChange={(e) => setSearchDriver(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-white border border-card-border rounded-none text-sm outline-none focus:ring-1 focus:ring-accent-olive focus:border-accent-olive transition-all"
            />
          </div>
          <div className="grid gap-3">
            {availableDrivers.length === 0 ? (
              <div className="text-center py-12 bg-white border border-card-border">
                <User size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm font-bold text-text-muted">No available drivers</p>
              </div>
            ) : availableDrivers.map(driver => (
              <button
                key={driver.id || driver._id}
                onClick={() => { setSelectedDriver(driver); setStep(3); }}
<<<<<<< HEAD
                className={`p-4 bg-white border-2 text-left transition-all hover:shadow-wapixo ${
                  selectedDriver?.id === driver.id
                    ? 'border-accent-olive shadow-glow'
                    : 'border-card-border hover:border-accent-olive'
=======
                className={`p-4 bg-white rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                  (selectedDriver?.id || selectedDriver?._id) === (driver.id || driver._id) ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-100 hover:border-blue-200'
>>>>>>> 4e5aef310993ff2aebf762c63b40b849a93de9dd
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F5F5EC] border border-card-border flex items-center justify-center">
                    <User size={18} className="text-accent-olive" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{driver.fullName}</h3>
                    <p className="text-[10px] text-text-muted font-bold">{driver.phone}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Vehicle */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Select Vehicle</h2>
            <button onClick={() => setStep(2)} className="text-xs text-accent-olive font-black uppercase tracking-wider hover:text-brand-olive transition-colors">← Back</button>
          </div>
          <div className="grid gap-3">
            {availableVehicles.length === 0 ? (
              <div className="text-center py-12 bg-white border border-card-border">
                <Truck size={32} className="text-text-muted mx-auto mb-2" />
                <p className="text-sm font-bold text-text-muted">No available vehicles</p>
              </div>
            ) : availableVehicles.map(vehicle => (
              <button
                key={vehicle.id || vehicle._id}
                onClick={() => { setSelectedVehicle(vehicle); setStep(4); }}
                className={`p-4 bg-white border-2 text-left transition-all hover:shadow-wapixo ${
                  selectedVehicle?.id === vehicle.id
                    ? 'border-accent-olive shadow-glow'
                    : 'border-card-border hover:border-accent-olive'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#F5F5EC] border border-card-border flex items-center justify-center">
                    <Truck size={18} className="text-text-secondary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">{vehicle.plateNumber}</h3>
                    <p className="text-[10px] text-text-muted font-bold">{vehicle.type} {vehicle.capacity ? `• ${vehicle.capacity} KG` : ''}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">Confirm Assignment</h2>
            <button onClick={() => setStep(3)} className="text-xs text-accent-olive font-black uppercase tracking-wider hover:text-brand-olive transition-colors">← Back</button>
          </div>

          <div className="bg-white border border-card-border p-5 space-y-4 shadow-subtle">
            <div className="flex items-center gap-3 pb-3 border-b border-card-border">
              <Package size={16} className="text-accent-olive" />
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Tapal</p>
                <p className="text-sm font-black text-slate-900">{selectedTapal?.tapalNumber} — {selectedTapal?.partyName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 pb-3 border-b border-card-border">
              <User size={16} className="text-accent-olive" />
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Driver</p>
                <p className="text-sm font-black text-slate-900">{selectedDriver?.fullName} — {selectedDriver?.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Truck size={16} className="text-brand-yellow" />
              <div>
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">Vehicle</p>
                <p className="text-sm font-black text-slate-900">{selectedVehicle?.plateNumber}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleAssign}
            disabled={assigning}
            className="w-full py-4 bg-black text-white rounded-none border border-black font-black text-[10px] uppercase tracking-[0.2em] shadow-subtle hover:bg-black/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {assigning ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 size={18} /> Assign Driver & Launch Trip
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyerAssignDriver;

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, CheckCircle2, Link2 } from 'lucide-react';
import { tapalService } from '../../services/tapalService';
import { userService } from '../../services/userService';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';

function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

const BuyerAssignDriver = () => {
  const navigate = useNavigate();
  const [tapals, setTapals] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loadingTapals, setLoadingTapals] = useState(true);

  const [selectedTapal, setSelectedTapal] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [searchTapal, setSearchTapal] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [step, setStep] = useState(1);
  const [lookup, setLookup] = useState(null);

  const loadTapals = useCallback(() => {
    setLoadingTapals(true);
    return buyerPortalService
      .getAssignableTapals()
      .then((res) => setTapals(unwrapList(res)))
      .catch((e) => toast.error(e?.message || 'Could not load your tapals'))
      .finally(() => setLoadingTapals(false));
  }, []);

  useEffect(() => {
    loadTapals();
    userService
      .drivers()
      .then((res) => setDrivers(unwrapList(res)))
      .catch(() => setDrivers([]));
  }, [loadTapals]);

  const filteredTapals = tapals.filter(
    (t) =>
      !searchTapal ||
      t.tapalNumber?.toLowerCase().includes(searchTapal.toLowerCase()) ||
      t.partyName?.toLowerCase().includes(searchTapal.toLowerCase())
  );

  const availableDrivers = drivers.filter(
    (d) =>
      !searchDriver ||
      d.fullName?.toLowerCase().includes(searchDriver.toLowerCase()) ||
      d.phone?.includes(searchDriver)
  );

  useEffect(() => {
    const q = searchTapal.trim();
    if (q.length < 4 || filteredTapals.length > 0) {
      setLookup(null);
      return;
    }
    const timer = setTimeout(() => {
      buyerPortalService
        .lookupTapal(q)
        .then((res) => setLookup(res?.data || res))
        .catch(() => setLookup(null));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTapal, filteredTapals.length]);

  const handleClaim = async (tapalNumber) => {
    setClaiming(true);
    try {
      await buyerPortalService.claimTapal(tapalNumber);
      toast.success('Tapal linked to your account');
      setLookup(null);
      await loadTapals();
    } catch (err) {
      toast.error(err?.message || 'Could not link tapal');
    } finally {
      setClaiming(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTapal || !selectedDriver) {
      toast.error('Select tapal and driver');
      return;
    }

    setAssigning(true);
    try {
      await tapalService.assignDriver(
        selectedTapal._id || selectedTapal.id,
        selectedDriver._id || selectedDriver.id,
        undefined
      );
      toast.success('Driver assigned — trip sent to driver app');
      navigate('/mobile/buyer/tapals');
    } catch (err) {
      toast.error(err?.message || 'Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black ${step >= s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
              }`}
          >
            {s}
          </div>
          {s < 2 && <div className={`w-8 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-slate-200'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-accent-olive mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Assign Driver</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          Your tapals only · vehicle optional
        </p>
      </div>

      <StepIndicator />

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 uppercase">Select your tapal</h2>
          <input
            type="text"
            placeholder="Search by tapal no (e.g. PUR-0009)..."
            value={searchTapal}
            onChange={(e) => setSearchTapal(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm"
          />
          {loadingTapals ? (
            <p className="text-sm text-slate-400">Loading...</p>
          ) : filteredTapals.length === 0 ? (
            <div className="space-y-3">
              <div className="text-center py-12 bg-white rounded-2xl border">
                <Package size={32} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-400">No tapals waiting for driver</p>
                <p className="text-xs text-slate-300 mt-1 px-4 leading-relaxed">
                  Tapal must be linked to your phone and in status CREATED, ASSIGNED, or CONFIRMED.
                  Ask Procurement to select you as buyer when creating the tapal, or search your tapal
                  number below to link it.
                </p>
              </div>
              {lookup?.tapal && lookup.canClaim && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="text-sm font-bold text-amber-900">
                    Found {lookup.tapal.tapalNumber} — not linked to you yet
                  </p>
                  <p className="text-xs text-amber-800 mt-1">{lookup.tapal.partyName} · {lookup.tapal.status}</p>
                  <button
                    type="button"
                    disabled={claiming}
                    onClick={() => handleClaim(lookup.tapal.tapalNumber)}
                    className="mt-3 w-full py-3 bg-amber-600 text-white rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2"
                  >
                    <Link2 size={16} />
                    {claiming ? 'Linking...' : 'Link tapal to my account'}
                  </button>
                </div>
              )}
              {lookup?.tapal && lookup.belongsToOther && (
                <p className="text-xs text-red-600 text-center">
                  {lookup.tapal.tapalNumber} belongs to another buyer.
                </p>
              )}
              {lookup?.tapal && lookup.alreadyYours && !lookup.canClaim && (
                <p className="text-xs text-slate-500 text-center">
                  {lookup.tapal.tapalNumber} is yours but status is {lookup.tapal.status} (not ready for driver).
                </p>
              )}
            </div>
          ) : (
            filteredTapals.map((tapal) => (
              <button
                key={tapal._id || tapal.id}
                type="button"
                onClick={() => {
                  setSelectedTapal(tapal);
                  setStep(2);
                }}
                className="w-full p-4 bg-white rounded-2xl border-2 text-left hover:border-blue-200"
              >
                <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded">
                  {tapal.tapalNumber}
                </span>
                <h3 className="text-sm font-black mt-1">{tapal.partyName}</h3>
                <p className="text-[10px] text-slate-500">{tapal.status}</p>
              </button>
            ))
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-black uppercase">Select driver</h2>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-600 font-bold">
              Back
            </button>
          </div>
          {selectedTapal && (
            <p className="text-xs text-slate-500">
              Tapal: <span className="font-black">{selectedTapal.tapalNumber}</span>
            </p>
          )}
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchDriver}
            onChange={(e) => setSearchDriver(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl text-sm"
          />
          {availableDrivers.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No active drivers found.</p>
          ) : (
            availableDrivers.map((driver) => (
              <button
                key={driver._id}
                type="button"
                onClick={() => setSelectedDriver(driver)}
                className={`w-full p-4 bg-white rounded-2xl border-2 text-left ${(selectedDriver?._id || selectedDriver?.id) === driver._id
                    ? 'border-blue-500'
                    : 'border-slate-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <User size={18} className="text-blue-600" />
                  <div>
                    <h3 className="text-sm font-black">{driver.fullName}</h3>
                    <p className="text-[10px] text-slate-400">{driver.phone}</p>
                  </div>
                </div>
              </button>
            ))
          )}
          <button
            type="button"
            onClick={handleAssign}
            disabled={assigning || !selectedDriver}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {assigning ? 'Assigning...' : (
              <>
                <CheckCircle2 size={18} /> Assign driver & launch trip
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyerAssignDriver;

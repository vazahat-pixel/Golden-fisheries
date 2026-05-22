import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../services/tapalService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const emptyPump = () => ({ name: '', litres: '', amount: '' });

/**
 * Driver End Trip / accounting sheet — matches client paperwork.
 */
const DriverTripExpenseForm = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trip, setTrip] = useState(null);

  const [form, setForm] = useState({
    tripNumber: '',
    tapalNo: '',
    loadingPoint: '',
    unloadingPoint: '',
    startingKms: '',
    endingKms: '',
    totalKms: '',
    mileage: '',
    diesel: '',
    tollFastag: '',
    rtoPcRmc: '',
    maintenance: '',
    driverBatta: '',
    lessAdvance: '',
    halting: '',
    remarks: '',
    pumps: [emptyPump()],
  });

  useEffect(() => {
    if (!tripId) return;
    (async () => {
      try {
        const res = await tapalService.getTripById(tripId);
        const t = res?.data?.trip || res?.trip || res;
        setTrip(t);
        const tapal = t.tapalId || t.tapal || {};
        setForm((f) => ({
          ...f,
          tripNumber: t.tripNumber || t.tripNo || '',
          tapalNo: tapal.tapalNumber || tapal.tpNo || '',
          loadingPoint: t.pickupLocation || tapal.pickupLocation || '',
          unloadingPoint: t.deliveryLocation || tapal.unloadingPoint || tapal.destination || '',
        }));
      } catch {
        toast.error('Could not load trip');
      }
    })();
  }, [tripId]);

  useEffect(() => {
    const start = parseFloat(form.startingKms) || 0;
    const end = parseFloat(form.endingKms) || 0;
    if (end >= start) {
      setForm((f) => ({ ...f, totalKms: String(end - start) }));
    }
  }, [form.startingKms, form.endingKms]);

  const pumpTotal = form.pumps.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalExpenses =
    (parseFloat(form.diesel) || 0) +
    (parseFloat(form.tollFastag) || 0) +
    (parseFloat(form.rtoPcRmc) || 0) +
    (parseFloat(form.maintenance) || 0) +
    (parseFloat(form.driverBatta) || 0) +
    (parseFloat(form.halting) || 0) +
    pumpTotal;
  const balancePayable = totalExpenses - (parseFloat(form.lessAdvance) || 0);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await tapalService.submitPostTripExpense(tripId, {
        ...form,
        startingKms: parseFloat(form.startingKms) || 0,
        endingKms: parseFloat(form.endingKms) || 0,
        totalKms: parseFloat(form.totalKms) || 0,
        mileage: parseFloat(form.mileage) || 0,
        diesel: parseFloat(form.diesel) || 0,
        tollFastag: parseFloat(form.tollFastag) || 0,
        rtoPcRmc: parseFloat(form.rtoPcRmc) || 0,
        maintenance: parseFloat(form.maintenance) || 0,
        driverBatta: parseFloat(form.driverBatta) || 0,
        lessAdvance: parseFloat(form.lessAdvance) || 0,
        halting: parseFloat(form.halting) || 0,
        pumps: form.pumps
          .filter((p) => p.name || p.amount)
          .map((p) => ({
            name: p.name,
            litres: parseFloat(p.litres) || 0,
            amount: parseFloat(p.amount) || 0,
          })),
        totalExpenses,
        pumpTotal,
        balancePayable,
      });
      toast.success('End trip sheet submitted');
      navigate(`/driver/trip-expense/${tripId}/bill`);
    } catch (err) {
      toast.error(err?.message || 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <button type="button" onClick={() => navigate(-1)} className="mb-3 flex items-center gap-1 text-sm">
        <ArrowLeft size={16} /> Back
      </button>
      <form onSubmit={handleSubmit}>
        <PaperFormFrame title="Driver End Trip Sheet" subtitle="Trip accounting">
          <PaperFieldRow label="Trip Number">
            <input className={paperInputClass} value={form.tripNumber} readOnly />
          </PaperFieldRow>
          <PaperFieldRow label="Tapal Number">
            <input className={paperInputClass} value={form.tapalNo} readOnly />
          </PaperFieldRow>
          <PaperFieldRow label="Loading Point">
            <input className={paperInputClass} value={form.loadingPoint} onChange={(e) => set('loadingPoint', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Unloading Point">
            <input className={paperInputClass} value={form.unloadingPoint} onChange={(e) => set('unloadingPoint', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Start KM">
            <input className={paperInputClass} inputMode="decimal" value={form.startingKms} onChange={(e) => set('startingKms', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="End KM">
            <input className={paperInputClass} inputMode="decimal" value={form.endingKms} onChange={(e) => set('endingKms', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Total KM">
            <input className={paperInputClass} readOnly value={form.totalKms} />
          </PaperFieldRow>
          <PaperFieldRow label="Mileage">
            <input className={paperInputClass} inputMode="decimal" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Diesel">
            <input className={paperInputClass} inputMode="decimal" value={form.diesel} onChange={(e) => set('diesel', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Toll / FASTag">
            <input className={paperInputClass} inputMode="decimal" value={form.tollFastag} onChange={(e) => set('tollFastag', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="RTO / PC / RMC">
            <input className={paperInputClass} inputMode="decimal" value={form.rtoPcRmc} onChange={(e) => set('rtoPcRmc', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Maintenance">
            <input className={paperInputClass} inputMode="decimal" value={form.maintenance} onChange={(e) => set('maintenance', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Driver Batta">
            <input className={paperInputClass} inputMode="decimal" value={form.driverBatta} onChange={(e) => set('driverBatta', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Advance (Less)">
            <input className={paperInputClass} inputMode="decimal" value={form.lessAdvance} onChange={(e) => set('lessAdvance', e.target.value)} />
          </PaperFieldRow>
          <PaperFieldRow label="Halting">
            <input className={paperInputClass} inputMode="decimal" value={form.halting} onChange={(e) => set('halting', e.target.value)} />
          </PaperFieldRow>

          <p className="text-xs font-bold uppercase mt-4 mb-2">Pump Entry</p>
          {form.pumps.map((p, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-1 mb-2">
              <input
                placeholder="Pump name"
                className={paperInputClass}
                value={p.name}
                onChange={(e) => {
                  const pumps = [...form.pumps];
                  pumps[idx] = { ...p, name: e.target.value };
                  setForm((f) => ({ ...f, pumps }));
                }}
              />
              <input
                placeholder="Litres"
                className={paperInputClass}
                inputMode="decimal"
                value={p.litres}
                onChange={(e) => {
                  const pumps = [...form.pumps];
                  pumps[idx] = { ...p, litres: e.target.value };
                  setForm((f) => ({ ...f, pumps }));
                }}
              />
              <input
                placeholder="Amount"
                className={paperInputClass}
                inputMode="decimal"
                value={p.amount}
                onChange={(e) => {
                  const pumps = [...form.pumps];
                  pumps[idx] = { ...p, amount: e.target.value };
                  setForm((f) => ({ ...f, pumps }));
                }}
              />
            </div>
          ))}
          <button
            type="button"
            className="text-xs underline mb-3"
            onClick={() => setForm((f) => ({ ...f, pumps: [...f.pumps, emptyPump()] }))}
          >
            + Add pump row
          </button>

          <PaperFieldRow label="Remarks">
            <textarea className={paperInputClass} rows={2} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
          </PaperFieldRow>

          <div className="border-2 border-black mt-3 p-2 text-sm space-y-1">
            <div className="flex justify-between">
              <span>Total Expenses</span>
              <span className="font-bold">₹{totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Balance Payable</span>
              <span className="font-bold">₹{balancePayable.toFixed(2)}</span>
            </div>
          </div>
        </PaperFormFrame>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-4 bg-[#6A7051] text-white py-4 font-bold uppercase text-sm"
        >
          {loading ? 'Submitting...' : 'Submit End Trip Sheet'}
        </button>
      </form>
    </div>
  );
};

export default DriverTripExpenseForm;

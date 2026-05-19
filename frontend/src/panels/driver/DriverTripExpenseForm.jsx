import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDriverStore } from '../../store/driverStore';
import { useAuthStore } from '../../store/authStore';
import { ArrowRight, Fuel, Truck, IndianRupee, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DriverTripExpenseForm = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeTrip, submitPostTripExpenseAsync } = useDriverStore();

  const trip = activeTrip || {};
  const today = new Date().toLocaleDateString('en-IN');

  const [form, setForm] = useState({
    tripStartDate: trip.startedAt?.slice(0, 10) || today,
    tripEndDate: today,
    vehicleNumber: trip.vehicle || '',
    driverName: user?.fullName || user?.name || '',
    loadingPoint: trip.pickupLocation || '',
    unloadingPoint: trip.deliveryLocation || '',
    tapalNo: trip.tripNumber || tripId || '',
    driverBatta: '',
    rtoPcRmc: '',
    maintenance: '',
    tollFastag: '',
    halting: '',
    startingKms: '',
    endingKms: '',
    diesel: '',
    mileage: '',
    lessAdvance: '',
    remarks: '',
  });

  const [pumps, setPumps] = useState([{ name: '', litres: '', amount: '' }]);

  const upd = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const totalKms = form.endingKms && form.startingKms
    ? Math.max(0, parseFloat(form.endingKms) - parseFloat(form.startingKms))
    : 0;

  const pumpTotal = pumps.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);

  const total = [form.driverBatta, form.rtoPcRmc, form.maintenance, form.tollFastag, form.halting, form.diesel, pumpTotal]
    .reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const balancePayable = total - (parseFloat(form.lessAdvance) || 0);

  const handleSubmit = async () => {
    if (!form.vehicleNumber) return toast.error('Enter vehicle number');
    if (!form.driverName) return toast.error('Enter driver name');

    const activeTripId = trip._id || trip.id || tripId;
    if (!activeTripId) return toast.error('No active trip found to submit expenses for.');

    try {
      toast.loading('Submitting post-trip expenses...', { id: 'submit-expense' });
      const payload = {
        ...form,
        pumps,
        totalExpenses: total,
        pumpTotal,
        balancePayable,
        totalKms
      };
      await submitPostTripExpenseAsync(activeTripId, payload);
      toast.success('Trip expenses submitted successfully!', { id: 'submit-expense' });
      navigate(`/driver/trip-expense/${activeTripId}/bill`, {
        state: { form, pumps, totalKms, pumpTotal, total, balancePayable }
      });
    } catch (err) {
      toast.error(err.message || 'Failed to submit post-trip expenses', { id: 'submit-expense' });
    }
  };

  const inp = 'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-900 outline-none focus:border-[#6B7550] focus:ring-1 focus:ring-[#6B7550] transition-all';
  const label = 'text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block';

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-24 font-sans">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="w-12 h-12 bg-[#6B7550] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
          <Truck size={22} className="text-white" />
        </div>
        <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">Driver & Road Expenses</h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Post-trip expense declaration · {today}</p>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Trip Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Trip Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className={label}>Trip Start Date</label><input type="date" value={form.tripStartDate} onChange={e => upd('tripStartDate', e.target.value)} className={inp} /></div>
            <div><label className={label}>Trip End Date</label><input type="date" value={form.tripEndDate} onChange={e => upd('tripEndDate', e.target.value)} className={inp} /></div>
            <div><label className={label}>Vehicle Number</label><input value={form.vehicleNumber} onChange={e => upd('vehicleNumber', e.target.value)} placeholder="KA-01-AB-1234" className={inp} /></div>
            <div><label className={label}>Driver Name</label><input value={form.driverName} onChange={e => upd('driverName', e.target.value)} className={inp} /></div>
            <div><label className={label}>Loading Point</label><input value={form.loadingPoint} onChange={e => upd('loadingPoint', e.target.value)} placeholder="Farm / Pickup location" className={inp} /></div>
            <div><label className={label}>Unloading Point</label><input value={form.unloadingPoint} onChange={e => upd('unloadingPoint', e.target.value)} placeholder="Delivery location" className={inp} /></div>
            <div className="col-span-2"><label className={label}>Boxes / Tapal No</label><input value={form.tapalNo} onChange={e => upd('tapalNo', e.target.value)} className={inp} /></div>
          </div>
        </div>

        {/* KM Section */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Odometer Reading</h2>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={label}>Starting KMS</label><input type="number" value={form.startingKms} onChange={e => upd('startingKms', e.target.value)} className={inp} /></div>
            <div><label className={label}>Ending KMS</label><input type="number" value={form.endingKms} onChange={e => upd('endingKms', e.target.value)} className={inp} /></div>
            <div><label className={label}>Total KMS</label><input readOnly value={totalKms || ''} className={inp + ' bg-slate-100 text-slate-600 cursor-not-allowed'} /></div>
            <div><label className={label}>Diesel (₹)</label><input type="number" value={form.diesel} onChange={e => upd('diesel', e.target.value)} className={inp} /></div>
            <div><label className={label}>Mileage (KM/L)</label><input type="number" value={form.mileage} onChange={e => upd('mileage', e.target.value)} className={inp} /></div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Expense Breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Driver Batta', 'driverBatta'],
              ['RTO / PC / RMC', 'rtoPcRmc'],
              ['Maintenance', 'maintenance'],
              ['Toll / Fastag', 'tollFastag'],
              ['Halting', 'halting'],
            ].map(([lbl, key]) => (
              <div key={key}><label className={label}>{lbl} (₹)</label><input type="number" value={form[key]} onChange={e => upd(key, e.target.value)} className={inp} /></div>
            ))}
          </div>
        </div>

        {/* Pump / Diesel Details */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2"><Fuel size={12} />Fuel Pump Details</h2>
            <button onClick={() => setPumps(p => [...p, { name: '', litres: '', amount: '' }])}
              className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#6B7550]">
              <Plus size={12} /> Add Row
            </button>
          </div>
          {pumps.map((pump, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 items-end">
              <div><label className={label}>Pump Name</label><input value={pump.name} onChange={e => setPumps(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Pump name" className={inp} /></div>
              <div><label className={label}>Litres</label><input type="number" value={pump.litres} onChange={e => setPumps(p => p.map((x, j) => j === i ? { ...x, litres: e.target.value } : x))} className={inp} /></div>
              <div className="flex gap-2">
                <div className="flex-1"><label className={label}>Amount (₹)</label><input type="number" value={pump.amount} onChange={e => setPumps(p => p.map((x, j) => j === i ? { ...x, amount: e.target.value } : x))} className={inp} /></div>
                {pumps.length > 1 && <button onClick={() => setPumps(p => p.filter((_, j) => j !== i))} className="mt-5 p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2">
          <h2 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Summary</h2>
          {[['Total Expenses', total], ['Less Advance', form.lessAdvance || 0], ['Balance Payable', balancePayable]].map(([l, v]) => (
            <div key={l} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0 last:pt-2">
              <span className="text-[10px] font-bold text-slate-600 uppercase">{l}</span>
              <span className={`text-[12px] font-black ${l === 'Balance Payable' ? 'text-[#6B7550]' : 'text-slate-900'}`}>₹{parseFloat(v || 0).toFixed(0)}</span>
            </div>
          ))}
          <div><label className={label + ' mt-3'}>Remarks</label><textarea value={form.remarks} onChange={e => upd('remarks', e.target.value)} rows={2} className={inp} placeholder="Any additional notes..." /></div>
        </div>

        <button onClick={handleSubmit}
          className="w-full py-4 bg-[#6B7550] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-[#5a6340] transition-all">
          Submit & Generate Bill <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default DriverTripExpenseForm;

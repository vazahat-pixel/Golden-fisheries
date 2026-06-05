import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { 
  Layers, ArrowLeft, ArrowRight, Check, Truck, User, 
  Package, Calendar, FileCheck, MapPin, Info, ChevronRight,
  AlertCircle, CheckCircle, Sprout
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Source Load',    icon: Sprout },
  { id: 2, label: 'Dispatch Info',  icon: Truck },
  { id: 3, label: 'Review & Create', icon: FileCheck },
];

const CreateTapalWizard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slipIdParam = searchParams.get('slipId');

  const {
    harvestSlips, fetchHarvestSlips,
    buyers, fetchBuyers,
    vehicles, fetchVehicles,
    drivers, fetchDrivers,
    tapals,
    convertSlipToTapalAsync, updateHarvestStatusAsync, updateSlipStatus,
  } = useAdminStore();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedSlipId, setSelectedSlipId] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [tpNo, setTpNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [graderName, setGraderName] = useState('');
  const [assignedBuyerId, setAssignedBuyerId] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [notes, setNotes] = useState('');

  const allBuyers = buyers;
  const allVehicles = vehicles.map((v) => v.plateNumber || v.vehicleNumber).filter(Boolean);
  const allDrivers = drivers.map((d) => d.name || d.fullName).filter(Boolean);

  useEffect(() => {
    fetchHarvestSlips();
    fetchBuyers();
    fetchVehicles();
    fetchDrivers();
  }, []);

  // Auto TP No
  useEffect(() => {
    const lastNo = tapals.length > 0
      ? Math.max(...tapals.map(t => parseInt(t.tpNo || t.tapalNumber) || 0))
      : 5000;
    setTpNo(String(lastNo + 1));
  }, [tapals]);

  // Pre-fill from URL param or session
  useEffect(() => {
    const targetId = slipIdParam || '';
    if (targetId) {
      setSelectedSlipId(targetId);
    } else {
      const raw = sessionStorage.getItem('current_tapal_source_slip');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.id || parsed?._id) setSelectedSlipId(parsed.id || parsed._id);
        } catch { /* ignore */ }
      }
    }
  }, [slipIdParam]);

  // Sync selected slip object
  useEffect(() => {
    if (selectedSlipId) {
      const found = harvestSlips.find(s => s.id === selectedSlipId || s._id === selectedSlipId);
      if (found) {
        setSelectedSlip(found);
        if (found.vehicleNo) setVehicleNo(found.vehicleNo);
        if (found.driverName) setDriverName(found.driverName);
        if (found.graderName) setGraderName(found.graderName);
      }
    } else {
      setSelectedSlip(null);
    }
  }, [selectedSlipId, harvestSlips]);

  const eligibleSlips = harvestSlips.filter(s =>
    ['Farmer Approved', 'Approved', 'Draft', 'Sent to Farmer', 'Pending Approval'].includes(s.status)
  );

  const selectedBuyer = allBuyers.find(b => b.id === assignedBuyerId || b._id === assignedBuyerId);

  // Step validation
  const canProceedStep1 = !!selectedSlipId;
  const canProceedStep2 = vehicleNo && driverName && assignedBuyerId;

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) { toast.error('Please select a harvest slip.'); return; }
    if (step === 2 && !canProceedStep2) { toast.error('Please fill vehicle, driver, and buyer.'); return; }
    setStep(s => Math.min(s + 1, 3));
  };

  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleCreate = async () => {
    setSubmitting(true);
    const loadToast = toast.loading('Creating Logistics Tapal...');
    const tapalData = {
      tpNo, date, vehicleNo, driverName, graderName,
      buyerName: selectedBuyer?.name || 'Unknown',
      buyerId: assignedBuyerId,
      sourceSlipId: selectedSlipId,
      sourceSlipNo: selectedSlip?.tpNo || 'N/A',
      items: selectedSlip?.items || [],
      totalBoxes: selectedSlip?.totalBoxes || 0,
      totalWeight: selectedSlip?.totalWeight || 0,
      notes: notes || selectedSlip?.notes || '',
      damageNotes: selectedSlip?.damageNotes || '',
      iceRentDeducted: selectedSlip?.iceRentDeducted || false,
      deliveryLocation,
      status: 'Assigned',
    };
    try {
      await convertSlipToTapalAsync(selectedSlipId, assignedBuyerId, selectedSlip?.items);
      await updateHarvestStatusAsync(selectedSlipId, 'Tapal Created');
      sessionStorage.removeItem('current_tapal_source_slip');
      toast.success('Tapal created successfully!', { id: loadToast });
      navigate('/admin/tapals');
    } catch (err) {
      toast.error(err?.message || 'Failed to create tapal. Check connection and try again.', { id: loadToast });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/admin/tapals')} className="text-text-muted hover:text-[#6A7051] transition-all p-1">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <Layers className="text-brand-yellow" size={24} /> Create Logistics Tapal
          </h1>
          <p className="text-text-secondary text-sm mt-1">Generate a dispatch slip from an approved harvest load.</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 bg-white border border-card-border shadow-sm overflow-hidden">
        {STEPS.map((s, idx) => {
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <React.Fragment key={s.id}>
              <button
                onClick={() => { if (isDone) setStep(s.id); }}
                className={`flex items-center gap-3 px-6 py-4 flex-1 transition-all ${
                  isActive ? 'bg-brand-olive text-white' :
                  isDone ? 'bg-emerald-50 text-emerald-800 cursor-pointer' :
                  'bg-white text-text-muted cursor-default'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${
                  isActive ? 'bg-white/20 text-white' :
                  isDone ? 'bg-emerald-600 text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {isDone ? <Check size={14} /> : <s.icon size={14} />}
                </div>
                <div className="text-left hidden sm:block">
                  <p className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : isDone ? 'text-emerald-600' : 'text-text-muted'}`}>Step {s.id}</p>
                  <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? 'text-white' : isDone ? 'text-emerald-800' : 'text-text-muted'}`}>{s.label}</p>
                </div>
              </button>
              {idx < STEPS.length - 1 && (
                <div className={`h-8 w-px ${step > idx + 1 ? 'bg-emerald-200' : 'bg-card-border'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Select Source Load */}
      {step === 1 && (
        <div className="bg-white border border-card-border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-card-border">
            <Sprout size={18} className="text-brand-yellow" />
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-olive">Select Harvest Source Load</h2>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-2 block">
              Approved Harvest Slip *
            </label>
            <select
              value={selectedSlipId}
              onChange={e => setSelectedSlipId(e.target.value)}
              className="w-full bg-white border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none font-medium"
            >
              <option value="">— Choose a harvest slip to dispatch —</option>
              {eligibleSlips.map((s) => (
                <option key={s.id || s._id} value={s.id || s._id}>
                  TP #{s.tpNo} · {s.farmerName} · {s.totalWeight} kg · [{s.status}]
                </option>
              ))}
            </select>
            {eligibleSlips.length === 0 && (
              <p className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                No approved harvest slips yet. Create and approve a slip under Procurement, then return here.
              </p>
            )}
          </div>

          {selectedSlip && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="col-span-1 md:col-span-3 p-4 bg-emerald-50 border border-emerald-200 flex items-center gap-4">
                <CheckCircle size={24} className="text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase text-emerald-800 tracking-wider">Harvest Load Linked</p>
                  <p className="text-sm font-bold text-emerald-900 mt-0.5">
                    TP #{selectedSlip.tpNo} · {selectedSlip.farmerName} · {selectedSlip.totalBoxes} boxes · {selectedSlip.totalWeight} kg
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-card-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Farmer</p>
                <p className="text-sm font-black uppercase mt-1">{selectedSlip.farmerName}</p>
              </div>
              <div className="p-4 bg-slate-50 border border-card-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Weight</p>
                <p className="text-lg font-black text-brand-olive mt-1">{selectedSlip.totalWeight} KG</p>
              </div>
              <div className="p-4 bg-slate-50 border border-card-border">
                <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">Total Boxes</p>
                <p className="text-lg font-black text-brand-olive mt-1">{selectedSlip.totalBoxes}</p>
              </div>

              {/* Items Preview Table */}
              <div className="col-span-1 md:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-brand-olive mb-2 border-b border-card-border pb-1">
                  Load Particulars (Rate columns hidden for in-transit security)
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px] text-xs">
                    <thead>
                      <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                        <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive w-10 text-center">#</th>
                        <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">Particulars</th>
                        <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-center">Boxes</th>
                        <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-right">Total Weight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-card-border">
                      {selectedSlip.items?.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-50/40">
                          <td className="py-2.5 px-3 text-center text-text-muted font-bold">{i+1}</td>
                          <td className="py-2.5 px-3 font-black uppercase text-brand-olive">{item.particulars}</td>
                          <td className="py-2.5 px-3 text-center font-bold">{item.noOfBoxes || 0}</td>
                          <td className="py-2.5 px-3 text-right font-black">{parseFloat(item.totalWeight || 0).toFixed(2)} kg</td>
                        </tr>
                      )) || (
                        <tr><td colSpan="4" className="py-4 text-center text-text-muted italic">No items data</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!selectedSlip && (
            <div className="py-12 text-center border border-dashed border-card-border">
              <Package size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-text-muted text-sm font-bold">Select an approved harvest slip above to preview its cargo details.</p>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Dispatch Info */}
      {step === 2 && (
        <div className="bg-white border border-card-border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-card-border">
            <Truck size={18} className="text-brand-yellow" />
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-olive">Dispatch & Assignment Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Tapal / TP Slip No</label>
              <input
                type="text" value={tpNo} onChange={e => setTpNo(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none font-black"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Dispatch Date *</label>
              <input
                type="date" value={date} onChange={e => setDate(e.target.value)}
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Assign to Buyer / Merchant *</label>
              <select
                value={assignedBuyerId} onChange={e => setAssignedBuyerId(e.target.value)}
                className="bg-white border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none font-bold"
              >
                <option value="">— Choose Buyer —</option>
                {allBuyers.map(b => (
                  <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Vehicle Number *</label>
              <input
                type="text" value={vehicleNo} onChange={e => setVehicleNo(e.target.value)}
                placeholder="Type or select" list="vehicles-list"
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
              <datalist id="vehicles-list">
                {allVehicles.map(v => <option key={v} value={v} />)}
              </datalist>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Driver Name *</label>
              <input
                type="text" value={driverName} onChange={e => setDriverName(e.target.value)}
                placeholder="Type or select" list="drivers-list"
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
              <datalist id="drivers-list">
                {allDrivers.map(d => <option key={d} value={d} />)}
              </datalist>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Grader Name</label>
              <input
                type="text" value={graderName} onChange={e => setGraderName(e.target.value)}
                placeholder="Name of grader"
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Delivery Location</label>
              <input
                type="text" value={deliveryLocation} onChange={e => setDeliveryLocation(e.target.value)}
                placeholder="e.g. Mangalore Cold Storage, Dock No. 4"
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-black uppercase tracking-widest text-brand-olive mb-1.5">Dispatch Notes</label>
              <input
                type="text" value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="Optional dispatch notes"
                className="bg-[#F5F5EC]/40 border border-card-border px-4 py-3 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
              />
            </div>
          </div>

          {assignedBuyerId && (
            <div className="p-4 bg-blue-50 border border-blue-200 flex items-center gap-3">
              <User size={18} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase text-blue-700 tracking-wider">Buyer Assigned</p>
                <p className="text-sm font-extrabold text-blue-900 mt-0.5">{selectedBuyer?.name}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review & Create */}
      {step === 3 && (
        <div className="bg-white border border-card-border shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-card-border">
            <FileCheck size={18} className="text-brand-yellow" />
            <h2 className="text-sm font-black uppercase tracking-widest text-brand-olive">Review & Confirm Tapal</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-card-border pb-1">Source Harvest Slip</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold text-text-muted w-28 inline-block">TP No:</span> <span className="font-black">#{selectedSlip?.tpNo || '—'}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Farmer:</span> <span className="font-black uppercase">{selectedSlip?.farmerName || '—'}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Total Weight:</span> <span className="font-black text-brand-olive">{selectedSlip?.totalWeight || 0} KG</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Boxes:</span> <span className="font-black">{selectedSlip?.totalBoxes || 0}</span></p>
              </div>
            </div>

            {/* Dispatch Summary */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-card-border pb-1">Dispatch Details</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold text-text-muted w-28 inline-block">Tapal No:</span> <span className="font-black">#{tpNo}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Date:</span> <span className="font-black">{date}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Buyer:</span> <span className="font-black uppercase">{selectedBuyer?.name || '—'}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Vehicle:</span> <span className="font-black">{vehicleNo || '—'}</span></p>
                <p><span className="font-bold text-text-muted w-28 inline-block">Driver:</span> <span className="font-black uppercase">{driverName || '—'}</span></p>
                {deliveryLocation && <p><span className="font-bold text-text-muted w-28 inline-block">Delivery To:</span> <span className="font-bold">{deliveryLocation}</span></p>}
              </div>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted border-b border-card-border pb-1 mb-3">Cargo Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] text-xs">
                <thead>
                  <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">#</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">HSN</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">Particulars</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-center">Boxes</th>
                    <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-right">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {selectedSlip?.items?.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/40">
                      <td className="py-2.5 px-3 font-bold text-text-muted">{i+1}</td>
                      <td className="py-2.5 px-3 font-mono text-xs">{item.hsnCode || 'N/A'}</td>
                      <td className="py-2.5 px-3 font-black uppercase text-brand-olive">{item.particulars}</td>
                      <td className="py-2.5 px-3 text-center font-black">{item.noOfBoxes || 0}</td>
                      <td className="py-2.5 px-3 text-right font-black">{parseFloat(item.totalWeight || 0).toFixed(2)} kg</td>
                    </tr>
                  )) || <tr><td colSpan="5" className="py-4 text-center italic text-text-muted">No items</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Warning banner */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200">
            <AlertCircle size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black uppercase text-amber-800 tracking-wider">Rate & Financial Columns Hidden</p>
              <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                This Tapal will be dispatched <strong>without</strong> Rate and Amount fields. The Buyer will enter agreed rates during the delivery verification step to generate the final Sales Invoice.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between items-center bg-white border border-card-border shadow-sm p-4">
        <button
          onClick={step === 1 ? () => navigate('/admin/tapals') : handleBack}
          className="border border-card-border text-text-secondary px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={14} /> {step === 1 ? 'Cancel' : 'Back'}
        </button>

        <div className="flex items-center gap-2">
          {STEPS.map(s => (
            <div key={s.id} className={`w-2 h-2 rounded-full transition-all ${step === s.id ? 'bg-brand-olive w-6' : step > s.id ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          ))}
        </div>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="bg-[#6A7051] text-white px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-md active:translate-y-0.5"
          >
            Continue <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="bg-brand-olive text-white px-8 py-3 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-2 shadow-md active:translate-y-0.5 disabled:opacity-60"
          >
            {submitting ? 'Creating...' : <>Create Tapal <Check size={14} /></>}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateTapalWizard;

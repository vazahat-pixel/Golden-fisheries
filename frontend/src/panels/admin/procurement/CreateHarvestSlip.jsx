import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { useAdminStore } from '../../../store/adminStore';
import { ArrowLeft, ChevronRight, Check, User, Sprout, Eye, Plus, Minus, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const CATEGORIES = ['Freshwater', 'Seafood', 'Prawns', 'Crab', 'Other'];
const QUALITY = ['A', 'B', 'Mix'];

export default function CreateHarvestSlip() {
  const navigate = useNavigate();
  const { farmers, harvestSlips, addHarvestSlip, addFarmer } = useAdminStore();
  const [step, setStep] = useState(1);
  const [sendNow, setSendNow] = useState(false);

  const [farmer, setFarmer] = useState({ id: '', name: '', mobile: '', location: '', village: '' });
  const [isNewFarmer, setIsNewFarmer] = useState(false);
  const [products, setProducts] = useState([{ id: 1, fishName: '', category: 'Freshwater', quantity: '', unit: 'KG', qualityType: 'A', estimatedWeight: '', rate: '' }]);
  const [harvest, setHarvest] = useState({ harvestDate: '', pickupDate: '', pickupTime: '', pickupLocation: '', logisticsNotes: '' });
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState({});

  const validateStep = (s) => {
    const newErrors = {};
    
    if (s === 1) {
      if (isNewFarmer) {
        if (!farmer.name || farmer.name.trim().length < 3) newErrors.name = 'Name must be at least 3 chars';
        if (!/^[6-9]\d{9}$/.test(farmer.mobile)) newErrors.mobile = 'Enter valid 10-digit mobile';
        if (!farmer.location) newErrors.location = 'Location is required';
      } else {
        if (!farmer.id) newErrors.farmer = 'Please select a farmer';
      }
    }

    if (s === 2) {
      products.forEach((p, i) => {
        if (!p.fishName) newErrors[`fishName_${i}`] = 'Required';
        if (!p.quantity || isNaN(p.quantity) || Number(p.quantity) <= 0) newErrors[`qty_${i}`] = 'Invalid Qty';
      });
      
      if (!harvest.harvestDate) newErrors.harvestDate = 'Required';
      if (!harvest.pickupDate) newErrors.pickupDate = 'Required';
      
      if (harvest.harvestDate && harvest.pickupDate) {
        if (new Date(harvest.pickupDate) < new Date(harvest.harvestDate)) {
          newErrors.pickupDate = 'Pickup cannot be before harvest';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(s => s + 1);
    } else {
      toast.error('Please fix the errors before proceeding');
    }
  };

  const handleSubmit = () => {
    if (!validateStep(step)) return;

    if (isNewFarmer && farmer.name) addFarmer({ ...farmer, name: farmer.name.toUpperCase(), whatsapp: true });
    const newSlip = {
      id: `HSL-${String(harvestSlips.length + 1).padStart(4, '0')}`,
      status: sendNow ? 'sent' : 'pending',
      createdBy: 'Mahesh',
      createdAt: new Date().toISOString().slice(0, 10),
      farmer: { ...farmer, name: farmer.name.toUpperCase() },
      products: products.map((p, i) => ({ ...p, id: i + 1, quantity: Number(p.quantity), rate: p.rate ? Number(p.rate) : null })),
      ...harvest,
      remarks,
    };
    addHarvestSlip(newSlip);
    toast.success('Harvest Slip Created');
    navigate('/admin/procurement/harvest');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate('/admin/procurement/harvest')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} /> BACK TO LIST
      </button>

      <div className="flex justify-between px-12 relative before:absolute before:top-4 before:left-24 before:right-24 before:h-px before:bg-olive-100 before:-z-10">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex flex-col items-center gap-1.5">
            <div className={clsx('w-8 h-8 flex items-center justify-center border text-xs transition-all', step >= s ? 'bg-black border-black text-white shadow-sm' : 'bg-white border-card-border text-text-muted')}>{step > s ? <Check size={14} /> : s}</div>
            <span className={clsx('text-[8px] font-bold uppercase tracking-widest', step === s ? 'text-black' : 'text-text-muted')}>{['Farmer', 'Details', 'Review'][s-1]}</span>
          </div>
        ))}
      </div>

      <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black">Farmer <span className="text-accent-olive">Selection.</span></h2>
              <div className="flex gap-2 bg-olive-50/50 p-0.5 border border-card-border/50 w-fit">
                {['EXISTING', 'NEW'].map(t => (
                  <button key={t} onClick={() => setIsNewFarmer(t === 'NEW')} className={clsx('px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all', (t==='NEW') === isNewFarmer ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black')}>
                    {t}
                  </button>
                ))}
              </div>
              {!isNewFarmer ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {farmers.map(f => (
                      <button key={f.id} onClick={() => setFarmer(f)} className={clsx('p-3 border text-left transition-all', farmer.id === f.id ? 'border-black bg-black text-white' : 'border-card-border bg-white hover:border-black')}>
                        <p className="text-[10px] font-bold uppercase">{f.name}</p>
                        <p className="text-[8px] opacity-60 font-bold uppercase tracking-widest">{f.location}</p>
                      </button>
                    ))}
                  </div>
                  {errors.farmer && <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest">{errors.farmer}</p>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[['NAME', 'name'], ['MOBILE', 'mobile'], ['LOCATION', 'location'], ['VILLAGE', 'village']].map(([l, k]) => (
                    <div key={k} className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-text-muted">{l}</label>
                      <input value={farmer[k]} onChange={e => setFarmer(f => ({ ...f, [k]: e.target.value }))} className={clsx("w-full border px-3 py-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-accent-olive shadow-none", errors[k] ? "border-red-500 bg-red-50" : "border-card-border")} />
                      {errors[k] && <p className="text-[7px] font-bold text-red-500 uppercase">{errors[k]}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black">Product <span className="text-accent-olive">Logistics.</span></h2>
              <div className="space-y-2">
                {products.map((p, idx) => (
                  <div key={p.id} className="p-3 border border-card-border bg-olive-50/20 grid grid-cols-2 md:grid-cols-4 gap-3 relative group">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-text-muted">FISH NAME</label>
                      <input value={p.fishName} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, fishName: e.target.value } : x))} className={clsx("w-full border px-2 py-1.5 text-[10px] font-bold uppercase outline-none", errors[`fishName_${idx}`] ? "border-red-500 bg-red-50" : "border-card-border")} />
                      {errors[`fishName_${idx}`] && <p className="text-[7px] font-bold text-red-500 uppercase">{errors[`fishName_${idx}`]}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase tracking-widest text-text-muted">QTY (KG)</label>
                      <input type="number" value={p.quantity} onChange={e => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, quantity: e.target.value } : x))} className={clsx("w-full border px-2 py-1.5 text-[10px] font-bold outline-none", errors[`qty_${idx}`] ? "border-red-500 bg-red-50" : "border-card-border")} />
                      {errors[`qty_${idx}`] && <p className="text-[7px] font-bold text-red-500 uppercase">{errors[`qty_${idx}`]}</p>}
                    </div>
                    <div className="flex items-end">
                       <button onClick={() => setProducts(prev => prev.filter(x => x.id !== p.id))} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={14} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setProducts(p => [...p, { id: Date.now(), fishName: '', category: 'Freshwater', quantity: '', unit: 'KG' }])} className="w-full py-2 border border-dashed border-card-border text-[9px] font-bold uppercase tracking-widest text-text-muted hover:text-black">
                  + ADD PRODUCT
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1">
                   <label className="text-[8px] font-bold uppercase text-text-muted">HARVEST DATE</label>
                   <input type="date" value={harvest.harvestDate} onChange={e => setHarvest(h => ({ ...h, harvestDate: e.target.value }))} className={clsx("w-full border px-3 py-2 text-[10px] font-bold outline-none", errors.harvestDate ? "border-red-500 bg-red-50" : "border-card-border")} />
                   {errors.harvestDate && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.harvestDate}</p>}
                 </div>
                 <div className="space-y-1">
                   <label className="text-[8px] font-bold uppercase text-text-muted">PICKUP DATE</label>
                   <input type="date" value={harvest.pickupDate} onChange={e => setHarvest(h => ({ ...h, pickupDate: e.target.value }))} className={clsx("w-full border px-3 py-2 text-[10px] font-bold outline-none", errors.pickupDate ? "border-red-500 bg-red-50" : "border-card-border")} />
                   {errors.pickupDate && <p className="text-[7px] font-bold text-red-500 uppercase">{errors.pickupDate}</p>}
                 </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black">Final <span className="text-accent-olive">Review.</span></h2>
              <div className="p-4 bg-olive-50 border border-card-border space-y-2">
                 <p className="text-[8px] font-bold uppercase text-text-muted">DISPATCHING TO:</p>
                 <p className="text-sm font-bold text-black uppercase">{farmer.name}</p>
                 <p className="text-[9px] text-text-muted font-bold">{farmer.mobile} · {farmer.location}</p>
              </div>
              <div className="border border-card-border divide-y divide-card-border">
                {products.map((p, i) => (
                  <div key={i} className="p-3 flex justify-between text-[10px] font-bold uppercase">
                    <span>{p.fishName}</span>
                    <span className="text-accent-olive">{p.quantity} KG</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 p-3 bg-white border border-card-border cursor-pointer hover:bg-olive-50 transition-all" onClick={() => setSendNow(!sendNow)}>
                 <div className={clsx('w-5 h-5 border flex items-center justify-center', sendNow ? 'bg-black border-black text-white' : 'border-card-border')}>{sendNow && <Check size={12} />}</div>
                 <p className="text-[9px] font-bold uppercase tracking-widest">SEND WHATSAPP IMMEDIATELY</p>
              </div>
            </div>
          )}

        <div className="mt-6 pt-4 border-t border-card-border flex justify-between">
           <Button variant="outline" size="sm" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/procurement/harvest')} className="text-[9px] font-bold border-card-border px-6 h-9">
             {step === 1 ? 'CANCEL' : 'BACK'}
           </Button>
           <Button onClick={step < 3 ? nextStep : handleSubmit} size="sm" className="text-[9px] font-bold px-8 h-9 shadow-md">
             {step === 3 ? (sendNow ? 'CREATE & SEND' : 'CREATE SLIP') : 'NEXT STEP'}
           </Button>
        </div>
      </Card>
    </div>
  );
}

import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { useAdminStore } from '../../../store/adminStore';
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  User, 
  ShoppingBag, 
  Truck, 
  Plus,
  Minus,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const CreateSalesTapal = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { addTapal } = useAdminStore();
  
  const [formData, setFormData] = useState({
    buyerType: 'external',
    buyerName: '',
    products: [{ id: Date.now(), type: '', qty: '', rate: '' }],
    driverRequired: true,
    channappaVerification: true
  });

  const nextStep = () => {
    if (step === 1 && !formData.buyerName) { toast.error('Enter buyer name'); return; }
    if (step === 2 && formData.products.some(p => !p.type || !p.qty)) { toast.error('Check product data'); return; }
    setStep(s => s + 1);
  };

  const calculateTotal = () => formData.products.reduce((acc, p) => acc + (p.qty * p.rate || 0), 0);

  const handleSubmit = () => {
    const newTapal = {
      id: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Sale',
      party: formData.buyerName.toUpperCase(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      qty: `${formData.products.reduce((acc, p) => acc + Number(p.qty), 0)} KG`,
      amount: `₹${calculateTotal().toLocaleString()}`,
      driver: formData.driverRequired ? 'Unassigned' : 'N/A',
      status: formData.channappaVerification ? 'Pending' : 'Confirmed'
    };
    addTapal(newTapal);
    toast.success('Sales Request Created');
    navigate('/admin/tapals');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} /> BACK TO RECORDS
      </button>

      <div className="flex justify-between px-16 relative before:absolute before:top-4 before:left-24 before:right-24 before:h-px before:bg-olive-100 before:-z-10">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex flex-col items-center gap-1.5">
            <div className={clsx('w-8 h-8 flex items-center justify-center border text-xs transition-all', step >= s ? 'bg-black border-black text-white shadow-sm' : 'bg-white border-card-border text-text-muted')}>{step > s ? <Check size={14} /> : s}</div>
            <span className={clsx('text-[8px] font-bold uppercase tracking-widest', step === s ? 'text-black' : 'text-text-muted')}>{['Buyer', 'Items', 'Final'][s-1]}</span>
          </div>
        ))}
      </div>

      <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Buyer <span className="text-accent-olive">Selection.</span></h2>
              <div className="flex gap-2 bg-olive-50/50 p-0.5 border border-card-border/50 w-fit">
                {['EXTERNAL', 'INTERNAL'].map(t => (
                  <button key={t} onClick={() => setFormData({...formData, buyerType: t.toLowerCase()})} className={clsx('px-4 py-1.5 text-[8px] font-bold uppercase tracking-widest transition-all', formData.buyerType === t.toLowerCase() ? 'bg-black text-white shadow-sm' : 'text-text-muted hover:text-black')}>
                    {t}
                  </button>
                ))}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-bold uppercase tracking-widest text-text-muted">NAME / OUTLET</label>
                {formData.buyerType === 'external' ? (
                  <input value={formData.buyerName} onChange={(e) => setFormData({...formData, buyerName: e.target.value})} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none" placeholder="e.g. CHANNAPPA BUYER" />
                ) : (
                  <select value={formData.buyerName} onChange={(e) => setFormData({...formData, buyerName: e.target.value})} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none appearance-none bg-white">
                    <option value="">SELECT OUTLET...</option>
                    <option value="GF RESTAURANT">GF RESTAURANT</option>
                    <option value="GF FISH MALL">GF FISH MALL</option>
                  </select>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Line <span className="text-accent-olive">Items.</span></h2>
              <div className="space-y-2">
                {formData.products.map((p, idx) => (
                  <div key={p.id} className="p-3 border border-card-border bg-olive-50/20 grid grid-cols-2 md:grid-cols-4 gap-3 group relative">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[8px] font-bold uppercase text-text-muted">FISH TYPE</label>
                      <select value={p.type} onChange={(e) => setFormData({...formData, products: formData.products.map(x => x.id === p.id ? {...x, type: e.target.value} : x)})} className="w-full border border-card-border px-2 py-1.5 text-[10px] font-bold uppercase outline-none bg-white">
                         <option value="">SELECT...</option>
                         <option value="ROHU">ROHU</option><option value="CATLA">CATLA</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold uppercase text-text-muted">QTY (KG)</label>
                      <input type="number" value={p.qty} onChange={(e) => setFormData({...formData, products: formData.products.map(x => x.id === p.id ? {...x, qty: e.target.value} : x)})} className="w-full border border-card-border px-2 py-1.5 text-[10px] font-bold outline-none" />
                    </div>
                    <div className="flex items-end">
                      <button onClick={() => setFormData({...formData, products: formData.products.filter(x => x.id !== p.id)})} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Minus size={14} /></button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setFormData({...formData, products: [...formData.products, { id: Date.now(), type: '', qty: '', rate: '' }]})} className="w-full py-2 border border-dashed border-card-border text-[8px] font-bold uppercase tracking-widest text-text-muted hover:text-black transition-all">+ ADD LINE ITEM</button>
              </div>
              <div className="p-4 bg-black text-white flex justify-between items-center shadow-md">
                 <div><p className="text-[7px] text-white/40 font-bold uppercase tracking-widest">TOTAL VALUE</p><h3 className="text-lg font-serif italic font-bold">₹{calculateTotal().toLocaleString()}</h3></div>
                 <div className="text-right"><p className="text-[7px] text-white/40 font-bold uppercase tracking-widest">ITEMS</p><h3 className="text-[10px] font-bold uppercase">{formData.products.length} PRODUCTS</h3></div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Final <span className="text-accent-olive">Verification.</span></h2>
              <div className="space-y-2">
                 {[
                   { label: 'CHANNAPPA VERIFICATION', key: 'channappaVerification', desc: 'REQUIRE APPROVAL BEFORE BILLING' },
                   { label: 'DRIVER ASSIGNMENT', key: 'driverRequired', desc: 'ENABLE LOGISTICS TRACKING' }
                 ].map(opt => (
                   <div key={opt.key} className="flex items-center justify-between p-3 border border-card-border bg-white cursor-pointer hover:bg-olive-50 transition-all" onClick={() => setFormData({...formData, [opt.key]: !formData[opt.key]})}>
                      <div className="flex items-center gap-3">
                         <div className={clsx('w-8 h-8 flex items-center justify-center border', formData[opt.key] ? 'bg-black text-white border-black' : 'border-card-border text-text-muted')}><Check size={14} /></div>
                         <div><p className="text-[9px] font-bold text-black uppercase">{opt.label}</p><p className="text-[7px] text-text-muted font-bold uppercase">{opt.desc}</p></div>
                      </div>
                      <div className={clsx('w-3 h-3 rounded-full', formData[opt.key] ? 'bg-accent-olive' : 'bg-card-border')}></div>
                   </div>
                 ))}
              </div>
            </div>
          )}

        <div className="mt-6 pt-4 border-t border-card-border flex justify-between">
           <Button variant="outline" size="sm" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/tapals')} className="text-[9px] font-bold px-6 h-9">
             {step === 1 ? 'CANCEL' : 'BACK'}
           </Button>
           <Button onClick={step < 3 ? nextStep : handleSubmit} size="sm" className="text-[9px] font-bold px-8 h-9 shadow-md">
             {step === 3 ? 'GENERATE SALES TAPAL' : 'NEXT STEP'}
           </Button>
        </div>
      </Card>
    </div>
  );
};

export default CreateSalesTapal;

import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { Modal } from '../../../design-system/components/Modal';
import { useAdminStore } from '../../../store/adminStore';
import { useDriverStore } from '../../../store/driverStore';
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  Sprout, 
  Package, 
  Truck, 
  Clock,
  Navigation,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

function clsx(...c) { return c.filter(Boolean).join(' '); }

const CreatePurchaseTapal = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { addTapal } = useAdminStore();
  const { drivers: verifiedDrivers } = useDriverStore();
  
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const availableDrivers = verifiedDrivers.filter(d => d.status === 'active' || d.status === 'approved');
  
  const [formData, setFormData] = useState({
    farmer: '',
    product: '',
    quantity: '',
    rate: '',
    expectedDate: '',
    whatsappDispatch: true,
    boxQty: '',
    weightPerBox: ''
  });

  const nextStep = () => {
    if (step === 1 && (!formData.farmer || !formData.product)) {
      toast.error('Select farmer and product');
      return;
    }
    if (step === 2 && (!formData.quantity || !formData.rate)) {
      toast.error('Enter quantity and rate');
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = () => {
    const newTapal = {
      id: `PUR-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Purchase',
      party: formData.farmer.toUpperCase(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(),
      qty: `${formData.quantity} KG`,
      amount: `₹${(formData.quantity * formData.rate).toLocaleString()}`,
      boxQty: formData.boxQty || null,
      weightPerBox: formData.weightPerBox || null,
      driver: selectedDriver ? selectedDriver.fullName : 'Unassigned',
      driverPhone: selectedDriver ? (selectedDriver.mobile || selectedDriver.phone) : null,
      vehicleNumber: selectedDriver ? selectedDriver.vehicleNumber : null,
      status: selectedDriver ? 'Assigned' : 'Pending'
    };
    addTapal(newTapal);
    toast.success('Purchase Tapal Created');
    navigate('/admin/tapals');
  };

  const steps = [
    { id: 1, label: 'ENTITY', icon: Sprout },
    { id: 2, label: 'METRICS', icon: Package },
    { id: 3, label: 'REVIEW', icon: Truck },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <button onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1.5 text-text-muted hover:text-black text-[9px] font-bold uppercase tracking-widest group">
        <ArrowLeft size={14} /> BACK TO RECORDS
      </button>

      {/* Stepper */}
      <div className="flex justify-between px-10 relative before:absolute before:top-4 before:left-20 before:right-20 before:h-px before:bg-olive-100 before:-z-10">
        {steps.map(s => (
          <div key={s.id} className="flex flex-col items-center gap-1.5">
            <div className={clsx('w-8 h-8 flex items-center justify-center border text-xs transition-all', step >= s.id ? 'bg-black border-black text-white shadow-sm' : 'bg-white border-card-border text-text-muted')}>
              {step > s.id ? <Check size={14} /> : s.id}
            </div>
            <span className={clsx('text-[8px] font-bold uppercase tracking-widest', step === s.id ? 'text-black' : 'text-text-muted')}>{s.label}</span>
          </div>
        ))}
      </div>

      <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden p-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Entity <span className="text-accent-olive">Selection.</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">SELECT FARMER</label>
                  <select className="w-full bg-white border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-accent-olive shadow-none appearance-none"
                    value={formData.farmer} onChange={(e) => setFormData({...formData, farmer: e.target.value})}>
                    <option value="">CHOOSE FARMER...</option>
                    <option value="RAMU FISHERIES">RAMU FISHERIES</option>
                    <option value="DEEP SEA FARMS">DEEP SEA FARMS</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">SELECT PRODUCT</label>
                  <select className="w-full bg-white border border-card-border px-3 py-2 text-[10px] font-bold uppercase outline-none focus:ring-1 focus:ring-accent-olive shadow-none appearance-none"
                    value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})}>
                    <option value="">CHOOSE PRODUCT...</option>
                    <option value="ROHU FISH">ROHU FISH</option>
                    <option value="CATLA FISH">CATLA FISH</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Metrics & <span className="text-accent-olive">Valuation.</span></h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">QUANTITY (KG)</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none" placeholder="500" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-text-muted uppercase tracking-widest">RATE / KG (₹)</label>
                  <input type="number" value={formData.rate} onChange={(e) => setFormData({...formData, rate: e.target.value})} className="w-full border border-card-border px-3 py-2 text-[10px] font-bold outline-none" placeholder="85" />
                </div>
              </div>

              <div className="p-3 bg-olive-50/30 border border-dashed border-card-border space-y-3">
                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1.5"><Package size={12} /> Box Details (Optional)</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-bold text-text-muted uppercase tracking-widest">BOX QTY</label>
                    <input type="number" value={formData.boxQty} onChange={(e) => setFormData({...formData, boxQty: e.target.value})} className="w-full border border-card-border px-3 py-1.5 text-[9px] font-bold outline-none bg-white" placeholder="e.g. 10" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[7px] font-bold text-text-muted uppercase tracking-widest">WEIGHT / BOX (KG)</label>
                    <input type="number" value={formData.weightPerBox} onChange={(e) => setFormData({...formData, weightPerBox: e.target.value})} className="w-full border border-card-border px-3 py-1.5 text-[9px] font-bold outline-none bg-white" placeholder="e.g. 25" />
                  </div>
                </div>
              </div>
              <div className="p-4 bg-black text-white flex justify-between items-center shadow-md">
                 <div><p className="text-[7px] text-white/40 font-bold uppercase tracking-widest">ESTIMATED TOTAL</p><h3 className="text-lg font-serif italic font-bold">₹{(formData.quantity * formData.rate).toLocaleString()}</h3></div>
                 <Badge className="bg-white text-black text-[7px] font-bold px-2 py-0.5 border-none">SYSTEM CALC</Badge>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <h2 className="text-lg font-serif italic font-bold text-black uppercase">Final <span className="text-accent-olive">Review.</span></h2>
              <div className="grid grid-cols-3 gap-3">
                 <div className="p-3 bg-olive-50/50 border border-card-border space-y-1">
                    <p className="text-[7px] font-bold text-text-muted uppercase">PARTY</p>
                    <p className="text-[10px] font-bold text-black uppercase">{formData.farmer}</p>
                 </div>
                 <div className="p-3 bg-olive-50/50 border border-card-border space-y-1">
                    <p className="text-[7px] font-bold text-text-muted uppercase">PRODUCT</p>
                    <p className="text-[10px] font-bold text-black uppercase">{formData.product}</p>
                 </div>
                 <div className="p-3 bg-olive-50/50 border border-card-border space-y-1">
                    <p className="text-[7px] font-bold text-text-muted uppercase">QTY / RATE</p>
                    <p className="text-[10px] font-bold text-black uppercase">{formData.quantity} KG @ ₹{formData.rate}</p>
                 </div>
              </div>
              {formData.boxQty && (
                <div className="p-3 border border-dashed border-card-border flex justify-between items-center text-[9px] font-bold uppercase">
                   <span className="text-text-muted">Box Details:</span>
                   <span>{formData.boxQty} Boxes · {formData.weightPerBox || '??'} KG/Box</span>
                </div>
              )}
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-3 p-3 bg-white border border-card-border cursor-pointer hover:bg-olive-50 transition-all" onClick={() => setFormData({...formData, whatsappDispatch: !formData.whatsappDispatch})}>
                    <div className={clsx('w-5 h-5 border flex items-center justify-center', formData.whatsappDispatch ? 'bg-black border-black text-white' : 'border-card-border')}>{formData.whatsappDispatch && <Check size={12} />}</div>
                    <p className="text-[9px] font-bold uppercase tracking-widest">DISPATCH WHATSAPP NOTIFICATION</p>
                 </div>

                 {/* Driver Selection */}
                 <div className="flex items-center justify-between p-3 border border-card-border bg-white cursor-pointer hover:bg-olive-50 transition-all" onClick={() => setIsDriverModalOpen(true)}>
                    <div className="flex items-center gap-3">
                       <div className={clsx('w-8 h-8 flex items-center justify-center border', selectedDriver ? 'bg-black text-white border-black' : 'border-card-border text-text-muted')}>
                          {selectedDriver ? <Navigation size={14} className="text-accent-olive" /> : <Truck size={14} />}
                       </div>
                       <div>
                          <p className="text-[9px] font-bold text-black uppercase">{selectedDriver ? `DRIVER: ${selectedDriver.fullName}` : 'ASSIGN DRIVER (OPTIONAL)'}</p>
                          <p className="text-[7px] text-text-muted font-bold uppercase">
                            {selectedDriver ? `PH: ${selectedDriver.mobile || selectedDriver.phone} | VEHICLE: ${selectedDriver.vehicleNumber}` : 'SELECT DRIVER & VEHICLE'}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {selectedDriver && <Badge variant="success" className="text-[7px] px-1.5 py-0.5">SELECTED</Badge>}
                       <div className={clsx('w-3 h-3 rounded-full', selectedDriver ? 'bg-accent-olive' : 'bg-card-border')}></div>
                    </div>
                 </div>
              </div>
            </div>
          )}

        <div className="mt-6 pt-4 border-t border-card-border flex justify-between">
           <Button variant="outline" size="sm" onClick={() => step > 1 ? setStep(s => s - 1) : navigate('/admin/tapals')} className="text-[9px] font-bold px-6 h-9">
             {step === 1 ? 'CANCEL' : 'BACK'}
           </Button>
           <Button onClick={step < 3 ? nextStep : handleSubmit} size="sm" className="text-[9px] font-bold px-8 h-9 shadow-md">
             {step === 3 ? 'CREATE TAPAL' : 'NEXT STEP'}
           </Button>
        </div>
      </Card>

      {/* Driver Selection Modal */}
      <Modal isOpen={isDriverModalOpen} onClose={() => setIsDriverModalOpen(false)} title="Assign Driver to Purchase Tapal">
        <div className="space-y-2">
          {availableDrivers.length === 0 ? (
            <div className="py-8 text-center text-[10px] font-bold text-text-muted uppercase tracking-widest">No verified drivers available.</div>
          ) : (
            availableDrivers.map(driver => (
              <div key={driver.id} className={clsx("p-3 border border-card-border hover:bg-olive-50 cursor-pointer flex justify-between items-center transition-all group", selectedDriver?.id === driver.id && "bg-olive-50 border-accent-olive")} onClick={() => { setSelectedDriver(driver); setIsDriverModalOpen(false); }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-[#C5A021] flex items-center justify-center font-bold text-[10px] border border-black shadow-sm overflow-hidden">
                    <img src={`https://ui-avatars.com/api/?name=${driver.fullName}&background=0A0B09&color=C5A021&size=64&bold=true`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-black uppercase tracking-tight">{driver.fullName}</p>
                    <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest">
                      {driver.vehicleNumber || 'No Vehicle'} · {driver.mobile || driver.phone || 'No Phone'}
                    </p>
                  </div>
                </div>
                {selectedDriver?.id === driver.id && <Check size={14} className="text-accent-olive" />}
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default CreatePurchaseTapal;

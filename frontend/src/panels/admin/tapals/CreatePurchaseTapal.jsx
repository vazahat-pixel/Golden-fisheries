import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  Sprout, 
  Package, 
  Truck, 
  MessageCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreatePurchaseTapal = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    farmer: '',
    product: '',
    quantity: '',
    rate: '',
    expectedDate: '',
    whatsappDispatch: true
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const steps = [
    { id: 1, label: 'Farmer & Product', icon: Sprout },
    { id: 2, label: 'Quantity & Rate', icon: Package },
    { id: 3, label: 'Logistics & Review', icon: Truck },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/admin/tapals')}
        className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors font-medium"
      >
        <ArrowLeft size={18} /> Back to Tapals
      </button>

      <div className="flex justify-between items-center mb-10 px-4">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2 relative z-10">
              <div className={clsx(
                'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 border-2',
                step === s.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 
                step > s.id ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-blue-100 text-blue-300'
              )}>
                {step > s.id ? <Check size={24} /> : <s.icon size={24} />}
              </div>
              <span className={clsx(
                'text-xs font-bold uppercase tracking-wider',
                step === s.id ? 'text-primary' : 'text-gray-400'
              )}>
                {s.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-blue-50 mx-4 -mt-6 relative">
                <div className={clsx(
                  'absolute inset-0 bg-primary transition-all duration-500',
                  step > s.id ? 'w-full' : 'w-0'
                )}></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <Card padding="lg" className="shadow-2xl">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 1: Select Farmer & Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Select Farmer</label>
                <select 
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.farmer}
                  onChange={(e) => setFormData({...formData, farmer: e.target.value})}
                >
                  <option value="">Choose a farmer...</option>
                  <option value="ramu">Ramu Fisheries</option>
                  <option value="deepsea">Deep Sea Farms</option>
                  <option value="coastal">Coastal Harvest</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Select Product</label>
                <select 
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={formData.product}
                  onChange={(e) => setFormData({...formData, product: e.target.value})}
                >
                  <option value="">Choose a product...</option>
                  <option value="rohu">Rohu Fish</option>
                  <option value="catla">Catla Fish</option>
                  <option value="prawns">Tiger Prawns</option>
                </select>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700 font-medium flex gap-2">
                <Clock size={14} className="shrink-0" />
                Note: Selecting a farmer will automatically load their preferred WhatsApp contact for the harvest slip.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 2: Enter Quantity & Rate</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Quantity (KG)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 500"
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Rate per KG (₹)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 85"
                  className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={formData.rate}
                  onChange={(e) => setFormData({...formData, rate: e.target.value})}
                />
              </div>
            </div>
            
            <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex justify-between items-center">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">Estimated Total</p>
                <h3 className="text-3xl font-black text-primary">
                  ₹{(formData.quantity * formData.rate).toLocaleString() || '0'}
                </h3>
              </div>
              <Badge variant="primary" className="px-4 py-1.5">Auto-calculated</Badge>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 3: Review & Dispatch</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Farmer Details</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{formData.farmer || 'Not selected'}</p>
                <p className="text-xs text-gray-500">Contact verified via WhatsApp</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">Product Info</p>
                <p className="text-sm font-bold text-gray-900 capitalize">{formData.product || 'Not selected'}</p>
                <p className="text-xs text-gray-500">{formData.quantity || 0} KG @ ₹{formData.rate || 0}/KG</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">WhatsApp Dispatch</p>
                    <p className="text-xs text-gray-500">Send harvest slip automatically to farmer</p>
                  </div>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                  checked={formData.whatsappDispatch}
                  onChange={(e) => setFormData({...formData, whatsappDispatch: e.target.checked})}
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={step === 1}
            className={step === 1 ? 'invisible' : ''}
          >
            Previous Step
          </Button>
          
          {step < 3 ? (
            <Button onClick={nextStep} className="gap-2">
              Next Step <ChevronRight size={18} />
            </Button>
          ) : (
            <Button 
              onClick={() => {
                // Submit logic here
                navigate('/admin/tapals');
              }} 
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              Confirm & Generate Tapal <Check size={18} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreatePurchaseTapal;

// Helper to use clsx
function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

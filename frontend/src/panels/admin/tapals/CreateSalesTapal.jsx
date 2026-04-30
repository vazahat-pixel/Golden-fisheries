import React, { useState } from 'react';
import { Card } from '../../../design-system/components/Card';
import { Button } from '../../../design-system/components/Button';
import { Badge } from '../../../design-system/components/Badge';
import { 
  ArrowLeft, 
  ChevronRight, 
  Check, 
  User, 
  ShoppingBag, 
  Truck, 
  UserCheck,
  Send,
  Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateSalesTapal = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    buyerType: 'external',
    buyerName: '',
    products: [{ id: Date.now(), type: '', qty: '', rate: '' }],
    driverRequired: true,
    channappaVerification: true
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { id: Date.now(), type: '', qty: '', rate: '' }]
    });
  };

  const updateProduct = (id, field, value) => {
    setFormData({
      ...formData,
      products: formData.products.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const calculateTotal = () => {
    return formData.products.reduce((acc, p) => acc + (p.qty * p.rate || 0), 0);
  };

  const steps = [
    { id: 1, label: 'Buyer Info', icon: User },
    { id: 2, label: 'Products & Pricing', icon: ShoppingBag },
    { id: 3, label: 'Verification & Logistics', icon: Truck },
  ];

  return (
    <div className="max-w-5xl mx-auto">
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
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 1: Buyer Information</h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Buyer Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    className={clsx(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      formData.buyerType === 'external' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 hover:border-blue-100 text-gray-500'
                    )}
                    onClick={() => setFormData({...formData, buyerType: 'external'})}
                  >
                    <User size={24} />
                    <span className="font-bold text-sm">External Buyer</span>
                  </button>
                  <button 
                    className={clsx(
                      'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                      formData.buyerType === 'internal' ? 'border-primary bg-blue-50 text-primary' : 'border-gray-100 hover:border-blue-100 text-gray-500'
                    )}
                    onClick={() => setFormData({...formData, buyerType: 'internal'})}
                  >
                    <ShoppingBag size={24} />
                    <span className="font-bold text-sm">Internal Panel</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">
                  {formData.buyerType === 'external' ? 'Buyer / Party Name' : 'Select Internal Outlet'}
                </label>
                {formData.buyerType === 'external' ? (
                  <input 
                    type="text" 
                    placeholder="e.g. Channappa Buyer"
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                  />
                ) : (
                  <select 
                    className="w-full bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({...formData, buyerName: e.target.value})}
                  >
                    <option value="">Choose outlet...</option>
                    <option value="restaurant">MKE Restaurant</option>
                    <option value="fishmall">MKE Fish Mall</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 2: Products & Pricing</h2>
            
            <div className="space-y-4">
              {formData.products.map((product, idx) => (
                <div key={product.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-blue-50/30 border border-blue-100 relative group">
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-blue-900 uppercase">Product</label>
                    <select 
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={product.type}
                      onChange={(e) => updateProduct(product.id, 'type', e.target.value)}
                    >
                      <option value="">Select fish...</option>
                      <option value="rohu">Rohu Fish</option>
                      <option value="catla">Catla Fish</option>
                      <option value="prawns">Tiger Prawns</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-900 uppercase">Qty (KG)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={product.qty}
                      onChange={(e) => updateProduct(product.id, 'qty', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-blue-900 uppercase">Rate (₹)</label>
                    <input 
                      type="number" 
                      className="w-full bg-white border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                      value={product.rate}
                      onChange={(e) => updateProduct(product.id, 'rate', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button variant="secondary" size="sm" onClick={addProduct} className="w-full py-3 border-2 border-dashed border-blue-200 bg-transparent hover:bg-blue-50 text-blue-600">
                + Add Another Product
              </Button>
            </div>

            <div className="p-6 bg-primary text-white rounded-2xl flex justify-between items-center shadow-xl shadow-primary/20">
              <div>
                <p className="text-xs text-blue-100 font-bold uppercase tracking-wider mb-1">Total Sales Value</p>
                <h3 className="text-3xl font-black">₹{calculateTotal().toLocaleString()}</h3>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100 font-bold uppercase tracking-wider mb-1">Items Count</p>
                <h3 className="text-xl font-bold">{formData.products.length} Products</h3>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Step 3: Verification & Logistics</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50 border border-blue-100 transition-all hover:bg-blue-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Channappa Verification</p>
                    <p className="text-xs text-gray-500">Sales will require Channappa's approval before billing.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-lg border-gray-300 text-primary focus:ring-primary transition-all"
                    checked={formData.channappaVerification}
                    onChange={(e) => setFormData({...formData, channappaVerification: e.target.checked})}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-5 rounded-2xl bg-blue-50 border border-blue-100 transition-all hover:bg-blue-100/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Truck size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Driver Assignment</p>
                    <p className="text-xs text-gray-500">Assign a driver for logistics tracking.</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 rounded-lg border-gray-300 text-primary focus:ring-primary transition-all"
                    checked={formData.driverRequired}
                    onChange={(e) => setFormData({...formData, driverRequired: e.target.checked})}
                  />
                </div>
              </div>
            </div>

            <Card variant="secondary" className="bg-amber-50 border-amber-100">
              <div className="flex gap-3">
                <Info className="text-amber-600 shrink-0" size={20} />
                <p className="text-sm text-amber-800 leading-relaxed">
                  Upon confirmation, a **Sales Tapal** will be generated and sent to Channappa. Once he confirms the quantity, a billing link will be automatically dispatched to the buyer.
                </p>
              </div>
            </Card>
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
                navigate('/admin/tapals');
              }} 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/30"
            >
              Send to Channappa & Create <Send size={18} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreateSalesTapal;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  Truck, 
  MapPin, 
  IndianRupee, 
  Camera, 
  CheckCircle2,
  Navigation,
  Fuel,
  Info
} from 'lucide-react';

const ActiveTrip = () => {
  const [expenseType, setExpenseType] = useState('fuel');
  const [amount, setAmount] = useState('');
  const [tripStatus, setTripStatus] = useState('Active');
  
  const handleUpdate = () => {
    toast.success('Location updated successfully');
  };

  const handleComplete = () => {
    toast.success('Trip marked as completed!');
    setTripStatus('Completed');
  };

  const handleSubmitExpense = () => {
    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }
    toast.success(`Expense of ₹${amount} for ${expenseType} submitted!`);
    setAmount('');
  };

  return (
    <div className="p-4 space-y-4 bg-page-bg min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-serif italic font-black text-black tracking-tight">Current <span className="text-[#6B7550]">Trip</span></h2>
        <Badge className={`bg-[#E6E2C8] text-black border border-card-border font-black uppercase tracking-widest text-[9px] px-3 py-1 ${tripStatus === 'Active' ? 'animate-pulse' : ''}`}>
          {tripStatus}
        </Badge>
      </div>

      <Card className="p-4 border border-[#E6E2C8] shadow-subtle rounded-none bg-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 bg-[#E6E2C8]/30 flex items-center justify-center text-[#6B7550] border border-[#E6E2C8]">
            <Truck size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-black uppercase tracking-tight">TRP-101</h3>
            <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">Hassan &rarr; Fish Mall (City)</p>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E6E2C8]">
          <div className="flex gap-4 relative">
            <div className="w-6 h-6 bg-[#6B7550] border-4 border-white flex items-center justify-center z-10 shrink-0 shadow-sm">
              <div className="w-1.5 h-1.5 bg-white"></div>
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Current</p>
              <p className="text-sm font-black text-black uppercase tracking-tight">Near Hassan Toll</p>
            </div>
          </div>
          <div className="flex gap-4 relative">
            <div className="w-6 h-6 bg-white border border-[#E6E2C8] flex items-center justify-center z-10 shrink-0">
              <MapPin size={10} className="text-[#6B7550]" />
            </div>
            <div>
              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Destination</p>
              <p className="text-sm font-black text-text-muted uppercase tracking-tight">MKE Fish Mall, City</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button onClick={handleUpdate} className="flex-1 bg-[#6B7550] text-white hover:bg-black font-black py-4 rounded-none shadow-md gap-2 active:scale-95 transition-all text-[10px] uppercase tracking-widest border-none">
            <Navigation size={14} /> UPDATE
          </Button>
          <Button onClick={handleComplete} variant="outline" className="flex-1 border-[#E6E2C8] text-black font-black py-4 rounded-none active:scale-95 transition-all text-[10px] uppercase tracking-widest hover:bg-black hover:text-white">
            COMPLETE
          </Button>
        </div>
      </Card>

      <h3 className="text-lg font-serif italic font-black text-black mt-8 mb-4 flex items-center gap-2 tracking-tight">
        <IndianRupee className="text-[#6B7550]" size={20} /> Add <span className="text-text-muted">Expense</span>
      </h3>
      
      <Card className="p-4 space-y-6 bg-white border border-[#E6E2C8] shadow-subtle rounded-none">
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'fuel', icon: Fuel, label: 'Fuel' },
            { id: 'toll', icon: MapPin, label: 'Toll' },
            { id: 'rto', icon: Info, label: 'Misc' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setExpenseType(type.id)}
              className={clsx(
                'p-4 rounded-none flex flex-col items-center gap-2 transition-all border active:scale-95',
                expenseType === type.id ? 'border-black bg-black text-white shadow-wapixo' : 'border-[#E6E2C8] text-text-muted hover:border-black hover:text-black'
              )}
            >
              <type.icon size={18} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em]">Amount (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border border-[#E6E2C8] rounded-none px-4 py-3 text-lg font-serif italic font-black text-black focus:ring-1 focus:ring-black outline-none shadow-inner"
            />
          </div>
          
          <button className="w-full p-6 border border-dashed border-[#E6E2C8] bg-white rounded-none flex flex-col items-center justify-center gap-3 hover:border-[#6B7550] hover:bg-[#E6E2C8]/10 transition-all text-text-muted group">
            <Camera size={24} className="group-hover:text-[#6B7550] transition-colors" />
            <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#6B7550] transition-colors">Capture Bill Photo</span>
          </button>

          <Button onClick={handleSubmitExpense} className="w-full py-4 rounded-none font-black text-black bg-[#E6E2C8] hover:bg-[#6B7550] hover:text-white border-none active:scale-95 transition-all text-[10px] uppercase tracking-widest">
            SUBMIT EXPENSE
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ActiveTrip;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}



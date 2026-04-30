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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900">Current Trip</h2>
        <Badge variant={tripStatus === 'Active' ? 'primary' : 'success'} className={tripStatus === 'Active' ? 'animate-pulse' : ''}>
          {tripStatus}
        </Badge>
      </div>

      <Card className="p-6 border-l-4 border-l-primary">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary">
            <Truck size={24} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">TRP-101</h3>
            <p className="text-xs text-gray-500 font-medium">Hassan &rarr; Fish Mall (City)</p>
          </div>
        </div>

        <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-50">
          <div className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center z-10 shrink-0 shadow-lg">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Current</p>
              <p className="text-sm font-bold text-gray-900">Near Hassan Toll</p>
            </div>
          </div>
          <div className="flex gap-4 relative">
            <div className="w-8 h-8 rounded-full bg-gray-100 border-4 border-white flex items-center justify-center z-10 shrink-0">
              <MapPin size={12} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Destination</p>
              <p className="text-sm font-bold text-gray-900 text-gray-400">MKE Fish Mall, City</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button onClick={handleUpdate} className="flex-1 bg-primary font-black py-4 rounded-2xl shadow-xl shadow-primary/20 gap-2 active:scale-95 transition-all">
            <Navigation size={18} /> Update
          </Button>
          <Button onClick={handleComplete} variant="outline" className="flex-1 border-2 font-bold py-4 rounded-2xl active:scale-95 transition-all">
            Complete
          </Button>
        </div>
      </Card>

      <h3 className="text-lg font-black text-gray-900 mt-8 mb-4 flex items-center gap-2">
        <IndianRupee className="text-amber-600" size={20} /> Add Expense
      </h3>
      
      <Card className="p-6 space-y-6 bg-white shadow-xl">
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
                'p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 active:scale-95',
                expenseType === type.id ? 'border-primary bg-blue-50 text-primary' : 'border-gray-50 text-gray-400'
              )}
            >
              <type.icon size={20} />
              <span className="text-[10px] font-bold uppercase">{type.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Amount (₹)</label>
            <input 
              type="number" 
              placeholder="e.g. 1200"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-4 text-lg font-black text-gray-900 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          
          <button className="w-full p-6 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-blue-50 transition-all text-gray-400 group">
            <Camera size={32} className="group-hover:text-primary transition-colors" />
            <span className="text-xs font-bold group-hover:text-primary transition-colors">Capture Bill Photo</span>
          </button>

          <Button onClick={handleSubmitExpense} variant="secondary" className="w-full py-4 rounded-2xl font-black text-blue-700 bg-blue-100 hover:bg-blue-200 border-none active:scale-95 transition-all">
            Submit Expense
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

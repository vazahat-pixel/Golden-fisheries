import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { Modal } from '../../design-system/components/Modal';
import {
  Truck,
  MapPin,
  IndianRupee,
  Camera,
  CheckCircle2,
  Navigation,
  Fuel,
  Info,
  PackageCheck,
  Signature,
  Scale,
  ArrowRight
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ActiveTrip = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, driverStartTrip, confirmPickup, completeTrip, addTripExpense, closeTrip } = useAdminStore();

  const trip = trips.find(t =>
    t.driverName === (user?.name || 'JAGRATI DOD') &&
    ['Accepted', 'In Transit', 'Picked', 'Delivered', 'Expense Submitted'].includes(t.status)
  );

  const [expenseData, setExpenseData] = useState({ type: 'FUEL', amount: '' });
  const [pickupForm, setPickupForm] = useState({ actualQty: '', quality: 'A', photo: null, signature: null });
  const [isPickupModalOpen, setIsPickupModalOpen] = useState(false);

  if (!trip) {
    return (
      <div className="p-8 text-center bg-page-bg min-h-screen flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-[#E6E2C8]/30 rounded-full flex items-center justify-center mb-6">
          <Truck size={40} className="text-[#6B7550]" />
        </div>
        <h2 className="text-xl font-serif italic font-black text-black mb-2 uppercase tracking-tight">No Active Trip</h2>
        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-8">Your dashboard will notify you of new tasks</p>
        <Button onClick={() => navigate('/driver/dashboard')} variant="outline" className="border-[#E6E2C8] text-black font-black text-[10px] uppercase tracking-widest px-8 py-3">BACK TO DASHBOARD</Button>
      </div>
    );
  }

  const handleStartTrip = () => {
    driverStartTrip(trip.tapalId);
    toast.success('Trip Started! Drive safe.');
  };

  const handlePickupComplete = () => {
    if (!pickupForm.actualQty) return toast.error('Please enter actual quantity');
    confirmPickup(trip.tapalId, pickupForm);
    setIsPickupModalOpen(false);
    toast.success('Pickup Execution Logged');
  };

  const handleDeliver = () => {
    completeTrip(trip.tapalId);
    toast.success('Delivery Completed! Inventory updated.');
  };

  const handleExpenseSubmit = () => {
    if (!expenseData.amount) return toast.error('Enter amount');
    addTripExpense(trip.tapalId, expenseData);
    setExpenseData({ type: 'FUEL', amount: '' });
    toast.success('Expense submitted for review');
  };

  const handleFinish = () => {
    closeTrip(trip.tapalId);
    toast.success('Trip flow fully completed!');
    navigate('/driver/dashboard');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Accepted': return 'bg-black text-white';
      case 'In Transit': return 'bg-[#6B7550] text-white';
      case 'Picked': return 'bg-black text-white';
      case 'Delivered': return 'bg-[#6B7550] text-white';
      case 'Expense Submitted': return 'bg-gray-100 text-black/40';
      default: return 'bg-black text-white';
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-24 selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Simple Header */}
      <div className="bg-gray-900 text-white p-6 md:p-8">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight uppercase">Mission Console</h2>
            <div className="flex items-center gap-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">Unit: GF-FLEET-01</p>
              <div className="h-1 w-1 rounded-full bg-[#6B7550]" />
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#6B7550]">Signal: Stable</p>
            </div>
          </div>
          <Badge className={`font-bold uppercase tracking-widest text-[8px] px-3 py-1 border-none ${getStatusColor(trip.status)}`}>
            {trip.status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 border border-white/10">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Origin</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-1">{trip.pickupLocation}</p>
          </div>
          <div className="p-4 bg-white/5 border border-white/10">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target</p>
            <p className="text-[10px] font-bold text-white uppercase tracking-tight line-clamp-1">{trip.deliveryLocation}</p>
          </div>
        </div>
      </div>

      {/* Action Deck */}
      <div className="px-4 -mt-6">
        <div className="bg-white border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-12 h-12 bg-gray-50 flex items-center justify-center border border-gray-100 text-gray-400">
              <Navigation size={20} className={trip.status === 'In Transit' ? 'animate-pulse text-[#6B7550]' : ''} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Primary Objective</p>
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                {trip.status === 'Accepted' && 'Start Trip'}
                {trip.status === 'In Transit' && 'Execute Pickup'}
                {trip.status === 'Picked' && 'Deliver Cargo'}
                {['Delivered', 'Expense Submitted'].includes(trip.status) && 'Finish Session'}
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {trip.status === 'Accepted' && (
              <Button onClick={handleStartTrip} className="w-full py-6 bg-gray-900 text-white hover:bg-[#6B7550] font-bold text-xs uppercase tracking-widest shadow-sm transition-all border-none">
                <Truck size={18} className="mr-3" /> Deploy Vehicle
              </Button>
            )}

            {trip.status === 'In Transit' && (
              <Button onClick={() => setIsPickupModalOpen(true)} className="w-full py-6 bg-gray-900 text-white hover:bg-[#6B7550] font-bold text-xs uppercase tracking-widest shadow-sm transition-all border-none">
                <PackageCheck size={18} className="mr-3" /> Log Pickup
              </Button>
            )}

            {trip.status === 'Picked' && (
              <Button onClick={handleDeliver} className="w-full py-6 bg-gray-900 text-white hover:bg-[#6B7550] font-bold text-xs uppercase tracking-widest shadow-sm transition-all border-none">
                <CheckCircle2 size={18} className="mr-3" /> Mark Delivered
              </Button>
            )}
            
            {['Delivered', 'Expense Submitted'].includes(trip.status) && (
              <Button onClick={handleFinish} className="w-full py-6 bg-[#6B7550] text-white hover:bg-gray-900 font-bold text-xs uppercase tracking-widest shadow-sm transition-all border-none">
                <CheckCircle2 size={18} className="mr-3" /> Close Session
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Expense Log */}
      {['Picked', 'Delivered', 'Expense Submitted'].includes(trip.status) && (
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Financial Log</h3>
            <IndianRupee size={12} className="text-gray-300" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-1">
              {['FUEL', 'TOLL', 'OTHER'].map(type => (
                <button
                  key={type}
                  onClick={() => setExpenseData({ ...expenseData, type })}
                  className={`py-3 text-[8px] font-bold uppercase tracking-widest border transition-all ${expenseData.type === type ? 'bg-black text-white border-black' : 'bg-white text-gray-400 border-gray-100 hover:border-gray-900'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="p-6 bg-white border border-gray-200 shadow-sm space-y-6">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Amount (₹)</label>
                <input
                  type="number"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 text-xl font-black text-gray-900 focus:border-[#6B7550] outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <button className="w-full p-4 border border-dashed border-gray-200 bg-gray-50 text-gray-400 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-gray-100 transition-all">
                <Camera size={14} /> Upload Receipt
              </button>

              <Button 
                onClick={handleExpenseSubmit} 
                disabled={trip.status === 'Expense Submitted'} 
                className={`w-full py-4 font-bold text-[9px] uppercase tracking-widest transition-all border-none ${trip.status === 'Expense Submitted' ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-[#6B7550]'}`}
              >
                {trip.status === 'Expense Submitted' ? 'Submitted' : 'Commit Expense'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Pickup Modal */}
      <Modal isOpen={isPickupModalOpen} onClose={() => setIsPickupModalOpen(false)} title="CARGO VERIFICATION">
        <div className="space-y-6 p-2">
          <div className="p-6 bg-gray-900 text-white text-center">
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Expected Quantity</p>
            <p className="text-3xl font-black">{trip.expectedQty} <span className="text-xs font-bold text-gray-400">KG</span></p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Scale size={12} className="text-[#6B7550]" /> Actual Weight (KG)
              </label>
              <input
                type="number"
                value={pickupForm.actualQty}
                onChange={(e) => setPickupForm({ ...pickupForm, actualQty: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50 p-4 text-2xl font-black outline-none focus:border-[#6B7550] transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button className="h-24 border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                <Camera size={20} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Photo</span>
              </button>
              <button className="h-24 border border-gray-100 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-900 hover:text-white transition-all">
                <Signature size={20} />
                <span className="text-[8px] font-bold uppercase tracking-widest">Sign</span>
              </button>
            </div>

            <Button onClick={handlePickupComplete} className="w-full py-4 bg-gray-900 text-white hover:bg-[#6B7550] font-bold text-[11px] uppercase tracking-widest mt-4 border-none transition-all">
              Complete Log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActiveTrip;



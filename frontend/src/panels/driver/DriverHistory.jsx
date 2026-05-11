import React from 'react';
import { Badge } from '../../design-system/components/Badge';
import { Card } from '../../design-system/components/Card';
import { 
  History, 
  MapPin, 
  Calendar, 
  ArrowRight,
  CheckCircle2,
  Package,
  IndianRupee,
  Navigation
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const DriverHistory = () => {
  const { user } = useAuthStore();
  const { trips } = useAdminStore();

  const myHistory = trips.filter(t => 
    (t.driverName === (user?.name || 'RAJESH KUMAR') || t.driverId === user?.id) && 
    ['Delivered', 'Closed'].includes(t.status)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const dummyHistory = [
    {
      id: 'TRP-HIST-7701',
      status: 'Closed',
      date: 'May 01, 2026',
      pickupLocation: 'SOUTH BAY DOCKS',
      deliveryLocation: 'MARKET TERMINAL 1',
      product: 'VANNAMEI SHRIMPS',
      expectedQty: '450 KG'
    },
    {
      id: 'TRP-HIST-7705',
      status: 'Closed',
      date: 'Apr 30, 2026',
      pickupLocation: 'NORTHERN FARMS',
      deliveryLocation: 'COLD STORAGE HUB',
      product: 'POMFRET (LARGE)',
      expectedQty: '250 KG'
    }
  ];

  const historyTrips = myHistory.length > 0 ? myHistory : dummyHistory;

  return (
    <div className="p-4 space-y-5 animate-in fade-in duration-500 pb-24 bg-slate-50 min-h-screen font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-black tracking-tighter uppercase italic leading-none">Trip Archive</h2>
          <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1.5 italic">Deployment History Registry</p>
        </div>
        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white shadow-lg">
          <History size={18} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft text-center">
          <p className="text-2xl font-black text-black italic leading-none">{historyTrips.length}</p>
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Trips</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border-none shadow-soft text-center">
          <p className="text-2xl font-black text-black italic leading-none">₹6,400</p>
          <p className="text-[7px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Yield</p>
        </div>
      </div>

      <div className="space-y-4">
        {historyTrips.map((trip) => (
          <div key={trip.id} className="glass-card p-4 rounded-[1.8rem] space-y-4 border-none shadow-extra-soft relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-black text-white bg-black px-1.5 py-0.5 rounded-lg tracking-tight">{trip.id}</span>
                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{trip.date}</span>
                </div>
                <h3 className="text-[13px] font-black text-black uppercase tracking-tight">{trip.product}</h3>
              </div>
              <Badge className="bg-emerald-50 text-emerald-600 text-[7px] font-black uppercase px-2 py-0.5 border-none">
                {trip.status}
              </Badge>
            </div>

            <div className="space-y-2 relative z-10">
              <div className="flex items-center gap-2">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                 <p className="text-[9px] font-bold text-black uppercase truncate">{trip.pickupLocation}</p>
              </div>
              <div className="flex items-center gap-2 ml-0.5">
                 <ArrowRight size={10} className="text-gray-300" />
                 <p className="text-[9px] font-bold text-gray-500 uppercase truncate">{trip.deliveryLocation}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-black/5 relative z-10">
               <div className="flex items-center gap-3">
                 <div className="flex items-center gap-1">
                    <Package size={10} className="text-gray-400" />
                    <span className="text-[9px] font-black text-black uppercase">{trip.expectedQty}</span>
                 </div>
                 <div className="w-0.5 h-0.5 bg-gray-200 rounded-full"></div>
                 <div className="flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                    <span className="text-[7px] font-black text-emerald-600 uppercase">Verified</span>
                 </div>
               </div>
               <p className="text-xs font-black text-black italic">₹500.00</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DriverHistory;

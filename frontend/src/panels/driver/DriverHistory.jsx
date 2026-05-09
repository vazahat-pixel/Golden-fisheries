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
  IndianRupee
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const DriverHistory = () => {
  const { user } = useAuthStore();
  const { trips } = useAdminStore();

  // Filter completed/closed trips for the current driver
  const myHistory = trips.filter(t => 
    (t.driverName === (user?.name || 'RAJESH KUMAR') || t.driverId === user?.id) && 
    ['Delivered', 'Closed'].includes(t.status)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const dummyHistory = [
    {
      id: 'TRP-HIST-7701',
      status: 'Closed',
      date: '2024-05-01',
      pickupLocation: 'SOUTH BAY DOCKS',
      deliveryLocation: 'MARKET TERMINAL 1',
      product: 'VANNAMEI SHRIMPS',
      expectedQty: '450 KG'
    },
    {
      id: 'TRP-HIST-7705',
      status: 'Closed',
      date: '2024-04-30',
      pickupLocation: 'NORTHERN FARMS',
      deliveryLocation: 'COLD STORAGE HUB',
      product: 'POMFRET (LARGE)',
      expectedQty: '250 KG'
    }
  ];

  const historyTrips = myHistory.length > 0 ? myHistory : dummyHistory;

  return (
    <div className="bg-white min-h-screen pb-24 selection:bg-black selection:text-white animate-in fade-in duration-500">
      {/* Sharp Registry Header */}
      <div className="bg-black text-white p-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-serif italic font-black text-white tracking-tighter uppercase leading-none">
              Trip <span className="text-[#6B7550]">Archive.</span>
            </h2>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/40 mt-3">Verified Log of Operational Deployments</p>
          </div>
          <div className="w-14 h-14 bg-[#6B7550] flex items-center justify-center shadow-2xl">
            <History size={28} className="text-white" />
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {historyTrips.length > 0 ? (
          <div className="space-y-4">
            {historyTrips.map((trip) => (
              <Card key={trip.id} padding="none" className="bg-white border border-black/5 shadow-xl group hover:border-black transition-all overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-black text-black uppercase tracking-tight group-hover:text-[#6B7550] transition-colors">{trip.id}</span>
                        <Badge className="text-[7px] font-black uppercase px-3 py-1 bg-black text-white border-none shadow-sm">
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{trip.date}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[8px] text-text-muted font-black uppercase tracking-[0.2em]">Operational Yield</p>
                      <p className="text-xl font-black text-black italic leading-none group-hover:scale-110 transition-transform">₹500.00</p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8 relative border-l-2 border-black/10 ml-3 pl-8 py-1">
                    <div className="relative">
                       <div className="absolute -left-[37px] top-0 w-4 h-4 bg-black shadow-lg" />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#6B7550] mb-1">Loading Port</p>
                       <p className="text-[10px] font-black text-black uppercase tracking-widest">{trip.pickupLocation || 'Central Harbor'}</p>
                    </div>
                    <div className="relative">
                       <div className="absolute -left-[37px] top-0 w-4 h-4 bg-[#6B7550] shadow-lg" />
                       <p className="text-[8px] font-black uppercase tracking-[0.3em] text-[#6B7550] mb-1">Target Terminal</p>
                       <p className="text-[10px] font-black text-black uppercase tracking-widest">{trip.deliveryLocation || 'Market Hub'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-black/5">
                     <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Package size={14} className="text-[#6B7550]" />
                           <span className="text-[10px] font-black text-black uppercase tracking-tight">{trip.product || 'Fresh Fish'}</span>
                        </div>
                        <div className="w-1 h-1 bg-black/10 rounded-full" />
                        <span className="text-[9px] font-black text-[#6B7550] uppercase tracking-[0.2em]">{trip.expectedQty || '250 KG'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-[#6B7550]">
                        <CheckCircle2 size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Validated</span>
                     </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center opacity-10 space-y-8">
            <History size={80} />
            <p className="text-[12px] font-black uppercase tracking-[0.5em]">Archive Empty</p>
          </div>
        )}

        {/* Global Statistics Matrix */}
        <div className="bg-black text-white p-10 shadow-3xl relative overflow-hidden group">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-10">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-[#6B7550]">Performance Analytics</h4>
              <div className="flex items-baseline gap-4">
                <p className="text-6xl font-black tracking-tighter italic">12</p>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Total Deployments</p>
              </div>
            </div>
            
            <div className="border-l-2 border-[#6B7550] pl-10 space-y-4">
               <p className="text-4xl font-black text-[#6B7550] tracking-tighter italic">₹6,000</p>
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Cumulative Earnings</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/5 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-1000" />
        </div>
      </div>
    </div>
  );
};

export default DriverHistory;

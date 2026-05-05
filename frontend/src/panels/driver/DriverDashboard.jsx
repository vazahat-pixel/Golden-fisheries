import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  Clock,
  ArrowRight
} from 'lucide-react';

const DriverDashboard = () => {
  return (
    <div className="p-4 space-y-4 bg-page-bg min-h-screen">
      {/* Driver Welcome */}
      <div className="mb-6">
        <h2 className="text-2xl font-serif italic font-black text-black leading-tight tracking-tight">Hello, <span className="text-[#6B7550]">Ramu!</span></h2>
        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">2 TASKS ASSIGNED TODAY</p>
      </div>

      {/* Active Trip Card */}
      <Card className="bg-[#6B7550] text-white border-none shadow-wapixo relative overflow-hidden p-6 rounded-none">
        <div className="relative z-10">
          <Badge className="bg-[#E6E2C8] text-black border-none mb-4 font-black uppercase tracking-widest text-[9px] px-3 py-1">Live Trip</Badge>
          <h3 className="text-2xl font-serif italic font-black mb-2 tracking-tight">TRP-101 (Hassan &rarr; Mall)</h3>
          <div className="flex items-center gap-2 text-[#E6E2C8] text-[10px] font-black uppercase tracking-widest mb-8">
            <Clock size={12} /> STARTED 10:45 AM
          </div>
          
          <div className="space-y-4 mb-8">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 bg-[#E6E2C8]"></div>
                <div className="w-[1px] h-8 bg-[#E6E2C8]/30"></div>
                <Navigation size={14} className="text-[#E6E2C8]" />
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E6E2C8] mb-1">Current Progress</p>
                <p className="text-sm font-black uppercase tracking-tight text-white">Near Sakleshpur Bypass</p>
              </div>
            </div>
          </div>

          <Button className="w-full bg-[#E6E2C8] text-black hover:bg-white border-none font-black gap-3 text-[10px] uppercase tracking-widest py-4">
            UPDATE LOCATION <Navigation size={14} />
          </Button>
        </div>
        <Truck className="absolute right-0 bottom-0 -mr-8 -mb-8 text-black/10" size={200} />
      </Card>

      {/* New Task Alert */}
      <div className="p-4 rounded-none bg-white border border-[#E6E2C8] shadow-subtle flex items-center justify-between gap-4 group hover:bg-[#E6E2C8]/10 transition-colors cursor-pointer">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-none bg-black text-white flex items-center justify-center shadow-sm">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-black text-black uppercase tracking-tight">New Task Assigned</p>
            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mt-1">Pick-up from Farm A</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2 text-black hover:bg-black hover:text-white transition-colors rounded-none">
          <ArrowRight size={18} />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-[#E6E2C8] shadow-subtle rounded-none hover:shadow-wapixo transition-all">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-2">Today's Earnings</p>
          <p className="text-xl font-serif italic font-black text-black tracking-tight">₹1,250</p>
        </Card>
        <Card className="p-4 bg-white border border-[#E6E2C8] shadow-subtle rounded-none hover:shadow-wapixo transition-all">
          <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] mb-2">KM Driven</p>
          <p className="text-xl font-serif italic font-black text-black tracking-tight">84.5 KM</p>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;



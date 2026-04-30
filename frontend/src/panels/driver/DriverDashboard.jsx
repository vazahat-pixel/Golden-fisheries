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
    <div className="p-4 space-y-6">
      {/* Driver Welcome */}
      <div>
        <h2 className="text-2xl font-black text-gray-900 leading-tight">Hello, Ramu! 👋</h2>
        <p className="text-sm text-gray-500 font-medium">You have 2 tasks assigned for today.</p>
      </div>

      {/* Active Trip Card */}
      <Card className="bg-primary text-white border-none shadow-2xl shadow-primary/20 relative overflow-hidden p-6">
        <div className="relative z-10">
          <Badge className="bg-white/20 text-white border-none mb-3">Live Trip</Badge>
          <h3 className="text-xl font-bold mb-1">TRP-101 (Hassan &rarr; Mall)</h3>
          <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-6">
            <Clock size={12} /> Started 10:45 AM
          </div>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-[1px] h-8 bg-white/30"></div>
                <Navigation size={12} className="text-blue-200" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase text-blue-200">Current Progress</p>
                <p className="text-sm font-bold">Near Sakleshpur Bypass</p>
              </div>
            </div>
          </div>

          <Button className="w-full bg-white text-primary hover:bg-blue-50 border-none font-black gap-2">
            Update Location <Navigation size={18} />
          </Button>
        </div>
        <Truck className="absolute right-0 bottom-0 -mr-12 -mb-12 text-white/5" size={240} />
      </Card>

      {/* New Task Alert */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <AlertCircle size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">New Task Assigned!</p>
            <p className="text-xs text-gray-500">Pick-up from Farm A</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="p-2">
          <ArrowRight size={20} />
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-white border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Today's Earnings</p>
          <p className="text-xl font-black text-gray-900">₹1,250</p>
        </Card>
        <Card className="p-4 bg-white border border-gray-100">
          <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">KM Driven</p>
          <p className="text-xl font-black text-gray-900">84.5 KM</p>
        </Card>
      </div>
    </div>
  );
};

export default DriverDashboard;

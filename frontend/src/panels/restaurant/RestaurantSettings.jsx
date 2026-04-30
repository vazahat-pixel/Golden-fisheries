import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Button } from '../../design-system/components/Button';
import { 
  Settings, 
  User, 
  Bell, 
  Lock, 
  Store, 
  Clock, 
  Shield, 
  CreditCard,
  ChefHat
} from 'lucide-react';

const RestaurantSettings = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Restaurant Settings</h1>
        <p className="text-gray-500 font-bold text-sm md:text-base">Manage your restaurant profile, staff, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Nav - Scrollable on mobile */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x shrink-0">
          {[
            { label: 'General', icon: Store, active: true },
            { label: 'Staff Management', icon: ChefHat },
            { label: 'Notifications', icon: Bell },
            { label: 'Security', icon: Lock },
            { label: 'Payments', icon: CreditCard },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={clsx(
                'flex-none lg:w-full flex items-center gap-3 px-6 lg:px-4 py-3 rounded-xl font-black text-sm transition-all snap-start',
                item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-white lg:bg-transparent text-gray-500 hover:text-primary border border-gray-100 lg:border-none'
              )}
            >
              <item.icon size={18} />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 md:p-8">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Store className="text-primary" size={22} /> Store Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Restaurant Name</label>
                <input 
                  type="text" 
                  defaultValue="MKE Golden Seafood"
                  className="w-full bg-blue-50/50 border border-blue-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store ID</label>
                <input 
                  type="text" 
                  defaultValue="STR-5501" 
                  disabled
                  className="w-full bg-gray-100 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Store Hours</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="time" 
                    defaultValue="10:00"
                    className="flex-1 bg-blue-50/50 border border-blue-50 rounded-xl px-3 md:px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                  <span className="text-gray-400 font-bold text-xs">to</span>
                  <input 
                    type="time" 
                    defaultValue="23:00"
                    className="flex-1 bg-blue-50/50 border border-blue-50 rounded-xl px-3 md:px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Contact Number</label>
                <input 
                  type="text" 
                  defaultValue="+91 98765 43210"
                  className="w-full bg-blue-50/50 border border-blue-50 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
              <Button variant="outline" className="py-3 rounded-xl">Discard</Button>
              <Button className="py-3 rounded-xl shadow-xl shadow-primary/20">Save Changes</Button>
            </div>
          </Card>

          <Card className="p-6 md:p-8 border-l-4 border-l-amber-500">
            <h3 className="text-lg font-black text-gray-900 mb-2 flex items-center gap-2">
              <Shield className="text-amber-500" size={22} /> Advanced Controls
            </h3>
            <p className="text-sm text-gray-500 font-bold mb-6">These settings affect the global behavior of the restaurant panel.</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                <div className="pr-4">
                  <p className="text-sm font-black text-gray-900">Auto-print KOT</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wide">Print kitchen order tickets automatically.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full p-1 cursor-pointer shrink-0">
                  <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 group hover:bg-white hover:shadow-lg transition-all">
                <div className="pr-4">
                  <p className="text-sm font-black text-gray-900">Enable Takeaway Mode</p>
                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wide">Show takeaway option in POS.</p>
                </div>
                <div className="w-12 h-6 bg-gray-200 rounded-full p-1 cursor-pointer shrink-0">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RestaurantSettings;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

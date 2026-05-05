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
import { toast } from 'react-hot-toast';

const RestaurantSettings = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Restaurant <span className="text-accent-olive">Settings.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">SYSTEM PREFERENCES • OUTLET CONFIGURATION • STAFF MANAGEMENT</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sidebar Nav - Scrollable on mobile */}
        <div className="lg:col-span-1 flex lg:flex-col gap-4 overflow-x-auto pb-4 lg:pb-0 scrollbar-hide snap-x shrink-0">
          {[
            { label: 'GENERAL', icon: Store, active: true },
            { label: 'STAFF MANAGEMENT', icon: ChefHat },
            { label: 'NOTIFICATIONS', icon: Bell },
            { label: 'SECURITY', icon: Lock },
            { label: 'PAYMENTS', icon: CreditCard },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={clsx(
                'flex-none lg:w-full flex items-center gap-4 px-6 lg:px-6 py-2.5 border transition-all snap-start shadow-subtle group',
                item.active 
                  ? 'bg-black text-white border-black shadow-lg' 
                  : 'bg-white text-text-muted hover:border-black hover:text-black border-card-border'
              )}
            >
              <item.icon size={18} className={item.active ? "text-accent-olive" : "group-hover:text-black"} />
              <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-4">
          <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden">
            <div className="p-4 border-b border-card-border bg-olive-100/30 flex items-center gap-4">
              <div className="w-10 h-10 bg-black text-white flex items-center justify-center shadow-md">
                <Store size={22} className="text-accent-olive" />
              </div>
              <h3 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">
                Store Profile
              </h3>
            </div>
            
            <div className="p-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">RESTAURANT NAME</label>
                  <input 
                    type="text" 
                    defaultValue="MKE GOLDEN SEAFOOD"
                    className="w-full bg-white border border-card-border rounded-none px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-black focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">STORE ID</label>
                  <input 
                    type="text" 
                    defaultValue="STR-5501" 
                    disabled
                    className="w-full bg-olive-50 border border-card-border rounded-none px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-text-muted cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">STORE HOURS</label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="time" 
                      defaultValue="10:00"
                      className="flex-1 bg-white border border-card-border rounded-none px-6 py-2.5 text-[11px] font-black uppercase text-black focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
                    />
                    <span className="text-text-muted font-black text-[10px] uppercase tracking-widest">TO</span>
                    <input 
                      type="time" 
                      defaultValue="23:00"
                      className="flex-1 bg-white border border-card-border rounded-none px-6 py-2.5 text-[11px] font-black uppercase text-black focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">CONTACT NUMBER</label>
                  <input 
                    type="text" 
                    defaultValue="+91 98765 43210"
                    className="w-full bg-white border border-card-border rounded-none px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-black focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-card-border">
                <Button 
                  variant="outline" 
                  className="py-5 px-10 rounded-none text-[10px] font-black uppercase tracking-widest border-card-border shadow-subtle"
                  onClick={() => toast('Changes discarded')}
                >
                  DISCARD
                </Button>
                <Button 
                  className="py-5 px-10 rounded-none text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
                  onClick={() => toast.success('Settings saved successfully')}
                >
                  SAVE CHANGES
                </Button>
              </div>
            </div>
          </Card>

          <Card padding="none" className="border border-amber-500 shadow-subtle bg-amber-50/10 overflow-hidden">
            <div className="p-4 border-b border-amber-100 flex items-center gap-4 bg-amber-50/50">
              <div className="w-10 h-10 bg-amber-500 text-white flex items-center justify-center shadow-md">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-xl font-serif italic font-black text-amber-900 uppercase tracking-tight">Advanced Controls</h3>
                <p className="text-[9px] text-amber-700/70 font-black uppercase tracking-widest mt-1">GLOBAL RESTAURANT PANEL BEHAVIOR</p>
              </div>
            </div>
            
            <div className="p-10 space-y-4">
              <div 
                className="flex items-center justify-between p-4 bg-white border border-card-border shadow-subtle group hover:bg-olive-50 transition-all cursor-pointer"
                onClick={() => toast.success('KOT settings updated')}
              >
                <div className="pr-6">
                  <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">AUTO-PRINT KOT</p>
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">PRINT KITCHEN ORDER TICKETS AUTOMATICALLY FOR NEW ORDERS.</p>
                </div>
                <div className="w-14 h-7 bg-black rounded-none p-1 shrink-0 flex items-center shadow-inner border border-black">
                  <div className="w-5 h-5 bg-white rounded-none ml-auto border border-black shadow-sm"></div>
                </div>
              </div>
              
              <div 
                className="flex items-center justify-between p-4 bg-white border border-card-border shadow-subtle group hover:bg-olive-50 transition-all cursor-pointer"
                onClick={() => toast.success('Takeaway mode updated')}
              >
                <div className="pr-6">
                  <p className="text-[11px] font-black text-black uppercase tracking-widest mb-1">ENABLE TAKEAWAY MODE</p>
                  <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em]">SHOW TAKEAWAY OPTION IN POS TERMINAL.</p>
                </div>
                <div className="w-14 h-7 bg-olive-100 rounded-none p-1 shrink-0 flex items-center shadow-inner border border-card-border">
                  <div className="w-5 h-5 bg-white rounded-none border border-card-border shadow-sm"></div>
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

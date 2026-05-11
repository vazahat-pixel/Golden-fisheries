import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle2, ChefHat, 
  AlertCircle, Utensils, User, MessageSquare,
  Activity, Navigation, Timer, Check
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { toast } from 'react-hot-toast';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';

const RestaurantKitchen = () => {
  const navigate = useNavigate();
  const { kots, updateKOTItemStatus } = useRestaurantStore();

  const activeKots = kots.filter(kot => kot.status === 'active');

  const handleStatusUpdate = (kotId, itemId, currentStatus) => {
    let nextStatus = 'preparing';
    if (currentStatus === 'preparing') nextStatus = 'ready';
    else if (currentStatus === 'ready') nextStatus = 'delivered';
    
    updateKOTItemStatus(kotId, itemId, nextStatus);
    toast.success(`Item status updated to ${nextStatus}`, {
      icon: nextStatus === 'ready' ? '🔔' : '✅'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparing': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'ready': return 'text-emerald-600 bg-emerald-50 border-emerald-100 animate-pulse';
      case 'delivered': return 'text-slate-400 bg-slate-50 border-slate-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-6">
      {/* Tactical Kitchen Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-card-border hover:bg-slate-50 rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
                Kitchen <span className="text-accent-olive">Ops.</span>
              </h1>
              <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">LIVE-FEED</span>
              </div>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">REAL-TIME PRODUCTION QUEUE • STATION MONITORING</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-5 py-3 border border-card-border text-left min-w-[120px]">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ACTIVE KOT</p>
            <p className="text-lg font-black text-black leading-none">{activeKots.length}</p>
          </div>
          <div className="bg-black text-white px-5 py-3 border border-black text-left min-w-[120px] shadow-lg">
            <p className="text-[8px] font-black text-white/40 uppercase tracking-widest mb-0.5">AVG TIME</p>
            <p className="text-lg font-black text-accent-olive leading-none font-serif italic">14:20 M</p>
          </div>
        </div>
      </header>

      {activeKots.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center opacity-20 border-2 border-dashed border-slate-200">
          <Utensils size={64} className="mb-4 text-slate-400" />
          <h2 className="text-xl font-black uppercase tracking-[0.3em] italic">No Active Tickets</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest mt-2">All stations currently clear</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          {activeKots.map((kot) => (
            <Card key={kot.id} padding="none" className="bg-white border border-card-border shadow-md flex flex-col hover:border-accent-olive transition-all group overflow-hidden">
              {/* Ticket Header */}
              <div className="p-4 bg-slate-50/50 border-b border-card-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black text-white flex items-center justify-center text-sm font-black italic font-serif">
                    {kot.tableLabel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <p className="text-[10px] font-black text-black uppercase tracking-tight leading-none">{kot.id}</p>
                       <Badge variant="secondary" className="text-[6px] font-black px-1.5 h-3 border-none bg-slate-200">{kot.orderType}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={10} className="text-slate-400" />
                       <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                         IN: {new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-1.5 justify-end">
                      <User size={10} className="text-accent-olive" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{kot.staffName.split(' ')[0]}</span>
                   </div>
                   <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Captain Assigned</p>
                </div>
              </div>

              {/* Items List */}
              <div className="p-4 flex-1 space-y-3 bg-white">
                {kot.items.map((item) => (
                  <div key={item.id} className="relative">
                    <button
                      onClick={() => handleStatusUpdate(kot.id, item.id, item.kotStatus)}
                      className={`w-full flex items-center justify-between p-3 border transition-all active:scale-[0.98] ${getStatusColor(item.kotStatus)}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/50 flex items-center justify-center text-lg shadow-sm">
                           {item.image}
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-tight leading-none">{item.name}</p>
                          <p className="text-[8px] font-bold opacity-60 mt-0.5">QUANTITY: {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5">
                           {item.kotStatus === 'preparing' && <Timer size={12} className="text-amber-500 animate-spin [animation-duration:3s]" />}
                           {item.kotStatus === 'ready' && <AlertCircle size={12} className="text-emerald-500" />}
                           {item.kotStatus === 'delivered' && <Check size={12} className="text-slate-300" />}
                           <span className="text-[7px] font-black uppercase tracking-widest">{item.kotStatus}</span>
                        </div>
                      </div>
                    </button>
                    {item.notes && (
                      <div className="mt-1.5 flex items-start gap-2 px-2 py-1.5 bg-amber-50/50 border-l-2 border-amber-500/30">
                        <MessageSquare size={10} className="text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-[9px] font-bold text-amber-900/60 uppercase tracking-tight italic leading-tight">"{item.notes}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Ticket Footer / General Notes */}
              {kot.notes ? (
                <div className="px-4 pb-4 pt-1">
                   <div className="bg-accent-olive/5 border border-accent-olive/10 p-2.5 flex gap-2.5">
                      <AlertCircle size={12} className="text-accent-olive shrink-0 mt-0.5" />
                      <p className="text-[9px] text-accent-olive font-black uppercase tracking-tight leading-snug">Note: {kot.notes}</p>
                   </div>
                </div>
              ) : (
                <div className="px-4 pb-4">
                   <div className="h-[1px] bg-slate-100 w-full mb-3" />
                   <div className="flex justify-between items-center opacity-40">
                      <p className="text-[7px] font-black uppercase tracking-widest italic">GF_SYSTEM // KOT_{kot.id.split('-')[1]}</p>
                      <Navigation size={10} />
                   </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
      
      {/* Floating Tactical Footer */}
      <div className="fixed bottom-6 right-6 z-50">
         <Button className="h-12 w-12 rounded-full bg-black text-white border-none shadow-2xl flex items-center justify-center group active:scale-95 transition-all">
            <Activity size={20} className="group-hover:text-accent-olive transition-colors" />
         </Button>
      </div>
    </div>
  );
};

export default RestaurantKitchen;

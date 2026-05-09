import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Clock, CheckCircle2, ChefHat, 
  AlertCircle, Utensils, Hash, User, MessageSquare
} from 'lucide-react';
import { useRestaurantStore } from '../../store/restaurantStore';
import { toast } from 'react-hot-toast';

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

  const getStatusStyle = (status) => {
    switch (status) {
      case 'preparing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ready': return 'bg-emerald-100 text-emerald-700 border-emerald-200 animate-pulse';
      case 'delivered': return 'bg-gray-100 text-gray-400 border-gray-200';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B09] text-white p-6 font-sans">
      <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              <ChefHat size={32} className="text-[#C5A021]" />
              Kitchen Live Queue
            </h1>
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]">Golden Fisheries • Real-time Monitoring</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Active KOTs</p>
            <p className="text-xl font-black text-[#C5A021]">{activeKots.length}</p>
          </div>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase mb-1">Server Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
              <p className="text-sm font-black text-emerald-500 uppercase">Online</p>
            </div>
          </div>
        </div>
      </header>

      {activeKots.length === 0 ? (
        <div className="h-[60vh] flex flex-col items-center justify-center opacity-20">
          <Utensils size={80} className="mb-6" />
          <h2 className="text-2xl font-black uppercase tracking-widest">No Active Orders</h2>
          <p className="text-sm font-bold uppercase tracking-widest mt-2">Kitchen is currently clear</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {activeKots.map((kot) => (
            <div key={kot.id} className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden flex flex-col hover:border-white/20 transition-all">
              <div className="p-6 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-[#C5A021] text-black flex items-center justify-center rounded-2xl text-xl font-black">
                    {kot.tableLabel}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{kot.orderType}</p>
                    <p className="text-sm font-black uppercase tracking-tight">{kot.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-white/60 mb-1">
                    <Clock size={12} />
                    <span className="text-[10px] font-black">{new Date(kot.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <User size={12} />
                    <span className="text-[10px] font-black uppercase">{kot.staffName}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 flex-1 space-y-4">
                {kot.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <button
                      onClick={() => handleStatusUpdate(kot.id, item.id, item.kotStatus)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${getStatusStyle(item.kotStatus)}`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{item.image}</span>
                        <div className="text-left">
                          <p className="text-xs font-black uppercase tracking-tight leading-tight">{item.name}</p>
                          <p className="text-[9px] font-bold opacity-60">QTY: {item.qty}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {item.kotStatus === 'preparing' && <Clock size={14} className="text-amber-500" />}
                        {item.kotStatus === 'ready' && <AlertCircle size={14} className="text-emerald-500" />}
                        {item.kotStatus === 'delivered' && <CheckCircle2 size={14} className="text-gray-400" />}
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1">{item.kotStatus}</span>
                      </div>
                    </button>
                    {item.notes && (
                      <div className="mt-2 flex items-start gap-2 px-2">
                        <MessageSquare size={10} className="text-[#C5A021] mt-0.5" />
                        <p className="text-[9px] font-medium text-white/60 italic">"{item.notes}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {kot.notes && (
                <div className="px-6 pb-6 pt-2">
                   <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
                      <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-200/80 font-medium italic">General Note: {kot.notes}</p>
                   </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantKitchen;

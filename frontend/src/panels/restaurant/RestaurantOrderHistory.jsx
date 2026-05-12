import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Printer, Search, Filter, Clock, ChevronRight, History, ArrowLeft, Download, Eye, FileText, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantOrderHistory = () => {
  const navigate = useNavigate();
  const { orders } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-8">
      {/* Tactical Ledger Header */}
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
                Order <span className="text-accent-olive">Ledger.</span>
              </h1>
              <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] font-black uppercase">{orders.length} RECORDS</Badge>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">TRANSACTION ARCHIVE • FINANCIAL AUDIT LOG</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button 
            variant="outline"
            className="h-11 px-6 text-[10px] font-black uppercase tracking-widest border-card-border shadow-sm"
           >
             <Calendar size={14} className="mr-2 text-accent-olive" /> FILTER BY DATE
           </Button>
           <Button 
            className="h-11 px-6 text-[10px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 transition-all"
            onClick={() => toast.success('Initializing data export...')}
           >
             <Download size={14} className="mr-2" /> EXPORT MANIFEST
           </Button>
        </div>
      </header>

      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Search Matrix */}
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="QUERY BY ORDER_ID OR SKU_NAME..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-card-border py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none transition-all shadow-sm"
            />
          </div>
          <Button variant="outline" className="h-14 px-8 border-card-border text-[10px] font-black uppercase tracking-widest bg-white">
            <Filter size={14} className="mr-2" /> RECONCILE
          </Button>
        </div>
        
        {/* Tactical Record List */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <Card key={order.id} padding="none" className="bg-white border border-card-border group hover:border-accent-olive transition-all shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                <div className="flex items-center flex-1">
                  {/* Status Indicator Bar */}
                  <div className={`w-1.5 self-stretch ${order.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  
                  <div className="p-5 flex items-center gap-6 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-slate-50 border border-card-border flex items-center justify-center shrink-0 group-hover:bg-accent-olive group-hover:text-white transition-all duration-300">
                       <FileText size={20} className={order.status === 'Active' ? 'animate-pulse' : ''} />
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1.5">
                        <h3 className="font-black text-black text-sm tracking-tight uppercase italic font-serif">
                          #{order.id.slice(-12)}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-400 text-[7px] font-black border-none px-2 h-4 uppercase">{order.paymentMethod}</Badge>
                        {order.status === 'Active' && (
                           <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 border border-emerald-100">
                              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
                              <span className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">LIVE</span>
                           </div>
                        )}
                      </div>
                      <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase line-clamp-1 mb-2">
                        {order.items.map(i => `${i.name} [x${i.qty}]`).join(' • ')}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-slate-400">
                           <Clock size={10} />
                           <span className="text-[8px] font-black uppercase tracking-widest">{new Date(order.timestamp).toLocaleString().toUpperCase()}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[8px] text-accent-olive font-black uppercase tracking-[0.2em]">{order.status.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8 p-5 lg:pl-0 border-t lg:border-t-0 border-slate-50 bg-slate-50/30 lg:bg-transparent">
                  <div className="text-right min-w-[100px]">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">SETTLEMENT</p>
                    <p className="text-xl font-serif italic font-black text-black tracking-tight leading-none">₹{order.total.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-1.5">
                     <button className="w-9 h-9 border border-card-border bg-white text-slate-300 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center">
                        <Printer size={14} />
                     </button>
                     <button className="w-9 h-9 border border-card-border bg-white text-slate-300 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center">
                        <ChevronRight size={14} />
                     </button>
                  </div>
                </div>
              </div>
            </Card>
          )) : (
            <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 opacity-20 grayscale grayscale-0">
               <History size={64} className="mb-4 text-slate-300" />
               <h3 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">Zero Transactions.</h3>
               <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-2">No archive records found for current query</p>
            </div>
          )}
        </div>
        
        {/* Pagination Signal */}
        {filteredOrders.length > 0 && (
          <div className="flex flex-col items-center gap-4 pt-10 pb-20">
             <div className="h-px w-24 bg-slate-200" />
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] italic">End of Manifest // Secure Ledger Archive</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrderHistory;

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Printer, Search, Filter, Clock, ChevronRight, History } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const RestaurantOrderHistory = () => {
  const { orders } = useRestaurantStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-[#6B7550] selection:text-white animate-in fade-in duration-300">
      {/* Simple Header */}
      <div className="bg-white border-b border-gray-200 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight uppercase">Order History</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction Ledger • {orders.length} Records Found</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="text-[10px] font-bold border-gray-200 uppercase tracking-widest px-6 py-2 bg-white text-gray-900 hover:bg-gray-50 transition-all"
            >
              <Calendar size={14} className="mr-2" /> Select Date
            </Button>
            <Button 
              className="text-[10px] font-bold uppercase tracking-widest px-6 py-2 bg-[#6B7550] text-white hover:bg-black border-none shadow-sm transition-all"
              onClick={() => toast.success('Exporting ledger...')}
            >
              <Printer size={14} className="mr-2" /> Export
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Search Matrix */}
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={14} />
            <input 
              type="text" 
              placeholder="Search by ID or Item name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 py-3 pl-12 pr-6 text-[10px] font-bold uppercase tracking-widest focus:border-[#6B7550] outline-none transition-all shadow-sm"
            />
          </div>
          <Button 
            variant="outline" 
            className="text-[10px] font-bold border-gray-200 uppercase tracking-widest px-8 bg-white text-gray-600 hover:text-gray-900 shadow-sm"
          >
            <Filter size={14} className="mr-2" /> Filter
          </Button>
        </div>
        
        {/* Record List */}
        <div className="space-y-3">
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <div key={order.id} className="bg-white border border-gray-200 p-4 md:p-6 group hover:border-[#6B7550] transition-all shadow-sm relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-[#6B7550]/10 group-hover:text-[#6B7550] transition-all">
                     <Clock size={18} className={order.status === 'Active' ? 'animate-pulse' : ''} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-bold text-gray-900 text-sm tracking-tight uppercase">
                        {order.id.slice(0, 12)}
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 border border-gray-200">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold tracking-tight uppercase line-clamp-1 mb-2">
                      {order.items.map(i => `${i.name} (x${i.qty})`).join(' • ')}
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(order.timestamp).toLocaleString().toUpperCase()}
                      </p>
                      <div className="w-1 h-1 rounded-full bg-gray-200" />
                      <p className="text-[8px] text-[#6B7550] font-bold uppercase tracking-widest">{order.status}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between lg:justify-end gap-10 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-100">
                  <div className="text-right">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                    <p className="text-xl font-black text-gray-900 tracking-tight">₹{order.total.toLocaleString()}</p>
                  </div>
                  <button className="w-10 h-10 bg-gray-50 text-gray-300 hover:bg-black hover:text-white transition-all flex items-center justify-center border border-gray-100">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center opacity-20">
               <History size={64} className="mx-auto mb-4 text-gray-200" />
               <p className="text-[12px] font-bold uppercase tracking-widest text-gray-400">
                 No transactions found
               </p>
            </div>
          )}
        </div>
        
        {/* Load More */}
        {filteredOrders.length > 5 && (
          <div className="flex justify-center pt-8">
            <button className="text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-all">
              Load more transactions
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantOrderHistory;

import React from 'react';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { Button } from '../../design-system/components/Button';
import { 
  History, 
  Search, 
  Calendar, 
  Clock, 
  Utensils, 
  Printer,
  ChevronRight,
  Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const mockOrders = [
  { id: 'ORD-5501', table: 'Table 4', items: 'Fish Thali (2), King Fish Fry (1)', amount: '₹780', time: '10 mins ago', status: 'completed' },
  { id: 'ORD-5502', table: 'Table 2', items: 'Prawn Ghee Roast (1), Rice (2)', amount: '₹470', time: '25 mins ago', status: 'completed' },
  { id: 'ORD-5503', table: 'Takeaway', items: 'Fish Thali (1)', amount: '₹180', time: '40 mins ago', status: 'cancelled' },
  { id: 'ORD-5504', table: 'Table 8', items: 'Chicken 65 (2), Lime Juice (2)', amount: '₹520', time: '1 hr ago', status: 'completed' },
];

const RestaurantOrderHistory = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Order <span className="text-accent-olive">History.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">PAST RESTAURANT ORDERS • SALES LOGS • INVOICES</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="gap-3 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle active:scale-95 transition-all"
          >
            <Calendar size={14} /> TODAY
          </Button>
          <Button 
            className="gap-3 text-[10px] font-black uppercase tracking-widest px-6 shadow-md active:scale-95 transition-all"
            onClick={() => toast.success('Printing Daily Report...')}
          >
            <Printer size={14} /> DAILY REPORT
          </Button>
        </div>
      </div>

      <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden">
        <div className="p-4 border-b border-card-border flex flex-col md:flex-row gap-4 bg-olive-100/30">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input 
              type="text" 
              placeholder="SEARCH BY ORDER ID OR TABLE..." 
              className="w-full bg-white border border-card-border rounded-none py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none shadow-subtle transition-all"
            />
          </div>
          <Button 
            variant="outline" 
            className="gap-3 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle bg-white"
            onClick={() => toast('Filters coming soon')}
          >
            <Filter size={14} /> FILTERS
          </Button>
        </div>
        
        <div className="divide-y divide-olive-100">
          {mockOrders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-olive-50 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 border flex items-center justify-center font-black shadow-md shrink-0 transition-transform group-hover:scale-105 ${
                  order.status === 'completed' ? 'bg-black text-white border-black' : 'bg-red-600 text-white border-red-600'
                }`}>
                  {order.table === 'Takeaway' ? '🥡' : order.table.split(' ')[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="font-serif italic font-black text-black text-xl tracking-tight uppercase">{order.id}</h3>
                    <span className="text-text-muted/30 hidden xs:inline">•</span>
                    <p className="text-[10px] text-accent-olive font-black uppercase tracking-[0.3em]">{order.table}</p>
                  </div>
                  <p className="text-sm text-text-muted font-black tracking-widest uppercase line-clamp-1 mb-2">{order.items}</p>
                  <div className="flex items-center gap-4 text-[9px] text-text-muted font-black uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={12} className="text-accent-olive" /> {order.time}</span>
                    <span className="flex items-center gap-2 hidden xs:flex"><Utensils size={12} className="text-accent-olive" /> DINE-IN</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-10 border-t sm:border-t-0 pt-4 sm:pt-0 border-card-border">
                <div className="text-left sm:text-right">
                  <p className="text-xl font-serif italic font-black text-black tracking-tight mb-2">{order.amount}</p>
                  <Badge variant={order.status === 'completed' ? 'success' : 'danger'} className="uppercase text-[9px] font-black border border-card-border shadow-sm px-4 py-1.5">
                    {order.status}
                  </Badge>
                </div>
                <button className="p-3 bg-white border border-card-border shadow-subtle text-text-muted hover:bg-black hover:text-white hover:border-black rounded-none transition-all active:scale-95">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="text-center pt-4">
        <button className="text-[11px] font-black text-accent-olive hover:text-black tracking-[0.3em] uppercase transition-colors">
          LOAD MORE HISTORY
        </button>
      </div>
    </div>
  );
};

export default RestaurantOrderHistory;

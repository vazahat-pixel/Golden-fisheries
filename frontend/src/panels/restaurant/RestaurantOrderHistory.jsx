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

const mockOrders = [
  { id: 'ORD-5501', table: 'Table 4', items: 'Fish Thali (2), King Fish Fry (1)', amount: '₹780', time: '10 mins ago', status: 'completed' },
  { id: 'ORD-5502', table: 'Table 2', items: 'Prawn Ghee Roast (1), Rice (2)', amount: '₹470', time: '25 mins ago', status: 'completed' },
  { id: 'ORD-5503', table: 'Takeaway', items: 'Fish Thali (1)', amount: '₹180', time: '40 mins ago', status: 'cancelled' },
  { id: 'ORD-5504', table: 'Table 8', items: 'Chicken 65 (2), Lime Juice (2)', amount: '₹520', time: '1 hr ago', status: 'completed' },
];

const RestaurantOrderHistory = () => {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-0">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Order History</h1>
          <p className="text-gray-500 font-bold text-sm md:text-base">View and manage past restaurant orders and invoices.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2 py-3 rounded-xl border-blue-100">
            <Calendar size={18} /> Today
          </Button>
          <Button className="flex-1 md:flex-none gap-2 py-3 rounded-xl shadow-xl shadow-primary/20">
            <Printer size={18} /> <span className="hidden xs:inline">Daily Report</span>
          </Button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Order ID or Table..." 
              className="w-full bg-white border border-blue-100 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary outline-none shadow-sm"
            />
          </div>
          <Button variant="outline" className="gap-2 py-3 rounded-xl border-blue-100">
            <Filter size={16} /> Filters
          </Button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {mockOrders.map((order) => (
            <div key={order.id} className="p-4 md:p-6 hover:bg-blue-50/20 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 md:gap-5">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black shadow-sm shrink-0 ${
                  order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {order.table === 'Takeaway' ? '🥡' : order.table.split(' ')[1]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-black text-gray-900 text-sm md:text-base">{order.id}</h3>
                    <span className="text-gray-300 hidden xs:inline">•</span>
                    <p className="text-[10px] md:text-xs text-primary font-black uppercase tracking-wider">{order.table}</p>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 font-bold line-clamp-1">{order.items}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Clock size={12} /> {order.time}</span>
                    <span className="flex items-center gap-1 hidden xs:flex"><Utensils size={12} /> Dine-in</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-8 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                <div className="text-left sm:text-right">
                  <p className="text-lg md:text-xl font-black text-gray-900 leading-none mb-1">{order.amount}</p>
                  <Badge variant={order.status === 'completed' ? 'success' : 'danger'} className="uppercase text-[9px] md:text-[10px]">
                    {order.status}
                  </Badge>
                </div>
                <button className="p-2 bg-gray-50 text-gray-400 group-hover:text-primary group-hover:bg-blue-50 rounded-xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      <div className="text-center">
        <button className="text-sm font-bold text-primary hover:underline">Load more history</button>
      </div>
    </div>
  );
};

export default RestaurantOrderHistory;

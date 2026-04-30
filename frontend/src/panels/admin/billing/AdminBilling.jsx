import React from 'react';
import { Card } from '../../../design-system/components/Card';
import { Badge } from '../../../design-system/components/Badge';
import { Button } from '../../../design-system/components/Button';
import { StatCard } from '../../../design-system/components/StatCard';
import { 
  FileText, 
  IndianRupee, 
  ArrowUpRight, 
  Clock, 
  Search,
  Download,
  Filter,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';

const mockInvoices = [
  { id: 'INV-1001', client: 'Golden Restaurant', type: 'Sales', amount: '₹12,450', date: '30 Apr 2026', status: 'paid' },
  { id: 'INV-1002', client: 'Fish Mall Retail', type: 'Sales', amount: '₹8,900', date: '30 Apr 2026', status: 'pending' },
  { id: 'INV-1003', client: 'Deep Sea Farms', type: 'Procurement', amount: '₹45,000', date: '29 Apr 2026', status: 'paid' },
  { id: 'INV-1004', client: 'Blue Water Hotel', type: 'Sales', amount: '₹18,200', date: '29 Apr 2026', status: 'overdue' },
  { id: 'INV-1005', client: 'Coastal Cuisines', type: 'Sales', amount: '₹6,750', date: '28 Apr 2026', status: 'paid' },
];

const AdminBilling = () => {
  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-500 font-medium">Oversee all sales, procurement invoices, and payment statuses.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Download size={18} /> Export GST Report
          </Button>
          <Button className="gap-2">
            <FileText size={18} /> Create Custom Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Receivables" value="₹2.45L" icon={IndianRupee} trend="+12% from last month" />
        <StatCard title="Total Payables" value="₹1.10L" icon={IndianRupee} variant="warning" />
        <StatCard title="Invoices Today" value="14" icon={FileText} />
        <StatCard title="Overdue" value="3" icon={Clock} variant="danger" />
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4 bg-blue-50/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by invoice ID or client..." 
              className="w-full bg-white border border-blue-100 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary shadow-sm outline-none transition-all"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Filter size={16} /> Filters
            </Button>
            <Button variant="outline" size="sm">Today</Button>
            <Button variant="outline" size="sm">This Month</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice / Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Client / Entity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white group-hover:text-primary transition-all">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{inv.id}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">{inv.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">{inv.client}</p>
                    <p className="text-xs text-gray-500 font-medium tracking-tight">Tax ID: MKE-{inv.id.split('-')[1]}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'text-[10px] font-black uppercase px-2 py-1 rounded-md border',
                      inv.type === 'Sales' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                    )}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-black text-gray-900">{inv.amount}</p>
                    <p className="text-[10px] text-gray-400 font-bold">Incl. 5% GST</p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      inv.status === 'paid' ? 'success' : 
                      inv.status === 'pending' ? 'warning' : 'danger'
                    }>
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-primary hover:bg-blue-50 rounded-lg">
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <p className="text-sm text-gray-500 font-medium">Showing 5 of 142 invoices</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminBilling;

function clsx(...classes) {
  return classes.filter(Boolean).join(' ');
}

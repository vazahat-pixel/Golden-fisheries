import React, { useState } from 'react';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Button } from '../../design-system/components/Button';
import { Badge } from '../../design-system/components/Badge';
import { 
  ClipboardList, 
  Plus, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Scale, 
  Search,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const FishMallStock = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const currentStock = [
    { id: 1, name: 'Rohu (Large)', category: 'Freshwater', quantity: 450, unit: 'KG', lastUpdated: '2 hours ago', status: 'In Stock' },
    { id: 2, name: 'Catla', category: 'Freshwater', quantity: 320, unit: 'KG', lastUpdated: '1 hour ago', status: 'In Stock' },
    { id: 3, name: 'Sea Bass', category: 'Sea Fish', quantity: 85, unit: 'KG', lastUpdated: '4 hours ago', status: 'Low Stock' },
    { id: 4, name: 'Tiger Prawns', category: 'Shellfish', quantity: 120, unit: 'KG', lastUpdated: '30 mins ago', status: 'In Stock' },
    { id: 5, name: 'Pomfret (Medium)', category: 'Sea Fish', quantity: 15, unit: 'KG', lastUpdated: '5 hours ago', status: 'Critical' },
  ];

  const recentTransactions = [
    { id: 1, type: 'Inflow', product: 'Rohu (Large)', quantity: 200, unit: 'KG', source: 'Ramu Farms', time: '10:30 AM', status: 'Completed' },
    { id: 2, type: 'Outflow', product: 'Catla', quantity: 45, unit: 'KG', source: 'Retail Sale', time: '11:15 AM', status: 'Completed' },
    { id: 3, type: 'Inflow', product: 'Tiger Prawns', quantity: 50, unit: 'KG', source: 'Coastal Supplies', time: '12:00 PM', status: 'Completed' },
    { id: 4, type: 'Outflow', product: 'Sea Bass', quantity: 12, unit: 'KG', source: 'Restaurant Transfer', time: '01:45 PM', status: 'Completed' },
  ];

  return (
    <div className="pb-10 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Stock Management</h1>
          <p className="text-gray-500 font-medium text-sm">Track inflow, outflow and live inventory levels</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" className="gap-2 text-xs flex-1 sm:flex-none">
            <History size={16} /> <span className="hidden xs:inline">Export Logs</span>
          </Button>
          <Button className="gap-2 bg-primary shadow-lg shadow-primary/20 text-xs flex-1 sm:flex-none">
            <Plus size={16} /> Record Inflow
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard title="Total Stock" value="990 KG" icon={ClipboardList} trend="+85 KG today" />
        <StatCard title="Daily Inflow" value="250 KG" icon={ArrowDownCircle} variant="primary" />
        <StatCard title="Daily Outflow" value="57 KG" icon={ArrowUpCircle} variant="warning" />
        <StatCard title="Critical Items" value="2" icon={AlertCircle} variant="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-gray-100 bg-gray-50/30 overflow-x-auto scrollbar-hide">
              <div className="flex min-w-max">
                <button 
                  onClick={() => setActiveTab('inventory')}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'inventory' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Live Inventory
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-6 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'history' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                >
                  Transaction History
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-sm"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="secondary" size="icon" className="flex-1 sm:flex-none">
                  <Scale size={20} />
                </Button>
                <Button variant="secondary" className="flex-1 sm:flex-none sm:hidden">Filter</Button>
              </div>
            </div>

            <div className="p-4 md:p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Info</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Available Stock</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Inventory Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Last Movement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeTab === 'inventory' ? (
                      currentStock.map((item) => (
                        <tr key={item.id} className="hover:bg-blue-50/10 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="text-base font-black text-gray-900">{item.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xl font-black text-primary tracking-tighter">{item.quantity}</span>
                              <span className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <Badge 
                              variant={
                                item.status === 'Critical' ? 'danger' : 
                                item.status === 'Low Stock' ? 'warning' : 'success'
                              }
                              className="font-black uppercase tracking-widest text-[9px] px-3"
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span className="text-sm font-black text-gray-500">{item.lastUpdated}</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      recentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-blue-50/10 transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${tx.type === 'Inflow' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                {tx.type === 'Inflow' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                              </div>
                              <div className="min-w-0">
                                <p className="font-black text-gray-900">{tx.product}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.source}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <p className={`text-lg font-black tracking-tighter ${tx.type === 'Inflow' ? 'text-green-600' : 'text-orange-600'}`}>
                              {tx.type === 'Inflow' ? '+' : '-'}{tx.quantity} {tx.unit}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                              {tx.status}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-right text-sm font-black text-gray-500">
                            {tx.time}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {activeTab === 'inventory' ? (
                  currentStock.map((item) => (
                    <div key={item.id} className="p-5 rounded-[28px] bg-gray-50 border border-gray-100 flex justify-between items-center">
                      <div>
                        <p className="font-black text-gray-900 leading-tight">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{item.category}</p>
                        <Badge 
                          variant={item.status === 'Critical' ? 'danger' : item.status === 'Low Stock' ? 'warning' : 'success'} 
                          className="mt-3 text-[8px] font-black uppercase tracking-widest"
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary tracking-tighter">{item.quantity}</p>
                        <p className="text-[10px] font-black text-gray-400 uppercase">{item.unit}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  recentTransactions.map((tx) => (
                    <div key={tx.id} className="p-5 rounded-[28px] bg-gray-50 border border-gray-100 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tx.type === 'Inflow' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                            {tx.type === 'Inflow' ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 truncate">{tx.product}</p>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">{tx.time} • {tx.source}</p>
                          </div>
                        </div>
                        <p className={`text-base font-black tracking-tighter ${tx.type === 'Inflow' ? 'text-green-600' : 'text-orange-600'}`}>
                          {tx.type === 'Inflow' ? '+' : '-'}{tx.quantity} {tx.unit}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-primary to-blue-800 text-white p-6 md:p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Plus className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Inflow</h3>
              <p className="text-blue-100 text-sm mb-6">Scan QR or manually enter new arrival details.</p>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-blue-200">Select Product</label>
                  <select className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/30 appearance-none text-white">
                    <option className="text-gray-900">Rohu (Large)</option>
                    <option className="text-gray-900">Catla</option>
                    <option className="text-gray-900">Sea Bass</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-blue-200">Weight (KG)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/30 placeholder:text-white/40 text-white"
                  />
                </div>
                <Button className="w-full bg-white text-primary border-none font-black mt-2 shadow-xl hover:scale-[1.02] transition-transform py-4 rounded-xl">
                  Confirm Arrival
                </Button>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          </Card>

          <Card className="p-4 md:p-6">
            <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" /> Low Stock Alerts
            </h3>
            <div className="space-y-4">
              {[
                { name: 'Pomfret', qty: '15 KG', status: 'Critical' },
                { name: 'Sea Bass', qty: '85 KG', status: 'Warning' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-bold text-gray-900">{item.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{item.qty} Remaining</p>
                  </div>
                  <Badge variant={item.status === 'Critical' ? 'danger' : 'warning'} className="text-[8px] md:text-[9px]">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="secondary" className="w-full mt-6 text-xs font-bold py-3 rounded-xl">
              View All Alerts
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FishMallStock;

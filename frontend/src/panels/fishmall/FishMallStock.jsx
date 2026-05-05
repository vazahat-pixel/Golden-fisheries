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
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const FishMallStock = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  
  const currentStock = [
    { id: 1, name: 'ROHU (LARGE)', category: 'FRESHWATER', quantity: 450, unit: 'KG', lastUpdated: '2 HOURS AGO', status: 'In Stock' },
    { id: 2, name: 'CATLA', category: 'FRESHWATER', quantity: 320, unit: 'KG', lastUpdated: '1 HOUR AGO', status: 'In Stock' },
    { id: 3, name: 'SEA BASS', category: 'SEA FISH', quantity: 85, unit: 'KG', lastUpdated: '4 HOURS AGO', status: 'Low Stock' },
    { id: 4, name: 'TIGER PRAWNS', category: 'SHELLFISH', quantity: 120, unit: 'KG', lastUpdated: '30 MINS AGO', status: 'In Stock' },
    { id: 5, name: 'POMFRET (MEDIUM)', category: 'SEA FISH', quantity: 15, unit: 'KG', lastUpdated: '5 HOURS AGO', status: 'Critical' },
  ];

  const recentTransactions = [
    { id: 1, type: 'Inflow', product: 'ROHU (LARGE)', quantity: 200, unit: 'KG', source: 'RAMU FARMS', time: '10:30 AM', status: 'Completed' },
    { id: 2, type: 'Outflow', product: 'CATLA', quantity: 45, unit: 'KG', source: 'RETAIL SALE', time: '11:15 AM', status: 'Completed' },
    { id: 3, type: 'Inflow', product: 'TIGER PRAWNS', quantity: 50, unit: 'KG', source: 'COASTAL SUPPLIES', time: '12:00 PM', status: 'Completed' },
    { id: 4, type: 'Outflow', product: 'SEA BASS', quantity: 12, unit: 'KG', source: 'RESTAURANT TRANSFER', time: '01:45 PM', status: 'Completed' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-serif italic font-black text-black tracking-tight">Stock <span className="text-accent-olive">Management.</span></h1>
          <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] mt-3">TRACK INFLOW • OUTFLOW • LIVE INVENTORY LEVELS</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            className="gap-3 text-[10px] font-black border-card-border uppercase tracking-widest px-6 shadow-subtle"
            onClick={() => toast.success('Exporting logs...')}
          >
            <History size={14} /> EXPORT LOGS
          </Button>
          <Button 
            className="gap-3 text-[10px] font-black uppercase tracking-widest px-6 shadow-md"
            onClick={() => toast.success('Open record inflow modal')}
          >
            <Plus size={14} /> RECORD INFLOW
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="TOTAL STOCK" 
          value="990 KG" 
          icon={ClipboardList} 
          trend="+85 KG TODAY" 
          trendType="up" 
        />
        <StatCard 
          title="DAILY INFLOW" 
          value="250 KG" 
          icon={ArrowDownCircle} 
          trend="STABLE"
          trendType="up"
        />
        <StatCard 
          title="DAILY OUTFLOW" 
          value="57 KG" 
          icon={ArrowUpCircle} 
          trend="RETAIL PEAK"
          trendType="up"
        />
        <StatCard 
          title="CRITICAL ITEMS" 
          value="2" 
          icon={AlertCircle} 
          trend="ACTION NEEDED"
          trendType="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card padding="none" className="border border-card-border shadow-subtle bg-white overflow-hidden">
            <div className="border-b border-card-border bg-white flex">
              <button 
                onClick={() => setActiveTab('inventory')}
                className={`px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-black text-white shadow-lg' : 'text-text-muted hover:text-black hover:bg-olive-50'}`}
              >
                LIVE INVENTORY
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-10 py-6 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-black text-white shadow-lg' : 'text-text-muted hover:text-black hover:bg-olive-50'}`}
              >
                TRANSACTION HISTORY
              </button>
            </div>

            <div className="p-4 border-b border-card-border bg-white flex flex-col md:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH PRODUCTS..."
                  className="w-full pl-12 pr-6 py-2.5 bg-white border border-card-border rounded-none outline-none focus:ring-1 focus:ring-accent-olive transition-all font-black text-[10px] uppercase tracking-widest shadow-subtle"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="w-full md:w-10 h-10 border-card-border"
                onClick={() => toast.success('Syncing scales...')}
              >
                <Scale size={20} />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-olive-100/50">
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Product Info</th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-center">Available Stock</th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Inventory Status</th>
                    <th className="px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted text-right">Last Movement</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t border-card-border">
                  {activeTab === 'inventory' ? (
                    currentStock.map((item) => (
                      <tr key={item.id} className="hover:bg-olive-50 transition-colors group">
                        <td className="px-6 py-2.5 border-b border-card-border">
                          <p className="text-xl font-serif italic font-black text-black uppercase tracking-tight">{item.name}</p>
                          <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-2">{item.category}</p>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-black text-black tracking-tighter">{item.quantity}</span>
                            <span className="text-[10px] font-black text-text-muted uppercase mt-1">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border">
                          <Badge 
                            variant={
                              item.status === 'Critical' ? 'danger' : 
                              item.status === 'Low Stock' ? 'warning' : 'success'
                            }
                            className="font-black uppercase tracking-widest text-[10px] px-4 py-2 shadow-sm border border-card-border"
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border text-right">
                          <span className="text-[11px] font-black text-text-muted uppercase group-hover:text-black">{item.lastUpdated}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-olive-50 transition-colors group">
                        <td className="px-6 py-2.5 border-b border-card-border">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 flex items-center justify-center shadow-sm border border-card-border ${tx.type === 'Inflow' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                              {tx.type === 'Inflow' ? <ArrowDownCircle size={20} /> : <ArrowUpCircle size={20} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-lg font-black text-black uppercase tracking-tight">{tx.product}</p>
                              <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{tx.source}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border text-center">
                          <p className={`text-xl font-serif italic font-black tracking-tighter ${tx.type === 'Inflow' ? 'text-green-600' : 'text-orange-600'}`}>
                            {tx.type === 'Inflow' ? '+' : '-'}{tx.quantity} {tx.unit}
                          </p>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border">
                          <div className="flex items-center gap-3 text-green-600 font-black text-[10px] uppercase tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            {tx.status}
                          </div>
                        </td>
                        <td className="px-6 py-2.5 border-b border-card-border text-right text-[11px] font-black text-text-muted group-hover:text-black">
                          {tx.time}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-black text-white p-4 relative overflow-hidden group border border-card-border shadow-subtle">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md">
                <Plus size={24} />
              </div>
              <h3 className="text-xl font-serif italic font-black mb-4 uppercase tracking-tight">Quick Inflow</h3>
              <p className="text-white/60 text-[11px] font-black uppercase tracking-widest mb-10 leading-relaxed">Scan QR or manually enter new arrival details.</p>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">SELECT PRODUCT</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-2.5 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-white appearance-none text-white transition-all">
                    <option className="text-black">ROHU (LARGE)</option>
                    <option className="text-black">CATLA</option>
                    <option className="text-black">SEA BASS</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">WEIGHT (KG)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/10 rounded-none px-6 py-2.5 text-[11px] font-black outline-none focus:ring-1 focus:ring-white placeholder:text-white/20 text-white transition-all"
                  />
                </div>
                <Button 
                  className="w-full bg-white text-black border-none font-black mt-4 shadow-xl hover:bg-olive-50 transition-all py-5"
                  onClick={() => toast.success('Arrival confirmed & stock updated!')}
                >
                  CONFIRM ARRIVAL
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4 border border-card-border shadow-subtle bg-white">
            <h3 className="text-[12px] font-black text-black mb-4 flex items-center gap-3 uppercase tracking-widest">
              <AlertCircle size={18} className="text-red-600" /> LOW STOCK ALERTS
            </h3>
            <div className="space-y-4">
              {[
                { name: 'POMFRET', qty: '15 KG', status: 'Critical' },
                { name: 'SEA BASS', qty: '85 KG', status: 'Warning' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-5 border border-card-border hover:bg-olive-50 transition-all cursor-pointer group shadow-sm">
                  <div>
                    <p className="text-[11px] font-black text-black uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-1">{item.qty} REMAINING</p>
                  </div>
                  <Badge variant={item.status === 'Critical' ? 'danger' : 'warning'} className="text-[8px] font-black uppercase tracking-widest border border-card-border shadow-sm">
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-8 text-[10px] font-black uppercase tracking-widest py-2.5 border-card-border hover:bg-black hover:text-white transition-all"
              onClick={() => toast.success('Opening all alerts...')}
            >
              VIEW ALL ALERTS
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FishMallStock;

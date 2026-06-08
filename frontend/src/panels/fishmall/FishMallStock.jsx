import React, { useState } from 'react';
import {
  ClipboardList,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  Package,
  Truck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFishMallStore } from '../../store/fishMallStore';
import { Button } from '../../design-system/components/Button';

const FishMallStock = () => {
  const {
    stock,
    stockLogs,
    pendingTransfers,
    fetchStock,
    fetchPendingTransfers,
    acceptTransferAsync,
    loading,
  } = useFishMallStore();
  const [acceptingId, setAcceptingId] = useState(null);

  React.useEffect(() => {
    fetchStock();
    fetchPendingTransfers();
  }, [fetchStock, fetchPendingTransfers]);

  const [activeTab, setActiveTab] = useState('inventory');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredStock = stock.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalItems = stock.filter((i) => i.qty < 50).length;

  const handleAcceptTransfer = async (transfer) => {
    const id = transfer._id || transfer.id;
    if (!id) {
      toast.error('Transfer ID missing');
      return;
    }
    setAcceptingId(id);
    try {
      await acceptTransferAsync(id, {
        status: 'ACCEPTED',
        remarks: 'Accepted via Fish Mall inventory',
      });
      toast.success(`${transfer.transferNumber} accepted — inventory updated`);
    } catch (err) {
      toast.error(err?.message || 'Accept failed');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4 animate-in fade-in duration-300 font-sans">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
            Inventory Console
            <span className="text-[8px] bg-black text-white px-1.5 py-0.5 font-black">SYNC</span>
          </h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
            Stock sirf procurement transfer accept se aata hai
          </p>
        </div>
        {pendingTransfers.length > 0 && (
          <span className="text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-full">
            {pendingTransfers.length} incoming
          </span>
        )}
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Gross Stock', value: `${totalStockKg.toFixed(1)} KG`, icon: ClipboardList, color: 'bg-[#6B7550]/10 text-[#6B7550]' },
          { label: 'Movement Logs', value: stockLogs.length, icon: History, color: 'bg-blue-50 text-blue-500' },
          { label: 'Varieties', value: stock.length, icon: Layers, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Pending Accept', value: pendingTransfers.length, icon: Truck, alert: pendingTransfers.length > 0, color: pendingTransfers.length > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 border border-gray-200 shadow-sm rounded-2xl flex items-center gap-4 group hover:border-[#6B7550] transition-all">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={16} className={stat.alert ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-base font-black tracking-tight text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 shadow-sm rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
          <div className="border-b border-gray-100 bg-gray-50/50 flex">
            {[
              { id: 'inventory', label: 'LIVE INVENTORY', icon: ClipboardList },
              { id: 'history', label: 'MOVEMENT LOGS', icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 relative ${activeTab === tab.id ? 'bg-white text-[#6B7550]' : 'text-gray-400 hover:text-gray-900'}`}
              >
                <tab.icon size={14} />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6B7550]" />}
              </button>
            ))}
          </div>

          <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center gap-4">
            <div className="relative group flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#6B7550] transition-colors" size={14} />
              <input
                type="text"
                placeholder="SEARCH REGISTRY..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 text-[10px] font-black uppercase tracking-widest outline-none focus:bg-white focus:border-[#6B7550] transition-all rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/30">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Identification</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Weight Status</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Health</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {activeTab === 'inventory' ? (
                  filteredStock.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-widest">{item.category}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-base font-black text-gray-900">{item.qty.toFixed(1)}</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase ml-1">{item.unit}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${item.qty < 50 ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                          {item.qty < 50 ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                          {item.qty < 50 ? 'REFILL REQ.' : 'OPTIMAL'}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="text-[9px] font-black text-gray-300 group-hover:text-gray-600 transition-colors uppercase tracking-widest">{item.lastSync}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  stockLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-5">
                        <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight">{log.productName}</p>
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[7px] font-black uppercase mt-1 ${log.type === 'INFLOW' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                          {log.type === 'INFLOW' ? <ArrowDownCircle size={8} /> : <ArrowUpCircle size={8} />}
                          {log.type}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[11px] font-black ${log.type === 'INFLOW' ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {log.type === 'INFLOW' ? '+' : '-'}
                          {log.delta.toFixed(1)} KG
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="inline-flex items-center gap-1.5 text-gray-400 text-[8px] font-black uppercase tracking-widest">
                          <Clock size={10} /> VERIFIED
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right text-[9px] font-black text-gray-400 uppercase tracking-widest">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  ))
                )}
                {(activeTab === 'inventory' ? filteredStock : stockLogs).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-32 text-center">
                      <div className="flex flex-col items-center opacity-10">
                        <ClipboardList size={64} className="mb-4" />
                        <p className="text-xl font-black uppercase tracking-[0.2em]">No Records Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div id="incoming-transfers" className="bg-white border border-gray-200 shadow-sm rounded-[40px] p-8 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px] flex items-center gap-2">
                  <Package size={14} className="text-[#6B7550]" />
                  Incoming Transfers
                </h3>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                  Notification accept karein — stock inventory mein add hoga
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-[8px] font-black uppercase h-8"
                onClick={() => fetchPendingTransfers()}
              >
                Refresh
              </Button>
            </div>

            {pendingTransfers.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-gray-200 rounded-2xl">
                <Truck size={32} className="mx-auto text-gray-200 mb-3" />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Koi pending transfer nahi</p>
                <p className="text-[8px] text-gray-300 font-bold uppercase mt-1">Admin dispatch ke baad yahan dikhega</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {pendingTransfers.map((transfer) => {
                  const id = transfer._id || transfer.id;
                  const lines = transfer.lines || [];
                  return (
                    <div key={id} className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-900 uppercase">{transfer.transferNumber}</p>
                          <p className="text-[8px] text-emerald-700 font-bold uppercase mt-0.5">{transfer.status}</p>
                        </div>
                        <span className="text-[8px] font-black text-gray-400 uppercase">
                          {lines.length} item(s)
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {lines.slice(0, 4).map((line, i) => (
                          <li key={i} className="text-[9px] font-bold text-gray-600 flex justify-between">
                            <span>{line.productName}</span>
                            <span>{line.quantity} {line.unit || 'KG'}</span>
                          </li>
                        ))}
                        {lines.length > 4 && (
                          <li className="text-[8px] text-gray-400 font-bold">+{lines.length - 4} more</li>
                        )}
                      </ul>
                      <Button
                        className="w-full bg-[#6B7550] text-white border-none font-black py-3 text-[9px] uppercase tracking-widest rounded-xl"
                        disabled={loading || acceptingId === id}
                        onClick={() => handleAcceptTransfer(transfer)}
                      >
                        {acceptingId === id ? 'Accepting…' : 'Accept Stock'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-[40px] p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Restock Priority</h3>
              <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[8px] font-black ${criticalItems > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                {criticalItems > 0 ? 'ACTION REQ.' : 'STABLE'}
              </div>
            </div>
            <div className="space-y-3">
              {stock
                .filter((i) => i.qty < 50)
                .slice(0, 3)
                .map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-rose-200 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-rose-400 rounded-full" />
                      <div>
                        <p className="text-[10px] font-black text-gray-900 uppercase tracking-tight">{item.name}</p>
                        <p className="text-[8px] text-gray-400 font-bold uppercase">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-black text-rose-500 tracking-tight">{item.qty.toFixed(1)} KG</p>
                      <p className="text-[7px] text-gray-300 font-black uppercase">REMAINING</p>
                    </div>
                  </div>
                ))}
              {criticalItems === 0 && (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Inventory Saturated</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-gray-400 mt-1">Procurement transfer se stock aayega</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishMallStock;

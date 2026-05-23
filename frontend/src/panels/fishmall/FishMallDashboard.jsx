import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, TrendingUp, Layers, ClipboardCheck, ArrowRight, Package, Wallet, IndianRupee, Plus, ArrowUpRight, ArrowDownRight, Calendar, User, Lock, Activity } from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { useFishMallStore } from '../../store/fishMallStore';
import { toast } from 'react-hot-toast';

const FishMallDashboard = () => {
  const {
    stock,
    fetchStock,
    alerts,
    activeSession,
    accountingSummary,
    cashbook,
    fetchActiveSessionAsync,
    openSessionAsync,
    fetchAccountingSummaryAsync
  } = useFishMallStore();

  const [openingCash, setOpeningCash] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [submittingSession, setSubmittingSession] = useState(false);

  const transferAlerts = alerts.filter((a) => a.type === 'PROCUREMENT_TRANSFER' && !a.read);
  const latestTransfer = transferAlerts[0];

  useEffect(() => {
    fetchStock();
    fetchActiveSessionAsync();
  }, [fetchStock, fetchActiveSessionAsync]);

  useEffect(() => {
    if (activeSession) {
      fetchAccountingSummaryAsync();
    }
  }, [activeSession, fetchAccountingSummaryAsync]);

  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!openingCash || isNaN(parseFloat(openingCash)) || parseFloat(openingCash) < 0) {
      toast.error('Please enter a valid opening cash float');
      return;
    }
    setSubmittingSession(true);
    try {
      await openSessionAsync(parseFloat(openingCash), openingNotes);
      toast.success('Operational shift session started successfully!');
    } catch (err) {
      toast.error(err?.message || 'Failed to start shift');
    } finally {
      setSubmittingSession(false);
    }
  };

  const totalVolume = (accountingSummary?.cashbook || [])
    .filter(entry => entry.category === 'RETAIL_SALE')
    .length;

  const liveStockKg = stock.reduce((acc, i) => acc + i.qty, 0);
  const criticalStock = stock.filter(i => i.qty < 50).length;

  // Render Opening Shift Lock Screen if no session is active
  if (!activeSession) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl shadow-xl shadow-gray-200/50 p-8 space-y-6 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Lock size={36} />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900 uppercase tracking-widest">Shift Opening Required</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Operational Day Cannot Start Without Opening Cash Balance</p>
          </div>

          <form onSubmit={handleOpenSession} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Opening Cash Float (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-3.5 text-[10px] font-bold outline-none focus:border-[#6B7550] rounded-xl transition-all"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Shift Notes / Handover Remarks</label>
              <textarea
                placeholder="Register starting float details or counter handover notes..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-[10px] font-bold outline-none focus:border-[#6B7550] rounded-xl transition-all h-20 resize-none"
                value={openingNotes}
                onChange={(e) => setOpeningNotes(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={submittingSession}
              className="w-full py-4 bg-black text-white hover:bg-[#6B7550] text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-black/10"
            >
              {submittingSession ? 'Starting shift...' : 'Open Cashbook Shift'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const s = accountingSummary || activeSession;

  return (
    <div className="bg-[#F9FAFB] min-h-screen animate-in fade-in duration-300 p-4 font-sans space-y-6">
      {/* Shift status Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 border border-gray-100 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6B7550]/10 text-[#6B7550] rounded-xl flex items-center justify-center shrink-0">
            <User size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              Active Shift: {s.sessionNumber}
              <span className="text-[7px] bg-emerald-500 text-white px-1.5 py-0.5 font-black uppercase rounded animate-pulse">Open</span>
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              Cashier ID: #{s.cashierId?.substring(s.cashierId.length - 6) || 'Current'} • Started: {new Date(s.openingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/fishmall/billing">
            <Button className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 bg-[#6B7550] text-white border-none shadow-lg shadow-[#6B7550]/20 active:scale-95 transition-all">
              New Billing
            </Button>
          </Link>
          <Link to="/fishmall/closing">
            <Button variant="outline" className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 border-gray-200 text-gray-700 hover:bg-black hover:text-white transition-all">
              Lock Shift
            </Button>
          </Link>
        </div>
      </div>

      {latestTransfer && (
        <Link
          to="/fishmall/alerts"
          className="block bg-emerald-50 border border-emerald-200 p-4 rounded-xl hover:border-emerald-400 transition-colors"
        >
          <div className="flex items-start gap-3">
            <Package size={20} className="text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800">
                {latestTransfer.title}
              </p>
              <p className="text-[9px] text-emerald-700 font-bold mt-1">{latestTransfer.message}</p>
            </div>
          </div>
        </Link>
      )}

      {/* Accounting & Cashbook Dashboard widgets */}
      <div className="space-y-4">
        <div>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Realtime Cashbook Summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'Opening Float', value: `₹${(s.openingCash ?? 0).toLocaleString()}`, desc: 'Counter float' },
              { title: 'Sales Total', value: `₹${(s.salesTotal ?? 0).toLocaleString()}`, desc: `Cash: ₹${s.cashSalesTotal || 0} | UPI: ₹${s.upiSalesTotal || 0}` },
              { title: 'Operational Expenses', value: `₹${(s.expensesTotal ?? 0).toLocaleString()}`, desc: `Paid Outflow` },
              { title: 'Net P&L Balance', value: `₹${(s.netPnL ?? 0).toLocaleString()}`, desc: `Gross Revenue - Expenses`, highlight: true }
            ].map((kpi, idx) => (
              <div key={idx} className={`p-4 border shadow-sm rounded-xl transition-all ${kpi.highlight ? 'bg-black text-white border-black' : 'bg-white border-gray-100'}`}>
                <p className={`text-[8px] font-black uppercase tracking-[0.1em] ${kpi.highlight ? 'text-gray-400' : 'text-gray-400'}`}>{kpi.title}</p>
                <h3 className="text-xl font-black tracking-tight mt-1 leading-none">{kpi.value}</h3>
                <p className={`text-[8px] font-bold uppercase mt-2 ${kpi.highlight ? 'text-emerald-400' : 'text-[#6B7550]'}`}>{kpi.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Realtime Available Cash Split & Ledger Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Activity className="text-[#6B7550]" size={14} /> Cashbook Ledger Feed
              </h3>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-lg">Shift: Live</span>
            </div>
            <div className="overflow-x-auto flex-1 max-h-[300px]">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Time</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Entry Code</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400">Pay Mode</th>
                    <th className="px-6 py-3 text-[8px] font-black uppercase tracking-widest text-gray-400 text-right">Ledger Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {cashbook.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                        No transactions registered yet
                      </td>
                    </tr>
                  ) : (
                    cashbook.map((entry, idx) => (
                      <tr key={entry._id || idx} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 text-[9px] font-bold text-gray-400">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-3 text-[9px] font-black text-gray-900">{entry.entryCode}</td>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest ${
                            entry.category === 'OPENING_BALANCE' ? 'bg-blue-50 text-blue-700' :
                            entry.category === 'RETAIL_SALE' ? 'bg-emerald-50 text-emerald-700' :
                            entry.category === 'EXPENSE' ? 'bg-rose-50 text-rose-700' :
                            entry.category === 'INTERNAL_TRANSFER' ? 'bg-purple-50 text-purple-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {entry.category}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-[9px] font-bold text-gray-500 uppercase tracking-tight">{entry.paymentMethod}</td>
                        <td className="px-6 py-3 text-right">
                          <span className={`text-[10px] font-black flex items-center justify-end gap-0.5 ${entry.type === 'INFLOW' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {entry.type === 'INFLOW' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                            ₹{entry.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cash vs UPI split balance display */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
            <h3 className="font-black text-gray-900 text-[10px] uppercase tracking-widest border-b border-gray-50 pb-3">Available Split Tally</h3>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Expected Cash-on-Hand</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">₹{(s.expectedClosingCash ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <IndianRupee size={16} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Expected UPI Collection</p>
                  <p className="text-2xl font-black text-gray-900 tracking-tight">₹{(s.expectedClosingUpi ?? 0).toLocaleString()}</p>
                </div>
                <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest leading-none">Auto calculated with real-time POS split updates</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Active Inventory Index */}
          <div className="lg:col-span-3 bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h3 className="font-black text-gray-900 text-[9px] uppercase tracking-widest">Active Product Inventory Index</h3>
              <Link to="/fishmall/rates" className="text-[8px] font-black uppercase text-[#6B7550] flex items-center gap-1 hover:underline">
                Edit Rates <ArrowRight size={10} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400">Product</th>
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-center">Rate</th>
                    <th className="px-4 py-2 text-[8px] font-black uppercase tracking-widest text-gray-400 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stock.slice(0, 8).map((fish, i) => (
                    <tr key={i} className="hover:bg-gray-50/30 transition-all">
                      <td className="px-4 py-2.5">
                        <p className="text-[9px] font-black text-gray-900 uppercase">{fish.name}</p>
                        <p className="text-[7px] text-gray-400 font-bold uppercase">{fish.category}</p>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="text-[10px] font-black text-gray-900">₹{fish.rate}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`text-[9px] font-black ${fish.qty < 50 ? 'text-rose-500 bg-rose-50 px-1' : 'text-gray-900'}`}>{fish.qty} {fish.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Quick Navigation */}
          <div className="space-y-3">
            <div className="bg-[#6B7550] p-4 shadow-sm flex flex-col justify-between h-[120px] rounded-xl relative overflow-hidden group">
              <div className="z-10">
                <h3 className="text-white text-xs font-black tracking-widest uppercase">Inflow Registry</h3>
                <p className="text-white/60 text-[8px] font-bold uppercase tracking-widest mt-1">Record Arrivals</p>
              </div>
              <Link to="/fishmall/stock" className="z-10">
                <Button className="w-full bg-white text-[#6B7550] text-[9px] font-black uppercase py-2 border-none hover:bg-black hover:text-white transition-all rounded-lg">
                  Record Stock
                </Button>
              </Link>
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                <Layers size={80} color="white" />
              </div>
            </div>

            <div className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/50">
                <h3 className="font-black text-gray-900 text-[9px] uppercase tracking-widest">Shift Stats</h3>
              </div>
              <div className="p-4 space-y-3 text-[9px] font-bold uppercase text-gray-400">
                <div className="flex justify-between">
                  <span>Sales Volume</span>
                  <span className="text-gray-900">{totalVolume} Sales</span>
                </div>
                <div className="flex justify-between">
                  <span>Alert Products</span>
                  <span className={criticalStock > 0 ? 'text-rose-500' : 'text-emerald-500'}>{criticalStock} Low</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Stock</span>
                  <span className="text-gray-900">{liveStockKg.toLocaleString()} KG</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FishMallDashboard;

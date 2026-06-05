import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, ShoppingCart, Flame, Utensils, Activity, Plus, LayoutGrid, 
  History, Settings, Package, Lock, IndianRupee, Wallet, Calendar, User, 
  FileText, CheckCircle2, AlertCircle, X, Printer, ArrowRight, ClipboardCheck 
} from 'lucide-react';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { StatCard } from '../../design-system/components/StatCard';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';
import { useAuthStore } from '../../store/authStore';
import { restaurantService } from '../../services/restaurantService';
import { toast } from 'react-hot-toast';

const orderDisplayId = (order) => {
  const raw = order?.orderNumber || order?.id || order?._id;
  if (!raw) return '—';
  const s = String(raw);
  return s.startsWith('#') ? s : `#${s.length > 12 ? s.slice(-8) : s}`;
};

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    orders,
    menuItems,
    kitchenStock,
    alerts,
    activeSession,
    accountingSummary,
    cashbook,
    expenses,
    fetchOrders,
    fetchMenu,
    fetchKitchenStock,
    fetchActiveSessionAsync,
    openSessionAsync,
    closeSessionAsync,
    fetchAccountingSummaryAsync,
    submitExpenseAsync,
    fetchExpensesAsync,
    loading
  } = useRestaurantStore();

  // Opening form state
  const [openingCash, setOpeningCash] = useState('');
  const [openingNotes, setOpeningNotes] = useState('');
  const [submittingSession, setSubmittingSession] = useState(false);

  // Expense Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseData, setExpenseData] = useState({
    amount: '',
    category: 'GAS',
    paymentMethod: 'CASH',
    payee: '',
    remarks: ''
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);

  // EOD Closing Modal state
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [closingStep, setClosingStep] = useState(1);
  const [closingData, setClosingData] = useState({
    actualClosingCash: '',
    actualClosingUpi: '',
    notes: ''
  });
  const [submittingClosing, setSubmittingClosing] = useState(false);
  const [lastClosedReport, setLastClosedReport] = useState(null);

  // Pending Incoming Supplies State
  const [pendingSupplies, setPendingSupplies] = useState([]);
  const [loadingSupplies, setLoadingSupplies] = useState(false);

  const loadPendingSupplies = async () => {
    setLoadingSupplies(true);
    try {
      const res = await restaurantService.listInternalSupplies({ status: 'PENDING_ACCEPTANCE', limit: 20 });
      const docs = Array.isArray(res?.data) ? res.data : res?.data?.docs ?? res?.docs ?? [];
      setPendingSupplies(docs);
    } catch {
      setPendingSupplies([]);
    } finally {
      setLoadingSupplies(false);
    }
  };

  // Dashboard Active Tab
  const [activeTab, setActiveTab] = useState('cashbook'); // 'cashbook' | 'expenses' | 'stock'

  // Fetch initial data
  useEffect(() => {
    fetchOrders();
    fetchMenu();
    fetchKitchenStock();
    fetchActiveSessionAsync();
    loadPendingSupplies();
  }, [fetchOrders, fetchMenu, fetchKitchenStock, fetchActiveSessionAsync]);

  // Fetch shift aggregates once active session is verified
  useEffect(() => {
    if (activeSession) {
      fetchAccountingSummaryAsync();
      loadPendingSupplies();
    }
  }, [activeSession, fetchAccountingSummaryAsync]);

  // ── Session Handlers ──────────────────────────────────────────────────────
  const handleOpenSession = async (e) => {
    e.preventDefault();
    if (!openingCash || isNaN(parseFloat(openingCash)) || parseFloat(openingCash) < 0) {
      toast.error('Please enter a valid opening cash float');
      return;
    }
    setSubmittingSession(true);
    try {
      await openSessionAsync(parseFloat(openingCash), openingNotes);
      toast.success('Shift session opened successfully!');
      setOpeningCash('');
      setOpeningNotes('');
    } catch (err) {
      toast.error(err?.message || 'Failed to start shift');
    } finally {
      setSubmittingSession(false);
    }
  };

  // ── Expense Handlers ──────────────────────────────────────────────────────
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!expenseData.amount || isNaN(parseFloat(expenseData.amount)) || parseFloat(expenseData.amount) <= 0) {
      toast.error('Please enter a valid expense amount');
      return;
    }
    if (!expenseData.payee.trim()) {
      toast.error('Please enter recipient payee name');
      return;
    }
    setSubmittingExpense(true);
    try {
      await submitExpenseAsync({
        category: expenseData.category,
        amount: parseFloat(expenseData.amount),
        paymentMethod: expenseData.paymentMethod,
        payee: expenseData.payee,
        remarks: expenseData.remarks
      });
      toast.success('Kitchen expense recorded successfully');
      setShowExpenseModal(false);
      setExpenseData({
        amount: '',
        category: 'GAS',
        paymentMethod: 'CASH',
        payee: '',
        remarks: ''
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to record expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  // ── Closing Handlers ──────────────────────────────────────────────────────
  const handleClosingSubmit = async (e) => {
    e.preventDefault();
    if (closingData.actualClosingCash === '' || isNaN(parseFloat(closingData.actualClosingCash))) {
      toast.error('Please enter actual physical cash-on-hand');
      return;
    }
    if (closingData.actualClosingUpi === '' || isNaN(parseFloat(closingData.actualClosingUpi))) {
      toast.error('Please enter actual physical UPI collected');
      return;
    }

    setSubmittingClosing(true);
    try {
      const closedSession = await closeSessionAsync({
        actualClosingCash: parseFloat(closingData.actualClosingCash),
        actualClosingUpi: parseFloat(closingData.actualClosingUpi),
        closingNotes: closingData.notes
      });
      setLastClosedReport(closedSession);
      toast.success('Operational Cashbook Shift Closed and Sealed Successfully!');
      setClosingStep(4); // Success and invoice display view
    } catch (err) {
      toast.error(err?.message || 'Failed to close daily shift');
    } finally {
      setSubmittingClosing(false);
    }
  };

  // Calculated Stats
  const s = accountingSummary || activeSession;
  const safeOrders = Array.isArray(orders) ? orders : [];
  const safeMenu = Array.isArray(menuItems) ? menuItems : [];
  const safeStock = Array.isArray(kitchenStock) ? kitchenStock : [];

  const today = new Date().toISOString().split('T')[0];
  const todayOrders = safeOrders.filter((o) => {
    const ts = o.timestamp || o.createdAt;
    if (!ts) return false;
    const day = typeof ts === 'string' ? ts.slice(0, 10) : new Date(ts).toISOString().slice(0, 10);
    return day === today;
  });

  const totalSales = s?.salesTotal || todayOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const criticalStock = safeStock.filter((i) => (i.quantity ?? 0) < 10).length;
  const totalExpenses = s?.expensesTotal || 0;
  const netPnLYield = s?.netPnL || (totalSales - totalExpenses);

  const expectedClosingCash = s?.expectedClosingCash ?? s?.openingCash ?? 0;
  const expectedClosingUpi = s?.expectedClosingUpi ?? 0;

  // 1. Shift Opening Lock Screen (Rendered if no session is active)
  if (!activeSession) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center p-4 md:p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-2xl p-8 space-y-6 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-accent-olive/10 text-accent-olive border border-accent-olive/20 flex items-center justify-center mx-auto shadow-lg">
            <Lock size={32} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-widest">Shift Session Lock</h1>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Operational Day Cannot Start Without Opening Cash Balance</p>
          </div>

          <form onSubmit={handleOpenSession} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Opening Cash Float (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="number"
                  placeholder="0.00"
                  required
                  min="0"
                  className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3.5 text-[10px] font-bold outline-none focus:border-accent-olive transition-all"
                  value={openingCash}
                  onChange={(e) => setOpeningCash(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Shift Opening Handover Notes</label>
              <textarea
                placeholder="Write starting counter comments or hand-over descriptions..."
                className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-[10px] font-bold outline-none focus:border-accent-olive transition-all h-20 resize-none"
                value={openingNotes}
                onChange={(e) => setOpeningNotes(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={submittingSession}
              className="w-full py-4 bg-black text-white hover:bg-accent-olive text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              {submittingSession ? 'Starting Session...' : 'Open Cashbook Shift'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 px-4 py-6 md:px-8 font-sans space-y-6">
      
      {/* 2. Cashier Active Shift Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-white p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-olive/10 border border-accent-olive/20 text-accent-olive flex items-center justify-center shrink-0">
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-serif italic font-black text-slate-900 uppercase tracking-tight">
                Shift Session: <span className="text-accent-olive">{s?.sessionNumber}</span>
              </h1>
              <span className="text-[7px] bg-emerald-500 text-white px-2 py-0.5 font-black uppercase tracking-widest animate-pulse">Live</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              OPERATOR: {user?.name || 'CASHIER'} • OPENED: {s?.openingDate ? new Date(s.openingDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button onClick={() => setShowExpenseModal(true)} variant="outline" className="h-11 px-6 text-[9px] font-black uppercase tracking-widest border-slate-200 hover:border-black transition-all gap-2">
            <Wallet size={14} /> LOG KITCHEN EXPENSE
          </Button>
          <Button onClick={() => { setClosingStep(1); setShowClosingModal(true); }} variant="outline" className="h-11 px-6 text-[9px] font-black uppercase tracking-widest border-red-200 text-red-600 hover:bg-red-50 transition-all gap-2">
            <CheckCircle2 size={14} /> RECONCILE & CLOSE SHIFT
          </Button>
          <Link to="/restaurant/pos">
            <Button className="h-11 px-6 text-[9px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 transition-all gap-2">
              <Plus size={14} /> LAUNCH POS TERMINAL
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Incoming Supplies Banner */}
      {pendingSupplies.length > 0 && (
        <div className="bg-[#FAF8F5] border-2 border-amber-300 p-6 space-y-4 shadow-sm rounded-lg">
          <div className="flex items-center justify-between border-b border-amber-200 pb-3">
            <h2 className="text-[10px] font-black text-amber-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Package className="text-amber-600 animate-pulse" size={16} />
              Pending Incoming Kitchen Supplies ({pendingSupplies.length})
            </h2>
            <Link 
              to="/restaurant/received-stock"
              className="text-[9px] font-black uppercase text-amber-800 tracking-wider hover:underline"
            >
              Verify & Receive All &rarr;
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingSupplies.map((supply) => (
              <div key={supply._id} className="bg-white border border-amber-200 p-4 flex flex-col justify-between hover:shadow-md transition-all rounded">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-black text-slate-800">{supply.invoiceNumber}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                      Awaiting Kitchen Acceptance
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase">
                    Issued: {new Date(supply.billDate || supply.createdAt).toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-slate-700 font-medium mt-2">
                    Items: {(supply.lines || []).map((l) => `${l.itemName} (${l.quantity} KG)`).join(', ')}
                  </p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link to="/restaurant/received-stock" className="w-full">
                    <Button className="w-full bg-[#6B7550] hover:bg-[#5F6846] text-white text-[9px] font-black uppercase py-2 tracking-widest border-none text-center rounded">
                      Verify & Receive Cargo
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Realtime Shift Accounting KPIs */}
      <div>
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Live Shift Cashbook Metrics</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="OPENING FLOAT" value={`₹${(s?.openingCash ?? 0).toLocaleString()}`} icon={Wallet} trend="HANDOVER" trendType="up" />
          <StatCard title="POS SALES VALUE" value={`₹${totalSales.toLocaleString()}`} icon={TrendingUp} trend={`CASH: ₹${s?.cashSalesTotal || 0} | UPI: ₹${s?.upiSalesTotal || 0}`} trendType="up" />
          <StatCard title="KITCHEN EXPENSES" value={`₹${totalExpenses.toLocaleString()}`} icon={Flame} trend={`PAID OUTFLOW`} trendType={totalExpenses > 0 ? "danger" : "up"} />
          <div className="p-5 border shadow-sm bg-black border-black text-white flex flex-col justify-between h-32">
             <div className="flex justify-between items-start">
               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">NET SHIFT YIELD</span>
               <TrendingUp size={14} className="text-accent-olive" />
             </div>
             <p className="text-3xl font-serif italic font-black">{`₹${netPnLYield.toLocaleString()}`}</p>
             <span className="text-[8px] font-bold text-accent-olive uppercase tracking-widest">GROSS SALES - EXPENSES</span>
          </div>
        </div>
      </div>

      {/* 4. Tabbed Cashbook Feed / Expenses Log / Inventory Checklist */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 flex flex-col bg-white border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
          {/* Tabs header */}
          <div className="px-6 py-2.5 bg-slate-50/50 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setActiveTab('cashbook')}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeTab === 'cashbook' ? 'bg-black text-white border-black' : 'text-slate-400 border-transparent hover:border-slate-200'}`}
              >
                CASHBOOK LEDGER
              </button>
              <button 
                onClick={() => setActiveTab('expenses')}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeTab === 'expenses' ? 'bg-black text-white border-black' : 'text-slate-400 border-transparent hover:border-slate-200'}`}
              >
                KITCHEN EXPENSES
              </button>
              <button 
                onClick={() => setActiveTab('stock')}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest border transition-all ${activeTab === 'stock' ? 'bg-black text-white border-black' : 'text-slate-400 border-transparent hover:border-slate-200'}`}
              >
                LOW INVENTORY
              </button>
            </div>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">SHIFT_LEDGER_FEED // LIVE</span>
          </div>

          <div className="flex-1 overflow-x-auto">
            {activeTab === 'cashbook' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Entry Code</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Protocol</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Description</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!cashbook || cashbook.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        No ledger transactions recorded in this shift yet.
                      </td>
                    </tr>
                  ) : (
                    cashbook.map((entry) => (
                      <tr key={entry._id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-3.5">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic font-serif">
                            {entry.entryCode}
                          </span>
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 border ${
                            entry.type === 'INFLOW' 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                              : 'bg-red-50 border-red-100 text-red-600'
                          }`}>
                            {entry.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                          {entry.category}
                        </td>
                        <td className="px-6 py-3.5">
                          <span className="text-[11px] font-black text-slate-900 italic font-serif">
                            ₹{entry.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[10px] text-slate-400 uppercase tracking-tight font-medium max-w-xs truncate">
                          {entry.description}
                        </td>
                        <td className="px-6 py-3.5 text-[9px] text-slate-500 font-bold uppercase tracking-widest text-right">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'expenses' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Expense Ref</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Method</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Payee</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Remarks</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!expenses || expenses.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        No operational expenses logged in this shift yet.
                      </td>
                    </tr>
                  ) : (
                    expenses.map((exp) => (
                      <tr key={exp._id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-3.5">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic font-serif">
                            {exp.expenseCode}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[9px] font-black text-slate-900 uppercase tracking-widest">
                          {exp.category}
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant="outline" className="text-[7px] border-slate-200 text-slate-500 font-black px-2 py-0.5">
                            {exp.paymentMethod}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          {exp.payee}
                        </td>
                        <td className="px-6 py-3.5 text-[10px] text-slate-400 uppercase tracking-tight">
                          {exp.remarks || '—'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className="text-sm font-serif italic font-black text-red-600">
                            ₹{exp.amount.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'stock' && (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/30 border-b border-slate-200">
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Ingredient Name</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400">Category</th>
                    <th className="px-6 py-3.5 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right">Stock Quantity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {safeStock.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Loading kitchen inventory details...
                      </td>
                    </tr>
                  ) : (
                    safeStock.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-6 py-3.5">
                          <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">
                            {item.name}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {item.category || 'GENERAL'}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span className={`text-[10px] font-black ${item.quantity < 10 ? 'text-red-600 font-serif italic font-black text-sm' : 'text-accent-olive'}`}>
                            {item.quantity} {item.unit}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 5. Right Sidebar — High density activity */}
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
               <History size={14} className="text-accent-olive" /> Recent Orders Shift Log
            </h3>
            <div className="space-y-3">
              {todayOrders.slice(0, 4).length === 0 ? (
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center py-6">No sales recorded yet</p>
              ) : (
                todayOrders.slice(0, 4).map((order) => (
                  <div key={order._id || order.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200">
                    <div>
                      <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight italic font-serif">{orderDisplayId(order)}</p>
                      <p className="text-[7px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{order.orderType} • {order.paymentMethod}</p>
                    </div>
                    <span className="text-[11px] font-black text-slate-900 italic font-serif">₹{order.total?.toLocaleString() ?? order.totalAmount?.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card padding="none" className="bg-black p-6 shadow-xl flex flex-col justify-between h-[160px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
               <Activity size={80} className="text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="text-white text-lg font-serif italic font-black tracking-tight uppercase leading-none">Recipe & Inventory</h3>
              <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Verify stock transactions and transfers</p>
            </div>
            <Link to="/restaurant/inventory" className="relative z-10">
              <Button className="w-full bg-accent-olive text-white text-[9px] font-black uppercase py-3 border-none hover:bg-white hover:text-black transition-all tracking-widest shadow-lg">
                OPEN MASTER INVENTORY
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* ── 6. Log Kitchen Expense Modal ────────────────────────────────────── */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 relative">
            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-black transition-all">
              <X size={18} />
            </button>
            <div>
              <h2 className="text-xl font-serif italic font-black text-slate-900 uppercase tracking-tight">Record Expense.</h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Submit petty kitchen operational cost</p>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expense Category</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 text-[9px] font-black uppercase tracking-widest outline-none focus:border-accent-olive transition-all appearance-none cursor-pointer"
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                >
                  {['GAS', 'LABOR', 'INGREDIENT_WASTAGE', 'CLEANING', 'MISCELLANEOUS'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                  <input
                    type="number"
                    placeholder="0.00"
                    required
                    min="0.01"
                    step="0.01"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3.5 text-[10px] font-bold outline-none focus:border-accent-olive transition-all"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Payment Protocol</label>
                <div className="grid grid-cols-2 gap-2">
                  {['CASH', 'UPI'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setExpenseData({...expenseData, paymentMethod: method})}
                      className={`py-3.5 border transition-all text-[8px] font-black uppercase tracking-widest ${
                        expenseData.paymentMethod === method 
                          ? 'bg-black text-white border-black' 
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Recipient Payee</label>
                <input
                  type="text"
                  placeholder="E.G. GAS SUPPLIER, CLEANING AGENCY..."
                  required
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 text-[10px] font-bold uppercase tracking-tight outline-none focus:border-accent-olive transition-all"
                  value={expenseData.payee}
                  onChange={(e) => setExpenseData({...expenseData, payee: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Expense Remarks</label>
                <textarea
                  placeholder="Enter specific details regarding the expense..."
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-[10px] font-bold outline-none focus:border-accent-olive transition-all h-16 resize-none"
                  value={expenseData.remarks}
                  onChange={(e) => setExpenseData({...expenseData, remarks: e.target.value})}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" onClick={() => setShowExpenseModal(false)} variant="outline" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest border-slate-200">
                  CANCEL
                </Button>
                <Button type="submit" disabled={submittingExpense} className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 transition-all">
                  {submittingExpense ? 'SUBMITTING...' : 'LOG OUTFLOW'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 7. EOD Closing Reconcile & Seal Modal (Step-by-step Flow) ───────── */}
      {showClosingModal && (
        <div className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl border border-slate-200 shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-200 relative my-8">
            
            {closingStep < 4 && (
              <button onClick={() => setShowClosingModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-black transition-all">
                <X size={18} />
              </button>
            )}

            <div>
              <h2 className="text-xl font-serif italic font-black text-slate-900 uppercase tracking-tight">Shift Reconciliation.</h2>
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">Step {closingStep} of 4 — EOD cashier closing & seal</p>
            </div>

            {/* PROGRESS BAR */}
            <div className="w-full bg-slate-100 h-1">
              <div 
                className="bg-accent-olive h-full transition-all duration-300"
                style={{ width: `${(closingStep / 4) * 100}%` }}
              />
            </div>

            {/* STEP 1: STOCK VERIFICATION */}
            {closingStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-accent-olive/5 border border-accent-olive/20 p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-accent-olive text-white shadow-lg"><ClipboardCheck size={20} /></div>
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Verify Closing Stock Levels</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Ensure low stock and critical levels are acknowledged</p>
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest">Ingredient Name</th>
                        <th className="px-6 py-3 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">Quantity Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {safeStock.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-3 text-[10px] font-black text-slate-900 uppercase">{item.name}</td>
                          <td className={`px-6 py-3 text-right text-[10px] font-black ${item.quantity < 10 ? 'text-red-600' : 'text-slate-600'}`}>
                            {item.quantity} {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={() => setClosingStep(2)} className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] bg-black text-white border-none shadow-xl active:scale-95 flex items-center justify-center gap-2">
                  PROCEED TO CASHBOOK TALLY <ArrowRight size={14} />
                </Button>
              </div>
            )}

            {/* STEP 2: PHYSICAL COUNTS TALLY */}
            {closingStep === 2 && (
              <form onSubmit={(e) => { e.preventDefault(); setClosingStep(3); }} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-accent-olive/5 border border-accent-olive/20 p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-accent-olive text-white shadow-lg"><IndianRupee size={20} /></div>
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Physical Cash & UPI Tally</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Input exact counter drawer counts to calculate variance</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Expected Cash Bal.</p>
                    <p className="text-xl font-serif italic font-black text-slate-900 mt-1">₹{expectedClosingCash.toLocaleString()}</p>
                    <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest block mt-2">OPENING + CASH SALES - EXPENSES</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200">
                    <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Expected UPI Bal.</p>
                    <p className="text-xl font-serif italic font-black text-slate-900 mt-1">₹{expectedClosingUpi.toLocaleString()}</p>
                    <span className="text-[7px] text-slate-400 uppercase font-black tracking-widest block mt-2">UPI SALES - EXPENSES</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Actual Drawer Cash (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 text-[10px] font-bold outline-none focus:border-accent-olive transition-all"
                      value={closingData.actualClosingCash}
                      onChange={(e) => setClosingData({...closingData, actualClosingCash: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Actual UPI Collected (₹)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3.5 text-[10px] font-bold outline-none focus:border-accent-olive transition-all"
                      value={closingData.actualClosingUpi}
                      onChange={(e) => setClosingData({...closingData, actualClosingUpi: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setClosingStep(1)} variant="outline" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest border-slate-200">
                    BACK
                  </Button>
                  <Button type="submit" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    PROCEED TO MINI P&L <ArrowRight size={14} />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: MINI P&L AND SHIFT SEAL PREVIEW */}
            {closingStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-accent-olive/5 border border-accent-olive/20 p-5 flex items-start gap-4">
                  <div className="p-2.5 bg-accent-olive text-white shadow-lg"><FileText size={20} /></div>
                  <div>
                    <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Daily Mini P&L & Variance Review</h3>
                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Please review shift variance discrepancies before sealing shift</p>
                  </div>
                </div>

                {/* LEDGER DETAILS TALLY SHEET */}
                <div className="p-6 bg-slate-50 border border-slate-200 space-y-4">
                  <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-200 pb-2">SHIFT RECONCILIATION SUMMARY</h4>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-tight">
                      <span>OPENING COUNTER FLOAT:</span>
                      <span className="font-serif italic font-black">₹{parseFloat(s?.openingCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-tight">
                      <span>POS SALES REVENUE:</span>
                      <span className="font-serif italic font-black text-emerald-600">+₹{totalSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-tight">
                      <span>OPERATIONAL EXPENSES:</span>
                      <span className="font-serif italic font-black text-red-600">-₹{totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-[11px] font-black text-slate-900 uppercase tracking-tight">
                      <span>EXPECTED DRAWER CASH:</span>
                      <span className="font-serif italic font-black">₹{expectedClosingCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-black text-slate-900 uppercase tracking-tight">
                      <span>ACTUAL DRAWER CASH PHYSICAL:</span>
                      <span className="font-serif italic font-black">₹{parseFloat(closingData.actualClosingCash || 0).toLocaleString()}</span>
                    </div>

                    {/* LIVE DISCREPANCY DISPLAY */}
                    {(() => {
                      const disc = expectedClosingCash - parseFloat(closingData.actualClosingCash || 0);
                      const abs = Math.abs(disc);
                      return (
                        <div className={`flex justify-between text-[11px] font-black uppercase tracking-tight p-2.5 ${disc === 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                          <span>CASH DRAW VARIANCE DISCREPANCY:</span>
                          <span className="font-serif italic font-black">
                            {disc === 0 ? '₹0 (PERFECT)' : (disc > 0 ? `-₹${abs.toLocaleString()} (SHORTAGE)` : `+₹${abs.toLocaleString()} (OVERAGE)`)}
                          </span>
                        </div>
                      );
                    })()}

                    {(() => {
                      const disc = expectedClosingUpi - parseFloat(closingData.actualClosingUpi || 0);
                      const abs = Math.abs(disc);
                      return (
                        <div className={`flex justify-between text-[11px] font-black uppercase tracking-tight p-2.5 ${disc === 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-red-50 border border-red-100 text-red-700'}`}>
                          <span>UPI VARIANCE DISCREPANCY:</span>
                          <span className="font-serif italic font-black">
                            {disc === 0 ? '₹0 (PERFECT)' : (disc > 0 ? `-₹${abs.toLocaleString()} (SHORTAGE)` : `+₹${abs.toLocaleString()} (OVERAGE)`)}
                          </span>
                        </div>
                      );
                    })()}

                    <div className="border-t border-slate-200 pt-3 flex justify-between text-sm font-serif italic font-black text-slate-900 uppercase tracking-tight">
                      <span>NET SHIFT YIELD YIELD:</span>
                      <span className="text-accent-olive">₹{netPnLYield.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">EOD Shift Closing Handover Notes</label>
                  <textarea
                    placeholder="Provide comments regarding shift variances, discrepancies, or operational notes..."
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 text-[10px] font-bold outline-none focus:border-accent-olive transition-all h-20 resize-none"
                    value={closingData.notes}
                    onChange={(e) => setClosingData({...closingData, notes: e.target.value})}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={() => setClosingStep(2)} variant="outline" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest border-slate-200">
                    BACK
                  </Button>
                  <Button onClick={handleClosingSubmit} disabled={submittingClosing} className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95 flex items-center justify-center gap-2">
                    {submittingClosing ? 'SEALING SHIFT...' : 'AUTHORIZE & SEAL SHIFT'}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: SUCCESS AND PRINT REPORT SUMMARY */}
            {closingStep === 4 && lastClosedReport && (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-3 py-6">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-xl font-serif italic font-black text-slate-900 uppercase tracking-tight">Shift Closed & Sealed.</h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">All shift entries locked and archived successfully</p>
                </div>

                {/* PRINTABLE SLIP SUMMARY */}
                <div id="shift-eod-print" className="p-8 bg-white border border-slate-200 space-y-6 text-slate-900 font-sans print:border-none print:p-0">
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-serif italic font-black tracking-tight uppercase">GOLDEN <span className="text-accent-olive">FISHERIES.</span></h2>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">RESTAURANT CASHIER CLOSING SLIP</p>
                  </div>

                  <div className="border-t border-b border-slate-200 py-4 grid grid-cols-2 gap-y-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div>SHIFT REF: <span className="text-slate-900 font-black italic font-serif">#{lastClosedReport.sessionNumber}</span></div>
                    <div className="text-right">OPERATOR: <span className="text-slate-900 font-black">{user?.name}</span></div>
                    <div>SEAL TIME: <span className="text-slate-900 font-black">{new Date(lastClosedReport.closingDate).toLocaleString()}</span></div>
                    <div className="text-right">STATUS: <span className="text-slate-900 font-black">SEALED_CLOSED</span></div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>OPENING FLOAT BALANCE:</span>
                      <span className="font-serif italic font-black text-slate-900">₹{parseFloat(lastClosedReport.openingCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>SHIFT SALES REVENUE:</span>
                      <span className="font-serif italic font-black text-emerald-600">+₹{(lastClosedReport.salesTotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <span>SHIFT OPERATIONAL EXPENSES:</span>
                      <span className="font-serif italic font-black text-red-600">-₹{(lastClosedReport.expensesTotal || 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="border-t border-slate-200 pt-2 flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>EXPECTED DRAWER CASH:</span>
                      <span className="font-serif italic font-black">₹{(lastClosedReport.expectedClosingCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>ACTUAL DRAWER CASH TALLIED:</span>
                      <span className="font-serif italic font-black">₹{(lastClosedReport.actualClosingCash || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>CASH DRAWER DISCREPANCY:</span>
                      <span className={`font-serif italic font-black ${lastClosedReport.cashDiscrepancy === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {lastClosedReport.cashDiscrepancy === 0 ? '₹0 (PERFECT)' : (lastClosedReport.cashDiscrepancy > 0 ? `-₹${Math.abs(lastClosedReport.cashDiscrepancy).toLocaleString()} (SHORT)` : `+₹${Math.abs(lastClosedReport.cashDiscrepancy).toLocaleString()} (OVER)`)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-2 flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>EXPECTED UPI COLLECTIONS:</span>
                      <span className="font-serif italic font-black">₹{(lastClosedReport.expectedClosingUpi || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>ACTUAL UPI RECONCILED:</span>
                      <span className="font-serif italic font-black">₹{(lastClosedReport.actualClosingUpi || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black text-slate-900 uppercase tracking-widest">
                      <span>UPI COLLECTION DISCREPANCY:</span>
                      <span className={`font-serif italic font-black ${lastClosedReport.upiDiscrepancy === 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {lastClosedReport.upiDiscrepancy === 0 ? '₹0 (PERFECT)' : (lastClosedReport.upiDiscrepancy > 0 ? `-₹${Math.abs(lastClosedReport.upiDiscrepancy).toLocaleString()} (SHORT)` : `+₹${Math.abs(lastClosedReport.upiDiscrepancy).toLocaleString()} (OVER)`)}
                      </span>
                    </div>

                    <div className="border-t border-slate-200 pt-3 flex justify-between text-xs font-serif italic font-black text-slate-900 uppercase tracking-widest">
                      <span>NET SHIFT PROFIT YIELD:</span>
                      <span className="text-accent-olive">₹{(lastClosedReport.netPnL || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {lastClosedReport.closingNotes && (
                    <div className="p-3 bg-slate-50 border border-slate-200">
                      <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Shift Handover Remarks</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tight leading-normal">{lastClosedReport.closingNotes}</p>
                    </div>
                  )}

                  <div className="pt-6 text-center opacity-40">
                    <p className="text-[7px] font-black uppercase tracking-widest">SYSTEM_ARCHIVE // Shift Sealed // Transaction Verified</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => window.print()} variant="outline" className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest border-slate-200 flex items-center justify-center gap-2">
                    <Printer size={14} /> PRINT REPORT
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowClosingModal(false);
                      setClosingStep(1);
                      setClosingData({ actualClosingCash: '', actualClosingUpi: '', notes: '' });
                      // Force reload session verification state
                      fetchActiveSessionAsync();
                    }} 
                    className="flex-1 h-12 text-[9px] font-black uppercase tracking-widest bg-black text-white border-none shadow-xl active:scale-95"
                  >
                    RETURN TO TERMINAL
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;

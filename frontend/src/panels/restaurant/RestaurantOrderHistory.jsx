import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, Printer, Search, Clock, History, ArrowLeft, Download, 
  FileText, X, Ban, Utensils, TrendingUp, Flame, ChefHat, Filter, 
  Layers, ChevronDown, ChevronUp, BarChart3, CheckCircle2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../design-system/components/Button';
import { Card } from '../../design-system/components/Card';
import { Badge } from '../../design-system/components/Badge';
import { useRestaurantStore } from '../../store/restaurantStore';

const STATUS_STYLE = {
  PAID: { bar: 'bg-emerald-500', label: 'text-emerald-600', text: 'Paid' },
  PENDING: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Open' },
  PREPARING: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Preparing' },
  SERVED: { bar: 'bg-amber-500', label: 'text-amber-600', text: 'Served' },
  CANCELLED: { bar: 'bg-rose-400', label: 'text-rose-500', text: 'Voided' },
};

const fmtRupee = (n) => Number(n ?? 0).toLocaleString('en-IN');

const RestaurantOrderHistory = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, outletSettings, fetchOutletSettingsAsync, voidOrderAsync, fetchDishHistoryAsync } = useRestaurantStore();
  
  const [activeView, setActiveView] = useState('dish_analysis'); // 'orders_ledger' | 'dish_analysis'
  const [searchQuery, setSearchQuery] = useState('');
  const [printOrder, setPrintOrder] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);

  // Dish Analysis State
  const [datePreset, setDatePreset] = useState('7days'); // 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom'
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dishSearch, setDishSearch] = useState('');
  const [dishAnalysisData, setDishAnalysisData] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [expandedDates, setExpandedDates] = useState({});

  useEffect(() => {
    fetchOrders();
    fetchOutletSettingsAsync();
  }, [fetchOrders, fetchOutletSettingsAsync]);

  // Load dish analysis when filters change
  const loadDishAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const params = {};
      const now = new Date();

      if (datePreset === 'today') {
        params.date = now.toISOString().slice(0, 10);
      } else if (datePreset === 'yesterday') {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        params.date = y.toISOString().slice(0, 10);
      } else if (datePreset === '7days') {
        const past = new Date(now);
        past.setDate(past.getDate() - 7);
        past.setHours(0, 0, 0, 0);
        params.from = past.toISOString();
      } else if (datePreset === '30days') {
        const past = new Date(now);
        past.setDate(past.getDate() - 30);
        past.setHours(0, 0, 0, 0);
        params.from = past.toISOString();
      } else if (datePreset === 'custom') {
        if (customFrom) params.from = new Date(customFrom).toISOString();
        if (customTo) {
          const end = new Date(customTo);
          end.setHours(23, 59, 59, 999);
          params.to = end.toISOString();
        }
      }

      if (dishSearch.trim()) {
        params.search = dishSearch.trim();
      }

      const res = await fetchDishHistoryAsync(params);
      setDishAnalysisData(res);
      // Expand first 3 dates by default
      if (res?.dailyBreakdown) {
        const initialExp = {};
        res.dailyBreakdown.slice(0, 3).forEach((d) => {
          initialExp[d.date] = true;
        });
        setExpandedDates(initialExp);
      }
    } catch (err) {
      toast.error('Failed to load dish sales analysis');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadDishAnalysis();
  }, [datePreset, customFrom, customTo, dishSearch]);

  const toggleDateExpanded = (dKey) => {
    setExpandedDates((prev) => ({ ...prev, [dKey]: !prev[dKey] }));
  };

  const expandAllDates = () => {
    if (!dishAnalysisData?.dailyBreakdown) return;
    const allExp = {};
    dishAnalysisData.dailyBreakdown.forEach((d) => {
      allExp[d.date] = true;
    });
    setExpandedDates(allExp);
  };

  const collapseAllDates = () => {
    setExpandedDates({});
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!dishAnalysisData?.dishAggregates?.length) {
      toast.error('No dish analysis data available to export.');
      return;
    }
    const headers = ['Dish Name', 'Total Portions Sold', 'Total Revenue (INR)', 'Total Orders Count', 'Days Ordered', 'Avg Portions Per Day'];
    const rows = dishAnalysisData.dishAggregates.map((d) => [
      `"${d.name}"`,
      d.totalQuantity,
      d.totalRevenue,
      d.totalOrders,
      d.daysOrdered,
      d.avgPerDay,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dish_sales_analysis_${datePreset}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dish analysis report exported to CSV!');
  };

  const q = searchQuery.trim().toLowerCase();
  const filteredOrders = orders.filter((order) =>
    !q ||
    (order.orderNumber || '').toLowerCase().includes(q) ||
    (order.tableNumber || '').toLowerCase().includes(q) ||
    order.items.some((item) => item.name.toLowerCase().includes(q))
  );

  const handleVoidSubmit = async () => {
    if (!voidReason.trim()) {
      toast.error('Please explain why this bill is being voided.');
      return;
    }
    setVoiding(true);
    try {
      await voidOrderAsync(voidTarget._id || voidTarget.id, voidReason.trim());
      toast.success(`Bill ${voidTarget.orderNumber} voided — stock and cashbook reversed.`);
      setVoidTarget(null);
      setVoidReason('');
    } catch (err) {
      toast.error(err?.message || "Couldn't void this bill — please try again.");
    } finally {
      setVoiding(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen selection:bg-accent-olive selection:text-white animate-in fade-in duration-500 font-sans p-4 md:p-8 space-y-6">
      {/* Tactical Ledger Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white p-6 border border-card-border shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/restaurant/dashboard')}
            className="w-10 h-10 bg-white border border-card-border hover:bg-slate-50 rounded-none flex items-center justify-center transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-serif italic font-black text-black tracking-tight uppercase">
                Restaurant <span className="text-accent-olive">Analysis & Ledger.</span>
              </h1>
            </div>
            <p className="text-[9px] text-text-muted font-bold uppercase tracking-[0.3em] mt-1">
              DAILY DISH CONSUMPTION • ITEM ORDERS • FINANCIAL AUDIT
            </p>
          </div>
        </div>

        {/* View Switch Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveView('dish_analysis')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'dish_analysis'
                ? 'bg-white text-black shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 size={14} className="text-accent-olive" /> Dish Sales Analysis
          </button>
          <button
            onClick={() => setActiveView('orders_ledger')}
            className={`px-4 py-2 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeView === 'orders_ledger'
                ? 'bg-white text-black shadow-sm font-black'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText size={14} /> Bills Ledger ({orders.length})
          </button>
        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 1. DISH HISTORY & ORDER COUNT ANALYSIS VIEW                                */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'dish_analysis' && (
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Filter Bar */}
          <div className="bg-white p-5 border border-card-border shadow-sm space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mr-1 flex items-center gap-1">
                  <Calendar size={12} className="text-accent-olive" /> Time Range:
                </span>
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'yesterday', label: 'Yesterday' },
                  { id: '7days', label: 'Last 7 Days' },
                  { id: '30days', label: 'Last 30 Days' },
                  { id: 'all', label: 'All Time' },
                  { id: 'custom', label: 'Custom' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => setDatePreset(preset.id)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                      datePreset === preset.id
                        ? 'bg-[#6A7051] text-white border-[#6A7051] shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full lg:w-auto justify-end">
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 border border-slate-200 hover:border-black rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-700 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-black text-white rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Printer size={13} /> Print Report
                </button>
              </div>
            </div>

            {/* Custom Dates & Search */}
            <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-100">
              {datePreset === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-[#6A7051]"
                  />
                  <span className="text-slate-400 text-xs">to</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[10px] font-bold text-slate-700 outline-none focus:border-[#6A7051]"
                  />
                </div>
              )}

              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="FILTER BY DISH NAME (e.g. CHICKEN BIRYANI, POMFRET, PRAWNS)..."
                  value={dishSearch}
                  onChange={(e) => setDishSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-[10px] font-bold uppercase tracking-wider text-slate-800 outline-none focus:border-[#6A7051]"
                />
              </div>
            </div>
          </div>

          {/* KPI Stat Cards */}
          {dishAnalysisData?.summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border border-card-border p-5 shadow-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOP SELLING DISH</span>
                  <Flame size={15} className="text-amber-500" />
                </div>
                <p className="text-lg font-black text-slate-900 uppercase truncate">
                  {dishAnalysisData.summary.topSellingDish?.name || '—'}
                </p>
                <p className="text-[9px] font-black text-[#6A7051]">
                  {dishAnalysisData.summary.topSellingDish ? `${dishAnalysisData.summary.topSellingDish.quantity} portions served` : '0 portions'}
                </p>
              </Card>

              <Card className="bg-white border border-card-border p-5 shadow-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOTAL PORTIONS SERVED</span>
                  <Utensils size={15} className="text-[#6A7051]" />
                </div>
                <p className="text-2xl font-serif italic font-black text-slate-900">
                  {dishAnalysisData.summary.totalPortionsSold} <span className="text-xs font-normal text-slate-400 font-sans">dishes</span>
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  {dishAnalysisData.summary.daysCount} active day(s)
                </p>
              </Card>

              <Card className="bg-white border border-card-border p-5 shadow-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">TOTAL DISH REVENUE</span>
                  <TrendingUp size={15} className="text-emerald-500" />
                </div>
                <p className="text-2xl font-serif italic font-black text-emerald-700">
                  ₹{fmtRupee(dishAnalysisData.summary.totalDishRevenue)}
                </p>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                  Across {dishAnalysisData.summary.uniqueDishesCount} unique dishes
                </p>
              </Card>

              <Card className="bg-black text-white p-5 shadow-sm space-y-1">
                <div className="flex justify-between items-start">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">AVG PORTIONS / DAY</span>
                  <Sparkles size={15} className="text-accent-olive" />
                </div>
                <p className="text-2xl font-serif italic font-black text-accent-olive">
                  {dishAnalysisData.summary.averagePortionsPerDay}
                </p>
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                  Portions dispatched per day
                </p>
              </Card>
            </div>
          )}

          {/* Section 1: Day-Wise Breakdown (Orders per day e.g. Chicken Biryani - 5) */}
          <div className="bg-white border border-card-border shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <Calendar size={15} className="text-[#6A7051]" />
                  Day-Wise Dish Order Manifest (Quantity Per Day)
                </h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Breakdown of dishes ordered per day
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={expandAllDates}
                  className="text-[8px] font-black uppercase text-slate-500 hover:text-black tracking-wider cursor-pointer"
                >
                  Expand All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={collapseAllDates}
                  className="text-[8px] font-black uppercase text-slate-500 hover:text-black tracking-wider cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {loadingAnalysis ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                Loading dish sales analysis...
              </div>
            ) : !dishAnalysisData?.dailyBreakdown?.length ? (
              <div className="p-12 text-center space-y-2 opacity-50">
                <Utensils size={36} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-black uppercase tracking-wider text-slate-700">No dish sales found</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                  No orders match the selected date filter
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {dishAnalysisData.dailyBreakdown.map((day) => {
                  const isExpanded = !!expandedDates[day.date];
                  return (
                    <div key={day.date} className="p-4 transition-all hover:bg-slate-50/30">
                      {/* Date Header Strip */}
                      <button
                        type="button"
                        onClick={() => toggleDateExpanded(day.date)}
                        className="w-full flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#6A7051]/10 border border-[#6A7051]/20 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[7px] font-black uppercase text-slate-500">
                              {new Date(day.date).toLocaleString('en-US', { month: 'short' })}
                            </span>
                            <span className="text-sm font-black text-slate-900 leading-none">
                              {new Date(day.date).getDate()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                              {day.displayDate}
                            </h3>
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {day.orderCount} Bills Settled · {day.dishes.length} Distinct Dishes
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest block">Day Total</span>
                            <span className="text-sm font-serif italic font-black text-[#6A7051]">
                              ₹{fmtRupee(day.totalRevenue)}
                            </span>
                            <span className="text-[8px] font-black text-slate-600 block">
                              ({day.totalPortions} portions)
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      </button>

                      {/* Expanded Dishes Grid */}
                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                            {day.dishes.map((dish) => (
                              <div
                                key={dish.name}
                                className="p-3 bg-slate-50/80 border border-slate-200/80 rounded-xl flex items-center justify-between gap-2 hover:border-[#6A7051] transition-all"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-[10px] font-black uppercase text-slate-800 truncate">
                                    {dish.name}
                                  </p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                                    Rate: ₹{fmtRupee(dish.rate)} · {dish.orderCount} order(s)
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="inline-block px-2 py-0.5 bg-[#6A7051] text-white text-[10px] font-black rounded-md">
                                    × {dish.quantity}
                                  </span>
                                  <span className="block text-[9px] font-serif italic font-bold text-[#6A7051] mt-0.5">
                                    ₹{fmtRupee(dish.revenue)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Aggregated Dish Performance Ranking */}
          <div className="bg-white border border-card-border shadow-sm rounded-xl overflow-hidden">
            <div className="p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
                  <ChefHat size={15} className="text-[#6A7051]" />
                  Item Sales Aggregates & Ranking
                </h2>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Cumulative summary across selected date range
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400">Rank</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400">Dish Name</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 text-center">Total Portions</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 text-center">Days Active</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 text-center">Daily Avg</th>
                    <th className="px-5 py-3 text-[8px] font-black uppercase tracking-widest text-slate-400 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!dishAnalysisData?.dishAggregates || dishAnalysisData.dishAggregates.length === 0) ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No dish data found.
                      </td>
                    </tr>
                  ) : (
                    dishAnalysisData.dishAggregates.map((dish, idx) => (
                      <tr key={dish.name} className="hover:bg-slate-50/60 transition-all">
                        <td className="px-5 py-3 text-[10px] font-black text-slate-400">
                          #{idx + 1}
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-[11px] font-black uppercase text-slate-900">
                            {dish.name}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 text-[10px] font-black rounded-lg">
                            {dish.totalQuantity} portions
                          </span>
                        </td>
                        <td className="px-5 py-3 text-center text-[10px] font-bold text-slate-600">
                          {dish.daysOrdered} day(s)
                        </td>
                        <td className="px-5 py-3 text-center text-[10px] font-black text-[#6A7051]">
                          {dish.avgPerDay} / day
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="text-sm font-serif italic font-black text-slate-900">
                            ₹{fmtRupee(dish.totalRevenue)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────────── */}
      {/* 2. ORDER BILLS LEDGER VIEW                                                 */}
      {/* ────────────────────────────────────────────────────────────────────────── */}
      {activeView === 'orders_ledger' && (
        <div className="space-y-4 max-w-6xl mx-auto">
          {/* Search Matrix */}
          <div className="flex flex-col md:flex-row gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="SEARCH BY BILL NO, TABLE, OR DISH NAME..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-card-border py-4 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:ring-1 focus:ring-accent-olive outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Tactical Record List */}
          <div className="space-y-3">
            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
              const style = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING;
              return (
              <Card key={order.id} padding="none" className="bg-white border border-card-border group hover:border-accent-olive transition-all shadow-sm relative overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                  <div className="flex items-center flex-1">
                    {/* Status Indicator Bar */}
                    <div className={`w-1.5 self-stretch ${style.bar}`} />

                    <div className="p-5 flex items-center gap-6 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-slate-50 border border-card-border flex items-center justify-center shrink-0 group-hover:bg-accent-olive group-hover:text-white transition-all duration-300">
                         <FileText size={20} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-1.5">
                          <h3 className="font-black text-black text-sm tracking-tight uppercase italic font-serif">
                            #{order.orderNumber}
                          </h3>
                          <Badge className="bg-slate-100 text-slate-400 text-[7px] font-black border-none px-2 h-4 uppercase">{order.paymentMethod}</Badge>
                          <Badge className="bg-slate-100 text-slate-400 text-[7px] font-black border-none px-2 h-4 uppercase">{order.tableNumber}</Badge>
                        </div>
                        <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase line-clamp-1 mb-2">
                          {order.items.map(i => `${i.name} [x${i.quantity}]`).join(' • ')}
                        </p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-slate-400">
                             <Clock size={10} />
                             <span className="text-[8px] font-black uppercase tracking-widest">{new Date(order.timestamp).toLocaleString().toUpperCase()}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-200" />
                          <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${style.label}`}>{style.text}</span>
                        </div>
                        {order.status === 'CANCELLED' && order.voidReason && (
                          <p className="text-[8px] text-rose-500 font-bold uppercase tracking-widest mt-1">Reason: {order.voidReason}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 p-5 lg:pl-0 border-t lg:border-t-0 border-slate-50 bg-slate-50/30 lg:bg-transparent">
                    <div className="text-right min-w-[100px]">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">SETTLEMENT</p>
                      <p className="text-xl font-serif italic font-black text-black tracking-tight leading-none">₹{fmtRupee(order.total)}</p>
                    </div>
                    <div className="flex gap-1.5">
                       <button
                         onClick={() => setPrintOrder(order)}
                         title="Reprint bill"
                         className="w-9 h-9 border border-card-border bg-white text-slate-500 hover:bg-black hover:text-white hover:border-black transition-all flex items-center justify-center cursor-pointer"
                       >
                          <Printer size={14} />
                       </button>
                       {order.status === 'PAID' && (
                         <button
                           onClick={() => { setVoidTarget(order); setVoidReason(''); }}
                           title="Void this bill"
                           className="w-9 h-9 border border-card-border bg-white text-slate-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center justify-center cursor-pointer"
                         >
                            <Ban size={14} />
                         </button>
                       )}
                    </div>
                  </div>
                </div>
              </Card>
              );
            }) : (
              <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 opacity-20">
                 <History size={64} className="mb-4 text-slate-300" />
                 <h3 className="text-xl font-serif italic font-black text-black uppercase tracking-tight">Zero Transactions.</h3>
                 <p className="text-[9px] font-black uppercase tracking-[0.3em] mt-2">No archive records found for current query</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reprint Modal */}
      {printOrder && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="no-print p-3 flex justify-between items-center border-b border-slate-100 sticky top-0 bg-white z-10">
              <button onClick={() => setPrintOrder(null)} className="text-xs font-black uppercase text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer">
                <X size={14} /> Close
              </button>
              <button
                onClick={() => window.print()}
                className="bg-[#6A7051] text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer"
              >
                <Printer size={14} /> Print
              </button>
            </div>
            <div className="print-root p-6 space-y-4" style={{ background: '#ffffff', color: '#000000' }}>
              <div className="text-center space-y-1">
                <h2 className="text-lg font-black uppercase">{outletSettings?.name || 'Golden Seafood Restaurant'}</h2>
                <p className="text-[10px]">{outletSettings?.location || 'Fresh Seafood & Dine-In'}</p>
                <div className="flex flex-col text-[9px]">
                  {outletSettings?.gstin && <span>GSTIN: {outletSettings.gstin}</span>}
                  {outletSettings?.phone && <span>Tel: {outletSettings.phone}</span>}
                </div>
                <p className="text-[9px] font-bold uppercase mt-1">Duplicate Bill / Reprint</p>
              </div>
              <div className="border-t border-b border-black py-2 grid grid-cols-2 gap-y-1 text-xs">
                <span><strong>Bill No:</strong> {printOrder.orderNumber}</span>
                <span className="text-right"><strong>Table:</strong> {printOrder.tableNumber}</span>
                <span><strong>Date:</strong> {new Date(printOrder.timestamp).toLocaleString()}</span>
                <span className="text-right"><strong>Payment:</strong> {printOrder.paymentMethod}</span>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-black">
                    <th className="text-left py-1">Item</th>
                    <th className="text-center py-1">Qty</th>
                    <th className="text-right py-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {printOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1">{item.name}</td>
                      <td className="py-1 text-center">{item.quantity}</td>
                      <td className="py-1 text-right">₹{fmtRupee(item.rate * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-black pt-2 text-xs space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>₹{fmtRupee(printOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span>CGST + SGST</span><span>₹{fmtRupee((printOrder.cgst || 0) + (printOrder.sgst || 0))}</span></div>
                {printOrder.discountAmount > 0 && (
                  <div className="flex justify-between"><span>Discount</span><span>-₹{fmtRupee(printOrder.discountAmount)}</span></div>
                )}
                <div className="flex justify-between text-base font-black border-t border-black pt-1 mt-1">
                  <span>Total</span><span>₹{fmtRupee(printOrder.total)}</span>
                </div>
              </div>
              {printOrder.status === 'CANCELLED' && (
                <p className="text-center text-[10px] font-black uppercase text-rose-600 border border-rose-300 py-1">
                  This bill was voided{printOrder.voidReason ? ` — ${printOrder.voidReason}` : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Void Reason Modal */}
      {voidTarget && (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-slate-800">Void bill {voidTarget.orderNumber}?</h3>
              <button onClick={() => setVoidTarget(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer"><X size={16} /></button>
            </div>
            <p className="text-xs text-slate-500">
              This reverses the ₹{fmtRupee(voidTarget.total)} sale, restores kitchen stock, and reverses the cashbook entry for the currently open shift. This can't be undone.
            </p>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-500">Reason (required)</label>
              <textarea
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                placeholder="e.g. Customer billed twice by mistake"
                rows={3}
                className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-rose-400 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setVoidTarget(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleVoidSubmit}
                disabled={voiding}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-lg text-[10px] font-black uppercase hover:bg-rose-700 disabled:opacity-50 cursor-pointer"
              >
                {voiding ? 'Voiding...' : 'Void Bill'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrderHistory;

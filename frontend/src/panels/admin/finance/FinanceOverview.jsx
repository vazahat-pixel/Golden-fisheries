import React, { useCallback, useEffect, useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  RefreshCw,
  PieChart,
  Layers,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { reportsService } from '../../../services/reportsService';
import { masterService } from '../../../services/masterService';
import { AdminPageHeader, AdminCard, AdminBtn } from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const formatCurrency = (n) => {
  const v = Number(n);
  if (Number.isNaN(v) || v === null) return '₹ 0.00';
  return `₹ ${v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatQty = (n, decimals = 2) => {
  const v = Number(n);
  if (Number.isNaN(v) || v === null) return '0.00';
  return v.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const formatDateDisplay = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// Excel CSV Exporter Helper with UTF-8 BOM
const downloadCsv = (filename, csvContent) => {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const FinanceOverview = () => {
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [pnl, setPnl] = useState(null);
  const [stock, setStock] = useState([]);
  const [activeTab, setActiveTab] = useState('summary');

  // Filter state
  const [periodPreset, setPeriodPreset] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const loadData = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const [s, e, p, inv] = await Promise.all([
        reportsService.getSales(filters).catch((err) => { console.error('Sales error:', err); return null; }),
        reportsService.getExpenses(filters).catch((err) => { console.error('Expenses error:', err); return null; }),
        reportsService.getProfitability(filters).catch((err) => { console.error('P&L error:', err); return null; }),
        masterService.inventory.getAll({ limit: 200 }).catch((err) => { console.error('Inventory error:', err); return null; }),
      ]);

      setSales(s?.data ?? s);
      const expList = e?.data ?? e;
      setExpenses(Array.isArray(expList) ? expList : []);
      setPnl(p?.data ?? p);

      const invList = inv?.data ?? inv?.docs ?? (Array.isArray(inv) ? inv : []);
      setStock(invList);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      toast.error('Failed to refresh financial reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApplyPreset = (preset) => {
    setPeriodPreset(preset);
    const now = new Date();
    let from = '';
    let to = '';

    if (preset === 'today') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      from = start.toISOString();
      to = now.toISOString();
    } else if (preset === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      from = start.toISOString();
      to = now.toISOString();
    } else if (preset === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      from = start.toISOString();
      to = now.toISOString();
    }

    setFromDate(from ? from.split('T')[0] : '');
    setToDate(to ? to.split('T')[0] : '');

    const filters = {};
    if (from) filters.from = from;
    if (to) filters.to = to;
    loadData(filters);
  };

  const handleCustomFilter = (e) => {
    e.preventDefault();
    setPeriodPreset('custom');
    const filters = {};
    if (fromDate) filters.from = new Date(fromDate).toISOString();
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      filters.to = end.toISOString();
    }
    loadData(filters);
  };

  // Financial calculations
  const totalRevenue = sales?.totalCumulativeRevenue ?? 0;
  const wholesaleRev = sales?.wholesale?.totalRevenue ?? 0;
  const wholesaleTax = sales?.wholesale?.taxCollected ?? 0;
  const wholesaleCount = sales?.wholesale?.invoiceCount ?? 0;

  const restaurantRev = sales?.restaurant?.totalRevenue ?? 0;
  const restaurantTax = sales?.restaurant?.taxCollected ?? 0;
  const restaurantCount = sales?.restaurant?.ticketCount ?? 0;

  const fishmallRev = sales?.fishmall?.totalRevenue ?? 0;
  const fishmallTax = sales?.fishmall?.taxCollected ?? 0;
  const fishmallCount = sales?.fishmall?.retailSaleCount ?? 0;

  const totalExpensesSpent = pnl?.operationalExpenses ?? expenses.reduce((sum, item) => sum + (item.totalSpent || 0), 0);
  const netProfit = pnl?.netProfits ?? (totalRevenue - totalExpensesSpent);
  const profitMargin = pnl?.marginPercentage ?? (totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0);

  // --- Export Full Excel / CSV Report ---
  const exportFullReportExcel = () => {
    try {
      const dateTag = new Date().toISOString().split('T')[0];
      let csv = '';

      // Section 1: Header
      csv += 'GOLDEN FISHERIES — CONSOLIDATED FINANCIAL & P&L REPORT\n';
      csv += `Generated On,${new Date().toLocaleString('en-IN')}\n`;
      csv += `Period Filter,${periodPreset.toUpperCase()} ${fromDate ? `(${fromDate} to ${toDate})` : ''}\n\n`;

      // Section 2: Executive Summary
      csv += '1. EXECUTIVE FINANCIAL SUMMARY\n';
      csv += 'Metric,Amount (INR),Notes\n';
      csv += `Gross Cumulative Revenue,${totalRevenue.toFixed(2)},Across Wholesale Billing POS and Retail\n`;
      csv += `Total Operational Expenses,${totalExpensesSpent.toFixed(2)},Approved corporate and operational expenses\n`;
      csv += `Net Profit / Loss,${netProfit.toFixed(2)},Net profit before tax adjustments\n`;
      csv += `Profit Margin (%),${profitMargin.toFixed(2)}%,Net margin ratio\n`;
      csv += `Tracked Inventory SKUs,${stock.length},Central Procurement stock items\n\n`;

      // Section 3: Revenue Breakdown by Sales Channel
      csv += '2. REVENUE BREAKDOWN BY SALES CHANNEL\n';
      csv += 'Sales Channel,Invoice / Ticket Count,Tax Collected (INR),Subtotal (INR),Total Revenue (INR),% Share\n';
      const wShare = totalRevenue > 0 ? (wholesaleRev / totalRevenue) * 100 : 0;
      const rShare = totalRevenue > 0 ? (restaurantRev / totalRevenue) * 100 : 0;
      const fShare = totalRevenue > 0 ? (fishmallRev / totalRevenue) * 100 : 0;

      csv += `Wholesale Procurement Billing,${wholesaleCount},${wholesaleTax.toFixed(2)},${(wholesaleRev - wholesaleTax).toFixed(2)},${wholesaleRev.toFixed(2)},${wShare.toFixed(2)}%\n`;
      csv += `GF Restaurant POS,${restaurantCount},${restaurantTax.toFixed(2)},${(restaurantRev - restaurantTax).toFixed(2)},${restaurantRev.toFixed(2)},${rShare.toFixed(2)}%\n`;
      csv += `GF Fish Mall Retail,${fishmallCount},${fishmallTax.toFixed(2)},${(fishmallRev - fishmallTax).toFixed(2)},${fishmallRev.toFixed(2)},${fShare.toFixed(2)}%\n`;
      csv += `CONSOLIDATED TOTAL,${wholesaleCount + restaurantCount + fishmallCount},${(wholesaleTax + restaurantTax + fishmallTax).toFixed(2)},${(totalRevenue - (wholesaleTax + restaurantTax + fishmallTax)).toFixed(2)},${totalRevenue.toFixed(2)},100.00%\n\n`;

      // Section 4: Expense Breakdown by Category
      csv += '3. APPROVED OPERATIONAL EXPENSES BY CATEGORY\n';
      csv += 'Expense Category,Record Count,Total Spent (INR),% Share of Expenses\n';
      if (expenses.length === 0) {
        csv += 'No approved expense records found for this period\n';
      } else {
        expenses.forEach((item) => {
          const expShare = totalExpensesSpent > 0 ? (item.totalSpent / totalExpensesSpent) * 100 : 0;
          csv += `"${item._id || 'OTHER'}",${item.recordCount || 0},${(item.totalSpent || 0).toFixed(2)},${expShare.toFixed(2)}%\n`;
        });
        csv += `TOTAL EXPENSES,${expenses.reduce((s, i) => s + (i.recordCount || 0), 0)},${totalExpensesSpent.toFixed(2)},100.00%\n\n`;
      }

      // Section 5: Procurement Inventory Stock Valuation
      csv += '4. CENTRAL PROCUREMENT STOCK VALUATION\n';
      csv += 'Product Name,Category,Quantity (KG),Unit,Min Limit (KG),Reorder Status\n';
      stock.forEach((item) => {
        const qty = Number(item.quantity) || 0;
        const minL = Number(item.minStockLimit) || 50;
        const st = qty <= minL ? 'CRITICAL_LOW' : 'OK';
        csv += `"${item.name || 'SKU'}",${item.category || 'GENERAL'},${qty.toFixed(2)},${item.unit || item.baseUnit || 'KG'},${minL},${st}\n`;
      });

      downloadCsv(`Golden_Fisheries_Finance_PnL_${dateTag}.csv`, csv);
      toast.success('Entire Finance & P&L Report downloaded for Excel');
    } catch (err) {
      console.error('CSV Export Error:', err);
      toast.error('Could not generate Excel report');
    }
  };

  return (
    <div className="pb-16 font-sans">
      {/* Page Header */}
      <AdminPageHeader
        title="Finance & P&L Control"
        subtitle="Consolidated financial reports, revenue streams, operational expenses, and Excel downloads"
        badge="Finance & Accounting"
        actions={
          <div className="flex flex-wrap gap-2">
            <AdminBtn variant="outline" onClick={() => loadData()} disabled={loading}>
              <RefreshCw size={14} className={`mr-1 inline ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </AdminBtn>
            <AdminBtn
              variant="primary"
              onClick={exportFullReportExcel}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold gap-1 shadow-md"
            >
              <FileSpreadsheet size={16} />
              Export Full P&L (Excel)
            </AdminBtn>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <div className="bg-white border border-card-border p-4 mb-6 shadow-sm rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1">
            <Calendar size={14} className="text-brand-olive" /> Period:
          </span>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today' },
            { id: 'month', label: 'This Month' },
            { id: 'year', label: 'This Year' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p.id)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                periodPreset === p.id
                  ? 'bg-brand-olive text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleCustomFilter} className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            className="border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-700"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            className="border border-slate-300 rounded px-2.5 py-1 text-xs font-medium text-slate-700"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
          <button
            type="submit"
            className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded"
          >
            Apply Range
          </button>
        </form>
      </div>

      {/* 4 Key Financial Indicator Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AdminCard className="p-5 border-l-4 border-l-emerald-600 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Gross Sales (Period)</p>
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 font-mono">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[10px] text-emerald-700 font-bold mt-1">
            {wholesaleCount + restaurantCount + fishmallCount} total sales transactions
          </p>
        </AdminCard>

        <AdminCard className="p-5 border-l-4 border-l-rose-500 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Operational Expenses</p>
            <TrendingDown size={18} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 font-mono">
            {formatCurrency(totalExpensesSpent)}
          </p>
          <p className="text-[10px] text-rose-600 font-bold mt-1">
            {expenses.reduce((s, i) => s + (i.recordCount || 0), 0)} approved vouchers
          </p>
        </AdminCard>

        <AdminCard className={`p-5 border-l-4 shadow-sm ${netProfit >= 0 ? 'border-l-green-600' : 'border-l-red-600'}`}>
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Net P&L (Profit / Loss)</p>
            <DollarSign size={18} className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'} />
          </div>
          <p className={`text-2xl font-black mt-2 font-mono ${netProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {formatCurrency(netProfit)}
          </p>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            Sales minus operational costs
          </p>
        </AdminCard>

        <AdminCard className="p-5 border-l-4 border-l-amber-500 shadow-sm">
          <div className="flex justify-between items-start">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Net Profit Margin</p>
            <PieChart size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black mt-2 text-slate-900 font-mono">
            {profitMargin.toFixed(2)} %
          </p>
          <p className="text-[10px] text-amber-700 font-bold mt-1">
            {stock.length} inventory SKUs tracked
          </p>
        </AdminCard>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-card-border mb-6">
        {[
          { id: 'summary', label: 'P&L Revenue Streams', icon: Layers },
          { id: 'expenses', label: 'Expense Breakdown', icon: DollarSign },
          { id: 'stock', label: 'Procurement Stock Snapshot', icon: Package },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 -mb-px flex items-center gap-1.5 transition-colors ${
              activeTab === id
                ? 'border-brand-olive text-brand-olive bg-slate-50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* TAB 1: REVENUE STREAMS BREAKDOWN */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <AdminCard className="p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2 border-b pb-3">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                  <FileText size={16} className="text-brand-olive" /> Consolidated Revenue Streams
                </h3>
                <p className="text-[11px] text-text-muted">
                  Revenue breakdown across Wholesale Procurement, GF Restaurant POS, and GF Fish Mall Retail
                </p>
              </div>
              <button
                type="button"
                onClick={exportFullReportExcel}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded"
              >
                <Download size={14} /> Export Revenue CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b text-slate-700 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3">Sales Channel</th>
                    <th className="p-3 text-center">Invoices / Orders</th>
                    <th className="p-3 text-right">Subtotal (₹)</th>
                    <th className="p-3 text-right">Tax Collected (₹)</th>
                    <th className="p-3 text-right">Total Revenue (₹)</th>
                    <th className="p-3 text-right">Share (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-sans text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Wholesale Procurement Billing
                    </td>
                    <td className="p-3 text-center font-sans font-bold">{wholesaleCount}</td>
                    <td className="p-3 text-right">{formatQty(wholesaleRev - wholesaleTax)}</td>
                    <td className="p-3 text-right text-slate-600">{formatQty(wholesaleTax)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(wholesaleRev)}</td>
                    <td className="p-3 text-right font-sans font-bold text-blue-600">
                      {totalRevenue > 0 ? ((wholesaleRev / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-sans text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> GF Restaurant POS
                    </td>
                    <td className="p-3 text-center font-sans font-bold">{restaurantCount}</td>
                    <td className="p-3 text-right">{formatQty(restaurantRev - restaurantTax)}</td>
                    <td className="p-3 text-right text-slate-600">{formatQty(restaurantTax)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(restaurantRev)}</td>
                    <td className="p-3 text-right font-sans font-bold text-amber-600">
                      {totalRevenue > 0 ? ((restaurantRev / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-sans text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> GF Fish Mall Retail
                    </td>
                    <td className="p-3 text-center font-sans font-bold">{fishmallCount}</td>
                    <td className="p-3 text-right">{formatQty(fishmallRev - fishmallTax)}</td>
                    <td className="p-3 text-right text-slate-600">{formatQty(fishmallTax)}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(fishmallRev)}</td>
                    <td className="p-3 text-right font-sans font-bold text-emerald-600">
                      {totalRevenue > 0 ? ((fishmallRev / totalRevenue) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 text-xs">
                    <td className="p-3 font-sans uppercase">Consolidated Total</td>
                    <td className="p-3 text-center font-sans">{wholesaleCount + restaurantCount + fishmallCount}</td>
                    <td className="p-3 text-right font-mono">{formatQty(totalRevenue - (wholesaleTax + restaurantTax + fishmallTax))}</td>
                    <td className="p-3 text-right font-mono">{formatQty(wholesaleTax + restaurantTax + fishmallTax)}</td>
                    <td className="p-3 text-right font-mono text-emerald-700">{formatCurrency(totalRevenue)}</td>
                    <td className="p-3 text-right font-sans">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 2: EXPENSES BREAKDOWN */}
      {activeTab === 'expenses' && (
        <AdminCard className="p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2 border-b pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                <DollarSign size={16} className="text-rose-600" /> Approved Operational Expenses
              </h3>
              <p className="text-[11px] text-text-muted">Categorized corporate expenses approved by finance managers</p>
            </div>
            <button
              type="button"
              onClick={exportFullReportExcel}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 bg-rose-50 px-3 py-1.5 border border-rose-200 rounded"
            >
              <Download size={14} /> Export Expenses CSV
            </button>
          </div>

          {expenses.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No approved expense records found for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b text-slate-700 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3">Expense Category</th>
                    <th className="p-3 text-center">Record Count</th>
                    <th className="p-3 text-right">Total Spent (₹)</th>
                    <th className="p-3 text-right">% Share of Expenses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {expenses.map((item) => {
                    const share = totalExpensesSpent > 0 ? (item.totalSpent / totalExpensesSpent) * 100 : 0;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold font-sans text-slate-800 uppercase">{item._id || 'OTHER'}</td>
                        <td className="p-3 text-center font-sans">{item.recordCount || 0}</td>
                        <td className="p-3 text-right font-bold text-rose-700">{formatCurrency(item.totalSpent || 0)}</td>
                        <td className="p-3 text-right font-sans font-bold text-slate-600">{share.toFixed(1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 text-xs">
                    <td className="p-3 font-sans uppercase">Total Expenses</td>
                    <td className="p-3 text-center font-sans">{expenses.reduce((s, i) => s + (i.recordCount || 0), 0)}</td>
                    <td className="p-3 text-right font-mono text-rose-700">{formatCurrency(totalExpensesSpent)}</td>
                    <td className="p-3 text-right font-sans">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </AdminCard>
      )}

      {/* TAB 3: PROCUREMENT STOCK SNAPSHOT */}
      {activeTab === 'stock' && (
        <AdminCard className="p-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2 border-b pb-3">
            <div>
              <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
                <Package size={16} className="text-brand-olive" /> Procurement Stock Snapshot
              </h3>
              <p className="text-[11px] text-text-muted">
                Central procurement ledger stock reserves (formatted cleanly to 2 decimal places)
              </p>
            </div>
            <button
              type="button"
              onClick={exportFullReportExcel}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 border border-emerald-200 rounded"
            >
              <Download size={14} /> Export Inventory CSV
            </button>
          </div>

          {stock.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No inventory records</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b text-slate-700 font-black uppercase tracking-wider text-[10px]">
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-right">Current Qty (KG)</th>
                    <th className="p-3 text-right">Min Reorder Limit</th>
                    <th className="p-3 text-center">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {stock.map((p) => {
                    const qty = Number(p.quantity) || 0;
                    const minL = Number(p.minStockLimit) || 50;
                    const isLow = qty <= minL;
                    return (
                      <tr key={p._id || p.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold font-sans text-slate-800">{p.name}</td>
                        <td className="p-3 font-sans text-slate-500 uppercase text-[10px]">{p.category || 'GENERAL'}</td>
                        <td className="p-3 text-right font-bold text-slate-900">{formatQty(qty, 2)}</td>
                        <td className="p-3 text-right text-slate-500">{formatQty(minL, 0)}</td>
                        <td className="p-3 text-center font-sans">
                          {isLow ? (
                            <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-200 rounded">
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border bg-emerald-50 text-emerald-800 border-emerald-200 rounded">
                              Sufficient
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 text-xs">
                    <td className="p-3 font-sans uppercase">Total Stock (KG)</td>
                    <td className="p-3 font-sans">{stock.length} SKUs</td>
                    <td className="p-3 text-right font-mono text-emerald-700">
                      {formatQty(stock.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0), 2)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </AdminCard>
      )}
    </div>
  );
};

export default FinanceOverview;

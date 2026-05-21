import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package, PlusCircle, RefreshCw } from 'lucide-react';
import { reportsService } from '../../../services/reportsService';
import { masterService } from '../../../services/masterService';
import {
  AdminPageHeader,
  AdminCard,
  AdminDataTable,
  AdminBtn,
  StatusBadge,
} from '../shared/adminUi';

const TX_TYPE_LABELS = {
  PROCUREMENT_IN: 'Procurement in',
  SALES_OUT: 'Sales out',
  RESTAURANT_CONSUMPTION: 'Restaurant',
  FISHMALL_SALE: 'FishMall sale',
  RETURN_IN: 'Return in',
  MANUAL_ADJUSTMENT: 'Manual adjustment',
};

const formatQty = (n) => {
  const v = Number(n);
  if (Number.isNaN(v)) return '—';
  return v.toLocaleString('en-IN', { maximumFractionDigits: 2 });
};

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const InventoryOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [rep, txnRes] = await Promise.all([
        reportsService.getInventory(),
        masterService.inventory.getTransactions({ limit: 50 }),
      ]);
      setSummary(rep?.data ?? rep);
      const rawTx = txnRes?.data ?? txnRes;
      const tx = Array.isArray(rawTx) ? rawTx : rawTx?.docs ?? [];
      setTxns(tx);
    } catch {
      setSummary(null);
      setTxns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stockLevels = summary?.stockLevels ?? [];
  const criticalList = summary?.criticalReorderList ?? [];
  const totalKg = stockLevels.reduce((s, p) => s + (Number(p.quantity) || 0), 0);

  const stockColumns = [
    { key: 'name', label: 'Product' },
    { key: 'category', label: 'Category' },
    {
      key: 'quantity',
      label: 'Qty',
      render: (row) => (
        <span className="font-mono text-right block">{formatQty(row.quantity)}</span>
      ),
    },
    { key: 'unit', label: 'Unit', render: (row) => row.unit || 'KG' },
    {
      key: 'minStockLimit',
      label: 'Min limit',
      render: (row) => <span className="font-mono">{formatQty(row.minStockLimit)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) =>
        row.status === 'CRITICAL_LOW' ? (
          <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-200">
            Low stock
          </span>
        ) : (
          <StatusBadge status="ACTIVE" />
        ),
    },
  ];

  const txnColumns = [
    {
      key: 'createdAt',
      label: 'Date',
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: 'transactionCode',
      label: 'Code',
      render: (row) => row.transactionCode || '—',
    },
    {
      key: 'product',
      label: 'Product',
      render: (row) => row.productId?.name || row.product?.name || '—',
    },
    {
      key: 'type',
      label: 'Type',
      render: (row) => TX_TYPE_LABELS[row.type] || row.type?.replace(/_/g, ' ') || '—',
    },
    {
      key: 'quantity',
      label: 'Change',
      render: (row) => {
        const q = Number(row.quantity);
        const sign = q > 0 ? '+' : '';
        return (
          <span className={`font-mono ${q < 0 ? 'text-red-700' : 'text-emerald-700'}`}>
            {sign}
            {formatQty(q)}
          </span>
        );
      },
    },
    {
      key: 'newQuantity',
      label: 'Balance',
      render: (row) => <span className="font-mono">{formatQty(row.newQuantity)}</span>,
    },
    {
      key: 'remarks',
      label: 'Reference',
      render: (row) => (
        <span className="max-w-[200px] truncate block text-text-muted" title={row.remarks}>
          {row.remarks || '—'}
        </span>
      ),
    },
  ];

  const kpiCards = [
    { label: 'Product SKUs', value: summary?.totalProductSKUs ?? stockLevels.length },
    { label: 'Total stock (KG)', value: formatQty(totalKg) },
    { label: 'Critical low', value: summary?.criticalItemsCount ?? criticalList.length },
    { label: 'Ledger entries', value: txns.length },
  ];

  return (
    <div className="pb-12">
      <AdminPageHeader
        title="Procurement Inventory"
        subtitle="Central ERP stock only — Restaurant & Fish Mall maintain separate inventories"
        badge="Procurement"
        actions={
          <>
            <AdminBtn variant="outline" onClick={load} disabled={loading}>
              <RefreshCw size={14} className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </AdminBtn>
            <AdminBtn variant="primary" onClick={() => navigate('/admin/inventory/new')}>
              <PlusCircle size={14} className="inline mr-1" />
              Add SKU
            </AdminBtn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpiCards.map((c) => (
          <AdminCard key={c.label} className="p-4">
            <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{c.label}</p>
            <p className="text-xl font-black mt-1 text-brand-olive">{c.value}</p>
          </AdminCard>
        ))}
      </div>

      {criticalList.length > 0 && (
        <AdminCard className="p-4 mb-6 border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-amber-700" />
            <h3 className="text-xs font-black uppercase text-amber-800">Reorder required</h3>
          </div>
          <ul className="space-y-1 text-[11px] font-bold">
            {criticalList.map((p) => (
              <li key={p.productId} className="flex justify-between gap-4">
                <span>{p.name}</span>
                <span className="font-mono text-amber-800">
                  {formatQty(p.quantity)} / min {formatQty(p.minStockLimit)} {p.unit || 'KG'}
                </span>
              </li>
            ))}
          </ul>
        </AdminCard>
      )}

      <div className="mb-2 flex items-center gap-2">
        <Package size={16} className="text-brand-olive" />
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Live stock levels</h3>
      </div>
      <AdminDataTable
        columns={stockColumns}
        rows={stockLevels}
        loading={loading}
        emptyMessage="No products in inventory. Add a SKU to start tracking stock."
      />

      <div className="mt-8 mb-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive">Recent ledger movements</h3>
        <p className="text-[10px] text-text-muted mt-1">Procurement in/out, buyer sales, returns, and manual adjustments only</p>
      </div>
      <AdminDataTable
        columns={txnColumns}
        rows={txns}
        loading={loading}
        emptyMessage="No inventory transactions yet"
      />
    </div>
  );
};

export default InventoryOverview;

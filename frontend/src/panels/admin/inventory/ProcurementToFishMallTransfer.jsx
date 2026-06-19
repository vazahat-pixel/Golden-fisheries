import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  ArrowRightLeft,
  CheckCircle2,
  History,
  Plus,
  RefreshCw,
  Trash2,
  Package,
} from 'lucide-react';
import { masterService } from '../../../services/masterService';
import { stockTransferService } from '../../../services/stockTransferService';
import { fishMallOutletService, unwrapOutletList } from '../../../services/fishMallOutletService';
import { reportsService } from '../../../services/reportsService';
import {
  AdminPageHeader,
  AdminCard,
  AdminDataTable,
  AdminBtn,
  StatusBadge,
} from '../shared/adminUi';

const emptyLine = () => ({ productId: '', quantity: '' });

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

const ProcurementToFishMallTransfer = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('create');
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([emptyLine()]);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [transfers, setTransfers] = useState([]);
  const [ledgerPreview, setLedgerPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fishMallOutlets, setFishMallOutlets] = useState([]);
  const [destinationOutletId, setDestinationOutletId] = useState('');

  const loadProducts = useCallback(async () => {
    try {
      const res = await masterService.inventory.getAll({ limit: 200 });
      const list = Array.isArray(res?.data) ? res.data : res?.data?.docs ?? [];
      setProducts(
        list.map((p) => ({
          id: p._id || p.id,
          name: p.name,
          quantity: p.quantity ?? 0,
          unit: p.baseUnit || 'KG',
        }))
      );
    } catch {
      toast.error('Could not load procurement stock');
    }
  }, []);

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await stockTransferService.list({ limit: 50 });
      const payload = res?.data ?? res;
      const docs = Array.isArray(payload) ? payload : payload?.docs ?? [];
      setTransfers(docs);
    } catch {
      setTransfers([]);
      toast.error('Could not load transfer history');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLedger = useCallback(async () => {
    try {
      const res = await reportsService.getProcurementLedger({ limit: 30 });
      const data = res?.data ?? res;
      setLedgerPreview(data?.docs ?? []);
    } catch {
      setLedgerPreview([]);
    }
  }, []);

  const loadFishMallOutlets = useCallback(async () => {
    try {
      const res = await fishMallOutletService.list({ limit: 100, activeOnly: 'true' });
      const docs = unwrapOutletList(res);
      setFishMallOutlets(docs);
      setDestinationOutletId((prev) => {
        if (prev) return prev;
        const preferred = docs.find((o) => o.isDefault) || docs[0];
        return preferred ? preferred._id || preferred.id || '' : '';
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Could not load registered Fish Malls';
      toast.error(msg);
      setFishMallOutlets([]);
    }
  }, []);

  useEffect(() => {
    loadProducts();
    loadFishMallOutlets();
  }, [loadProducts, loadFishMallOutlets]);

  useEffect(() => {
    if (tab === 'create') loadFishMallOutlets();
    if (tab === 'history') loadTransfers();
    if (tab === 'ledger') loadLedger();
  }, [tab, loadTransfers, loadLedger, loadFishMallOutlets]);

  const updateLine = (idx, field, value) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, [field]: value } : l)));
  };

  const lineInfo = (line) => {
    const product = products.find((p) => String(p.id) === String(line.productId));
    const qty = parseFloat(line.quantity) || 0;
    const available = product?.quantity ?? 0;
    const over = qty > available;
    return { product, qty, available, over };
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payloadLines = lines
      .map((l) => ({
        productId: l.productId,
        quantity: parseFloat(l.quantity),
      }))
      .filter((l) => l.productId && l.quantity > 0);

    if (!payloadLines.length) {
      toast.error('Add at least one product with quantity');
      return;
    }
    if (!destinationOutletId) {
      toast.error('Select destination Fish Mall');
      return;
    }

    const overLine = lines.find((l) => lineInfo(l).over);
    if (overLine) {
      toast.error('Quantity exceeds available procurement stock');
      return;
    }

    setSubmitting(true);
    try {
      const res = await stockTransferService.create({
        destinationOutletId,
        lines: payloadLines,
        notes: notes || undefined,
      });
      const transfer = res?.data?.transfer ?? res?.data?.data?.transfer;
      toast.success(
        transfer?.transferNumber
          ? `Transfer ${transfer.transferNumber} created — pending dispatch`
          : 'Transfer note created'
      );
      setLines([emptyLine()]);
      setNotes('');
      setTab('history');
      loadTransfers();
      loadProducts();
    } catch (err) {
      const detail = err?.errors?.[0]?.message;
      toast.error(detail || err?.message || 'Failed to create transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id, transferNumber) => {
    if (!window.confirm(`Dispatch transfer ${transferNumber}? Stock will be deducted from Procurement.`)) return;
    try {
      await stockTransferService.dispatch(id);
      toast.success(`Transfer ${transferNumber} dispatched to Fish Mall`);
      loadTransfers();
      loadProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Dispatch failed');
    }
  };

  const handleCancel = async (id, transferNumber) => {
    const reason = window.prompt(`Cancel transfer ${transferNumber}? Enter reason:`);
    if (!reason?.trim()) return;
    try {
      await stockTransferService.cancel(id, reason.trim());
      toast.success('Transfer cancelled');
      loadTransfers();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Cancel failed');
    }
  };

  const historyColumns = [
    { key: 'transferNumber', label: 'Transfer #' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'destinationOutletId',
      label: 'Fish Mall',
      render: (row) => {
        const o = row.destinationOutletId;
        if (!o) return '—';
        if (typeof o === 'object') {
          return (
            <span className="text-[10px] font-bold">
              {o.name}
              {o.outletCode ? ` (${o.outletCode})` : ''}
            </span>
          );
        }
        return '—';
      },
    },
    {
      key: 'lines',
      label: 'Items',
      render: (row) => (
        <span className="text-[10px] font-bold">
          {(row.lines || []).map((l) => `${l.productName} (${formatQty(l.quantity)} KG)`).join(', ')}
        </span>
      ),
    },
    {
      key: 'transferDate',
      label: 'Date',
      render: (row) => formatDate(row.transferDate || row.createdAt),
    },
    {
      key: 'actions',
      label: '',
      render: (row) =>
        ['CREATED', 'PENDING_APPROVAL', 'DRAFT'].includes(row.status) ? (
          <div className="flex gap-1">
            <AdminBtn
              variant="primary"
              className="!py-1 !px-2 text-[9px]"
              onClick={() => handleApprove(row._id || row.id, row.transferNumber)}
            >
              <CheckCircle2 className="w-3 h-3 inline" /> Dispatch
            </AdminBtn>
            <AdminBtn
              variant="ghost"
              className="!py-1 !px-2 text-[9px]"
              onClick={() => handleCancel(row._id || row.id, row.transferNumber)}
            >
              Cancel
            </AdminBtn>
          </div>
        ) : (
          <span className="text-[9px] text-text-muted uppercase">—</span>
        ),
    },
  ];

  const ledgerColumns = [
    { key: 'transactionCode', label: 'Tx #' },
    {
      key: 'productId',
      label: 'Product',
      render: (row) => row.productId?.name || '—',
    },
    { key: 'type', label: 'Type' },
    {
      key: 'quantity',
      label: 'Change',
      render: (row) => (
        <span className={row.quantity >= 0 ? 'text-emerald-700' : 'text-red-700'}>
          {formatQty(row.quantity)}
        </span>
      ),
    },
    {
      key: 'newQuantity',
      label: 'Closing',
      render: (row) => formatQty(row.newQuantity),
    },
    {
      key: 'createdAt',
      label: 'When',
      render: (row) => formatDate(row.createdAt),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <AdminPageHeader
        badge="Procurement → Fish Mall"
        title="Stock Transfer"
        subtitle="Move warehouse stock into Fish Mall inventory (atomic on approval)"
        actions={
          <>
            <AdminBtn variant="ghost" onClick={() => navigate('/admin/inventory')}>
              <Package className="w-4 h-4" /> Inventory
            </AdminBtn>
            <AdminBtn variant="ghost" onClick={loadProducts}>
              <RefreshCw className="w-4 h-4" />
            </AdminBtn>
          </>
        }
      />

      <div className="flex gap-2 mb-6 border-b border-card-border">
        {[
          { id: 'create', label: 'New transfer', icon: Plus },
          { id: 'history', label: 'Transfer history', icon: History },
          { id: 'ledger', label: 'Procurement ledger', icon: ArrowRightLeft },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-wider border-b-2 -mb-px ${
              tab === id
                ? 'border-[#6B7550] text-[#6B7550]'
                : 'border-transparent text-text-muted'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <AdminCard className="p-6">
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="rounded-lg border border-card-border bg-[#F8F7F2] p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                  Destination Fish Mall *
                </label>
                <button
                  type="button"
                  onClick={loadFishMallOutlets}
                  className="text-[10px] font-black uppercase text-[#6B7550] hover:underline shrink-0"
                >
                  Refresh list
                </button>
              </div>
              <select
                className="w-full h-10 border border-card-border bg-white px-3 text-sm font-semibold rounded-erp focus:outline-none focus:ring-1 focus:ring-accent"
                value={destinationOutletId}
                onChange={(e) => setDestinationOutletId(e.target.value)}
                required
              >
                <option value="">Select Fish Mall</option>
                {fishMallOutlets.map((o) => (
                  <option key={o._id || o.id} value={o._id || o.id}>
                    {o.name}
                    {o.location ? ` — ${o.location}` : ''}
                    {o.outletCode ? ` [${o.outletCode}]` : ''}
                  </option>
                ))}
              </select>
              {fishMallOutlets.length === 0 && (
                <p className="text-[10px] text-amber-700 font-semibold">
                  No Fish Mall registered.{' '}
                  <button
                    type="button"
                    className="underline text-[#6B7550]"
                    onClick={() => navigate('/admin/outlets')}
                  >
                    Add under Outlets
                  </button>
                  , then refresh.
                </p>
              )}
            </div>

            <div className="space-y-3">
              {lines.map((line, idx) => {
                const { product, available, over } = lineInfo(line);
                return (
                  <div
                    key={idx}
                    className="rounded-lg border border-card-border bg-white p-4 space-y-2"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-6 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                          Product (procurement)
                        </label>
                        <select
                          className="w-full h-10 border border-card-border bg-white px-3 text-sm font-semibold rounded-erp focus:outline-none focus:ring-1 focus:ring-accent"
                          value={line.productId}
                          onChange={(e) => updateLine(idx, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — available {formatQty(p.quantity)} {p.unit}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-4 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                          Quantity (KG)
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="w-full h-10 border border-card-border bg-white px-3 text-sm font-mono rounded-erp focus:outline-none focus:ring-1 focus:ring-accent"
                          value={line.quantity}
                          onChange={(e) => updateLine(idx, 'quantity', e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 flex md:justify-end md:pt-6">
                        <button
                          type="button"
                          onClick={() =>
                            setLines((prev) =>
                              prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev
                            )
                          }
                          className="h-10 w-10 flex items-center justify-center rounded-erp border border-card-border text-red-600 hover:bg-red-50"
                          aria-label="Remove line"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {product && (
                      <p className={`text-[10px] font-semibold ${over ? 'text-red-600' : 'text-emerald-700'}`}>
                        Available: {formatQty(available)} KG
                        {over ? ' — exceeds stock' : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setLines((prev) => [...prev, emptyLine()])}
              className="text-[10px] font-black uppercase text-[#6B7550] flex items-center gap-1.5 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Add line
            </button>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-text-muted">
                Notes
              </label>
              <textarea
                className="w-full min-h-[80px] border border-card-border bg-white px-3 py-2.5 text-sm rounded-erp resize-y focus:outline-none focus:ring-1 focus:ring-accent"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Transfer note / remarks"
              />
            </div>

            <div className="pt-2">
              <AdminBtn type="submit" variant="primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create transfer note'}
              </AdminBtn>
            </div>
          </form>
        </AdminCard>
      )}

      {tab === 'history' && (
        <AdminCard className="p-4">
          {loading ? (
            <p className="text-sm text-text-muted p-4">Loading…</p>
          ) : (
            <AdminDataTable columns={historyColumns} rows={transfers} emptyLabel="No transfers yet" />
          )}
        </AdminCard>
      )}

      {tab === 'ledger' && (
        <AdminCard className="p-4">
          <AdminDataTable
            columns={ledgerColumns}
            rows={ledgerPreview}
            emptyLabel="No procurement movements"
          />
        </AdminCard>
      )}
    </div>
  );
};

export default ProcurementToFishMallTransfer;

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import {
  ErpFormFrame,
  ErpFieldRow,
  ErpSummaryBox,
  erpInputClass,
  erpSelectClass,
} from '../../../components/forms/ErpFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calculator, Printer, Save } from 'lucide-react';

const NetRate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips, saveNetRateAsync, loading } = useAdminStore();

  const [harvestId, setHarvestId] = useState(preselectId || '');
  const [productRates, setProductRates] = useState([]);
  const [deductions, setDeductions] = useState({
    tds: '',
    commission: '',
    soft: '',
    deductionTransport: '',
    deductionCommission: '',
    deductionSoft: '',
    deductionOther: '',
  });

  useEffect(() => {
    fetchHarvestSlips();
  }, [fetchHarvestSlips]);

  const harvest = useMemo(
    () => harvestSlips.find((h) => String(h._id || h.id) === String(harvestId)),
    [harvestSlips, harvestId]
  );

  useEffect(() => {
    if (!harvest) return;
    const lines = (harvest.products || harvest.items || []).map((p, i) => ({
      id: String(i),
      fishName: p.fishName || p.particulars || '',
      grossWeight: String(p.estimatedQty || p.totalWeight || ''),
      rate: String(p.rate || ''),
    }));
    setProductRates(lines.length ? lines : [{ id: '1', fishName: '', grossWeight: '', rate: '' }]);
  }, [harvest]);

  const grossAmount = productRates.reduce((sum, row) => {
    const w = parseFloat(row.grossWeight) || 0;
    const r = parseFloat(row.rate) || 0;
    return sum + w * r;
  }, 0);

  const totalDeductions = ['tds', 'deductionTransport', 'deductionCommission', 'deductionSoft', 'deductionOther'].reduce(
    (s, k) => s + (parseFloat(deductions[k]) || 0),
    0
  );

  const commissionAddition = parseFloat(deductions.commission) || 0;
  const loadingAddition = parseFloat(deductions.soft) || 0;
  const netPayable = Math.max(
    0,
    Math.round((grossAmount - totalDeductions + commissionAddition + loadingAddition) * 100) / 100
  );

  const handleSave = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    if (harvest?.status && !['CONFIRMED', 'PARTIALLY_CONVERTED'].includes(harvest.status)) {
      toast.error(`Harvest status "${harvest.status}" — confirm farmer approval first`);
      return;
    }
    const hasRates = productRates.some((r) => parseFloat(r.rate) > 0);
    if (!hasRates) {
      toast.error('Enter rate per kg for at least one fish line');
      return;
    }
    try {
      await saveNetRateAsync(harvestId, {
        productRates: productRates.map((r) => ({
          fishName: r.fishName,
          estimatedQty: parseFloat(r.grossWeight) || 0,
          rate: parseFloat(r.rate) || 0,
        })),
        ...Object.fromEntries(Object.entries(deductions).map(([k, v]) => [k, parseFloat(v) || 0])),
      });
      toast.success('Purchase invoice saved');
      navigate('/admin/procurement/harvest');
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    }
  };

  const confirmedHarvests = harvestSlips.filter((h) =>
    ['CONFIRMED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_TAPAL', 'PENDING', 'SENT', 'PENDING_CONFIRMATION', 'OPEN', 'PARTIAL_USED', 'CLOSED'].includes(h.status)
  );

  return (
    <div className="space-y-4 pb-12 erp-page">
      <div className="flex items-center gap-2 no-print">
        <button type="button" onClick={() => navigate(-1)} className="p-1.5 text-text-secondary hover:text-text-primary rounded-erp hover:bg-surface-hover">
          <ArrowLeft size={18} />
        </button>
        <h1 className="erp-h1 flex items-center gap-2 uppercase">
          <Calculator size={20} className="text-brand-yellow" /> Farmer Purchase Invoice
        </h1>
      </div>

      <ErpFormFrame
        title="Purchase Invoice"
        subtitle="Net rate · deductions · net payable"
        badge="Procurement"
        actions={
          <button type="button" onClick={() => window.print()} className="erp-form-btn-secondary no-print">
            <Printer size={14} /> Print
          </button>
        }
        footer={
          <div className="flex flex-wrap gap-2 no-print">
            <button type="button" onClick={handleSave} disabled={loading} className="erp-form-btn-primary flex-1 sm:flex-none min-w-[200px]">
              <Save size={14} /> {loading ? 'Saving…' : 'Save Purchase Invoice'}
            </button>
          </div>
        }
      >
        <ErpFieldRow label="Harvest Ref (H No)">
          <select className={erpSelectClass} value={harvestId} onChange={(e) => setHarvestId(e.target.value)}>
            <option value="">— Select harvest slip —</option>
            {confirmedHarvests.map((h) => {
              const isFinalized = h.netRateCalculated != null;
              return (
                <option key={h._id || h.id} value={h._id || h.id}>
                  {isFinalized ? '★ ' : ''}
                  {h.hNo || h.harvestNumber || h.tpNo} — {h.farmerName || h.partyName}
                  {isFinalized ? ` (Finalized: ₹${(h.totalPayableAmount || 0).toLocaleString('en-IN')})` : ''}
                </option>
              );
            })}
          </select>
        </ErpFieldRow>
        <ErpFieldRow label="Farmer">
          <input className={erpInputClass} readOnly value={harvest?.farmerName || '—'} />
        </ErpFieldRow>

        <p className="text-[11px] text-text-secondary mb-2 no-print">
          Enter <strong className="text-brand-olive">rate per kg (₹)</strong> for each fish line — amount and net payable update automatically.
        </p>

        <table className="erp-form-table">
          <thead>
            <tr>
              <th>Fish Item</th>
              <th className="text-right w-28">Gross Wt (KG)</th>
              <th className="text-right w-32">Rate (₹ / kg)</th>
              <th className="text-right w-28">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {productRates.map((row, idx) => {
              const amt = (parseFloat(row.grossWeight) || 0) * (parseFloat(row.rate) || 0);
              return (
                <tr key={row.id}>
                  <td>
                    <input
                      className="erp-table-readonly"
                      readOnly
                      value={row.fishName}
                      tabIndex={-1}
                    />
                  </td>
                  <td className="text-right">
                    <input
                      className="erp-table-readonly text-right"
                      readOnly
                      tabIndex={-1}
                      value={row.grossWeight}
                    />
                  </td>
                  <td className="text-right">
                    <input
                      className={`${erpInputClass} text-right min-w-[88px]`}
                      inputMode="decimal"
                      placeholder="Enter rate"
                      aria-label={`Rate per kg for ${row.fishName || `line ${idx + 1}`}`}
                      value={row.rate}
                      onChange={(e) => {
                        const next = [...productRates];
                        next[idx] = { ...row, rate: e.target.value };
                        setProductRates(next);
                      }}
                    />
                  </td>
                  <td className="text-right tabular-nums font-black text-brand-olive">{amt.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="text-right uppercase text-[10px]">
                Gross Amount
              </td>
              <td className="text-right tabular-nums text-brand-olive">₹{grossAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {[
            ['Commission (addition)', 'commission'],
            ['TDS', 'tds'],
            ['Loading (addition)', 'soft'],
            ['Transport Ded.', 'deductionTransport'],
            ['Commission Ded.', 'deductionCommission'],
            ['Loading Ded.', 'deductionSoft'],
            ['Other Deduction', 'deductionOther'],
          ].map(([label, key]) => (
            <ErpFieldRow key={key} label={label} compact>
              <input
                className={erpInputClass}
                inputMode="decimal"
                value={deductions[key]}
                onChange={(e) => setDeductions((d) => ({ ...d, [key]: e.target.value }))}
              />
            </ErpFieldRow>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <ErpSummaryBox label="Gross Amount" value={`₹${grossAmount.toLocaleString('en-IN')}`} />
          <ErpSummaryBox label="Commission (+)" value={`₹${commissionAddition.toLocaleString('en-IN')}`} />
          <ErpSummaryBox label="Loading (+)" value={`₹${loadingAddition.toLocaleString('en-IN')}`} />
          <ErpSummaryBox label="Total Deductions" value={`₹${totalDeductions.toLocaleString('en-IN')}`} variant="warn" />
          <ErpSummaryBox label="Net Payable" value={`₹${netPayable.toLocaleString('en-IN')}`} variant="total" />
        </div>
      </ErpFormFrame>
    </div>
  );
};

export default NetRate;

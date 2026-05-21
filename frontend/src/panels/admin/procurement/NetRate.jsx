import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Calculator, Printer } from 'lucide-react';

/**
 * Farmer Purchase Invoice — net rate & deductions (seafood office format).
 */
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

  const totalDeductions =
    ['tds', 'commission', 'soft', 'deductionTransport', 'deductionCommission', 'deductionSoft', 'deductionOther'].reduce(
      (s, k) => s + (parseFloat(deductions[k]) || 0),
      0
    );

  const netPayable = Math.max(0, Math.round((grossAmount - totalDeductions) * 100) / 100);

  const handleSave = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    if (harvest?.status && !['CONFIRMED', 'PARTIALLY_CONVERTED', 'PENDING', 'SENT'].includes(harvest.status)) {
      toast.error(`Harvest status "${harvest.status}" — confirm farmer approval first`);
    }
    try {
      await saveNetRateAsync(harvestId, {
        productRates: productRates.map((r) => ({
          fishName: r.fishName,
          estimatedQty: parseFloat(r.grossWeight) || 0,
          rate: parseFloat(r.rate) || 0,
        })),
        ...Object.fromEntries(
          Object.entries(deductions).map(([k, v]) => [k, parseFloat(v) || 0])
        ),
      });
      toast.success('Purchase invoice (net rate) saved');
      navigate('/admin/procurement/harvest');
    } catch (err) {
      toast.error(err?.message || 'Failed to save');
    }
  };

  const confirmedHarvests = harvestSlips.filter((h) =>
    ['CONFIRMED', 'PARTIALLY_CONVERTED', 'PENDING', 'SENT', 'PENDING_CONFIRMATION'].includes(h.status)
  );

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)} className="text-text-muted">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold uppercase text-brand-olive flex items-center gap-2">
          <Calculator size={22} /> Farmer Purchase Invoice
        </h1>
      </div>

      <div className="no-print flex justify-end mb-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1 text-xs font-bold uppercase border px-3 py-2"
        >
          <Printer size={14} /> Print Invoice
        </button>
      </div>
      <div className="print-root">
      <PaperFormFrame title="Purchase Invoice" subtitle="Net rate · deductions · net payable">
        <PaperFieldRow label="Harvest Ref (H No)">
          <select
            className={paperInputClass}
            value={harvestId}
            onChange={(e) => setHarvestId(e.target.value)}
          >
            <option value="">— Select —</option>
            {confirmedHarvests.map((h) => (
              <option key={h._id || h.id} value={h._id || h.id}>
                {h.hNo || h.harvestNumber || h.tpNo} — {h.farmerName || h.partyName}
              </option>
            ))}
          </select>
        </PaperFieldRow>
        <PaperFieldRow label="Farmer">
          <input className={paperInputClass} readOnly value={harvest?.farmerName || ''} />
        </PaperFieldRow>

        <table className="w-full border-collapse border border-black text-xs mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Fish Item</th>
              <th className="border border-black p-1">Gross Wt (KG)</th>
              <th className="border border-black p-1">Rate</th>
              <th className="border border-black p-1">Amount</th>
            </tr>
          </thead>
          <tbody>
            {productRates.map((row, idx) => {
              const amt =
                (parseFloat(row.grossWeight) || 0) * (parseFloat(row.rate) || 0);
              return (
                <tr key={row.id}>
                  <td className="border border-black p-0">
                    <input
                      className="w-full border-0 px-1 py-1"
                      value={row.fishName}
                      onChange={(e) => {
                        const next = [...productRates];
                        next[idx] = { ...row, fishName: e.target.value };
                        setProductRates(next);
                      }}
                    />
                  </td>
                  <td className="border border-black p-0">
                    <input
                      className="w-full border-0 px-1 py-1 text-right"
                      inputMode="decimal"
                      value={row.grossWeight}
                      onChange={(e) => {
                        const next = [...productRates];
                        next[idx] = { ...row, grossWeight: e.target.value };
                        setProductRates(next);
                      }}
                    />
                  </td>
                  <td className="border border-black p-0">
                    <input
                      className="w-full border-0 px-1 py-1 text-right"
                      inputMode="decimal"
                      value={row.rate}
                      onChange={(e) => {
                        const next = [...productRates];
                        next[idx] = { ...row, rate: e.target.value };
                        setProductRates(next);
                      }}
                    />
                  </td>
                  <td className="border border-black p-1 text-right font-mono">
                    {amt.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="border border-black p-1 text-right font-bold">
                Gross Amount
              </td>
              <td className="border border-black p-1 text-right font-bold">
                ₹{grossAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div className="mt-4 grid grid-cols-2 gap-x-4 text-sm">
          {[
            ['Commission', 'commission'],
            ['TDS', 'tds'],
            ['Soft', 'soft'],
            ['Transport Deduction', 'deductionTransport'],
            ['Commission Ded.', 'deductionCommission'],
            ['Soft Ded.', 'deductionSoft'],
            ['Other Deduction', 'deductionOther'],
          ].map(([label, key]) => (
            <PaperFieldRow key={key} label={label}>
              <input
                className={paperInputClass}
                inputMode="decimal"
                value={deductions[key]}
                onChange={(e) => setDeductions((d) => ({ ...d, [key]: e.target.value }))}
              />
            </PaperFieldRow>
          ))}
        </div>

        <div className="mt-4 border-2 border-black p-3 flex justify-between items-center">
          <span className="font-bold uppercase">Net Payable</span>
          <span className="text-xl font-bold">₹{netPayable.toLocaleString('en-IN')}</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#6A7051] text-white py-3 text-sm font-bold uppercase"
          >
            Save Purchase Invoice
          </button>
        </div>
      </PaperFormFrame>
      </div>
    </div>
  );
};

export default NetRate;

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
import { ArrowLeft, Calculator, Printer, Save, Edit3, FileText } from 'lucide-react';

const NetRate = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectId = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips, saveNetRateAsync, loading } = useAdminStore();

  const [harvestId, setHarvestId] = useState(preselectId || '');
  const [productRates, setProductRates] = useState([]);
  const userEditedRef = React.useRef(false); // tracks if user manually edited any rate
  const [deductions, setDeductions] = useState({
    tds: '',
    commission: '',
    soft: '',
    deductionTransport: '',
    deductionCommission: '',
    deductionSoft: '',
    deductionOther: '',
  });

  const handleHarvestChange = (val) => {
    setHarvestId(val);
    userEditedRef.current = false; // reset dirty flag on harvest change
    if (val) {
      setSearchParams({ harvestId: val }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  useEffect(() => {
    fetchHarvestSlips();
  }, [fetchHarvestSlips]);

  const harvest = useMemo(
    () => harvestSlips.find((h) => String(h._id || h.id) === String(harvestId)),
    [harvestSlips, harvestId]
  );

  useEffect(() => {
    if (!harvest) return;
    // Don't reset user-entered rates unless harvest selection changed
    if (userEditedRef.current) return;

    // Check if we have temporary preview data in sessionStorage matching this harvest ID
    const rawTemp = sessionStorage.getItem('current_harvest_slip_creation');
    let tempData = null;
    if (rawTemp) {
      try {
        const parsed = JSON.parse(rawTemp);
        if (String(parsed.id || parsed._id) === String(harvestId)) {
          tempData = parsed;
        }
      } catch (e) {
        console.error('Error parsing temp harvest slip data', e);
      }
    }

    const sourceData = tempData || harvest;

    const lines = (sourceData.products || sourceData.items || []).map((p, i) => ({
      id: String(i),
      fishName: p.fishName || p.particulars || p.name || '',
      grossWeight: String(p.estimatedQty || p.totalWeight || ''),
      rate: String(p.rate || ''),
    }));
    setProductRates(lines.length ? lines : [{ id: '1', fishName: '', grossWeight: '', rate: '' }]);
    setDeductions({
      tds: sourceData.tds != null ? String(sourceData.tds) : '',
      commission: sourceData.commission != null ? String(sourceData.commission) : '',
      soft: sourceData.soft != null ? String(sourceData.soft) : '',
      deductionTransport: sourceData.deductionTransport != null ? String(sourceData.deductionTransport) : '',
      deductionCommission: sourceData.deductionCommission != null ? String(sourceData.deductionCommission) : '',
      deductionSoft: sourceData.deductionSoft != null ? String(sourceData.deductionSoft) : '',
      deductionOther: sourceData.deductionOther != null ? String(sourceData.deductionOther) : '',
    });
  }, [harvest, harvestId]);

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

  const handlePreview = () => {
    if (!harvestId) {
      toast.error('Select harvest reference first');
      return;
    }

    const qtyTotal = productRates.reduce((sum, row) => sum + (parseFloat(row.grossWeight) || 0), 0);
    const boxTotal = harvest?.products?.reduce((sum, p) => sum + (parseInt(p.boxCount, 10) || 0), 0) || 0;

    const tempSlip = {
      ...harvest,
      id: harvest._id || harvest.id,
      netRateCalculated: new Date().toISOString(), // flags isInvoice = true
      products: (harvest.products || []).map((p, idx) => {
        const matchingRateRow = productRates[idx];
        const r = matchingRateRow ? parseFloat(matchingRateRow.rate) || 0 : 0;
        const qty = parseFloat(p.totalWeight || p.estimatedQty) || 0;
        return {
          ...p,
          rate: r,
          totalAmount: r * qty,
        };
      }),
      items: (harvest.products || []).map((p, idx) => {
        const matchingRateRow = productRates[idx];
        const r = matchingRateRow ? matchingRateRow.rate : '';
        const qty = parseFloat(p.totalWeight || p.estimatedQty) || 0;
        const amt = r ? parseFloat(r) * qty : 0;
        return {
          id: String(idx + 1),
          hsnCode: p.hsnCode || '',
          particulars: p.fishName || p.name || '',
          count: p.count || '',
          noOfBoxes: p.boxCount != null ? String(p.boxCount) : '',
          boxWeight: p.weightPerBox != null ? String(p.weightPerBox) : '',
          totalWeight: String(qty),
          rate: String(r),
          totalAmount: amt > 0 ? String(amt) : '',
        };
      }),
      tds: parseFloat(deductions.tds) || 0,
      commission: parseFloat(deductions.commission) || 0,
      soft: parseFloat(deductions.soft) || 0,
      deductionTransport: parseFloat(deductions.deductionTransport) || 0,
      deductionCommission: parseFloat(deductions.deductionCommission) || 0,
      deductionSoft: parseFloat(deductions.deductionSoft) || 0,
      deductionOther: parseFloat(deductions.deductionOther) || 0,
      totalBoxes: boxTotal,
      totalWeight: qtyTotal,
      grandTotal: netPayable,
      inWords: netPayable > 0 ? `${netPayable.toLocaleString('en-IN')} RUPEES ONLY` : '',
    };

    sessionStorage.setItem('current_harvest_slip_creation', JSON.stringify(tempSlip));

    const isMobile = window.location.pathname.startsWith('/mobile');
    const targetPath = isMobile ? '/mobile/procurement/harvest/preview' : '/admin/procurement/harvest/preview';
    navigate(targetPath);
  };

const SAVEABLE_HARVEST_STATUSES = [
  'CONFIRMED',
  'PARTIALLY_CONVERTED',
  'CONVERTED_TO_TAPAL',
  'OPEN',
  'PARTIAL_USED',
  'PENDING_CONFIRMATION',
  'APPROVED',
  'SENT',
  'CLOSED',
  'COMPLETED',
];

  const handleSave = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    if (harvest?.status && !SAVEABLE_HARVEST_STATUSES.includes(harvest.status)) {
      toast.error(`Harvest status "${harvest.status}" — confirm farmer approval first`);
      return;
    }
    const hasRates = productRates.some((r) => parseFloat(r.rate) > 0);
    if (!hasRates) {
      toast.error('Enter rate per kg for at least one fish line');
      return;
    }
    try {
      const sourceProducts = harvest?.products || harvest?.items || [];
      await saveNetRateAsync(harvestId, {
        productRates: productRates.map((r, idx) => {
          const line = sourceProducts[idx];
          return {
            lineItemId: line?._id || line?.id,
            lineIndex: idx,
            productId: line?.productId?._id || line?.productId,
            fishName: r.fishName,
            estimatedQty: parseFloat(r.grossWeight) || 0,
            rate: parseFloat(r.rate) || 0,
          };
        }),
        ...Object.fromEntries(Object.entries(deductions).map(([k, v]) => [k, parseFloat(v) || 0])),
      });
      sessionStorage.removeItem('current_harvest_slip_creation');
      userEditedRef.current = false; // allow useEffect to re-sync rates after save
      toast.success('Purchase invoice saved');
      navigate('/admin/procurement/harvest');
    } catch (err) {
      toast.error(err?.message || err?.data?.message || 'Failed to save');
    }
  };

  const confirmedHarvests = harvestSlips.filter((h) =>
    ['CONFIRMED', 'PARTIALLY_CONVERTED', 'CONVERTED_TO_TAPAL', 'PENDING', 'SENT', 'PENDING_CONFIRMATION', 'OPEN', 'PARTIAL_USED', 'CLOSED'].includes(h.status)
  );

  const finalizedInvoices = useMemo(
    () => harvestSlips.filter((h) => h.netRateCalculated != null),
    [harvestSlips]
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
          <button type="button" onClick={handlePreview} className="erp-form-btn-secondary no-print">
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
          <select className={erpSelectClass} value={harvestId} onChange={(e) => handleHarvestChange(e.target.value)}>
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
                        userEditedRef.current = true; // mark as user-edited
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

      {/* Finalized Bills List */}
      <div className="bg-white border border-card-border shadow-sm p-5 mt-6 no-print">
        <h2 className="text-sm font-black uppercase tracking-wider text-brand-olive mb-4 flex items-center gap-2">
          <FileText size={16} className="text-brand-yellow" /> Finalized Purchase Bills ({finalizedInvoices.length})
        </h2>

        {finalizedInvoices.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-xs">
            No purchase bills finalized yet. Select a reference above to enter rates.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive">Invoice / Ref No</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive">Farmer Name</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive">Date</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive text-right">Total Weight</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive text-right">Grand Total</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive text-center">Payment Status</th>
                  <th className="py-2.5 px-3 font-black uppercase tracking-wider text-brand-olive text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {finalizedInvoices.map((slip) => (
                  <tr key={slip._id || slip.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-black text-brand-olive">
                      #{slip.tpNo || slip.hNo || 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-brand-olive uppercase">
                      {slip.farmerName || 'Unknown'}
                    </td>
                    <td className="py-3 px-3 text-text-secondary whitespace-nowrap">
                      {slip.date ? new Date(slip.date).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="py-3 px-3 font-bold text-right text-brand-olive whitespace-nowrap">
                      {parseFloat(slip.totalWeight || 0).toFixed(2)} kg
                    </td>
                    <td className="py-3 px-3 font-extrabold text-right text-brand-olive whitespace-nowrap">
                      ₹{(slip.grandTotal || slip.totalPayableAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border ${
                        slip.paymentStatus === 'PAID'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : slip.paymentStatus === 'PARTIAL'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {slip.paymentStatus || 'UNPAID'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            handleHarvestChange(slip._id || slip.id);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-brand-olive hover:text-brand-yellow font-bold uppercase text-[10px] flex items-center gap-1"
                          title="Edit Rates/Deductions"
                        >
                          <Edit3 size={12} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Stage for print
                            sessionStorage.setItem('current_harvest_slip_creation', JSON.stringify(slip));
                            const isMobile = window.location.pathname.startsWith('/mobile');
                            const targetPath = isMobile ? '/mobile/procurement/harvest/preview' : '/admin/procurement/harvest/preview';
                            navigate(targetPath);
                          }}
                          className="text-[#6A7051] hover:text-[#5F6846] font-bold uppercase text-[10px] flex items-center gap-1"
                          title="Print Invoice"
                        >
                          <Printer size={12} /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetRate;

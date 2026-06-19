import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerPortalService } from '../../services/buyerPortalService';
import { tapalService } from '../../services/tapalService';
import { toast } from 'react-hot-toast';
import { FieldPageWrap } from '../../design-system/field-app';
import { useBuyerPaths } from './buyerPaths';

const BuyerBillView = () => {
  const { tapalId } = useParams();
  const navigate = useNavigate();
  const paths = useBuyerPaths();
  const [tapal, setTapal] = useState(null);
  const [ratePerKg, setRatePerKg] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await tapalService.getById(tapalId);
        const t = res?.data?.tapal || res?.data;
        setTapal(t);
        setFinalWeight(String(t?.numericQty || ''));
      } catch (e) {
        toast.error(e?.message || 'Tapal not found');
      } finally {
        setLoading(false);
      }
    })();
  }, [tapalId]);

  const createBill = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await buyerPortalService.createBill(tapalId, {
        ratePerKg: parseFloat(ratePerKg),
        finalWeight: parseFloat(finalWeight),
        item: tapal?.products?.[0]?.name,
      });
      toast.success('Buyer bill created');
      navigate(paths.invoices);
    } catch (err) {
      toast.error(err?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <FieldPageWrap>
      <h1 className="text-lg font-bold">Create bill</h1>
      {loading ? (
        <p className="text-sm fa-muted py-8">Loading tapal…</p>
      ) : (
        <>
          {tapal && (
            <p className="text-[11px] fa-muted mb-4">
              {tapal.tpNo || tapal.tapalNumber} — {tapal.partyName || 'Load'}
            </p>
          )}

          <form onSubmit={createBill} className="fa-surface p-5 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase fa-muted">Final weight (KG)</label>
              <input
                type="number"
                required
                className="fa-input mt-1"
                value={finalWeight}
                onChange={(e) => setFinalWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase fa-muted">Rate per KG (₹)</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                placeholder="e.g. 180"
                className="fa-input mt-1"
                value={ratePerKg}
                onChange={(e) => setRatePerKg(e.target.value)}
              />
            </div>
            {ratePerKg && finalWeight && (
              <p className="text-sm fa-amount-positive">
                Total (excl. tax): ₹
                {(parseFloat(ratePerKg) * parseFloat(finalWeight)).toLocaleString('en-IN')}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 fa-btn-primary text-xs font-bold uppercase disabled:opacity-50 fa-tap"
            >
              {saving ? 'Creating…' : 'Generate bill'}
            </button>
          </form>
        </>
      )}
    </FieldPageWrap>
  );
};

export default BuyerBillView;

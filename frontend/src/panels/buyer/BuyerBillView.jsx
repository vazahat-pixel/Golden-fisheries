import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { buyerPortalService } from '../../services/buyerPortalService';
import { tapalService } from '../../services/tapalService';
import { toast } from 'react-hot-toast';

const BuyerBillView = () => {
  const { tapalId } = useParams();
  const navigate = useNavigate();
  const [tapal, setTapal] = useState(null);
  const [ratePerKg, setRatePerKg] = useState('');
  const [finalWeight, setFinalWeight] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await tapalService.getById(tapalId);
        const t = res?.data?.tapal || res?.data;
        setTapal(t);
        setFinalWeight(String(t?.numericQty || ''));
      } catch (e) {
        toast.error(e?.message || 'Tapal not found');
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
        item: tapal?.products?.[0]?.name
      });
      toast.success('Buyer bill created');
      navigate('/admin/buyer/invoices');
    } catch (err) {
      toast.error(err?.message || 'Failed to create bill');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Create Bill</h1>
        {tapal && (
          <p className="text-[10px] text-slate-500 mt-1">
            {tapal.tpNo || tapal.tapalNumber} — {tapal.partyName}
          </p>
        )}
      </div>

      <form onSubmit={createBill} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Final weight (KG)</label>
          <input
            type="number"
            required
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            value={finalWeight}
            onChange={(e) => setFinalWeight(e.target.value)}
          />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Rate per KG (₹)</label>
          <input
            type="number"
            required
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
            value={ratePerKg}
            onChange={(e) => setRatePerKg(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {saving ? 'Creating...' : 'Generate Bill'}
        </button>
      </form>
    </div>
  );
};

export default BuyerBillView;

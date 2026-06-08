import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';
import { FieldPageWrap } from '../../design-system/field-app';

const BuyerSalesReturn = () => {
  const [bills, setBills] = useState([]);
  const [billId, setBillId] = useState('');
  const [tapalRef, setTapalRef] = useState('');
  const [item, setItem] = useState('');
  const [returnedQty, setReturnedQty] = useState('');
  const [damagedQty, setDamagedQty] = useState('');
  const [damageReason, setDamageReason] = useState('');
  const [returnAmount, setReturnAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    buyerPortalService
      .listBills()
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        setBills(list);
      })
      .catch(() => toast.error('Failed to load bills'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!billId) {
      toast.error('Select a bill');
      return;
    }
    const bill = bills.find((b) => b._id === billId);
    try {
      await buyerPortalService.createReturn({
        buyerBill: billId,
        tapalRef: tapalRef || bill?.tapal?.tapalNumber || '',
        returnedQty: parseFloat(returnedQty),
        damagedQty: parseFloat(damagedQty) || 0,
        returnAmount: parseFloat(returnAmount) || undefined,
        remarks,
        items: [
          {
            item: item || bill?.item || 'SEAFOOD',
            returnedQty: parseFloat(returnedQty),
            damagedQty: parseFloat(damagedQty) || 0,
            damageReason,
            reason: damageReason,
          },
        ],
      });
      toast.success('Return request submitted');
      const billsRes = await buyerPortalService.listBills();
      setBills(billsRes?.data || (Array.isArray(billsRes) ? billsRes : []));
      setReturnedQty('');
      setDamagedQty('');
      setDamageReason('');
      setReturnAmount('');
      setRemarks('');
    } catch (err) {
      toast.error(err?.message || 'Return failed');
    }
  };

  return (
    <FieldPageWrap subtitle="Damaged or excess stock">
      <h1 className="text-lg font-bold">Sales return</h1>
      <p className="text-[11px] fa-muted mb-4">Select a bill to submit a return request</p>

      {loading ? (
        <p className="text-sm fa-muted py-8 text-center">Loading bills…</p>
      ) : bills.length === 0 ? (
        <div className="fa-empty-state">
          <p className="text-sm font-semibold">Bill required first</p>
          <p className="text-[11px] fa-muted mt-2">Select a generated bill to submit a return</p>
        </div>
      ) : (
        <form onSubmit={submit} className="fa-surface p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Buyer bill</label>
            <select
              className="fa-input mt-1"
              value={billId}
              onChange={(e) => {
                setBillId(e.target.value);
                const b = bills.find((x) => x._id === e.target.value);
                if (b) {
                  setItem(b.item || '');
                  setTapalRef(b.tapal?.tapalNumber || b.tapalRef || '');
                  setReturnedQty(String(b.finalWeight || ''));
                }
              }}
            >
              <option value="">Select bill</option>
              {bills.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.billNo} — ₹{b.totalAmount} — {b.tapal?.tapalNumber || ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Tapal ref (TP No)</label>
            <input className="fa-input mt-1" value={tapalRef} onChange={(e) => setTapalRef(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Fish item</label>
            <input className="fa-input mt-1" value={item} onChange={(e) => setItem(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Returned qty (KG)</label>
            <input
              type="number"
              required
              className="fa-input mt-1"
              value={returnedQty}
              onChange={(e) => setReturnedQty(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Damaged qty (KG)</label>
            <input
              type="number"
              className="fa-input mt-1"
              value={damagedQty}
              onChange={(e) => setDamagedQty(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Damage reason</label>
            <input className="fa-input mt-1" value={damageReason} onChange={(e) => setDamageReason(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Return amount (₹)</label>
            <input
              type="number"
              className="fa-input mt-1"
              value={returnAmount}
              onChange={(e) => setReturnAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase fa-muted">Remarks</label>
            <textarea
              className="fa-input mt-1 min-h-[72px]"
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full py-3 fa-btn-primary text-xs font-bold uppercase fa-tap">
            Submit return
          </button>
        </form>
      )}
    </FieldPageWrap>
  );
};

export default BuyerSalesReturn;

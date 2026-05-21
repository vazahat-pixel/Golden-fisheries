import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';

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

  useEffect(() => {
    buyerPortalService
      .listBills()
      .then((res) => {
        const list = res?.data || (Array.isArray(res) ? res : []);
        setBills(list);
      })
      .catch(() => toast.error('Failed to load bills'));
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
      const res = await buyerPortalService.listReturns();
      const list = res?.data || (Array.isArray(res) ? res : []);
      if (list.length) {
        /* listReturns available for future UI */
      }
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
    <div className="max-w-md mx-auto space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Sales Return</h1>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Buyer bill</label>
          <select
            className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
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
          <label className="text-[9px] font-black uppercase text-slate-400">Tapal ref (TP No)</label>
          <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={tapalRef} onChange={(e) => setTapalRef(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Fish item</label>
          <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Returned qty (KG)</label>
          <input type="number" required className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={returnedQty} onChange={(e) => setReturnedQty(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Damaged qty (KG)</label>
          <input type="number" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={damagedQty} onChange={(e) => setDamagedQty(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Damage reason</label>
          <input className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={damageReason} onChange={(e) => setDamageReason(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Return amount (₹)</label>
          <input type="number" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" value={returnAmount} onChange={(e) => setReturnAmount(e.target.value)} />
        </div>
        <div>
          <label className="text-[9px] font-black uppercase text-slate-400">Remarks</label>
          <textarea className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider">
          Submit return
        </button>
      </form>
    </div>
  );
};

export default BuyerSalesReturn;

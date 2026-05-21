import React, { useEffect, useState } from 'react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';

const BuyerReconciliation = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    buyerPortalService
      .getReconciliation()
      .then((res) => setData(res?.data || res))
      .catch((err) => toast.error(err?.message || 'Failed to load'));
  }, []);

  if (!data) {
    return <p className="p-6 text-sm text-slate-500">Loading settlement...</p>;
  }

  return (
    <div className="max-w-md mx-auto space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Settlement</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span>Total billed</span>
          <span className="font-bold">₹{(data.totalBilled || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Returns (completed)</span>
          <span className="font-bold text-red-600">₹{(data.totalReturned || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Pending returns</span>
          <span>₹{(data.pendingReturns || 0).toLocaleString('en-IN')}</span>
        </div>
        <div className="border-t pt-3 flex justify-between text-base">
          <span className="font-black uppercase text-xs">Balance due</span>
          <span className="font-black">₹{(data.balanceDue || 0).toLocaleString('en-IN')}</span>
        </div>
        <p className="text-[10px] text-slate-500 pt-2">
          {data.bills} bills · {data.returns} return requests
        </p>
      </div>
    </div>
  );
};

export default BuyerReconciliation;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, FileText } from 'lucide-react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';

const BuyerIncomingTapals = () => {
  const navigate = useNavigate();
  const [tapals, setTapals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyId, setVerifyId] = useState(null);
  const [form, setForm] = useState({ receivedWeight: '', receivedBoxes: '', remarks: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await buyerPortalService.getAssignedTapals();
      const list = Array.isArray(res?.data) ? res.data : [];
      const awaiting = list.filter((t) =>
        ['DELIVERED', 'IN_TRANSIT', 'BILL_PENDING'].includes(t.status)
      );
      setTapals(awaiting);
    } catch (e) {
      toast.error(e?.message || 'Failed to load tapals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitVerify = async (tapalId) => {
    try {
      const t = tapals.find((x) => (x._id || x.id) === tapalId);
      await buyerPortalService.submitVerification(tapalId, {
        dispatchedQty: {
          noOfBoxes: t?.products?.[0]?.boxQty || 0,
          weight: t?.numericQty || 0
        },
        receivedQty: {
          noOfBoxes: parseFloat(form.receivedBoxes) || 0,
          weight: parseFloat(form.receivedWeight) || 0
        },
        buyerRemarks: form.remarks
      });
      toast.success('Verification submitted');
      setVerifyId(null);
      load();
    } catch (e) {
      toast.error(e?.message || 'Verification failed');
    }
  };

  return (
    <div className="space-y-6 p-1">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Incoming Tapals</h1>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
          Verify delivered shipments, then generate bills
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : tapals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <Package size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-400">No tapals awaiting verification</p>
        </div>
      ) : (
        tapals.map((t) => {
          const id = t._id || t.id;
          return (
            <div key={id} className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded-lg">
                    {t.tpNo || t.tapalNumber}
                  </span>
                  <h3 className="text-sm font-black text-slate-900 mt-1">{t.partyName}</h3>
                  <p className="text-[10px] text-slate-500">{t.qty}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 uppercase">{t.status}</span>
              </div>

              {verifyId === id ? (
                <div className="space-y-2 border-t pt-3">
                  <p className="text-[10px] text-slate-500">
                    Dispatched: {t.numericQty || 0} KG · {t.products?.[0]?.boxQty || 0} boxes
                  </p>
                  {Math.abs((parseFloat(form.receivedWeight) || 0) - (t.numericQty || 0)) > 0.01 && (
                    <p className="text-[10px] font-bold text-amber-700 uppercase">
                      Qty mismatch — will flag discrepancy on submit
                    </p>
                  )}
                  <input
                    type="number"
                    placeholder="Received weight (KG)"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.receivedWeight}
                    onChange={(e) => setForm({ ...form, receivedWeight: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Received boxes"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.receivedBoxes}
                    onChange={(e) => setForm({ ...form, receivedBoxes: e.target.value })}
                  />
                  <input
                    placeholder="Remarks"
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => submitVerify(id)}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold uppercase"
                    >
                      Submit
                    </button>
                    <button
                      onClick={() => setVerifyId(null)}
                      className="px-4 py-2 border rounded-xl text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setVerifyId(id);
                      setForm({
                        receivedWeight: String(t.numericQty || ''),
                        receivedBoxes: '',
                        remarks: ''
                      });
                    }}
                    className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={14} /> Verify
                  </button>
                  <button
                    onClick={() => navigate(`/buyer/bill/${id}`)}
                    className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-1"
                  >
                    <FileText size={14} /> Bill
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default BuyerIncomingTapals;

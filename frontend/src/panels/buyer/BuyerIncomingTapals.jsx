import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle2, FileText } from 'lucide-react';
import { buyerPortalService } from '../../services/buyerPortalService';
import { toast } from 'react-hot-toast';
import { FieldPageWrap } from '../../design-system/field-app';
import { useBuyerPaths } from './buyerPaths';

const VERIFY_STATUSES = ['DELIVERED', 'IN_TRANSIT', 'BILL_PENDING', 'DRIVER_ASSIGNED'];

function unwrapList(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
}

const BuyerIncomingTapals = () => {
  const navigate = useNavigate();
  const paths = useBuyerPaths();
  const [tapals, setTapals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyId, setVerifyId] = useState(null);
  const [form, setForm] = useState({ receivedWeight: '', receivedBoxes: '', remarks: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await buyerPortalService.getAssignedTapals({ limit: 50 });
      const list = unwrapList(res);
      setTapals(list);
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
          weight: t?.numericQty || 0,
        },
        receivedQty: {
          noOfBoxes: parseFloat(form.receivedBoxes) || 0,
          weight: parseFloat(form.receivedWeight) || 0,
        },
        remarks: form.remarks,
      });
      toast.success('Verification submitted — you can generate a bill now');
      setVerifyId(null);
      load();
    } catch (e) {
      toast.error(e?.message || 'Verification failed');
    }
  };

  return (
    <FieldPageWrap subtitle="Verify delivered tapals">
      <h1 className="text-lg font-bold">Incoming tapals</h1>
      <p className="text-[11px] fa-muted mb-4">
        Verify received quantity first, then generate a bill
      </p>

      {loading ? (
        <p className="text-sm fa-muted py-8 text-center">Loading…</p>
      ) : tapals.length === 0 ? (
        <div className="text-center py-16 fa-surface">
          <Package size={40} className="text-[var(--fa-muted)] mx-auto mb-3" />
          <p className="text-sm font-semibold">No tapals need action</p>
          <p className="text-[11px] fa-muted mt-2 px-4">
            When the driver delivers or admin assigns a tapal, it will appear here
          </p>
        </div>
      ) : (
        tapals.map((t) => {
          const id = t._id || t.id;
          const canVerify = VERIFY_STATUSES.includes(t.status);
          const canBill = t.status === 'BUYER_VERIFIED';

          return (
            <div key={id} className="fa-surface p-5 space-y-3 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold bg-[var(--fa-accent-dim)] text-[var(--fa-accent)] px-2 py-0.5 rounded-lg">
                    {t.tpNo || t.tapalNumber}
                  </span>
                  <h3 className="text-sm font-semibold mt-1">{t.partyName || 'Buyer load'}</h3>
                  <p className="text-[10px] fa-muted">
                    {t.numericQty ? `${t.numericQty} KG` : t.qty || '—'}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-[var(--fa-accent)] uppercase">{t.status}</span>
              </div>

              {verifyId === id ? (
                <div className="space-y-2 border-t border-[var(--fa-border)] pt-3">
                  <p className="text-[10px] fa-muted">
                    Dispatched: {t.numericQty || 0} KG · {t.products?.[0]?.boxQty || 0} boxes
                  </p>
                  {Math.abs((parseFloat(form.receivedWeight) || 0) - (t.numericQty || 0)) > 0.01 && (
                    <p className="text-[10px] font-bold text-amber-400 uppercase">
                      Qty mismatch — will flag on submit
                    </p>
                  )}
                  <input
                    type="number"
                    placeholder="Received weight (KG)"
                    className="fa-input"
                    value={form.receivedWeight}
                    onChange={(e) => setForm({ ...form, receivedWeight: e.target.value })}
                  />
                  <input
                    type="number"
                    placeholder="Received boxes"
                    className="fa-input"
                    value={form.receivedBoxes}
                    onChange={(e) => setForm({ ...form, receivedBoxes: e.target.value })}
                  />
                  <input
                    placeholder="Remarks"
                    className="fa-input"
                    value={form.remarks}
                    onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => submitVerify(id)}
                      className="flex-1 py-2.5 fa-btn-primary text-xs font-bold uppercase fa-tap"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerifyId(null)}
                      className="px-4 py-2.5 border border-[var(--fa-border)] rounded-[var(--fa-radius-md)] text-xs font-bold fa-tap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  {canVerify && (
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyId(id);
                        setForm({
                          receivedWeight: String(t.numericQty || ''),
                          receivedBoxes: String(t.products?.[0]?.boxQty || ''),
                          remarks: '',
                        });
                      }}
                      className="flex-1 py-2.5 fa-btn-primary text-xs font-bold uppercase flex items-center justify-center gap-1 fa-tap"
                    >
                      <CheckCircle2 size={14} /> Verify
                    </button>
                  )}
                  {canBill && (
                    <button
                      type="button"
                      onClick={() => navigate(paths.bill(id))}
                      className="flex-1 py-2.5 bg-[var(--fa-surface-elevated)] text-[var(--fa-text)] rounded-[var(--fa-radius-md)] text-xs font-bold uppercase flex items-center justify-center gap-1 fa-tap border border-[var(--fa-border)]"
                    >
                      <FileText size={14} /> Bill
                    </button>
                  )}
                  {!canVerify && !canBill && (
                    <p className="text-[10px] fa-muted">
                      {['CREATED', 'ASSIGNED', 'CONFIRMED', 'DRIVER_ASSIGNED'].includes(t.status)
                        ? 'Tapal linked — assign driver or wait for delivery'
                        : 'No action available for this tapal yet'}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </FieldPageWrap>
  );
};

export default BuyerIncomingTapals;

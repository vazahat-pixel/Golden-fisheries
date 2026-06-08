import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { buyerPortalService } from '../../../services/buyerPortalService';
import {
  AdminPageHeader,
  AdminBtn,
  AdminCard,
  StatusBadge,
} from '../shared/adminUi';
import { toast } from 'react-hot-toast';
import { ExternalLink, RefreshCw } from 'lucide-react';

const FILTERS = ['ALL', 'ISSUED', 'PAID'];

function buyerLabel(b) {
  if (!b || typeof b !== 'object') return '—';
  return (b.fullName || b.name || 'Buyer') + (b.phone ? ` · ${b.phone}` : '');
}

function tapalLabel(t) {
  if (!t || typeof t !== 'object') return '—';
  return t.tapalNumber || t.tpNo || 'Tapal';
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

const BuyerSalesAdmin = () => {
  const [overview, setOverview] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [detail, setDetail] = useState(null);
  const [payModal, setPayModal] = useState(null);
  const [payForm, setPayForm] = useState({ paidAmount: '', paymentMethod: 'UPI', paymentRef: '' });
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, billRes] = await Promise.all([
        buyerPortalService.adminSalesOverview(),
        buyerPortalService.adminListBills({
          limit: 100,
          status: filter === 'ALL' ? undefined : filter,
        }),
      ]);
      const ov = ovRes?.data ?? ovRes;
      setOverview(ov && typeof ov === 'object' ? ov : null);
      const list = billRes?.data ?? billRes?.docs ?? (Array.isArray(billRes) ? billRes : []);
      setBills(asArray(list));
    } catch (e) {
      toast.error(e?.message || 'Failed to load buyer sales');
      setOverview(null);
      setBills([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const submitPayment = async () => {
    if (!payModal) return;
    setPaying(true);
    try {
      await buyerPortalService.markBillPaid(payModal._id, {
        paidAmount: parseFloat(payForm.paidAmount) || payModal.totalAmount,
        paymentMethod: payForm.paymentMethod,
        paymentRef: payForm.paymentRef,
      });
      toast.success(`${payModal.billNo} marked as PAID`);
      setPayModal(null);
      load();
    } catch (e) {
      toast.error(e?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const summary = overview?.summary || {};
  const awaitingBill = asArray(overview?.awaitingBill);

  return (
    <div className="pb-12 space-y-6">
      <AdminPageHeader
        title="Buyer sales"
        subtitle="Verify, bills, payment — sab buyers ka record"
        badge="Sales"
        actions={
          <>
            {FILTERS.map((f) => (
              <AdminBtn key={f} variant={filter === f ? 'primary' : 'outline'} onClick={() => setFilter(f)}>
                {f}
              </AdminBtn>
            ))}
            <AdminBtn variant="outline" onClick={load}>
              <RefreshCw size={14} className={loading ? 'animate-spin inline' : 'inline'} /> Refresh
            </AdminBtn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <AdminCard className="p-4">
          <p className="text-[10px] font-bold uppercase text-gray-500">Total billed</p>
          <p className="text-xl font-black text-[#6A7051]">
            ₹{(summary.totalBilled || 0).toLocaleString('en-IN')}
          </p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[10px] font-bold uppercase text-gray-500">Outstanding</p>
          <p className="text-xl font-black text-amber-700">
            ₹{(summary.outstanding || 0).toLocaleString('en-IN')}
          </p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[10px] font-bold uppercase text-gray-500">Received (paid)</p>
          <p className="text-xl font-black text-emerald-700">
            ₹{(summary.totalPaid || 0).toLocaleString('en-IN')}
          </p>
        </AdminCard>
        <AdminCard className="p-4">
          <p className="text-[10px] font-bold uppercase text-gray-500">Awaiting bill</p>
          <p className="text-xl font-black">{summary.awaitingBillCount || 0}</p>
        </AdminCard>
      </div>

      {awaitingBill.length > 0 && (
        <AdminCard className="p-4">
          <h2 className="text-xs font-black uppercase mb-3 text-amber-800">Verified — bill pending</h2>
          <div className="space-y-2">
            {awaitingBill.map((t) => (
              <div
                key={t._id}
                className="flex flex-wrap justify-between gap-2 items-center text-sm border-b border-gray-100 pb-2"
              >
                <div>
                  <span className="font-mono font-bold">{t.tapalNumber || '—'}</span>
                  <span className="text-gray-500 ml-2">{t.partyName || ''}</span>
                </div>
                <Link
                  to={`/admin/tapals/${t._id}`}
                  className="text-[10px] font-bold uppercase text-[#6A7051] flex items-center gap-1"
                >
                  Tapal <ExternalLink size={12} />
                </Link>
              </div>
            ))}
          </div>
        </AdminCard>
      )}

      <AdminCard className="overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading buyer sales…</p>
        ) : bills.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">
            No buyer bills yet — buyer verify + bill banane ke baad yahan dikhega
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-black">
                <tr>
                  <th className="p-2 text-left">Bill</th>
                  <th className="p-2 text-left">Buyer</th>
                  <th className="p-2 text-left">Tapal</th>
                  <th className="p-2 text-left">Verify</th>
                  <th className="p-2 text-right">KG</th>
                  <th className="p-2 text-right">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((r) => {
                  const tapalId = r.tapal?._id || r.tapal;
                  const v = r.verification;
                  return (
                    <tr key={r._id} className="border-t border-gray-200 hover:bg-gray-50">
                      <td className="p-2 font-mono font-bold">{r.billNo}</td>
                      <td className="p-2">{buyerLabel(r.buyer)}</td>
                      <td className="p-2">
                        {tapalId ? (
                          <Link to={`/admin/tapals/${tapalId}`} className="font-mono text-[#6A7051] hover:underline">
                            {tapalLabel(r.tapal)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-2">
                        {v ? (
                          <StatusBadge
                            status={
                              v.verificationStatus === 'APPROVED_WITH_DISCREPANCY'
                                ? 'PENDING'
                                : v.verificationStatus
                            }
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-2 text-right">{r.finalWeight ?? '—'}</td>
                      <td className="p-2 text-right font-bold">
                        ₹{(r.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2">
                        <StatusBadge status={r.status || 'ISSUED'} />
                      </td>
                      <td className="p-2">
                        <div className="flex gap-1 flex-wrap">
                          <AdminBtn variant="outline" onClick={() => setDetail(r)}>
                            Detail
                          </AdminBtn>
                          {r.status !== 'PAID' && r.status !== 'CANCELLED' && (
                            <AdminBtn
                              variant="primary"
                              onClick={() => {
                                setPayModal(r);
                                setPayForm({
                                  paidAmount: String(r.totalAmount || ''),
                                  paymentMethod: 'UPI',
                                  paymentRef: '',
                                });
                              }}
                            >
                              Mark paid
                            </AdminBtn>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>

      {detail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <AdminCard className="w-full max-w-lg my-8 p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black text-lg">{detail.billNo}</h3>
                <p className="text-sm text-gray-600">{buyerLabel(detail.buyer)}</p>
              </div>
              <button type="button" onClick={() => setDetail(null)} className="text-sm font-bold">
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Tapal</span>
                <span className="font-mono">{tapalLabel(detail.tapal)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Tapal status</span>
                <span className="font-bold uppercase text-xs">{detail.tapal?.status || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Item</span>
                {detail.item || '—'}
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Weight × Rate</span>
                {detail.finalWeight} KG @ ₹{detail.ratePerKg}
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Total</span>
                <span className="font-black">₹{(detail.totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-500 block">Bill status</span>
                <StatusBadge status={detail.status} />
              </div>
            </div>

            {detail.verification && (
              <div className="border border-gray-200 rounded p-3 text-sm space-y-2 bg-gray-50">
                <p className="text-[10px] font-black uppercase text-[#6A7051]">Buyer verification</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500 block">Dispatched</span>
                    {detail.verification.dispatchedQty?.weight ?? 0} KG ·{' '}
                    {detail.verification.dispatchedQty?.noOfBoxes ?? 0} boxes
                  </div>
                  <div>
                    <span className="text-gray-500 block">Received</span>
                    {detail.verification.receivedQty?.weight ?? 0} KG ·{' '}
                    {detail.verification.receivedQty?.noOfBoxes ?? 0} boxes
                  </div>
                </div>
                <p className="text-[10px]">
                  Status: <strong>{detail.verification.verificationStatus}</strong>
                </p>
              </div>
            )}

            {detail.status === 'PAID' && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded">
                Paid ₹{(detail.paidAmount ?? detail.totalAmount)?.toLocaleString('en-IN')} via{' '}
                {detail.paymentMethod || '—'}
              </div>
            )}

            {(detail.tapal?._id || detail.tapal) && (
              <Link
                to={`/admin/tapals/${detail.tapal?._id || detail.tapal}`}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase text-[#6A7051]"
              >
                Open tapal record <ExternalLink size={12} />
              </Link>
            )}
          </AdminCard>
        </div>
      )}

      {payModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <AdminCard className="w-full max-w-sm p-6 space-y-4">
            <h3 className="font-black uppercase text-sm">Record buyer payment</h3>
            <p className="text-xs text-gray-600">
              {payModal.billNo} · {buyerLabel(payModal.buyer)}
            </p>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">Amount (₹)</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm"
                value={payForm.paidAmount}
                onChange={(e) => setPayForm({ ...payForm, paidAmount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">Method</label>
              <select
                className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm"
                value={payForm.paymentMethod}
                onChange={(e) => setPayForm({ ...payForm, paymentMethod: e.target.value })}
              >
                <option value="UPI">UPI</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank transfer</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-gray-500">Reference / UPI ID</label>
              <input
                className="w-full border border-gray-300 px-3 py-2 mt-1 text-sm"
                placeholder="Optional"
                value={payForm.paymentRef}
                onChange={(e) => setPayForm({ ...payForm, paymentRef: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <AdminBtn loading={paying} onClick={submitPayment}>
                Mark PAID
              </AdminBtn>
              <AdminBtn variant="outline" onClick={() => setPayModal(null)}>
                Cancel
              </AdminBtn>
            </div>
          </AdminCard>
        </div>
      )}
    </div>
  );
};

export default BuyerSalesAdmin;

import React, { useEffect, useState } from 'react';
import { farmerLedgerService } from '../../../services/farmerLedgerService';
import { masterService } from '../../../services/masterService';
import {
  AdminPageHeader,
  AdminDataTable,
  AdminBtn,
  AdminSearchBar,
  StatusBadge,
} from '../shared/adminUi';
import { toast } from 'react-hot-toast';

const FarmerLedger = () => {
  const [summary, setSummary] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState('');
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState({ creditAmount: '', description: '', harvestId: '' });

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sumRes, farmRes] = await Promise.all([
          farmerLedgerService.summary(),
          masterService.farmers.getAll({ limit: 200 }),
        ]);
        setSummary(Array.isArray(sumRes?.data) ? sumRes.data : sumRes || []);
        setFarmers(farmRes?.data || farmRes?.docs || []);
      } catch (err) {
        toast.error(err?.message || 'Failed to load farmer ledger');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedFarmer) {
      setLedger([]);
      return;
    }
    farmerLedgerService
      .getByFarmer(selectedFarmer)
      .then((res) => setLedger(Array.isArray(res?.data) ? res.data : res || []))
      .catch(() => toast.error('Failed to load statement'));
  }, [selectedFarmer]);

  const filtered = summary.filter((f) =>
    !search || String(f.farmerName || f.fullName || '').toLowerCase().includes(search.toLowerCase())
  );

  const recordPayment = async () => {
    if (!selectedFarmer || !payment.creditAmount) {
      toast.error('Select farmer and amount');
      return;
    }
    try {
      await farmerLedgerService.recordPayment({
        farmerId: selectedFarmer,
        creditAmount: parseFloat(payment.creditAmount),
        description: payment.description || 'Payment to farmer',
        harvestId: payment.harvestId || undefined,
      });
      toast.success('Payment recorded');
      setPayment({ creditAmount: '', description: '', harvestId: '' });
      const sumRes = await farmerLedgerService.summary();
      setSummary(Array.isArray(sumRes?.data) ? sumRes.data : sumRes || []);
      const stmt = await farmerLedgerService.getByFarmer(selectedFarmer);
      setLedger(Array.isArray(stmt?.data) ? stmt.data : stmt || []);
    } catch (err) {
      toast.error(err?.message || 'Payment failed');
    }
  };

  return (
    <div className="pb-12">
      <AdminPageHeader title="Farmer Ledger" subtitle="Payments · supply · balances" badge="Procurement" />

      <AdminDataTable
        loading={loading}
        emptyMessage="No farmer balances — add farmers and harvest slips first"
        columns={[
          { key: 'farmerName', label: 'Farmer' },
          { key: 'phone', label: 'Mobile' },
          { key: 'balance', label: 'Balance', render: (r) => `₹${(r.balance || r.pendingAmount || 0).toLocaleString('en-IN')}` },
          { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.paymentStatus || 'UNPAID'} /> },
        ]}
        rows={filtered}
        onRowClick={(r) => setSelectedFarmer(r.farmerId || r._id)}
      />

      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="border border-card-border bg-white p-4">
          <h3 className="text-sm font-black uppercase mb-3">Record payment</h3>
          <select
            className="w-full border px-3 py-2 text-sm mb-2"
            value={selectedFarmer}
            onChange={(e) => setSelectedFarmer(e.target.value)}
          >
            <option value="">Select farmer</option>
            {farmers.map((f) => (
              <option key={f._id || f.id} value={f._id || f.id}>
                {f.fullName} ({f.phone})
              </option>
            ))}
          </select>
          <input
            className="w-full border px-3 py-2 text-sm mb-2"
            placeholder="Amount (₹)"
            value={payment.creditAmount}
            onChange={(e) => setPayment((p) => ({ ...p, creditAmount: e.target.value }))}
          />
          <input
            className="w-full border px-3 py-2 text-sm mb-2"
            placeholder="Description"
            value={payment.description}
            onChange={(e) => setPayment((p) => ({ ...p, description: e.target.value }))}
          />
          <AdminBtn onClick={recordPayment}>Post payment</AdminBtn>
        </div>

        <div className="border border-card-border bg-white p-4">
          <h3 className="text-sm font-black uppercase mb-3">Statement</h3>
          {ledger.length === 0 ? (
            <p className="text-xs text-gray-500">Select a farmer to view ledger entries</p>
          ) : (
            <ul className="text-xs space-y-2 max-h-64 overflow-auto">
              {ledger.map((e) => (
                <li key={e._id} className="border-b pb-1 flex justify-between">
                  <span>{e.description || e.entryType}</span>
                  <span className="font-mono">
                    {e.creditAmount ? `+₹${e.creditAmount}` : ''}
                    {e.debitAmount ? `-₹${e.debitAmount}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerLedger;

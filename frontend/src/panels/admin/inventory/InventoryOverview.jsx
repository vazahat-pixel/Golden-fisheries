import React, { useEffect, useState } from 'react';
import { masterService } from '../../../services/masterService';
import { reportsService } from '../../../services/reportsService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';

const InventoryOverview = () => {
  const [stock, setStock] = useState([]);
  const [summary, setSummary] = useState(null);
  const [txns, setTxns] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [inv, rep, txnRes] = await Promise.all([
          masterService.inventory.getAll({ limit: 200 }),
          reportsService.getInventory().catch(() => null),
          masterService.inventory.getTransactions({ limit: 30 }).catch(() => null),
        ]);
        const list = inv?.data || inv?.docs || (Array.isArray(inv) ? inv : []);
        setStock(list);
        setSummary(rep?.data || rep);
        const tx = txnRes?.data || txnRes?.docs || (Array.isArray(txnRes) ? txnRes : []);
        setTxns(tx);
      } catch {
        setStock([]);
      }
    })();
  }, []);

  return (
    <div className="pb-12">
      <AdminPageHeader
        title="Inventory reconciliation"
        subtitle="Opening + Procurement − Sales − Restaurant − FishMall + Returns = Closing"
        badge="Stock"
      />
      {summary && (
        <AdminCard className="p-4 mb-4 text-xs">
          <pre className="whitespace-pre-wrap font-mono text-[10px]">{JSON.stringify(summary, null, 2)}</pre>
        </AdminCard>
      )}
      <AdminCard className="p-4 mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b text-left">
              <th className="py-2">Product</th>
              <th className="py-2 text-right">Qty (KG)</th>
              <th className="py-2 text-right">Unit</th>
            </tr>
          </thead>
          <tbody>
            {stock.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-gray-500">
                  No inventory records
                </td>
              </tr>
            ) : (
              stock.map((p) => (
                <tr key={p._id || p.id} className="border-b border-gray-100">
                  <td className="py-2 font-medium">{p.name}</td>
                  <td className="py-2 text-right font-mono">{p.quantity ?? p.actualQty ?? 0}</td>
                  <td className="py-2 text-right text-gray-500">{p.unit || 'KG'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </AdminCard>
      <AdminCard className="p-4">
        <h3 className="text-xs font-black uppercase mb-3">Recent ledger movements</h3>
        {txns.length === 0 ? (
          <p className="text-sm text-gray-500">No transactions</p>
        ) : (
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b">
                <th className="text-left py-1">Type</th>
                <th className="text-right py-1">Qty</th>
                <th className="text-left py-1">Ref</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr key={t._id} className="border-b border-gray-50">
                  <td className="py-1">{t.type || t.transactionType}</td>
                  <td className="py-1 text-right font-mono">{t.quantity ?? t.qty}</td>
                  <td className="py-1">{t.reference || t.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
};

export default InventoryOverview;

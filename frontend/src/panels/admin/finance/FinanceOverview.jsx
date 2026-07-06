import React, { useEffect, useState } from 'react';
import { reportsService } from '../../../services/reportsService';
import { masterService } from '../../../services/masterService';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';

const FinanceOverview = () => {
  const [sales, setSales] = useState(null);
  const [expenses, setExpenses] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [stock, setStock] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [s, e, p, inv] = await Promise.all([
          reportsService.getSales().catch((err) => { console.error('Sales error:', err); return null; }),
          reportsService.getExpenses().catch((err) => { console.error('Expenses error:', err); return null; }),
          reportsService.getProfitability().catch((err) => { console.error('P&L error:', err); return null; }),
          masterService.inventory.getAll({ limit: 100 }).catch((err) => { console.error('Inventory error:', err); return null; }),
        ]);
        setSales(s?.data || s);
        setExpenses(e?.data || e);
        setPnl(p?.data || p);
        const list = inv?.data || inv?.docs || (Array.isArray(inv) ? inv : []);
        setStock(list);
      } catch (err) {
        console.error('Failed to load finance data:', err);
      }
    })();
  }, []);

  const totalExp = pnl?.operationalExpenses ?? (Array.isArray(expenses) ? expenses.reduce((s, x) => s + (x.totalSpent || 0), 0) : '—');

  const cards = [
    { label: 'Sales (period)', value: sales?.totalCumulativeRevenue ?? '—' },
    { label: 'Expenses', value: totalExp },
    { label: 'Net P&L', value: pnl?.netProfits ?? '—' },
    { label: 'SKUs tracked', value: stock.length },
  ];

  return (
    <div className="pb-12">
      <AdminPageHeader title="Finance & P&L" subtitle="Daily operational summary" badge="Reports" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <AdminCard key={c.label} className="p-4">
            <p className="text-[9px] font-black uppercase text-text-muted">{c.label}</p>
            <p className="text-xl font-black mt-1">{typeof c.value === 'number' ? c.value.toLocaleString('en-IN') : c.value}</p>
          </AdminCard>
        ))}
      </div>
      <AdminCard className="p-4">
        <h3 className="text-xs font-black uppercase mb-3">Procurement stock snapshot</h3>
        <p className="text-[10px] text-text-muted mb-4">
          Central procurement ledger only. Restaurant and Fish Mall stock are managed in their own modules.
        </p>
        {stock.length === 0 ? (
          <p className="text-sm text-gray-500">No inventory records</p>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Qty (KG)</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((p) => (
                <tr key={p._id || p.id} className="border-b border-gray-100">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 text-right font-mono">{p.quantity ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminCard>
    </div>
  );
};

export default FinanceOverview;

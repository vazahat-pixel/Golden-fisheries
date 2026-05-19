import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Download, Eye, FileText } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const BuyerInvoiceHistory = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { trips, fetchTrips } = useAdminStore();

  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  const myInvoices = trips
    .filter(t =>
      ['DELIVERED', 'COMPLETED'].includes(t.status) &&
      (t.buyerName === (user?.fullName || user?.name) || t.buyerPhone === user?.phone)
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-600 mb-1">Buyer Portal</p>
        <h1 className="text-2xl font-serif italic font-black text-slate-900">Invoice History</h1>
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{myInvoices.length} completed transactions</p>
      </div>

      {myInvoices.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Invoices', value: myInvoices.length },
            { label: 'Total KG Received', value: myInvoices.reduce((s, t) => s + (parseFloat(t.actualQty || t.expectedQty) || 0), 0) + ' KG' },
            { label: 'This Month', value: myInvoices.filter(t => new Date(t.createdAt).getMonth() === new Date().getMonth()).length },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
              <p className="text-xl font-black text-slate-900 font-serif italic">{s.value}</p>
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {myInvoices.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 py-16 text-center">
          <History size={36} className="mx-auto text-slate-200 mb-3" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No completed invoices yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">All Invoices</span>
          </div>
          <div className="divide-y divide-slate-50">
            {myInvoices.map((t) => (
              <div key={t.id} className="px-6 py-4 flex justify-between items-center hover:bg-slate-50/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText size={16} className="text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase">{t.tripNumber || t.id}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                      {t.product} · {t.actualQty || t.expectedQty} KG · {t.createdAt?.slice(0, 10)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/buyer/bill/${t.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-[9px] font-black uppercase hover:bg-blue-50 hover:text-blue-600 transition-all">
                    <Eye size={12} /> View
                  </button>
                  <button onClick={() => navigate(`/buyer/bill/${t.id}`)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-700 shadow-sm">
                    <Download size={12} /> PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerInvoiceHistory;

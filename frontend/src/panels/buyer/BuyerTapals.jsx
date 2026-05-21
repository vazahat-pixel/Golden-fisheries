import React, { useEffect, useState } from 'react';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { FileText, Download, Layers } from 'lucide-react';
import { toast } from 'react-hot-toast';

const BuyerTapals = () => {
  const { user } = useAuthStore();
  const { tapals, fetchTapals } = useAdminStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTapals().finally(() => setLoading(false));
  }, [fetchTapals]);

  const buyerTapals = tapals.filter(t => (t.buyerId === user?.id) || (t.buyerName?.toLowerCase() === user?.name?.toLowerCase()) || (user?.role === 'BUYER'));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="border-b border-card-border pb-5">
        <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
          <Layers className="text-brand-yellow" size={24} /> My Deliveries
        </h1>
        <p className="text-text-secondary text-sm mt-1">Track your incoming stock and download tapal slips.</p>
      </div>

      <div className="bg-white border border-card-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">TP No</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Date</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Total Qty</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive">Status</th>
                <th className="py-3 px-4 text-[10px] font-black uppercase text-brand-olive text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">Loading Deliveries...</td>
                </tr>
              ) : buyerTapals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted italic">No deliveries found.</td>
                </tr>
              ) : (
                buyerTapals.map((tapal) => (
                  <tr key={tapal.id || tapal._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 font-black text-brand-olive">#{tapal.tpNo || tapal.tapalNumber}</td>
                    <td className="py-4 px-4 font-medium text-text-secondary">
                      {new Date(tapal.createdAt || tapal.date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-extrabold">{tapal.totalWeight || tapal.qty || '0'} KG</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded-sm ${
                        tapal.status?.toUpperCase() === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                        tapal.status?.toUpperCase() === 'IN TRANSIT' ? 'bg-blue-100 text-blue-800' :
                        'bg-brand-yellow/30 text-brand-olive'
                      }`}>
                        {tapal.status || 'CREATED'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => toast.success('Slip download initiated')}
                        className="text-[10px] font-black uppercase tracking-widest text-brand-olive hover:text-brand-yellow transition-colors flex items-center gap-1 justify-end ml-auto"
                      >
                        <Download size={12} /> Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BuyerTapals;

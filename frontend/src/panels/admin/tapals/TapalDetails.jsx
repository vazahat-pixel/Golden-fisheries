import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { ArrowLeft, FileText, CheckCircle, Truck, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TapalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tapals, fetchTapals } = useAdminStore();
  const [tapal, setTapal] = useState(null);

  useEffect(() => {
    if (tapals.length === 0) fetchTapals();
  }, [fetchTapals, tapals.length]);

  useEffect(() => {
    const found = tapals.find(t => t.id === id || t._id === id);
    if (found) setTapal(found);
  }, [id, tapals]);

  if (!tapal) return <div className="p-8 text-center text-text-muted">Loading Tapal...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans pb-12">
      <div className="flex items-center gap-3 border-b border-card-border pb-5">
        <button onClick={() => navigate('/admin/tapals')} className="text-text-muted hover:text-[#6A7051] transition-all">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold tracking-wider text-brand-olive uppercase flex items-center gap-3">
            <FileText className="text-brand-yellow" size={24} /> Tapal #{tapal.tpNo || tapal.tapalNumber}
          </h1>
          <p className="text-text-secondary text-sm mt-1">Status: {tapal.status || 'CREATED'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-card-border p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
            Party Details
          </h3>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold text-text-muted w-24 inline-block">Buyer:</span> <span className="font-black uppercase">{tapal.buyerName || tapal.party || tapal.partyName || 'N/A'}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block">Source Slip:</span> <span className="font-bold">{tapal.sourceSlipNo || 'N/A'}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block">Date:</span> <span className="font-bold">{new Date(tapal.createdAt || tapal.date).toLocaleDateString()}</span></p>
          </div>
        </div>

        <div className="bg-white border border-card-border p-6 shadow-sm">
          <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
            Logistics Details
          </h3>
          <div className="space-y-3 text-sm">
            <p><span className="font-bold text-text-muted w-24 inline-block">Vehicle:</span> <span className="font-black uppercase">{tapal.vehicleNo || tapal.vehicleNumber || 'Unassigned'}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block">Driver:</span> <span className="font-bold">{tapal.driverName || tapal.driver || 'Unassigned'}</span></p>
            <p><span className="font-bold text-text-muted w-24 inline-block">Total Qty:</span> <span className="font-black text-brand-olive">{tapal.totalWeight || tapal.qty || '0'}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-card-border p-6 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-brand-olive border-b border-card-border pb-2 mb-4">
          Cargo Particulars
        </h3>
        {tapal.items && tapal.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F5F5EC]/50 border-b border-card-border">
                  <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive w-12 text-center">No</th>
                  <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive">Item</th>
                  <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-center">Boxes</th>
                  <th className="py-2 px-3 text-[10px] font-black uppercase text-brand-olive text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border text-xs">
                {tapal.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-center font-bold">{idx + 1}</td>
                    <td className="py-3 px-3 font-black uppercase">{item.particulars || item.name}</td>
                    <td className="py-3 px-3 text-center font-bold">{item.noOfBoxes || item.boxes || '-'}</td>
                    <td className="py-3 px-3 text-right font-bold text-brand-olive">{item.totalWeight || item.weight} kg</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-text-muted italic">No items associated with this Tapal.</p>
        )}
      </div>
    </div>
  );
};

export default TapalDetails;

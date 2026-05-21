import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { tapalService } from '../../../services/tapalService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { ArrowLeft, Printer } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TapalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tapal, setTapal] = useState(null);

  useEffect(() => {
    tapalService
      .getById(id)
      .then((res) => setTapal(res?.data?.tapal || res?.tapal || res))
      .catch(() => toast.error('Failed to load tapal'));
  }, [id]);

  if (!tapal) return <p className="p-8 text-sm">Loading...</p>;

  const lines = tapal.products || [];

  const printDoc = () => window.print();

  return (
    <div className="space-y-4">
      <div className="no-print flex justify-between items-center">
        <button type="button" onClick={() => navigate('/admin/tapals')} className="flex items-center gap-1 text-sm">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          type="button"
          onClick={printDoc}
          className="flex items-center gap-1 text-xs font-bold uppercase border px-3 py-2"
        >
          <Printer size={14} /> Print Tapal
        </button>
      </div>
      <div className="print-root">
      <PaperFormFrame title={`Tapal ${tapal.tpNo || tapal.tapalNumber}`} subtitle="Dispatch record">
        <PaperFieldRow label="Harvest Ref">
          <input className={paperInputClass} readOnly value={tapal.harvest?.harvestNumber || tapal.harvestId || '—'} />
        </PaperFieldRow>
        <PaperFieldRow label="Party">
          <input className={paperInputClass} readOnly value={tapal.partyName || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Destination">
          <input className={paperInputClass} readOnly value={tapal.destination || tapal.unloadingPoint || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Vehicle">
          <input className={paperInputClass} readOnly value={tapal.vehicleNumber || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Driver">
          <input className={paperInputClass} readOnly value={tapal.driver || ''} />
        </PaperFieldRow>
        <PaperFieldRow label="Status">
          <input className={paperInputClass} readOnly value={tapal.status || ''} />
        </PaperFieldRow>
        <table className="w-full border border-black text-xs mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Item</th>
              <th className="border border-black p-1">Qty</th>
              <th className="border border-black p-1">Box</th>
              <th className="border border-black p-1">Weight</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((p, i) => (
              <tr key={i}>
                <td className="border border-black p-1">{p.name || p.fishName}</td>
                <td className="border border-black p-1 text-right">{p.qty}</td>
                <td className="border border-black p-1 text-right">{p.boxQty}</td>
                <td className="border border-black p-1 text-right">{p.totalWeight}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </PaperFormFrame>
      </div>
    </div>
  );
};

export default TapalDetail;

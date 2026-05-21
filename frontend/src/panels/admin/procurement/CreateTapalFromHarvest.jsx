import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tapalService } from '../../../services/tapalService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

/**
 * Tapal dispatch slip — ONLY from confirmed harvest with purchase invoice (net rate).
 */
const CreateTapalFromHarvest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips } = useAdminStore();
  const [harvestId, setHarvestId] = useState(preselect || '');
  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHarvestSlips();
  }, [fetchHarvestSlips]);

  const harvest = harvestSlips.find((h) => String(h._id || h.id) === String(harvestId));

  useEffect(() => {
    if (!harvest) return;
    setDestination(harvest.destination || '');
    setVehicleNumber(harvest.vehicleNo || '');
    setDriverName(harvest.driverName || '');
    setLogisticsNotes(harvest.logisticsNotes || harvest.notes || '');
  }, [harvest]);

  const eligible = harvestSlips.filter(
    (h) =>
      ['CONFIRMED', 'PARTIALLY_CONVERTED'].includes(h.status) &&
      h.netRateCalculated != null
  );

  const handleCreate = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    setLoading(true);
    try {
      await tapalService.createFromHarvest(harvestId, {
        destination,
        vehicleNumber,
        driver: driverName,
        logisticsNotes,
      });
      toast.success('Tapal created from harvest');
      navigate('/admin/tapals');
    } catch (err) {
      toast.error(err?.message || 'Failed to create tapal');
    } finally {
      setLoading(false);
    }
  };

  const lines = harvest?.products || harvest?.items || [];

  return (
    <div className="space-y-4 pb-12">
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold uppercase text-brand-olive">Create Tapal (from Harvest)</h1>
      </div>

      <PaperFormFrame title="Tapal Dispatch" subtitle="TP Number assigned on save">
        <PaperFieldRow label="Harvest Ref (H No)">
          <select className={paperInputClass} value={harvestId} onChange={(e) => setHarvestId(e.target.value)}>
            <option value="">— Select —</option>
            {eligible.map((h) => (
              <option key={h._id || h.id} value={h._id || h.id}>
                {h.hNo || h.harvestNumber || h.tpNo} — {h.farmerName}
              </option>
            ))}
          </select>
        </PaperFieldRow>
        <PaperFieldRow label="Destination">
          <input className={paperInputClass} value={destination} onChange={(e) => setDestination(e.target.value)} />
        </PaperFieldRow>
        <PaperFieldRow label="Vehicle">
          <input className={paperInputClass} value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} />
        </PaperFieldRow>
        <PaperFieldRow label="Driver">
          <input className={paperInputClass} value={driverName} onChange={(e) => setDriverName(e.target.value)} />
        </PaperFieldRow>
        <PaperFieldRow label="Dispatch Notes">
          <textarea className={paperInputClass} rows={2} value={logisticsNotes} onChange={(e) => setLogisticsNotes(e.target.value)} />
        </PaperFieldRow>

        {lines.length > 0 && (
          <table className="w-full border border-black text-xs mt-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-1">Fish Item</th>
                <th className="border border-black p-1">Qty</th>
                <th className="border border-black p-1">Box</th>
                <th className="border border-black p-1">Weight</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((p, i) => (
                <tr key={i}>
                  <td className="border border-black p-1">{p.fishName || p.particulars}</td>
                  <td className="border border-black p-1 text-right">{p.estimatedQty || p.totalWeight}</td>
                  <td className="border border-black p-1 text-right">{p.boxCount || p.noOfBoxes}</td>
                  <td className="border border-black p-1 text-right">{p.totalWeight || p.estimatedQty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          type="button"
          disabled={loading || !harvestId}
          onClick={handleCreate}
          className="w-full mt-4 bg-[#6A7051] text-white py-3 font-bold uppercase text-sm disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Generate Tapal'}
        </button>
      </PaperFormFrame>
    </div>
  );
};

export default CreateTapalFromHarvest;

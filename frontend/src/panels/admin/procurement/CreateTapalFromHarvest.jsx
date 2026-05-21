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
    (h) => !['CONVERTED_TO_TAPAL', 'COMPLETED', 'REJECTED'].includes(h.status)
  );

  const isConfirmed = harvest && ['CONFIRMED', 'PARTIALLY_CONVERTED'].includes(harvest.status);
  const hasNetRate = harvest && harvest.netRateCalculated != null;
  const showWarning = harvest && (!isConfirmed || !hasNetRate);

  const handleCreate = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    if (showWarning) {
      toast.error('This harvest slip is not yet eligible for Tapal generation.');
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
            {eligible.map((h) => {
              const statusText = h.status || 'PENDING';
              const hasNetVal = h.netRateCalculated != null;
              const suffix = ` (${statusText}${hasNetVal ? ', Net Rate Saved' : ', No Net Rate'})`;
              return (
                <option key={h._id || h.id} value={h._id || h.id}>
                  {h.hNo || h.harvestNumber || h.tpNo} — {h.farmerName}{suffix}
                </option>
              );
            })}
          </select>
        </PaperFieldRow>

        {showWarning && (
          <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 text-xs mt-2 space-y-1.5 font-sans">
            <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800">⚠️ Ineligible Harvest Slip</div>
            {!isConfirmed && (
              <p>
                Harvest status is <strong>{harvest.status || 'PENDING'}</strong>. Farmer confirmation is required.
                <button
                  type="button"
                  onClick={() => navigate(`/admin/procurement/harvest/${harvest._id || harvest.id}`)}
                  className="underline font-bold text-amber-700 ml-1 hover:text-amber-950"
                >
                  Confirm / Approve Slip
                </button>
              </p>
            )}
            {!hasNetRate && (
              <p>
                Purchase invoice (net rate) is not saved yet. Please calculate and save the net rate.
                <button
                  type="button"
                  onClick={() => navigate(`/admin/procurement/net-rate?harvestId=${harvest._id || harvest.id}`)}
                  className="underline font-bold text-amber-700 ml-1 hover:text-amber-950"
                >
                  Save Net Rate / Purchase Invoice
                </button>
              </p>
            )}
          </div>
        )}

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
          disabled={loading || !harvestId || showWarning}
          onClick={handleCreate}
          className="w-full mt-4 bg-[#6A7051] text-white py-3 font-bold uppercase text-sm disabled:opacity-50 transition-all"
        >
          {loading ? 'Creating...' : showWarning ? 'Ineligible Slip (Fix warnings above)' : 'Generate Tapal'}
        </button>
      </PaperFormFrame>
    </div>
  );
};

export default CreateTapalFromHarvest;

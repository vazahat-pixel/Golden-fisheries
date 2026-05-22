import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tapalService } from '../../../services/tapalService';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

const CONVERTIBLE_STATUS = ['CONFIRMED', 'PARTIALLY_CONVERTED'];

function harvestReadyForTapal(h) {
  if (!h) return false;
  if (!CONVERTIBLE_STATUS.includes(h.status)) return false;
  if (h.netRateCalculated == null || h.netRateCalculated === '') return false;
  if (['CONVERTED_TO_TAPAL', 'COMPLETED'].includes(h.status)) return false;
  return true;
}

function harvestLabel(h) {
  const no = h.hNo || h.harvestNumber || h.tpNo || '—';
  const farmer = h.farmerName || 'Farmer';
  return `${no} — ${farmer}`;
}

/**
 * Tapal dispatch slip — ONLY from confirmed harvest with purchase invoice (net rate).
 */
const CreateTapalFromHarvest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselect = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips, loading } = useAdminStore();
  const [harvestId, setHarvestId] = useState(preselect || '');
  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    (async () => {
      setFetchError(null);
      try {
        await fetchHarvestSlips({ limit: 500 });
      } catch (err) {
        setFetchError(err?.message || 'Could not load harvest slips');
        toast.error(err?.message || 'Failed to load harvest slips');
      }
    })();
  }, [fetchHarvestSlips]);

  useEffect(() => {
    masterService.buyers
      .getAll({ limit: 200 })
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBuyers(list.filter((b) => b.isActive !== false));
      })
      .catch(() => setBuyers([]));
  }, []);

  const harvest = harvestSlips.find((h) => String(h._id || h.id) === String(harvestId));
  const selectedBuyer = buyers.find((b) => String(b._id || b.id) === String(buyerId));

  useEffect(() => {
    if (!harvest) return;
    setDestination(harvest.destination || harvest.pickupLocation || '');
    setVehicleNumber(harvest.vehicleNo || '');
    setDriverName(harvest.driverName || '');
    setLogisticsNotes(harvest.logisticsNotes || harvest.notes || '');
  }, [harvest]);

  const { eligible, needNetRate, other } = useMemo(() => {
    const eligibleList = [];
    const needNetRateList = [];
    const otherList = [];
    for (const h of harvestSlips) {
      if (['CONVERTED_TO_TAPAL', 'COMPLETED'].includes(h.status)) continue;
      if (harvestReadyForTapal(h)) eligibleList.push(h);
      else if (CONVERTIBLE_STATUS.includes(h.status)) needNetRateList.push(h);
      else otherList.push(h);
    }
    return { eligible: eligibleList, needNetRate: needNetRateList, other: otherList };
  }, [harvestSlips]);

  const handleCreate = async () => {
    if (!harvestId) {
      toast.error('Select harvest reference');
      return;
    }
    if (!harvestReadyForTapal(harvest)) {
      toast.error('Selected harvest must be CONFIRMED with net rate saved');
      return;
    }
    if (!buyerId || !selectedBuyer?.phone) {
      toast.error('Select buyer (Channapa) — required for buyer app driver assignment');
      return;
    }
    setSubmitting(true);
    try {
      await tapalService.createFromHarvest(harvestId, {
        destination,
        vehicleNumber,
        driverName,
        logisticsNotes,
        buyerId: selectedBuyer._id || selectedBuyer.id,
        buyerPhone: selectedBuyer.phone,
      });
      toast.success('Tapal created from harvest');
      navigate('/admin/tapals');
    } catch (err) {
      toast.error(err?.message || 'Failed to create tapal');
    } finally {
      setSubmitting(false);
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

      <p className="text-[11px] bg-amber-50 border border-amber-200 p-3 text-amber-900">
        Destination / vehicle / driver fields below are notes for your team only. After save, assign the real
        driver from Tapal detail or Logistics → Assign Driver.
      </p>

      <PaperFormFrame title="Tapal Dispatch" subtitle="TP Number assigned on save">
        <PaperFieldRow label="Harvest Ref (H No)">
          <select
            className={paperInputClass}
            value={harvestId}
            onChange={(e) => setHarvestId(e.target.value)}
            disabled={loading}
          >
            <option value="">
              {loading ? 'Loading harvest slips…' : '— Select harvest —'}
            </option>
            {eligible.length > 0 && (
              <optgroup label="Ready for tapal (confirmed + net rate)">
                {eligible.map((h) => (
                  <option key={h._id || h.id} value={h._id || h.id}>
                    {harvestLabel(h)}
                  </option>
                ))}
              </optgroup>
            )}
            {needNetRate.length > 0 && (
              <optgroup label="Confirmed — save net rate first">
                {needNetRate.map((h) => (
                  <option key={h._id || h.id} value={h._id || h.id} disabled>
                    {harvestLabel(h)} (net rate required)
                  </option>
                ))}
              </optgroup>
            )}
            {other.length > 0 && (
              <optgroup label="Not yet confirmed">
                {other.map((h) => (
                  <option key={h._id || h.id} value={h._id || h.id} disabled>
                    {harvestLabel(h)} — {h.status}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {fetchError && (
            <p className="text-xs text-red-600 mt-1">{fetchError}</p>
          )}
          {!loading && !fetchError && harvestSlips.length === 0 && (
            <p className="text-xs text-amber-700 mt-1">
              No harvest slips in database.{' '}
              <Link to="/admin/procurement/harvest/new" className="underline font-bold">
                Create a harvest slip
              </Link>{' '}
              first.
            </p>
          )}
          {!loading && harvestSlips.length > 0 && eligible.length === 0 && (
            <p className="text-xs text-amber-700 mt-1">
              No harvest is ready yet. Confirm the slip and{' '}
              <Link
                to={needNetRate[0] ? `/admin/procurement/net-rate?harvestId=${needNetRate[0]._id || needNetRate[0].id}` : '/admin/procurement/net-rate'}
                className="underline font-bold"
              >
                save net rate (purchase invoice)
              </Link>{' '}
              before creating a tapal.
            </p>
          )}
        </PaperFieldRow>
        <PaperFieldRow label="Buyer (Channapa) *">
          <select
            className={paperInputClass}
            value={buyerId}
            onChange={(e) => setBuyerId(e.target.value)}
            required
          >
            <option value="">— Select buyer —</option>
            {buyers.map((b) => (
              <option key={b._id || b.id} value={b._id || b.id}>
                {(b.buyerName || b.name || 'Buyer').toUpperCase()} — {b.phone}
              </option>
            ))}
          </select>
          {buyers.length === 0 && (
            <p className="text-xs text-amber-700 mt-1">
              No buyers in master. Add buyer under Masters first.
            </p>
          )}
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
          disabled={submitting || !harvestId || !harvestReadyForTapal(harvest)}
          onClick={handleCreate}
          className="w-full mt-4 bg-[#6A7051] text-white py-3 font-bold uppercase text-sm disabled:opacity-50"
        >
          {submitting ? 'Creating...' : 'Generate Tapal'}
        </button>
      </PaperFormFrame>
    </div>
  );
};

export default CreateTapalFromHarvest;

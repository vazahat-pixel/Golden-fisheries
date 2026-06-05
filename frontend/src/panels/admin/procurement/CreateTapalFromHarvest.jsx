import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tapalService } from '../../../services/tapalService';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
import { Modal } from '../../../design-system';
=======
>>>>>>> 36813be461d21b408f6150d714f5746d56ef9a1c
import { ArrowLeft, Check, Plus, Trash2, Sprout, AlertCircle, ShoppingCart, Weight, ClipboardCheck } from 'lucide-react';

const CONVERTIBLE_STATUS = ['CONFIRMED', 'PARTIALLY_CONVERTED', 'OPEN', 'PARTIAL_USED'];

function harvestReadyForTapal(h) {
  if (!h) return false;
  if (!CONVERTIBLE_STATUS.includes(h.status)) return false;
  if (h.netRateCalculated == null || h.netRateCalculated === '') return false;
  if (h.status === 'CLOSED' || h.remainingQty <= 0) return false;
  return true;
}

function harvestLabel(h) {
  const no = h.harvestNumber || h.hNo || '—';
  const farmer = h.farmerId?.fullName || h.farmerName || 'Farmer';
  return `${no} — ${farmer}`;
}

const CreateTapalFromHarvest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips, loading } = useAdminStore();

  // Selected allocations state: { [harvestId]: allocatedQty }
  const [selectedAllocations, setSelectedAllocations] = useState({});

  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

<<<<<<< HEAD
  // Buyer creation modal states
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [newBuyerName, setNewBuyerName] = useState('');
  const [newBuyerPhone, setNewBuyerPhone] = useState('');
  const [newBuyerAddress, setNewBuyerAddress] = useState('');
  const [newBuyerType, setNewBuyerType] = useState('EXTERNAL');
  const [isAddingBuyer, setIsAddingBuyer] = useState(false);

  const handleAddBuyerSubmit = async (e) => {
    e.preventDefault();
    if (!newBuyerName.trim() || !newBuyerPhone.trim() || !newBuyerAddress.trim()) {
      toast.error('Buyer Name, Phone, and Delivery Address are required!');
      return;
    }
    setIsAddingBuyer(true);
    try {
      const res = await masterService.buyers.create({
        buyerName: newBuyerName.trim().toUpperCase(),
        phone: newBuyerPhone.trim(),
        buyerType: newBuyerType,
        deliveryAddress: newBuyerAddress.trim().toUpperCase()
      });
      const newBuyer = res?.data?.buyer || res?.buyer || res;
      if (newBuyer) {
        toast.success('Buyer added successfully!');
        const bRes = await masterService.buyers.getAll({ limit: 200 });
        const list = Array.isArray(bRes?.data) ? bRes.data : Array.isArray(bRes) ? bRes : [];
        const filtered = list.filter((b) => b.isActive !== false);
        setBuyers(filtered);
        
        setBuyerId(newBuyer._id || newBuyer.id);
        
        setNewBuyerName('');
        setNewBuyerPhone('');
        setNewBuyerAddress('');
        setNewBuyerType('EXTERNAL');
        setIsBuyerModalOpen(false);
      } else {
        toast.error('Failed to create buyer.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create buyer');
    } finally {
      setIsAddingBuyer(false);
    }
  };

=======
>>>>>>> 36813be461d21b408f6150d714f5746d56ef9a1c
  // Fetch harvest slips and buyers on mount
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

  // Filter harvest lists
  const { eligible, needNetRate, other } = useMemo(() => {
    const eligibleList = [];
    const needNetRateList = [];
    const otherList = [];
    for (const h of harvestSlips) {
      if (['CLOSED', 'COMPLETED', 'CONVERTED_TO_TAPAL'].includes(h.status)) continue;
      // Also verify remaining quantity
      const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
      const available = h.availableQty || totalEstWeight;
      const remaining = available - (h.allocatedQty || 0);
      if (remaining <= 0) continue;

      if (harvestReadyForTapal(h)) {
        eligibleList.push(h);
      } else if (['CONFIRMED', 'PARTIALLY_CONVERTED', 'OPEN', 'PARTIAL_USED'].includes(h.status)) {
        needNetRateList.push(h);
      } else {
        otherList.push(h);
      }
    }
    return { eligible: eligibleList, needNetRate: needNetRateList, other: otherList };
  }, [harvestSlips]);

  // Pre-fill from URL param if available
  useEffect(() => {
    if (preselectId && eligible.length > 0) {
      const match = eligible.find(h => String(h._id || h.id) === String(preselectId));
      if (match) {
        const totalEstWeight = match.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
        const available = match.availableQty || totalEstWeight;
        const remaining = available - (match.allocatedQty || 0);
        setSelectedAllocations({ [preselectId]: remaining.toFixed(2) });
      }
    }
  }, [preselectId, eligible]);

  // Sync logistics fields when selection changes
  useEffect(() => {
    const activeHarvestIds = Object.keys(selectedAllocations);
    if (activeHarvestIds.length === 1) {
      const h = eligible.find(x => String(x._id || x.id) === activeHarvestIds[0]);
      if (h) {
        setDestination(h.destination || h.pickupLocation || '');
        setVehicleNumber(h.vehicleNo || '');
        setDriverName(h.driverName || '');
        setLogisticsNotes(h.logisticsNotes || h.remarks || '');
      }
    }
  }, [selectedAllocations, eligible]);

  const selectedBuyer = buyers.find((b) => String(b._id || b.id) === String(buyerId));

  // Handle allocation checkbox toggle
  const toggleHarvestSelection = (hId, remainingQty) => {
    setSelectedAllocations(prev => {
      const next = { ...prev };
      if (next[hId] !== undefined) {
        delete next[hId];
      } else {
        next[hId] = remainingQty.toFixed(2);
      }
      return next;
    });
  };

  // Handle allocation weight change
  const handleWeightChange = (hId, val) => {
    setSelectedAllocations(prev => ({
      ...prev,
      [hId]: val
    }));
  };

  // Compute live consolidated products
  const consolidatedProducts = useMemo(() => {
    const productsMap = {};
    Object.entries(selectedAllocations).forEach(([hId, allocatedQty]) => {
      const h = eligible.find(x => String(x._id || x.id) === hId);
      if (!h) return;
      const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 1;
      const available = h.availableQty || totalEstWeight || 1;
      const scaleFactor = (parseFloat(allocatedQty) || 0) / available;

      const items = h.products || h.items || [];
      items.forEach(item => {
        const key = item.fishName || item.particulars;
        if (!key) return;
        const scaledQty = (item.estimatedQty || item.totalWeight || 0) * scaleFactor;
        const scaledBoxes = (item.boxCount || item.noOfBoxes || 0) * scaleFactor;

        if (!productsMap[key]) {
          productsMap[key] = {
            fishName: key,
            estimatedQty: 0,
            boxCount: 0
          };
        }
        productsMap[key].estimatedQty += scaledQty;
        productsMap[key].boxCount += scaledBoxes;
      });
    });
    return Object.values(productsMap);
  }, [selectedAllocations, eligible]);

  // Compute totals
  const totalAllocatedWeight = useMemo(() => {
    return Object.values(selectedAllocations).reduce((sum, w) => sum + (parseFloat(w) || 0), 0);
  }, [selectedAllocations]);

  // Validate allocations
  const validationErrors = useMemo(() => {
    const errors = {};
    Object.entries(selectedAllocations).forEach(([hId, allocatedQty]) => {
      const h = eligible.find(x => String(x._id || x.id) === hId);
      if (!h) return;
      const qty = parseFloat(allocatedQty) || 0;
      const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
      const available = h.availableQty || totalEstWeight;
      const remaining = available - (h.allocatedQty || 0);

      if (qty <= 0) {
        errors[hId] = 'Allocated quantity must be greater than zero';
      } else if (qty > remaining + 0.001) {
        errors[hId] = `Allocation exceeds remaining stock (${remaining.toFixed(2)} KG)`;
      }
    });
    return errors;
  }, [selectedAllocations, eligible]);

  const isValid = useMemo(() => {
    const keys = Object.keys(selectedAllocations);
    if (keys.length === 0) return false;
    if (Object.keys(validationErrors).length > 0) return false;
    if (!buyerId || !selectedBuyer?.phone) return false;
    return true;
  }, [selectedAllocations, validationErrors, buyerId, selectedBuyer]);

  const handleCreate = async () => {
    if (!isValid) {
      toast.error('Please resolve all validation errors and select a buyer');
      return;
    }

    const allocations = Object.entries(selectedAllocations).map(([hId, qty]) => ({
      harvestId: hId,
      allocatedQty: parseFloat(qty)
    }));

    setSubmitting(true);
    try {
      await tapalService.createFromHarvest(null, {
        allocations,
        destination,
        vehicleNumber,
        driverName,
        logisticsNotes,
        buyerId: selectedBuyer._id || selectedBuyer.id,
        buyerPhone: selectedBuyer.phone,
      });
      toast.success('Unified Tapal created successfully!');
      navigate('/admin/tapals');
    } catch (err) {
      toast.error(err?.message || 'Failed to create tapal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-[#6A7051]">Create Consolidated Tapal</h1>
          <p className="text-xs text-slate-500">Allocate custom weights across multiple farmer harvests into a single dispatch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Harvest slips checklist & allocations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#6A7051] border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
              <Sprout size={16} /> 1. Select Harvest Source Loads
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400">Loading harvest slips…</div>
            ) : eligible.length === 0 ? (
              <div className="py-8 text-center text-xs font-bold text-slate-500 border border-dashed border-slate-200">
                No ready harvest slips available. Confirm a slip and{' '}
                <Link to="/admin/procurement/net-rate" className="underline font-black text-[#6A7051]">
                  save net rate (purchase invoice)
                </Link>{' '}
                first.
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {eligible.map((h) => {
                  const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
                  const available = h.availableQty || totalEstWeight;
                  const remaining = available - (h.allocatedQty || 0);
                  const isChecked = selectedAllocations[h._id || h.id] !== undefined;
<<<<<<< HEAD

                  return (
                    <div
                      key={h._id || h.id}
                      onClick={() => toggleHarvestSelection(h._id || h.id, remaining)}
                      className={`border p-4 transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#6A7051] bg-[#F9FAF6]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-[#6A7051] border-[#6A7051] text-white' : 'border-slate-300 text-transparent'
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Status: <span className="font-bold uppercase">{h.status}</span> · Date:{' '}
                            {new Date(h.harvestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#6A7051]">{remaining.toFixed(2)} KG</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining Stock</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Incomplete / Non-ready groups */}
            {(needNetRate.length > 0 || other.length > 0) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <details className="cursor-pointer">
                  <summary className="text-[10px] font-black uppercase text-slate-400 tracking-wider hover:text-slate-600 transition-colors">
                    View non-convertible harvest slips ({needNetRate.length + other.length})
                  </summary>
                  <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto text-[10px]">
                    {needNetRate.map(h => (
                      <div key={h._id || h.id} className="p-2 bg-slate-50 text-slate-500 flex justify-between">
                        <span>{harvestLabel(h)}</span>
                        <span className="font-bold text-amber-700">Net Rate Required</span>
                      </div>
                    ))}
                    {other.map(h => (
                      <div key={h._id || h.id} className="p-2 bg-slate-50 text-slate-500 flex justify-between">
                        <span>{harvestLabel(h)}</span>
                        <span className="font-bold uppercase text-slate-400">{h.status}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Allocation input widgets for selected items */}
          {Object.keys(selectedAllocations).length > 0 && (
            <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#6A7051] border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
                <Weight size={16} /> 2. Enter Allocation Weights
              </h2>

              <div className="divide-y divide-slate-100">
                {Object.entries(selectedAllocations).map(([hId, qty]) => {
                  const h = eligible.find(x => String(x._id || x.id) === hId);
                  if (!h) return null;
                  const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
                  const available = h.availableQty || totalEstWeight;
                  const remaining = available - (h.allocatedQty || 0);
                  const error = validationErrors[hId];

                  return (
                    <div key={hId} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Stock remaining: <span className="font-bold text-slate-700">{remaining.toFixed(2)} KG</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            max={remaining}
                            className={`${paperInputClass} w-32 text-right font-black text-xs`}
                            value={qty}
                            onChange={(e) => handleWeightChange(hId, e.target.value)}
                          />
                          <span className="text-xs font-bold text-slate-400">KG</span>
                        </div>
                      </div>
                      {error && <p className="text-[10px] text-red-600 font-bold mt-1 text-right">{error}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-[#F9FAF6] p-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#6A7051]">Consolidated Total Weight</span>
                <span className="text-lg font-black text-slate-800">{totalAllocatedWeight.toFixed(2)} KG</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Logistics & Confirmation details */}
        <div className="space-y-6">
          <PaperFormFrame title="3. Logistics & Destination" subtitle="TP slip generated on submit">
            <PaperFieldRow
              label={
                <div className="flex flex-col gap-1 items-start">
                  <span>Buyer (Channapa) *</span>
                  <button
                    type="button"
                    onClick={() => setIsBuyerModalOpen(true)}
                    className="text-[9px] font-black uppercase text-[#a5a027] hover:underline whitespace-nowrap"
                  >
                    + Add Buyer
                  </button>
                </div>
              }
            >
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
            </PaperFieldRow>

            <PaperFieldRow label="Destination">
              <input
                className={paperInputClass}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Mangalore Wharf"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Vehicle Number">
              <input
                className={paperInputClass}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KA-19-F-1234"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Driver Name">
              <input
                className={paperInputClass}
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Anand"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Dispatch Notes">
              <textarea
                className={paperInputClass}
                rows={2}
                value={logisticsNotes}
                onChange={(e) => setLogisticsNotes(e.target.value)}
                placeholder="Special loading or route notes"
              />
            </PaperFieldRow>

            {consolidatedProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[#6A7051] border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
                  <ClipboardCheck size={14} /> Unified Load Manifest
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 text-[10px] bg-slate-50">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="border border-slate-200 p-1.5 text-left uppercase">Fish Item</th>
                        <th className="border border-slate-200 p-1.5 text-right uppercase">Est. Weight</th>
                        <th className="border border-slate-200 p-1.5 text-center uppercase">Boxes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="border border-slate-200 p-1.5 font-bold uppercase text-slate-800">{p.fishName}</td>
                          <td className="border border-slate-200 p-1.5 text-right font-black text-slate-900">
                            {p.estimatedQty.toFixed(2)} KG
                          </td>
                          <td className="border border-slate-200 p-1.5 text-center text-slate-600 font-bold">
                            {p.boxCount ? Math.round(p.boxCount) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={submitting || !isValid}
              onClick={handleCreate}
              className="w-full mt-6 bg-[#6A7051] hover:bg-[#5F6846] text-white py-3.5 font-black uppercase text-xs tracking-widest shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Generating...' : 'Generate Tapal'}
            </button>
          </PaperFormFrame>
        </div>
      </div>

      {/* Standard Design System Modal for On-the-fly Buyer Creation */}
      <Modal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        title="Add New Buyer"
        size="md"
      >
        <form onSubmit={handleAddBuyerSubmit} className="space-y-4 font-sans text-xs">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">Buyer Full Name / Firm Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. CHANNAPPA S. & CO"
              value={newBuyerName}
              onChange={(e) => setNewBuyerName(e.target.value)}
              className="border border-gray-400 px-3 py-2 text-xs focus:ring-1 focus:ring-[#6A7051] outline-none uppercase"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g. 9876543210"
              value={newBuyerPhone}
              onChange={(e) => setNewBuyerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="border border-gray-400 px-3 py-2 text-xs focus:ring-1 focus:ring-[#6A7051] outline-none"
              maxLength={10}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">Buyer Type *</label>
            <select
              value={newBuyerType}
              onChange={(e) => setNewBuyerType(e.target.value)}
              className="border border-gray-400 px-3 py-2 text-xs focus:ring-1 focus:ring-[#6A7051] outline-none"
            >
              <option value="EXTERNAL">EXTERNAL BUYER</option>
              <option value="INTERNAL">INTERNAL OUTLET</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[#6A7051] mb-1">Delivery Address *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. MANGALORE WHARF, SHED 4B"
              value={newBuyerAddress}
              onChange={(e) => setNewBuyerAddress(e.target.value)}
              className="border border-gray-400 px-3 py-2 text-xs focus:ring-1 focus:ring-[#6A7051] outline-none uppercase"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setIsBuyerModalOpen(false)}
              className="border border-gray-400 text-slate-700 px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAddingBuyer}
              className="bg-[#6A7051] text-white px-4 py-2 text-xs font-black uppercase tracking-widest hover:bg-[#5F6846] transition-all flex items-center gap-1 shadow-md disabled:opacity-50"
            >
              {isAddingBuyer ? 'Saving...' : 'Add Buyer'}
            </button>
          </div>
        </form>
      </Modal>
=======

                  return (
                    <div
                      key={h._id || h.id}
                      onClick={() => toggleHarvestSelection(h._id || h.id, remaining)}
                      className={`border p-4 transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'border-[#6A7051] bg-[#F9FAF6]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-[#6A7051] border-[#6A7051] text-white' : 'border-slate-300 text-transparent'
                        }`}>
                          <Check size={12} strokeWidth={3} />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Status: <span className="font-bold uppercase">{h.status}</span> · Date:{' '}
                            {new Date(h.harvestDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#6A7051]">{remaining.toFixed(2)} KG</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining Stock</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Incomplete / Non-ready groups */}
            {(needNetRate.length > 0 || other.length > 0) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <details className="cursor-pointer">
                  <summary className="text-[10px] font-black uppercase text-slate-400 tracking-wider hover:text-slate-600 transition-colors">
                    View non-convertible harvest slips ({needNetRate.length + other.length})
                  </summary>
                  <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto text-[10px]">
                    {needNetRate.map(h => (
                      <div key={h._id || h.id} className="p-2 bg-slate-50 text-slate-500 flex justify-between">
                        <span>{harvestLabel(h)}</span>
                        <span className="font-bold text-amber-700">Net Rate Required</span>
                      </div>
                    ))}
                    {other.map(h => (
                      <div key={h._id || h.id} className="p-2 bg-slate-50 text-slate-500 flex justify-between">
                        <span>{harvestLabel(h)}</span>
                        <span className="font-bold uppercase text-slate-400">{h.status}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Allocation input widgets for selected items */}
          {Object.keys(selectedAllocations).length > 0 && (
            <div className="bg-white border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-[#6A7051] border-b border-slate-100 pb-3 mb-2 flex items-center gap-2">
                <Weight size={16} /> 2. Enter Allocation Weights
              </h2>

              <div className="divide-y divide-slate-100">
                {Object.entries(selectedAllocations).map(([hId, qty]) => {
                  const h = eligible.find(x => String(x._id || x.id) === hId);
                  if (!h) return null;
                  const totalEstWeight = h.products?.reduce((sum, item) => sum + (item.estimatedQty || 0), 0) || 0;
                  const available = h.availableQty || totalEstWeight;
                  const remaining = available - (h.allocatedQty || 0);
                  const error = validationErrors[hId];

                  return (
                    <div key={hId} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            Stock remaining: <span className="font-bold text-slate-700">{remaining.toFixed(2)} KG</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            max={remaining}
                            className={`${paperInputClass} w-32 text-right font-black text-xs`}
                            value={qty}
                            onChange={(e) => handleWeightChange(hId, e.target.value)}
                          />
                          <span className="text-xs font-bold text-slate-400">KG</span>
                        </div>
                      </div>
                      {error && <p className="text-[10px] text-red-600 font-bold mt-1 text-right">{error}</p>}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center bg-[#F9FAF6] p-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#6A7051]">Consolidated Total Weight</span>
                <span className="text-lg font-black text-slate-800">{totalAllocatedWeight.toFixed(2)} KG</span>
              </div>
            </div>
          )}
        </div>

        {/* Right column: Logistics & Confirmation details */}
        <div className="space-y-6">
          <PaperFormFrame title="3. Logistics & Destination" subtitle="TP slip generated on submit">
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
            </PaperFieldRow>

            <PaperFieldRow label="Destination">
              <input
                className={paperInputClass}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Mangalore Wharf"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Vehicle Number">
              <input
                className={paperInputClass}
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. KA-19-F-1234"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Driver Name">
              <input
                className={paperInputClass}
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="e.g. Anand"
              />
            </PaperFieldRow>

            <PaperFieldRow label="Dispatch Notes">
              <textarea
                className={paperInputClass}
                rows={2}
                value={logisticsNotes}
                onChange={(e) => setLogisticsNotes(e.target.value)}
                placeholder="Special loading or route notes"
              />
            </PaperFieldRow>

            {consolidatedProducts.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[10px] font-black uppercase tracking-wider text-[#6A7051] border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
                  <ClipboardCheck size={14} /> Unified Load Manifest
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-slate-200 text-[10px] bg-slate-50">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="border border-slate-200 p-1.5 text-left uppercase">Fish Item</th>
                        <th className="border border-slate-200 p-1.5 text-right uppercase">Est. Weight</th>
                        <th className="border border-slate-200 p-1.5 text-center uppercase">Boxes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="border border-slate-200 p-1.5 font-bold uppercase text-slate-800">{p.fishName}</td>
                          <td className="border border-slate-200 p-1.5 text-right font-black text-slate-900">
                            {p.estimatedQty.toFixed(2)} KG
                          </td>
                          <td className="border border-slate-200 p-1.5 text-center text-slate-600 font-bold">
                            {p.boxCount ? Math.round(p.boxCount) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <button
              type="button"
              disabled={submitting || !isValid}
              onClick={handleCreate}
              className="w-full mt-6 bg-[#6A7051] hover:bg-[#5F6846] text-white py-3.5 font-black uppercase text-xs tracking-widest shadow-md active:translate-y-0.5 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Generating...' : 'Generate Tapal'}
            </button>
          </PaperFormFrame>
        </div>
      </div>
>>>>>>> 36813be461d21b408f6150d714f5746d56ef9a1c
    </div>
  );
};

export default CreateTapalFromHarvest;

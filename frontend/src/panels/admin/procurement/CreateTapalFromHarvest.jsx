import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tapalService } from '../../../services/tapalService';
import { masterService } from '../../../services/masterService';
import { userService } from '../../../services/userService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { Modal } from '../../../design-system';
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

function getHarvestQuantities(h) {
  const totalEstWeight = (h.products || h.items || []).reduce(
    (sum, item) => sum + (item.estimatedQty || item.totalWeight || 0),
    0
  );
  const available = h.availableQty || totalEstWeight;
  const remaining = available - (h.allocatedQty || 0);
  return { totalEstWeight, available, remaining };
}

function getProductLineKey(item, index = 0) {
  if (item._id) return String(item._id);
  const pid = item.productId?._id || item.productId;
  const name = (item.fishName || item.particulars || 'line').toUpperCase();
  if (pid) return `${String(pid)}:${index}`;
  return `${name}:${index}`;
}

function getHarvestProductLines(h) {
  const source = h.products?.length ? h.products : h.items || [];
  return source.map((item, index) => ({
    item,
    index,
    lineKey: getProductLineKey(item, index),
  }));
}

function getLineEstimatedKg(item) {
  const est = parseFloat(item.estimatedQty ?? item.totalWeight);
  return Number.isFinite(est) ? est : 0;
}

function getProductRemaining(h, item) {
  const est = getLineEstimatedKg(item);
  if ((item.usedQty || 0) > 0) {
    return Math.max(0, est - item.usedQty);
  }
  const { available, remaining } = getHarvestQuantities(h);
  return available > 0 ? est * (remaining / available) : 0;
}

function buildDefaultProductAllocations(h) {
  const products = {};
  getHarvestProductLines(h).forEach(({ item, index, lineKey }) => {
    products[lineKey] = getProductRemaining(h, item).toFixed(2);
  });
  return products;
}

function sumProductAllocations(products = {}) {
  return Object.values(products).reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

const CreateTapalFromHarvest = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('harvestId');
  const { harvestSlips, fetchHarvestSlips, fetchVehicles, vehicles, loading } = useAdminStore();

  // Selected allocations: { [harvestId]: { products: { [productKey]: qtyKg } } }
  const [selectedAllocations, setSelectedAllocations] = useState({});

  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverId, setDriverId] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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

  useEffect(() => {
    fetchVehicles();
    userService
      .drivers()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDrivers(list.filter((d) => d.isActive !== false));
      })
      .catch(() => {
        setDrivers([]);
        toast.error('Could not load registered drivers');
      })
      .finally(() => setLoadingDrivers(false));
  }, [fetchVehicles]);

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
        setSelectedAllocations({ [preselectId]: { products: buildDefaultProductAllocations(match) } });
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
        setLogisticsNotes(h.logisticsNotes || h.remarks || '');
      }
    }
  }, [selectedAllocations, eligible]);

  const selectedBuyer = buyers.find((b) => String(b._id || b.id) === String(buyerId));
  const selectedDriver = drivers.find((d) => String(d._id || d.id) === String(driverId));

  // Handle allocation checkbox toggle
  const toggleHarvestSelection = (hId, h) => {
    setSelectedAllocations((prev) => {
      const next = { ...prev };
      if (next[hId] !== undefined) {
        delete next[hId];
      } else {
        next[hId] = { products: buildDefaultProductAllocations(h) };
      }
      return next;
    });
  };

  const handleProductQtyChange = (hId, lineKey, val) => {
    setSelectedAllocations((prev) => ({
      ...prev,
      [hId]: {
        products: {
          ...(prev[hId]?.products || {}),
          [lineKey]: val,
        },
      },
    }));
  };

  // Compute live consolidated products
  const consolidatedProducts = useMemo(() => {
    const productsMap = {};
    Object.entries(selectedAllocations).forEach(([hId, allocation]) => {
      const h = eligible.find((x) => String(x._id || x.id) === hId);
      if (!h) return;

      getHarvestProductLines(h).forEach(({ item, lineKey }) => {
        const manifestKey = (item.fishName || item.particulars || '').toUpperCase();
        if (!manifestKey) return;
        const qty = parseFloat(allocation?.products?.[lineKey]) || 0;
        if (qty <= 0) return;
        const lineEst = getLineEstimatedKg(item);
        const boxRatio = lineEst > 0 ? qty / lineEst : 0;
        const scaledBoxes = (parseFloat(item.boxCount ?? item.noOfBoxes) || 0) * boxRatio;

        if (!productsMap[manifestKey]) {
          productsMap[manifestKey] = {
            fishName: manifestKey,
            estimatedQty: 0,
            boxCount: 0,
          };
        }
        productsMap[manifestKey].estimatedQty += qty;
        productsMap[manifestKey].boxCount += scaledBoxes;
      });
    });
    return Object.values(productsMap);
  }, [selectedAllocations, eligible]);

  const totalAllocatedWeight = useMemo(() => {
    return Object.values(selectedAllocations).reduce(
      (sum, allocation) => sum + sumProductAllocations(allocation?.products),
      0
    );
  }, [selectedAllocations]);

  // Validate allocations
  const validationErrors = useMemo(() => {
    const errors = {};
    Object.entries(selectedAllocations).forEach(([hId, allocation]) => {
      const h = eligible.find((x) => String(x._id || x.id) === hId);
      if (!h) return;

      const { remaining } = getHarvestQuantities(h);
      const totalQty = sumProductAllocations(allocation?.products);

      if (totalQty <= 0) {
        errors[hId] = 'Enter KG for at least one fish product';
        return;
      }
      if (totalQty > remaining + 0.001) {
        errors[hId] = `Total allocation (${totalQty.toFixed(2)} KG) exceeds remaining stock (${remaining.toFixed(2)} KG)`;
      }

      getHarvestProductLines(h).forEach(({ item, lineKey }) => {
        const qty = parseFloat(allocation?.products?.[lineKey]) || 0;
        if (qty <= 0) return;
        const productRemaining = getProductRemaining(h, item);
        if (qty > productRemaining + 0.001) {
          errors[`${hId}:${lineKey}`] = `${item.fishName || item.particulars}: max ${productRemaining.toFixed(2)} KG available`;
        }
      });
    });
    return errors;
  }, [selectedAllocations, eligible]);

  const isValid = useMemo(() => {
    const keys = Object.keys(selectedAllocations);
    if (keys.length === 0) return false;
    if (Object.keys(validationErrors).length > 0) return false;
    if (!buyerId || !selectedBuyer?.phone) return false;
    if (!driverId || !selectedDriver) return false;
    return true;
  }, [selectedAllocations, validationErrors, buyerId, selectedBuyer, driverId, selectedDriver]);

  const resolveVehicleId = () => {
    if (!vehicleNumber.trim()) return undefined;
    const norm = vehicleNumber.replace(/\s|-/g, '').toLowerCase();
    const match = (vehicles || []).find((v) => {
      const plate = (v.plateNumber || v.vehicleNumber || '').replace(/\s|-/g, '').toLowerCase();
      return plate && plate === norm;
    });
    return match?._id || match?.id || undefined;
  };

  const handleCreate = async () => {
    if (!isValid) {
      toast.error('Select harvest, buyer, and a registered driver');
      return;
    }

    const allocations = Object.entries(selectedAllocations).map(([hId, allocation]) => {
      const h = eligible.find((x) => String(x._id || x.id) === hId);
      const products = getHarvestProductLines(h || {})
        .map(({ item, lineKey }) => {
          const allocatedQty = parseFloat(allocation?.products?.[lineKey]) || 0;
          if (allocatedQty <= 0) return null;
          return {
            lineItemId: item._id || undefined,
            productId: item.productId?._id || item.productId,
            fishName: item.fishName || item.particulars,
            allocatedQty,
          };
        })
        .filter(Boolean);

      return {
        harvestId: hId,
        allocatedQty: sumProductAllocations(allocation?.products),
        products,
      };
    });

    const driverDisplayName = selectedDriver.fullName || selectedDriver.name || 'Driver';

    setSubmitting(true);
    try {
      const createRes = await tapalService.createFromHarvest(null, {
        allocations,
        destination,
        vehicleNumber,
        driverName: driverDisplayName,
        logisticsNotes,
        buyerId: selectedBuyer._id || selectedBuyer.id,
        buyerPhone: selectedBuyer.phone,
      });

      const tapal =
        createRes?.data?.tapal ||
        createRes?.tapal ||
        createRes?.data;
      const tapalId = tapal?._id || tapal?.id;

      if (!tapalId) {
        throw new Error('Tapal created but ID missing from server response');
      }

      await tapalService.assignDriver(tapalId, driverId, resolveVehicleId());

      toast.success(
        `Tapal generated and driver assigned — ${driverDisplayName}${selectedDriver.phone ? ` (${selectedDriver.phone})` : ''}`
      );
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

                  return (
                    <div
                      key={h._id || h.id}
                      onClick={() => toggleHarvestSelection(h._id || h.id, h)}
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
                <Weight size={16} /> 2. Enter KG Per Fish Product
              </h2>
              <p className="text-[11px] text-slate-500 -mt-2">
                Har product ke liye alag KG daalein — poora harvest ek saath bhejna ho to default values rakhein ya badlein.
              </p>

              <div className="space-y-6">
                {Object.entries(selectedAllocations).map(([hId, allocation]) => {
                  const h = eligible.find((x) => String(x._id || x.id) === hId);
                  if (!h) return null;
                  const { remaining } = getHarvestQuantities(h);
                  const harvestTotal = sumProductAllocations(allocation?.products);
                  const harvestError = validationErrors[hId];
                  const lines = getHarvestProductLines(h);

                  return (
                    <div key={hId} className="border border-slate-200 rounded-sm overflow-hidden">
                      <div className="bg-[#F9FAF6] px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
                        <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                        <p className="text-[10px] text-slate-500">
                          Stock remaining: <span className="font-bold text-slate-700">{remaining.toFixed(2)} KG</span>
                          {' · '}
                          Allocating: <span className="font-bold text-[#6A7051]">{harvestTotal.toFixed(2)} KG</span>
                        </p>
                      </div>

                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600">
                            <th className="border-b border-slate-200 p-2 text-left uppercase font-black">Fish Item</th>
                            <th className="border-b border-slate-200 p-2 text-right uppercase font-black w-28">Available (KG)</th>
                            <th className="border-b border-slate-200 p-2 text-right uppercase font-black w-32">Tapal KG</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lines.map(({ item, lineKey }) => {
                            const availableKg = getProductRemaining(h, item);
                            const lineError = validationErrors[`${hId}:${lineKey}`];
                            return (
                              <tr key={lineKey} className="hover:bg-slate-50/50">
                                <td className="border-b border-slate-100 p-2 font-bold uppercase text-slate-800">
                                  {item.fishName || item.particulars}
                                </td>
                                <td className="border-b border-slate-100 p-2 text-right tabular-nums text-slate-600">
                                  {availableKg.toFixed(2)}
                                </td>
                                <td className="border-b border-slate-100 p-2">
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={availableKg}
                                    className={`${paperInputClass} w-full text-right font-black`}
                                    value={allocation?.products?.[lineKey] ?? ''}
                                    onChange={(e) => handleProductQtyChange(hId, lineKey, e.target.value)}
                                  />
                                  {lineError && (
                                    <p className="text-[9px] text-red-600 font-bold mt-0.5 text-right">{lineError}</p>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-[#F9FAF6] font-black">
                            <td colSpan={2} className="p-2 text-right uppercase text-[10px] text-[#6A7051]">
                              Subtotal
                            </td>
                            <td className="p-2 text-right tabular-nums text-slate-900">{harvestTotal.toFixed(2)} KG</td>
                          </tr>
                        </tfoot>
                      </table>
                      {harvestError && (
                        <p className="text-[10px] text-red-600 font-bold px-4 py-2 bg-red-50">{harvestError}</p>
                      )}
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

            <PaperFieldRow label="Assign Driver *">
              <select
                className={paperInputClass}
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
                disabled={loadingDrivers}
              >
                <option value="">
                  {loadingDrivers ? 'Loading drivers…' : '— Select registered driver —'}
                </option>
                {drivers.map((d) => (
                  <option key={d._id || d.id} value={d._id || d.id}>
                    {(d.fullName || d.name || 'Driver').toUpperCase()} — {d.phone}
                  </option>
                ))}
              </select>
              {!loadingDrivers && drivers.length === 0 && (
                <p className="text-[10px] text-amber-700 font-bold mt-1">
                  No active drivers found. Add a DRIVER user in Access Control first.
                </p>
              )}
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
              {submitting ? 'Generating & assigning driver…' : 'Generate Tapal & Assign Driver'}
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
    </div>
  );
};

export default CreateTapalFromHarvest;

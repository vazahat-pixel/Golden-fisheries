import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { useAdminStore } from '../../../store/adminStore';
import { tapalService } from '../../../services/tapalService';
import { masterService } from '../../../services/masterService';
import { PaperFormFrame, PaperFieldRow, paperInputClass } from '../../../components/forms/PaperFormFrame';
import { toast } from 'react-hot-toast';
import { BuyerFormModal } from '../buyers/BuyerFormModal';
import { unwrapBuyers } from '../../../utils/buyerHelpers';
import { ArrowLeft, Check, Plus, Trash2, Sprout, AlertCircle, ShoppingCart, Weight, ClipboardCheck, Package } from 'lucide-react';

const CONVERTIBLE_STATUS = ['CONFIRMED', 'PARTIALLY_CONVERTED', 'OPEN', 'PARTIAL_USED'];

function harvestReadyForTapal(h) {
  if (!h) return false;
  if (!CONVERTIBLE_STATUS.includes(h.status)) return false;
  if (h.status === 'CLOSED' || h.remainingQty <= 0) return false;
  return true;
}

function harvestLabel(h) {
  const no = h.harvestNumber || h.hNo || '—';
  return `${no}`;
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
  const count = item.count ? `:${String(item.count).trim()}` : '';
  if (pid) return `${String(pid)}:${index}${count}`;
  return `${name}:${index}${count}`;
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
    const remainingKg = getProductRemaining(h, item);
    const lineEstKg = getLineEstimatedKg(item);
    const itemBoxes = parseInt(item.boxCount ?? item.noOfBoxes ?? item.boxes, 10) || 0;
    const remainingBoxes = (lineEstKg > 0 && itemBoxes > 0)
      ? Math.max(1, Math.round(itemBoxes * (remainingKg / lineEstKg)))
      : (itemBoxes > 0 ? itemBoxes : '');
    const boxWeight = item.weightPerBox != null ? String(item.weightPerBox) : (item.boxWeight || 'Full Box');

    products[lineKey] = {
      boxes: remainingBoxes > 0 ? String(remainingBoxes) : '',
      boxWeight: boxWeight || 'Full Box',
      totalWeight: remainingKg > 0 ? remainingKg.toFixed(2) : '',
    };
  });
  return products;
}

function sumHarvestAllocatedKg(products = {}) {
  return Object.values(products).reduce((s, v) => {
    const kg = typeof v === 'object' ? parseFloat(v?.totalWeight) : parseFloat(v);
    return s + (Number.isFinite(kg) ? kg : 0);
  }, 0);
}

function sumHarvestAllocatedBoxes(products = {}) {
  return Object.values(products).reduce((s, v) => {
    const b = typeof v === 'object' ? parseInt(v?.boxes, 10) : 0;
    return s + (Number.isFinite(b) ? b : 0);
  }, 0);
}

function normalizePhone10(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

export function resolveBoxWeightKg(boxWeightVal, defaultItemWeight = null) {
  if (boxWeightVal == null || boxWeightVal === '') {
    return Number(defaultItemWeight) > 0 ? Number(defaultItemWeight) : 0;
  }
  if (typeof boxWeightVal === 'number' && Number.isFinite(boxWeightVal) && boxWeightVal > 0) {
    return boxWeightVal;
  }
  const str = String(boxWeightVal).trim();
  const direct = parseFloat(str);
  if (Number.isFinite(direct) && direct > 0) return direct;

  // Extract number from string like "Full Box / 25 kg", "25kg", "Full Box (25)"
  const numMatch = str.match(/(\d+(?:\.\d+)?)/);
  if (numMatch) {
    const parsed = parseFloat(numMatch[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  // If text says "Full Box" or "Full" and we have default item weight
  if (defaultItemWeight && Number(defaultItemWeight) > 0) {
    return Number(defaultItemWeight);
  }

  // Standard Full Box in seafood trade
  if (/full/i.test(str)) {
    return 25;
  }

  return 0;
}

const CreateTapalFromHarvest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('harvestId');
  const preselectBuyerId = location.state?.preselectBuyerId;
  const { harvestSlips, fetchHarvestSlips, loading } = useAdminStore();

  // Selected allocations: { [harvestId]: { products: { [productKey]: { boxes, boxWeight, totalWeight } } } }
  const [selectedAllocations, setSelectedAllocations] = useState({});

  const [destination, setDestination] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [logisticsNotes, setLogisticsNotes] = useState('');
  const [buyerId, setBuyerId] = useState('');
  const [buyers, setBuyers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);

  const loadBuyers = useCallback(async () => {
    try {
      const res = await masterService.buyers.getAll({ limit: 500 });
      setBuyers(unwrapBuyers(res).filter((b) => b.isActive !== false));
    } catch {
      setBuyers([]);
    }
  }, []);

  const handleBuyerCreated = (newBuyer) => {
    loadBuyers();
    if (newBuyer) setBuyerId(String(newBuyer._id || newBuyer.id || ''));
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
    loadBuyers();
  }, [loadBuyers]);

  useEffect(() => {
    if (preselectBuyerId) setBuyerId(String(preselectBuyerId));
  }, [preselectBuyerId]);

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

  const handleProductFieldChange = (hId, lineKey, field, val) => {
    setSelectedAllocations((prev) => {
      const currentH = prev[hId]?.products || {};
      const currentItem = typeof currentH[lineKey] === 'object'
        ? currentH[lineKey]
        : { boxes: '', boxWeight: 'Full Box', totalWeight: currentH[lineKey] || '' };

      const updated = { ...currentItem, [field]: val };

      // Auto-compute totalWeight when boxes or numeric boxWeight change
      if (field === 'boxes' || field === 'boxWeight') {
        const b = parseFloat(field === 'boxes' ? val : updated.boxes) || 0;
        const bwStr = field === 'boxWeight' ? val : updated.boxWeight;
        const h = eligible.find((x) => String(x._id || x.id) === hId);
        const lineObj = h ? getHarvestProductLines(h).find(l => l.lineKey === lineKey) : null;
        const fallbackWt = lineObj?.item?.weightPerBox || (lineObj?.item ? (getLineEstimatedKg(lineObj.item) / (parseInt(lineObj.item.boxCount || lineObj.item.boxes, 10) || 1)) : 25);
        const bwNum = resolveBoxWeightKg(bwStr, fallbackWt);
        if (b > 0 && Number.isFinite(bwNum) && bwNum > 0) {
          updated.totalWeight = String(Number((b * bwNum).toFixed(2)));
        }
      }

      return {
        ...prev,
        [hId]: {
          products: {
            ...currentH,
            [lineKey]: updated,
          },
        },
      };
    });
  };

  // Compute live consolidated products
  const consolidatedProducts = useMemo(() => {
    const productsMap = {};
    Object.entries(selectedAllocations).forEach(([hId, allocation]) => {
      const h = eligible.find((x) => String(x._id || x.id) === hId);
      if (!h) return;

      getHarvestProductLines(h).forEach(({ item, lineKey }) => {
        const prodData = allocation?.products?.[lineKey];
        const boxes = typeof prodData === 'object' ? (parseInt(prodData.boxes, 10) || 0) : 0;
        const boxWeight = typeof prodData === 'object' ? (prodData.boxWeight || '') : '';
        const fallbackWt = item.weightPerBox || (getLineEstimatedKg(item) / (parseInt(item.boxCount || item.boxes, 10) || 1)) || 25;
        const bwNum = resolveBoxWeightKg(boxWeight, fallbackWt);
        const qty = typeof prodData === 'object'
          ? (parseFloat(prodData.totalWeight) || (boxes > 0 && bwNum > 0 ? Number((boxes * bwNum).toFixed(2)) : 0))
          : (parseFloat(prodData) || 0);

        const count = item.count ? String(item.count).trim() : '';
        const sticker = item.sticker ? String(item.sticker).trim() : '';

        const name = (item.fishName || item.particulars || '').toUpperCase();
        if (!name || (qty <= 0 && boxes <= 0)) return;

        const countLabel = count ? ` (COUNT ${count})` : '';
        const stickerLabel = sticker ? ` [${sticker}]` : '';
        const bwKey = boxWeight ? `:${boxWeight.trim().toUpperCase()}` : '';
        const manifestKey = `${name}${countLabel}${stickerLabel}${bwKey}`;

        if (!productsMap[manifestKey]) {
          productsMap[manifestKey] = {
            fishName: `${name}${countLabel}${stickerLabel}`,
            count: count,
            sticker: sticker,
            estimatedQty: 0,
            boxCount: 0,
            boxWeight: boxWeight || (bwNum > 0 ? `${bwNum} KG` : '—'),
          };
        }
        productsMap[manifestKey].estimatedQty += qty;
        productsMap[manifestKey].boxCount += boxes;
        if (boxWeight) productsMap[manifestKey].boxWeight = boxWeight;
      });
    });
    return Object.values(productsMap);
  }, [selectedAllocations, eligible]);

  const totalAllocatedWeight = useMemo(() => {
    return Object.values(selectedAllocations).reduce(
      (sum, allocation) => sum + sumHarvestAllocatedKg(allocation?.products),
      0
    );
  }, [selectedAllocations]);

  const totalAllocatedBoxes = useMemo(() => {
    return Object.values(selectedAllocations).reduce(
      (sum, allocation) => sum + sumHarvestAllocatedBoxes(allocation?.products),
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
      const totalQty = sumHarvestAllocatedKg(allocation?.products);
      const totalBoxes = sumHarvestAllocatedBoxes(allocation?.products);

      if (totalQty <= 0 && totalBoxes <= 0) {
        errors[hId] = 'Enter Boxes or Weight for at least one fish product';
        return;
      }
      if (totalQty > remaining + 0.001) {
        errors[hId] = `Total allocation (${totalQty.toFixed(2)} KG) exceeds remaining stock (${remaining.toFixed(2)} KG)`;
      }

      getHarvestProductLines(h).forEach(({ item, lineKey }) => {
        const prodData = allocation?.products?.[lineKey];
        const qty = typeof prodData === 'object' ? (parseFloat(prodData.totalWeight) || 0) : (parseFloat(prodData) || 0);
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
    return true;
  }, [selectedAllocations, validationErrors, buyerId, selectedBuyer]);

  const handleCreate = async () => {
    if (!isValid) {
      toast.error('Select harvest slips and buyer');
      return;
    }

    const allocations = Object.entries(selectedAllocations).map(([hId, allocation]) => {
      const h = eligible.find((x) => String(x._id || x.id) === hId);
      const products = getHarvestProductLines(h || {})
        .map(({ item, lineKey }) => {
          const prodData = allocation?.products?.[lineKey];
          const boxes = typeof prodData === 'object' ? (parseInt(prodData.boxes, 10) || 0) : 0;
          const boxWeight = typeof prodData === 'object' ? (prodData.boxWeight || '') : '';
          const fallbackWt = item.weightPerBox || (getLineEstimatedKg(item) / (parseInt(item.boxCount || item.boxes, 10) || 1)) || 25;
          const bwNum = resolveBoxWeightKg(boxWeight, fallbackWt);
          let allocatedQty = typeof prodData === 'object'
            ? (parseFloat(prodData.totalWeight) || (boxes > 0 && bwNum > 0 ? Number((boxes * bwNum).toFixed(2)) : 0))
            : (parseFloat(prodData) || 0);

          if (allocatedQty <= 0 && boxes <= 0) return null;
          const finalBoxWeight = boxWeight || (bwNum > 0 ? `${bwNum} kg` : 'Full Box');
          return {
            lineItemId: item._id || undefined,
            productId: item.productId?._id || item.productId,
            fishName: item.fishName || item.particulars,
            sticker: item.sticker || '',
            count: item.count || '',
            boxCount: boxes,
            boxes: boxes,
            noOfBoxes: boxes,
            boxWeight: finalBoxWeight,
            weightPerBox: finalBoxWeight,
            allocatedQty,
            totalWeight: allocatedQty,
          };
        })
        .filter(Boolean);

      return {
        harvestId: hId,
        allocatedQty: sumHarvestAllocatedKg(allocation?.products),
        products,
      };
    });

    setSubmitting(true);
    try {
      const res = await tapalService.createFromHarvest(null, {
        allocations,
        destination,
        vehicleNumber,
        logisticsNotes,
        buyerId: selectedBuyer._id || selectedBuyer.id,
        buyerPhone: normalizePhone10(selectedBuyer.phone),
      });

      const newTapal = res?.data?.tapal || res?.tapal;
      const newTapalId = newTapal?._id || newTapal?.id;

      toast.success('Tapal created successfully!');
      if (newTapalId) {
        navigate(`/admin/tapals/${newTapalId}/preview`);
      } else {
        navigate('/admin/tapals');
      }
    } catch (err) {
      toast.error(err?.message || err?.data?.message || 'Failed to create tapal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans animate-in fade-in duration-300">
      {/* Preset options for box weight */}
      <datalist id="tapal-box-weight-presets">
        <option value="Full Box" />
        <option value="Full Box / 25 kg" />
        <option value="Loose Box" />
        <option value="20 kg" />
        <option value="25 kg" />
        <option value="30 kg" />
        <option value="35 kg" />
        <option value="40 kg" />
        <option value="50 kg" />
      </datalist>

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => navigate(-1)} className="p-1 hover:bg-slate-100 transition-colors">
          <ArrowLeft size={20} className="text-slate-700" />
        </button>
        <div>
          <h1 className="text-xl font-black uppercase tracking-wider text-[#6A7051]">Create Consolidated Tapal</h1>
          <p className="text-xs text-slate-500">Allocate boxes and weights across farmer harvest slips into a dispatch slip</p>
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
                No confirmed harvest slips available. Please confirm a harvest slip first.
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
                <Package size={16} /> 2. Enter Boxes & Box Weight Per Fish Product
              </h2>
              <p className="text-[11px] text-slate-500 -mt-2">
                Har product ke liye Boxes aur Box Weight (Full Box / Loose Box / Custom Wt) daalein — Total Weight automatically calculate hoga.
              </p>

              <div className="space-y-6">
                {Object.entries(selectedAllocations).map(([hId, allocation]) => {
                  const h = eligible.find((x) => String(x._id || x.id) === hId);
                  if (!h) return null;
                  const { remaining } = getHarvestQuantities(h);
                  const harvestTotalKg = sumHarvestAllocatedKg(allocation?.products);
                  const harvestTotalBoxes = sumHarvestAllocatedBoxes(allocation?.products);
                  const harvestError = validationErrors[hId];
                  const lines = getHarvestProductLines(h);

                  return (
                    <div key={hId} className="border border-slate-200 rounded-sm overflow-hidden">
                      <div className="bg-[#F9FAF6] px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
                        <p className="text-xs font-black uppercase text-slate-800">{harvestLabel(h)}</p>
                        <p className="text-[10px] text-slate-500">
                          Stock remaining: <span className="font-bold text-slate-700">{remaining.toFixed(2)} KG</span>
                          {' · '}
                          Allocating: <span className="font-bold text-[#6A7051]">{harvestTotalBoxes} Boxes ({harvestTotalKg.toFixed(2)} KG)</span>
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px]">
                          <thead>
                            <tr className="bg-slate-50 text-slate-600">
                              <th className="border-b border-slate-200 p-2 text-left uppercase font-black">Fish Item</th>
                              <th className="border-b border-slate-200 p-2 text-center uppercase font-black w-28">Available</th>
                              <th className="border-b border-slate-200 p-2 text-center uppercase font-black w-24">Tapal Boxes</th>
                              <th className="border-b border-slate-200 p-2 text-center uppercase font-black w-36">Box Weight</th>
                              <th className="border-b border-slate-200 p-2 text-right uppercase font-black w-28">Total Wt (KG)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {lines.map(({ item, lineKey }) => {
                              const availableKg = getProductRemaining(h, item);
                              const lineEstKg = getLineEstimatedKg(item);
                              const itemBoxes = parseInt(item.boxCount ?? item.noOfBoxes ?? item.boxes, 10) || 0;
                              const availableBoxes = (lineEstKg > 0 && itemBoxes > 0)
                                ? Math.round(itemBoxes * (availableKg / lineEstKg))
                                : (itemBoxes || 0);

                              const prodData = allocation?.products?.[lineKey] || {};
                              const lineError = validationErrors[`${hId}:${lineKey}`];

                              return (
                                <tr key={lineKey} className="hover:bg-slate-50/50">
                                  <td className="border-b border-slate-100 p-2 font-bold uppercase text-slate-800">
                                    <div>{item.fishName || item.particulars}</div>
                                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                      {item.count && (
                                        <span className="inline-block px-1.5 py-0.2 bg-amber-50 text-amber-800 font-black text-[9px] rounded-xs border border-amber-200">
                                          COUNT: {item.count}
                                        </span>
                                      )}
                                      {item.sticker && (
                                        <span className="inline-block px-1.5 py-0.2 bg-blue-50 text-blue-800 font-black text-[9px] rounded-xs border border-blue-200">
                                          STICKER: {item.sticker}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="border-b border-slate-100 p-2 text-center tabular-nums text-slate-600">
                                    <span className="font-bold text-slate-800">{availableBoxes > 0 ? `${availableBoxes} Box` : ''}</span>
                                    <span className="text-[10px] text-slate-400 block">({availableKg.toFixed(2)} KG)</span>
                                  </td>
                                  <td className="border-b border-slate-100 p-2">
                                    <input
                                      type="number"
                                      min="0"
                                      placeholder="Boxes"
                                      className={`${paperInputClass} w-full text-center font-black`}
                                      value={prodData.boxes ?? ''}
                                      onChange={(e) => handleProductFieldChange(hId, lineKey, 'boxes', e.target.value)}
                                    />
                                  </td>
                                  <td className="border-b border-slate-100 p-2">
                                    <input
                                      type="text"
                                      list="tapal-box-weight-presets"
                                      placeholder="Full Box / 25 kg"
                                      className={`${paperInputClass} w-full text-center font-medium`}
                                      value={prodData.boxWeight ?? ''}
                                      onChange={(e) => handleProductFieldChange(hId, lineKey, 'boxWeight', e.target.value)}
                                    />
                                  </td>
                                  <td className="border-b border-slate-100 p-2">
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      max={availableKg}
                                      placeholder="Total KG"
                                      className={`${paperInputClass} w-full text-right font-black`}
                                      value={prodData.totalWeight ?? ''}
                                      onChange={(e) => handleProductFieldChange(hId, lineKey, 'totalWeight', e.target.value)}
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
                              <td className="p-2 text-center tabular-nums text-slate-900">
                                {harvestTotalBoxes > 0 ? `${harvestTotalBoxes} Boxes` : '—'}
                              </td>
                              <td className="p-2 text-center text-slate-400 text-[10px]"></td>
                              <td className="p-2 text-right tabular-nums text-slate-900">{harvestTotalKg.toFixed(2)} KG</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                      {harvestError && (
                        <p className="text-[10px] text-red-600 font-bold px-4 py-2 bg-red-50">{harvestError}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-wrap justify-between items-center bg-[#F9FAF6] p-4 gap-3">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-[#6A7051] block">Consolidated Load Summary</span>
                  <span className="text-[11px] text-slate-600 font-bold">{totalAllocatedBoxes} Total Boxes</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Weight</span>
                  <span className="text-lg font-black text-slate-800">{totalAllocatedWeight.toFixed(2)} KG</span>
                </div>
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
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsBuyerModalOpen(true)}
                      className="text-[9px] font-black uppercase text-[#a5a027] hover:underline whitespace-nowrap"
                    >
                      + Add Buyer
                    </button>
                    <Link
                      to="/admin/buyers"
                      className="text-[9px] font-black uppercase text-[#6A7051] hover:underline whitespace-nowrap"
                    >
                      All buyers →
                    </Link>
                  </div>
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
                placeholder="e.g. KA-19-M-1234"
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
                        <th className="border border-slate-200 p-1.5 text-center uppercase">Boxes</th>
                        <th className="border border-slate-200 p-1.5 text-center uppercase">Box Wt</th>
                        <th className="border border-slate-200 p-1.5 text-right uppercase">Est. Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-white transition-colors">
                          <td className="border border-slate-200 p-1.5 font-bold uppercase text-slate-800">{p.fishName}</td>
                          <td className="border border-slate-200 p-1.5 text-center text-slate-800 font-black">
                            {p.boxCount ? p.boxCount : '—'}
                          </td>
                          <td className="border border-slate-200 p-1.5 text-center text-slate-600 font-medium">
                            {p.boxWeight || '—'}
                          </td>
                          <td className="border border-slate-200 p-1.5 text-right font-black text-slate-900">
                            {p.estimatedQty.toFixed(2)} KG
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
              {submitting ? 'Generating tapal…' : 'Generate Tapal'}
            </button>
          </PaperFormFrame>
        </div>
      </div>

      <BuyerFormModal
        isOpen={isBuyerModalOpen}
        onClose={() => setIsBuyerModalOpen(false)}
        onSuccess={handleBuyerCreated}
      />
    </div>
  );
};

export default CreateTapalFromHarvest;

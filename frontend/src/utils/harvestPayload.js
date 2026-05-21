/**
 * Maps paper harvest slip form → backend POST /harvests/create payload.
 * Harvest slip has NO pricing (rate left null).
 */
export function buildHarvestCreatePayload(slip, { farmers = [], products = [] } = {}) {
  const farmer =
    farmers.find(
      (f) =>
        (slip.farmerId && String(f._id || f.id) === String(slip.farmerId)) ||
        (slip.farmerMobile && f.phone === slip.farmerMobile) ||
        (slip.farmerName &&
          String(f.fullName || f.name || '')
            .toUpperCase()
            .trim() === String(slip.farmerName).toUpperCase().trim())
    ) || null;

  const farmerId = slip.farmerId || farmer?._id || farmer?.id;
  if (!farmerId) {
    throw new Error('Farmer not found. Register farmer in master data or select from list.');
  }

  const date = slip.date || new Date().toISOString().split('T')[0];
  const pickupLocation = (slip.pickupLocation || 'KARWAR').trim();

  const lineItems = (slip.items || []).filter((i) => i.particulars || i.hsnCode);
  if (!lineItems.length) {
    throw new Error('Add at least one fish line item.');
  }

  const productsPayload = lineItems.map((item) => {
    const name = (item.particulars || '').trim().toUpperCase();
    const prod =
      products.find((p) => String(p.name || p.productName || '').toUpperCase() === name) ||
      products[0];
    if (!prod) throw new Error('No products in system. Add products in master data first.');

    const boxCount = parseInt(item.noOfBoxes, 10) || 0;
    const weightPerBox = parseFloat(item.boxWeight) || 0;
    const totalWeight = parseFloat(item.totalWeight) || boxCount * weightPerBox || 0.1;

    return {
      productId: prod._id || prod.id,
      hsnCode: item.hsnCode || '',
      fishName: item.particulars || prod.name,
      estimatedQty: Math.max(0.1, totalWeight),
      rate: null,
      count: item.count != null ? String(item.count) : '',
      boxCount: boxCount || null,
      weightPerBox: weightPerBox || null,
      qualityType: 'Mix',
    };
  });

  return {
    farmerId,
    harvestDate: date,
    pickupDate: date,
    pickupTime: slip.pickupTime || '',
    pickupLocation,
    logisticsNotes: slip.logisticsNotes || '',
    remarks: slip.notes || '',
    damageComplaint: slip.damageNotes || '',
    deductionsNotes: slip.iceRentDeducted ? 'ICE & VEHICLE RENT DEDUCTED' : '',
    vehicleNo: slip.vehicleNo || '',
    driverName: slip.driverName || '',
    graderName: slip.graderName || '',
    products: productsPayload,
  };
}

export function mapHarvestFromApi(h) {
  if (!h) return h;
  const farmer = h.farmerId && typeof h.farmerId === 'object' ? h.farmerId : null;
  return {
    ...h,
    id: h._id || h.id,
    hNo: h.hNo || h.harvestNumber,
    tpNo: h.hNo || h.harvestNumber,
    date: h.date || (h.harvestDate ? String(h.harvestDate).slice(0, 10) : ''),
    farmerName: farmer?.fullName || h.farmerName || '',
    farmerMobile: farmer?.phone || h.farmerMobile || '',
    vehicleNo: h.vehicleNo || '',
    driverName: h.driverName || '',
    graderName: h.graderName || '',
    notes: h.remarks || h.notes || '',
    damageNotes: h.damageComplaint || h.damageNotes || '',
    status: h.status || 'PENDING',
    items: (h.products || []).map((p, idx) => ({
      id: String(idx + 1),
      hsnCode: p.hsnCode || '',
      particulars: p.fishName || '',
      count: p.count || '',
      noOfBoxes: p.boxCount != null ? String(p.boxCount) : '',
      boxWeight: p.weightPerBox != null ? String(p.weightPerBox) : '',
      totalWeight: p.totalWeight != null ? String(p.totalWeight) : String(p.estimatedQty || ''),
    })),
    totalBoxes: (h.products || []).reduce((s, p) => s + (parseInt(p.boxCount, 10) || 0), 0),
    totalWeight: (h.products || []).reduce((s, p) => s + (parseFloat(p.totalWeight || p.estimatedQty) || 0), 0),
  };
}

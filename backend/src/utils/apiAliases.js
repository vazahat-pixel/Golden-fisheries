/**
 * Adds camelCase aliases expected by newer frontends without renaming stored fields.
 */
export function aliasHarvestResponse(h) {
  if (!h || typeof h !== 'object') return h;
  const o = typeof h.toObject === 'function' ? h.toObject({ virtuals: true }) : { ...h };
  if (o.harvestNumber != null) o.hNo = o.harvestNumber;
  if (o.farmerId != null) o.farmer = o.farmerId;
  if (o.harvestDate != null) o.date = o.harvestDate;
  return o;
}

export function aliasTapalResponse(t) {
  if (!t || typeof t !== 'object') return t;
  const o = typeof t.toObject === 'function' ? t.toObject({ virtuals: true }) : { ...t };
  if (o.tapalNumber != null) o.tpNo = o.tapalNumber;
  if (o.harvestId != null) o.harvest = o.harvestId;
  if (o.buyerId && typeof o.buyerId === 'object') {
    const resolvedName = o.buyerId.buyerName || o.buyerId.name;
    if (resolvedName) {
      if (!o.partyName || o.partyName === 'UNASSIGNED BUYER') {
        o.partyName = resolvedName;
      }
      o.buyerName = resolvedName;
    }
  }
  return o;
}

export function aliasTripResponse(tr) {
  if (!tr || typeof tr !== 'object') return tr;
  const o = typeof tr.toObject === 'function' ? tr.toObject({ virtuals: true }) : { ...tr };
  if (o.tripNumber != null) o.tripNo = o.tripNumber;
  if (o.tapalId != null) o.tapal = o.tapalId;
  if (Array.isArray(o.stops) && o.stops.length) o.stopsCount = o.stops.length;

  const tapal =
    o.tapalId && typeof o.tapalId === 'object'
      ? o.tapalId
      : o.tapal && typeof o.tapal === 'object'
        ? o.tapal
        : null;
  if (tapal) {
    if (!o.tapalNumber && tapal.tapalNumber) o.tapalNumber = tapal.tapalNumber;
    if (o.expectedQty == null && tapal.numericQty != null) o.expectedQty = tapal.numericQty;
    if (!o.qty && tapal.qty) o.qty = tapal.qty;
    if (!o.partyName && tapal.partyName) o.partyName = tapal.partyName;

    const products = Array.isArray(tapal.products) ? tapal.products : [];
    if (products.length) {
      const parseLineKg = (p) => {
        const tw = Number(p.totalWeight);
        if (Number.isFinite(tw) && tw > 0) return tw;
        const nq = Number(p.numericQty);
        if (Number.isFinite(nq) && nq > 0) return nq;
        const parsed = parseFloat(String(p.qty || '').replace(/[^\d.]/g, ''));
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
      };
      const boxes = products.reduce((s, p) => s + (Number(p.boxQty) || 0), 0);
      const lineWeight = products.reduce((s, p) => s + parseLineKg(p), 0);
      if (boxes > 0) o.expectedBoxes = boxes;
      if (lineWeight > 0) {
        o.expectedQty = lineWeight;
      } else if (o.expectedQty == null && tapal.numericQty != null) {
        o.expectedQty = tapal.numericQty;
      }
    }
  }

  return o;
}

export function aliasBillingResponse(inv) {
  if (!inv || typeof inv !== 'object') return inv;
  const o = typeof inv.toObject === 'function' ? inv.toObject({ virtuals: true }) : { ...inv };
  if (o.invoiceNumber != null) o.invoiceNo = o.invoiceNumber;
  if (o.invoiceDate != null) o.date = o.invoiceDate;
  return o;
}

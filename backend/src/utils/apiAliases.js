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
  return o;
}

export function aliasTripResponse(tr) {
  if (!tr || typeof tr !== 'object') return tr;
  const o = typeof tr.toObject === 'function' ? tr.toObject({ virtuals: true }) : { ...tr };
  if (o.tripNumber != null) o.tripNo = o.tripNumber;
  if (o.tapalId != null) o.tapal = o.tapalId;
  return o;
}

export function aliasBillingResponse(inv) {
  if (!inv || typeof inv !== 'object') return inv;
  const o = typeof inv.toObject === 'function' ? inv.toObject({ virtuals: true }) : { ...inv };
  if (o.invoiceNumber != null) o.invoiceNo = o.invoiceNumber;
  if (o.invoiceDate != null) o.date = o.invoiceDate;
  return o;
}

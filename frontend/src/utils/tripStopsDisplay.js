/**
 * Normalize multi-stop trip route for driver / admin UI.
 */
export function normalizeTripStops(trip) {
  const raw = trip?.stops;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return [...raw]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    .map((s, index) => {
      const isHub = String(s.stopType || '').toUpperCase() === 'HUB';
      const isPickup = String(s.stopType || '').toUpperCase() === 'HARVEST_PICKUP';
      const harvest = s.harvestId && typeof s.harvestId === 'object' ? s.harvestId : null;
      const tapal = s.tapalId && typeof s.tapalId === 'object' ? s.tapalId : null;

      const title = isHub
        ? s.label || 'Return to Hub'
        : isPickup
        ? harvest?.harvestNumber || harvest?.hNo || s.label || `Pickup ${index + 1}`
        : tapal?.tapalNumber || s.label || `Delivery ${index + 1}`;

      const party = isHub
        ? ''
        : isPickup
        ? harvest?.farmerId?.fullName || harvest?.farmerName || ''
        : tapal?.partyName || '';

      const qty = isHub
        ? null
        : isPickup
        ? s.expectedQty || harvest?.availableQty || null
        : tapal?.numericQty || tapal?.qty || s.expectedQty || null;
      return {
        sequence: s.sequence || index + 1,
        stopType: s.stopType,
        isPickup,
        isHub,
        location: s.location || '',
        label: s.label || '',
        status: s.status || 'PENDING',
        title,
        party,
        qtyLabel: qty != null && qty !== '' ? (typeof qty === 'number' ? `${qty} KG` : String(qty)) : '',
        actualQty: s.actualQty || null,
        proofPhotoUrl: s.proofPhotoUrl || null,
        signatureUrl: s.signatureUrl || null,
        completedAt: s.completedAt || null,
      };
    });
}

export function tripStopsSummary(trip) {
  const stops = normalizeTripStops(trip);
  if (!stops.length) return null;
  const pickups = stops.filter((s) => s.isPickup).length;
  const hubs = stops.filter((s) => s.isHub).length;
  const deliveries = stops.length - pickups - hubs;
  const parts = [];
  if (pickups > 0) parts.push(`${pickups} pickup${pickups !== 1 ? 's' : ''}`);
  if (deliveries > 0) parts.push(`${deliveries} delivery${deliveries !== 1 ? 's' : ''}`);
  if (hubs > 0) parts.push(`${hubs} hub return${hubs !== 1 ? 's' : ''}`);
  return `${stops.length} stops (${parts.join(', ')})`;
}

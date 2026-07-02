/**
 * Normalize multi-stop trip route for driver / admin UI.
 */
export function normalizeTripStops(trip) {
  const raw = trip?.stops;
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return [...raw]
    .sort((a, b) => (a.sequence || 0) - (b.sequence || 0))
    .map((s, index) => {
      const isPickup = String(s.stopType || '').toUpperCase() === 'HARVEST_PICKUP';
      const harvest = s.harvestId && typeof s.harvestId === 'object' ? s.harvestId : null;
      const tapal = s.tapalId && typeof s.tapalId === 'object' ? s.tapalId : null;

      const title = isPickup
        ? harvest?.harvestNumber || harvest?.hNo || s.label || `Pickup ${index + 1}`
        : tapal?.tapalNumber || s.label || `Delivery ${index + 1}`;

      const party = isPickup
        ? harvest?.farmerId?.fullName || harvest?.farmerName || ''
        : tapal?.partyName || '';

      const qty = isPickup
        ? s.expectedQty || harvest?.availableQty || null
        : tapal?.numericQty || tapal?.qty || s.expectedQty || null;

      return {
        sequence: s.sequence || index + 1,
        stopType: s.stopType,
        isPickup,
        location: s.location || '',
        label: s.label || '',
        status: s.status || 'PENDING',
        title,
        party,
        qtyLabel: qty != null && qty !== '' ? (typeof qty === 'number' ? `${qty} KG` : String(qty)) : '',
      };
    });
}

export function tripStopsSummary(trip) {
  const stops = normalizeTripStops(trip);
  if (!stops.length) return null;
  const pickups = stops.filter((s) => s.isPickup).length;
  const deliveries = stops.length - pickups;
  return `${stops.length} stops (${pickups} pickup${pickups !== 1 ? 's' : ''}, ${deliveries} delivery${deliveries !== 1 ? 's' : ''})`;
}

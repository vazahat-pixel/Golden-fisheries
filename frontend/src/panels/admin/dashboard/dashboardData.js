import { subDays, format, parseISO, isValid, startOfDay } from 'date-fns';

const parseRecordDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const str = String(value);
  const d = str.includes('T') ? parseISO(str) : parseISO(str.length === 10 ? `${str}T12:00:00` : str);
  return isValid(d) ? d : null;
};

export const buildWeeklyVolumeSeries = (harvestSlips = [], tapals = [], days = 7) => {
  const today = startOfDay(new Date());
  const buckets = Array.from({ length: days }, (_, i) => {
    const day = subDays(today, days - 1 - i);
    return {
      name: format(day, 'EEE'),
      fullDate: format(day, 'dd MMM'),
      procurement: 0,
      sales: 0,
    };
  });

  const dayKey = (d) => format(startOfDay(d), 'yyyy-MM-dd');

  const bucketMap = Object.fromEntries(
    buckets.map((b, i) => {
      const day = subDays(today, days - 1 - i);
      return [dayKey(day), b];
    })
  );

  harvestSlips.forEach((slip) => {
    const d = parseRecordDate(slip.date || slip.harvestDate || slip.createdAt);
    if (!d) return;
    const key = dayKey(d);
    if (bucketMap[key]) {
      bucketMap[key].procurement += parseFloat(slip.totalWeight) || 0;
    }
  });

  tapals.forEach((tapal) => {
    const d = parseRecordDate(tapal.createdAt || tapal.date || tapal.dispatchDate);
    if (!d) return;
    const key = dayKey(d);
    if (!bucketMap[key]) return;
    const weight =
      parseFloat(tapal.totalWeight) ||
      parseFloat(tapal.qty) ||
      (tapal.products || []).reduce(
        (s, p) => s + (parseFloat(p.totalWeight || p.weight || p.estimatedQty) || 0),
        0
      ) ||
      0;
    bucketMap[key].sales += weight;
  });

  return buckets.map((b) => ({
    ...b,
    procurement: Math.round(b.procurement * 10) / 10,
    sales: Math.round(b.sales * 10) / 10,
  }));
};

export const buildParticularsMix = (harvestSlips = []) => {
  const mix = {};
  harvestSlips.forEach((slip) => {
    const lines = slip.items?.length ? slip.items : slip.products || [];
    lines.forEach((line) => {
      const name = (line.particulars || line.fishName || 'Other').trim() || 'Other';
      const w = parseFloat(line.totalWeight || line.estimatedQty || line.weight) || 0;
      if (w <= 0) return;
      mix[name] = (mix[name] || 0) + w;
    });
  });

  const palette = ['#6A7051', '#C5A021', '#5f6846', '#64748b', '#16a34a', '#d97706', '#b8941a'];
  return Object.entries(mix)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, value], i) => ({
      name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
      fullName: name,
      value: Math.round(value * 10) / 10,
      fill: palette[i % palette.length],
    }));
};

export const buildTripStatusBreakdown = (trips = []) => {
  const groups = {
    Active: 0,
    Completed: 0,
    Pending: 0,
    Other: 0,
  };

  trips.forEach((t) => {
    const s = String(t.status || '').toUpperCase().replace(/\s+/g, '_');
    if (['IN_TRANSIT', 'ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'PICKUP'].includes(s)) {
      groups.Active += 1;
    } else if (['COMPLETED', 'CLOSED', 'DELIVERED'].includes(s)) {
      groups.Completed += 1;
    } else if (['PENDING', 'CREATED', 'DRAFT', 'PENDING_APPROVAL'].includes(s)) {
      groups.Pending += 1;
    } else {
      groups.Other += 1;
    }
  });

  return [
    { name: 'Active', value: groups.Active, fill: '#6A7051' },
    { name: 'Completed', value: groups.Completed, fill: '#16a34a' },
    { name: 'Pending', value: groups.Pending, fill: '#d97706' },
    { name: 'Other', value: groups.Other, fill: '#94a3b8' },
  ].filter((d) => d.value > 0);
};

export const buildRecentActivities = (harvestSlips = [], tapals = []) => {
  const harvestActs = (harvestSlips ?? []).slice(0, 4).map((s, i) => ({
    id: `h-${s._id || s.id || i}`,
    type: 'HARVEST',
    title: 'Harvest slip',
    desc: `${s.farmerName || 'Farmer'} — ${s.hNo || s.harvestNumber || s.tpNo || 'GRN'}`,
    time: s.date || (s.harvestDate ? String(s.harvestDate).slice(0, 10) : '—'),
    highlight: i === 0,
  }));

  const tapalActs = (tapals ?? []).slice(0, 3).map((t, i) => ({
    id: `t-${t._id || t.id || i}`,
    type: 'DISPATCH',
    title: 'Sales tapal',
    desc: `${t.tapalNumber || t.tpNo || '—'} · ${t.status || ''}`,
    time: t.createdAt ? String(t.createdAt).slice(0, 16) : '—',
    highlight: false,
  }));

  return [...harvestActs, ...tapalActs];
};

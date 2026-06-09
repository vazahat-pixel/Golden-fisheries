import { useEffect, useState } from 'react';

export const emptyPump = () => ({ name: '', litres: '', amount: '' });

export function buildExpensePayload(form) {
  const pumpTotal = form.pumps.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalExpenses =
    (parseFloat(form.diesel) || 0) +
    (parseFloat(form.tollFastag) || 0) +
    (parseFloat(form.rtoPcRmc) || 0) +
    (parseFloat(form.maintenance) || 0) +
    (parseFloat(form.driverBatta) || 0) +
    (parseFloat(form.halting) || 0) +
    pumpTotal;
  const balancePayable = totalExpenses - (parseFloat(form.lessAdvance) || 0);

  return {
    ...form,
    startingKms: parseFloat(form.startingKms) || 0,
    endingKms: parseFloat(form.endingKms) || 0,
    totalKms: parseFloat(form.totalKms) || 0,
    mileage: parseFloat(form.mileage) || 0,
    diesel: parseFloat(form.diesel) || 0,
    tollFastag: parseFloat(form.tollFastag) || 0,
    rtoPcRmc: parseFloat(form.rtoPcRmc) || 0,
    maintenance: parseFloat(form.maintenance) || 0,
    driverBatta: parseFloat(form.driverBatta) || 0,
    lessAdvance: parseFloat(form.lessAdvance) || 0,
    halting: parseFloat(form.halting) || 0,
    pumps: form.pumps
      .filter((p) => p.name || p.amount)
      .map((p) => ({
        name: p.name,
        litres: parseFloat(p.litres) || 0,
        amount: parseFloat(p.amount) || 0,
      })),
    totalExpenses,
    pumpTotal,
    balancePayable,
  };
}

export function useTripExpenseForm(trip) {
  const [form, setForm] = useState({
    tripNumber: '',
    tapalNo: '',
    loadingPoint: '',
    unloadingPoint: '',
    startingKms: '',
    endingKms: '',
    totalKms: '',
    mileage: '',
    diesel: '',
    tollFastag: '',
    rtoPcRmc: '',
    maintenance: '',
    driverBatta: '',
    lessAdvance: '',
    halting: '',
    remarks: '',
    pumps: [emptyPump()],
  });

  useEffect(() => {
    if (!trip) return;
    const tapal = trip.tapalId || trip.tapal || {};
    setForm((f) => ({
      ...f,
      tripNumber: trip.tripNumber || trip.tripNo || '',
      tapalNo: tapal.tapalNumber || tapal.tpNo || '',
      loadingPoint: trip.pickupLocation || tapal.pickupLocation || '',
      unloadingPoint: trip.deliveryLocation || tapal.unloadingPoint || tapal.destination || '',
    }));
  }, [trip]);

  useEffect(() => {
    const start = parseFloat(form.startingKms) || 0;
    const end = parseFloat(form.endingKms) || 0;
    if (end >= start) {
      setForm((f) => ({ ...f, totalKms: String(end - start) }));
    }
  }, [form.startingKms, form.endingKms]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const pumpTotal = form.pumps.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const totalExpenses =
    (parseFloat(form.diesel) || 0) +
    (parseFloat(form.tollFastag) || 0) +
    (parseFloat(form.rtoPcRmc) || 0) +
    (parseFloat(form.maintenance) || 0) +
    (parseFloat(form.driverBatta) || 0) +
    (parseFloat(form.halting) || 0) +
    pumpTotal;
  const balancePayable = totalExpenses - (parseFloat(form.lessAdvance) || 0);

  return {
    form,
    setForm,
    set,
    pumpTotal,
    totalExpenses,
    balancePayable,
    buildPayload: () => buildExpensePayload(form),
  };
}

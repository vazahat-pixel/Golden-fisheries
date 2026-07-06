import React from 'react';
import { PaperFieldRow, paperInputClass } from '../../components/forms/PaperFormFrame';
import { emptyPump } from './useTripExpenseForm';

const fieldInputClass =
  'w-full border border-[var(--fa-border)] rounded-lg px-3 py-2 text-sm bg-[#161618] text-white outline-none focus:ring-2 focus:ring-[#C5A021]/40';

export function TripExpenseFields({ form, setForm, set, totalExpenses, balancePayable, variant = 'field' }) {
  const inputClass = variant === 'paper' ? paperInputClass : fieldInputClass;
  const Row = variant === 'paper'
    ? PaperFieldRow
    : ({ label, children }) => (
        <div className="space-y-1">
          <label className="text-[9px] font-black uppercase text-brand-olive">{label}</label>
          {children}
        </div>
      );

  return (
    <div className={variant === 'field' ? 'space-y-3' : ''}>
      <Row label="Trip Number">
        <input className={inputClass} value={form.tripNumber} readOnly />
      </Row>
      <Row label="Tapal Number">
        <input className={inputClass} value={form.tapalNo} readOnly />
      </Row>
      <Row label="Loading Point">
        <input className={inputClass} value={form.loadingPoint} onChange={(e) => set('loadingPoint', e.target.value)} />
      </Row>
      <Row label="Unloading Point">
        <input className={inputClass} value={form.unloadingPoint} onChange={(e) => set('unloadingPoint', e.target.value)} />
      </Row>
      <div className={variant === 'field' ? 'grid grid-cols-2 gap-3' : ''}>
        <Row label="Start KM">
          <input className={inputClass} inputMode="decimal" value={form.startingKms} onChange={(e) => set('startingKms', e.target.value)} />
        </Row>
        <Row label="End KM">
          <input className={inputClass} inputMode="decimal" value={form.endingKms} onChange={(e) => set('endingKms', e.target.value)} />
        </Row>
      </div>
      <Row label="Total KM">
        <input className={inputClass} inputMode="decimal" value={form.totalKms} onChange={(e) => set('totalKms', e.target.value)} />
      </Row>
      <div className={variant === 'field' ? 'grid grid-cols-2 gap-3' : ''}>
        <Row label="Mileage">
          <input className={inputClass} inputMode="decimal" value={form.mileage} onChange={(e) => set('mileage', e.target.value)} />
        </Row>
        <Row label="Diesel">
          <input className={inputClass} inputMode="decimal" value={form.diesel} onChange={(e) => set('diesel', e.target.value)} />
        </Row>
      </div>
      <div className={variant === 'field' ? 'grid grid-cols-2 gap-3' : ''}>
        <Row label="Toll / FASTag">
          <input className={inputClass} inputMode="decimal" value={form.tollFastag} onChange={(e) => set('tollFastag', e.target.value)} />
        </Row>
        <Row label="RTO / PC / RMC">
          <input className={inputClass} inputMode="decimal" value={form.rtoPcRmc} onChange={(e) => set('rtoPcRmc', e.target.value)} />
        </Row>
      </div>
      <div className={variant === 'field' ? 'grid grid-cols-2 gap-3' : ''}>
        <Row label="Maintenance">
          <input className={inputClass} inputMode="decimal" value={form.maintenance} onChange={(e) => set('maintenance', e.target.value)} />
        </Row>
        <Row label="Driver Batta">
          <input className={inputClass} inputMode="decimal" value={form.driverBatta} onChange={(e) => set('driverBatta', e.target.value)} />
        </Row>
      </div>
      <div className={variant === 'field' ? 'grid grid-cols-2 gap-3' : ''}>
        <Row label="Advance (Less)">
          <input className={inputClass} inputMode="decimal" value={form.lessAdvance} onChange={(e) => set('lessAdvance', e.target.value)} />
        </Row>
        <Row label="Halting">
          <input className={inputClass} inputMode="decimal" value={form.halting} onChange={(e) => set('halting', e.target.value)} />
        </Row>
      </div>

      <p className="text-[10px] font-black uppercase text-brand-olive mt-2">Pump entries</p>
      {form.pumps.map((p, idx) => (
        <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
          <input
            placeholder="Pump"
            className={inputClass}
            value={p.name}
            onChange={(e) => {
              const pumps = [...form.pumps];
              pumps[idx] = { ...p, name: e.target.value };
              setForm((f) => ({ ...f, pumps }));
            }}
          />
          <input
            placeholder="Litres"
            className={inputClass}
            inputMode="decimal"
            value={p.litres}
            onChange={(e) => {
              const pumps = [...form.pumps];
              pumps[idx] = { ...p, litres: e.target.value };
              setForm((f) => ({ ...f, pumps }));
            }}
          />
          <input
            placeholder="Amount"
            className={inputClass}
            inputMode="decimal"
            value={p.amount}
            onChange={(e) => {
              const pumps = [...form.pumps];
              pumps[idx] = { ...p, amount: e.target.value };
              setForm((f) => ({ ...f, pumps }));
            }}
          />
        </div>
      ))}
      <button
        type="button"
        className="text-[10px] font-semibold text-[#6A7051] underline fa-tap"
        onClick={() => setForm((f) => ({ ...f, pumps: [...f.pumps, emptyPump()] }))}
      >
        + Add pump row
      </button>

      <Row label="Remarks">
        <textarea className={inputClass} rows={2} value={form.remarks} onChange={(e) => set('remarks', e.target.value)} />
      </Row>

      <div className="border border-[var(--fa-border)] rounded-lg p-3 text-sm space-y-1 bg-[#1f1f22]">
        <div className="flex justify-between">
          <span className="text-xs uppercase font-bold text-[var(--fa-accent)]">Total expenses</span>
          <span className="font-bold text-white">₹{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs uppercase font-bold text-[var(--fa-accent)]">Balance payable</span>
          <span className="font-bold text-white">₹{balancePayable.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

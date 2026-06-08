import React from 'react';

const STEPS = [
  { n: '1', title: 'Tapal assigned', detail: 'Admin assigns a tapal to your buyer account.' },
  { n: '2', title: 'Driver delivery', detail: 'Driver delivers cargo — status becomes DELIVERED.' },
  { n: '3', title: 'Verify', detail: 'On the Tapals tab, confirm received KG and boxes.' },
  { n: '4', title: 'Bill', detail: 'After verification, generate a bill from rate and weight.' },
  { n: '5', title: 'Return / settle', detail: 'Submit returns for damage if needed; check balance on Settlement.' },
];

export function BuyerWorkflowGuide() {
  return (
    <div className="fa-surface p-4 space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--fa-accent)]">Your workflow</p>
        <p className="text-sm font-semibold mt-1">Buyer portal — receive, verify, bill</p>
        <p className="text-[11px] fa-muted mt-1 leading-relaxed">
          Receive fish from Golden Fisheries, verify delivery in the system, generate your bill, and track
          returns and settlement.
        </p>
      </div>
      <ol className="space-y-2">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-3 text-[11px]">
            <span className="shrink-0 w-6 h-6 rounded-full bg-[var(--fa-accent-dim)] text-[var(--fa-accent)] font-bold flex items-center justify-center text-[10px]">
              {s.n}
            </span>
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="fa-muted leading-relaxed">{s.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default BuyerWorkflowGuide;

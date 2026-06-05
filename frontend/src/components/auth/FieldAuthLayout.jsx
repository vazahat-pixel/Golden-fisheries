import React from 'react';
import { ArrowLeft } from 'lucide-react';

/** Dark + lime OTP login shell (driver / buyer field apps) */
export default function FieldAuthLayout({ title, subtitle, children, onBack, backLabel = 'Back' }) {
  return (
    <div className="field-app min-h-screen flex flex-col max-w-md mx-auto w-full px-5 py-8">
      <button
        type="button"
        onClick={onBack}
        className="fa-muted flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider fa-tap hover:text-[var(--fa-accent)] transition-colors"
      >
        <ArrowLeft size={14} /> {backLabel}
      </button>
      <div className="mb-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fa-accent)] mb-2 opacity-90">
          Golden Fisheries
        </p>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-sm fa-muted mt-2">{subtitle}</p>}
      </div>
      <div className="flex-1 fa-page-enter">{children}</div>
    </div>
  );
}

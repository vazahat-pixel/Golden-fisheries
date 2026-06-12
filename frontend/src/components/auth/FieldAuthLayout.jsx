import React, { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

/** Dark + gold OTP login shell (driver / buyer field apps) — full mobile width */
export default function FieldAuthLayout({ title, subtitle, children, onBack, backLabel = 'Back' }) {
  useEffect(() => {
    document.body.classList.add('is-field-app');
    return () => document.body.classList.remove('is-field-app');
  }, []);

  return (
    <div className="field-app field-app-viewport min-h-[100dvh] w-full flex flex-col">
      <div
        className="flex flex-col flex-1 w-full px-4 sm:px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      >
        <button
          type="button"
          onClick={onBack}
          className="fa-muted flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider fa-tap hover:text-[var(--fa-accent)] transition-colors self-start"
        >
          <ArrowLeft size={14} /> {backLabel}
        </button>

        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--fa-accent)] mb-2 opacity-90">
            Golden Fisheries
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{title}</h1>
          {subtitle && <p className="text-sm fa-muted mt-2 leading-relaxed">{subtitle}</p>}
        </div>

        <div className="flex-1 fa-page-enter w-full max-w-none">{children}</div>
      </div>
    </div>
  );
}

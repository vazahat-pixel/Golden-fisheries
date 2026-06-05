import React from 'react';
import { Package, ClipboardCheck, FileText } from 'lucide-react';

/** Buyer procurement portal — no banking / card UI */
export function FieldBuyerPortalCard({
  brandLabel = 'GF Buyer',
  sectionLabel = 'Procurement portal',
  accountRef = '—',
  status = 'Ready',
  statusTone = 'idle',
  activeTapals = 0,
  pendingVerify = 0,
  billsCount = 0,
  hint,
  onClick,
}) {
  const Wrapper = onClick ? 'button' : 'div';
  const toneClass =
    statusTone === 'active'
      ? 'fa-trip-status--active'
      : statusTone === 'assigned'
        ? 'fa-trip-status--assigned'
        : 'fa-trip-status--idle';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`fa-trip-hero w-full text-left p-5 fa-tap transition-transform duration-300 hover:scale-[1.01] relative z-[1] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="fa-trip-hero-bg" aria-hidden />

      <div className="flex justify-between items-start gap-3 relative z-[2]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="fa-trip-icon-wrap shrink-0">
            <Package size={20} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider fa-hero-accent">{brandLabel}</p>
            <p className="text-xs fa-muted mt-0.5 truncate">{sectionLabel}</p>
          </div>
        </div>
        <span className={`fa-trip-status ${toneClass}`}>{status}</span>
      </div>

      <p className="text-2xl font-bold tracking-tight mt-4 relative z-[2]">
        Account · {accountRef}
      </p>

      {hint ? (
        <p className="text-sm fa-muted mt-3 relative z-[2] leading-relaxed">{hint}</p>
      ) : (
        <div className="mt-4 space-y-2.5 relative z-[2]">
          <div className="flex items-center gap-2.5 text-sm">
            <ClipboardCheck size={15} className="text-[var(--fa-accent)] shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase fa-muted">Active tapals</p>
              <p className="font-medium">{activeTapals} in transit / open</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <FileText size={15} className="text-[var(--fa-accent-soft)] shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase fa-muted">Awaiting verify</p>
              <p className="font-medium">{pendingVerify} delivered · need your sign-off</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-5 pt-4 border-t border-[var(--fa-border)] grid grid-cols-2 gap-4 relative z-[2]">
        <div>
          <span className="text-[10px] font-bold uppercase fa-muted">Bills on file</span>
          <p className="text-lg font-bold mt-1 fa-hero-accent">{billsCount}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase fa-muted">To verify</span>
          <p className="text-lg font-bold mt-1">{pendingVerify}</p>
        </div>
      </div>
    </Wrapper>
  );
}

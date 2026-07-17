import React from 'react';
import { MapPin, Truck, ArrowRight } from 'lucide-react';

/** Fleet / dispatch trip card — premium glass style */
export function FieldTripHeroCard({
  tripLabel = 'Trip',
  tripNumber = '—',
  status = 'Ready',
  statusTone = 'idle',
  pickup,
  delivery,
  loadLabel = 'Load',
  loadValue,
  hint,
  onClick,
  headerAction,
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
      className={`fa-trip-hero fa-card-interactive w-full text-left p-4 fa-tap relative z-[1] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="fa-trip-hero-bg" aria-hidden />
      <div className="fa-trip-hero-shine" aria-hidden />

      <div className="flex justify-between items-start gap-3 relative z-[2]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="fa-trip-icon-wrap shrink-0">
            <Truck size={18} strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="fa-eyebrow fa-hero-accent">GF Fleet</p>
            <p className="text-xs fa-muted mt-0.5 truncate font-medium">{tripLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`fa-trip-status ${toneClass}`}>{status}</span>
          {headerAction}
        </div>
      </div>

      <p className="fa-display-num fa-text-gradient mt-3 relative z-[2]">
        #{tripNumber}
      </p>

      {(pickup || delivery) && (
        <div className="mt-4 space-y-2 relative z-[2]">
          {pickup && (
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-[var(--fa-accent-dim)] border border-[var(--fa-border-strong)] flex items-center justify-center shrink-0">
                <MapPin size={12} className="text-[var(--fa-accent)]" />
              </div>
              <div className="min-w-0">
                <p className="fa-label-xs">Pickup</p>
                <p className="font-semibold leading-snug truncate mt-0.5">{pickup}</p>
              </div>
            </div>
          )}
          {pickup && delivery && (
            <div className="flex items-center gap-2 pl-3 py-0.5">
              <div className="w-px h-5 bg-gradient-to-b from-[var(--fa-accent)]/40 to-transparent ml-[11px]" />
              <ArrowRight size={14} className="fa-muted shrink-0 opacity-60" />
            </div>
          )}
          {delivery && (
            <div className="flex items-start gap-2.5 text-xs">
              <div className="w-6 h-6 rounded-lg bg-white/[0.04] border border-[var(--fa-border)] flex items-center justify-center shrink-0">
                <MapPin size={12} className="text-[var(--fa-accent-soft)]" />
              </div>
              <div className="min-w-0">
                <p className="fa-label-xs">Delivery</p>
                <p className="font-semibold leading-snug truncate mt-0.5">{delivery}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {hint && !pickup && !delivery && (
        <p className="text-sm fa-muted mt-4 relative z-[2] leading-relaxed">{hint}</p>
      )}

      {(loadValue != null || status) && (
        <div className="mt-4 pt-3.5 border-t border-[var(--fa-border)] grid grid-cols-2 gap-3 relative z-[2]">
          <div>
            <span className="fa-label-xs">{loadLabel}</span>
            <p className="text-base font-bold mt-1 fa-text-gradient">{loadValue ?? '—'}</p>
          </div>
          <div className="text-right">
            <span className="fa-label-xs">Dispatch</span>
            <p className="text-base font-bold mt-1">{status}</p>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

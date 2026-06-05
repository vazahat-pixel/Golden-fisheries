import React from 'react';
import { MapPin, Truck, ArrowRight } from 'lucide-react';

/** Fleet / dispatch trip card — no banking / card metaphors */
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
      className={`fa-trip-hero w-full text-left p-5 fa-tap transition-transform duration-300 hover:scale-[1.01] relative z-[1] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="fa-trip-hero-bg" aria-hidden />

      <div className="flex justify-between items-start gap-3 relative z-[2]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="fa-trip-icon-wrap shrink-0">
            <Truck size={20} strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider fa-hero-accent">GF Fleet</p>
            <p className="text-xs fa-muted mt-0.5 truncate">{tripLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`fa-trip-status ${toneClass}`}>{status}</span>
          {headerAction}
        </div>
      </div>

      <p className="text-2xl font-bold tracking-tight mt-4 relative z-[2]">
        #{tripNumber}
      </p>

      {(pickup || delivery) && (
        <div className="mt-4 space-y-2 relative z-[2]">
          {pickup && (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin size={15} className="text-[var(--fa-accent)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase fa-muted">Pickup</p>
                <p className="font-medium leading-snug truncate">{pickup}</p>
              </div>
            </div>
          )}
          {pickup && delivery && (
            <div className="flex items-center gap-2 pl-1">
              <div className="w-px h-4 bg-[var(--fa-border)] ml-[6px]" />
              <ArrowRight size={14} className="fa-muted shrink-0" />
            </div>
          )}
          {delivery && (
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin size={15} className="text-[var(--fa-accent-soft)] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase fa-muted">Delivery</p>
                <p className="font-medium leading-snug truncate">{delivery}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {hint && !pickup && !delivery && (
        <p className="text-sm fa-muted mt-3 relative z-[2] leading-relaxed">{hint}</p>
      )}

      {(loadValue != null || status) && (
        <div className="mt-5 pt-4 border-t border-[var(--fa-border)] grid grid-cols-2 gap-4 relative z-[2]">
          <div>
            <span className="text-[10px] font-bold uppercase fa-muted">{loadLabel}</span>
            <p className="text-lg font-bold mt-1 fa-hero-accent">{loadValue ?? '—'}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase fa-muted">Dispatch</span>
            <p className="text-lg font-bold mt-1">{status}</p>
          </div>
        </div>
      )}
    </Wrapper>
  );
}

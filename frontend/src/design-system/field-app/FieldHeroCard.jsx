import React from 'react';
import { Eye, EyeOff, Wifi } from 'lucide-react';

/** Reference-style lime “card” block */
export function FieldHeroCard({
  badge = 'GF FLEET',
  title,
  subtitle,
  cardId,
  amountLabel = 'Load / Qty',
  amount,
  maskable = false,
  masked = false,
  onToggleMask,
  footer,
  onClick,
  headerAction,
}) {
  const Wrapper = onClick ? 'button' : 'div';
  const displayId = cardId || '**** 0000';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`fa-hero-card w-full text-left p-5 fa-tap transition-transform duration-300 hover:scale-[1.01] relative z-[1] ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex justify-between items-start relative z-[2]">
        <span className="text-[11px] font-bold tracking-wide fa-hero-accent">{badge}</span>
        {headerAction}
      </div>

      <div className="flex justify-between items-center mt-5 relative z-[2]">
        <span className="text-xs font-bold tracking-widest text-[var(--fa-text)]">{title || 'Golden Fisheries'}</span>
        <div className="flex items-center gap-2 opacity-90">
          <Wifi size={18} className="rotate-90" />
          <div className="w-9 h-7 rounded-md bg-amber-200/90 border border-amber-400/50" aria-hidden />
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 relative z-[2]">
        <p className="font-mono text-base font-semibold tracking-[0.2em]">
          {masked && maskable ? '**** **** ****' : displayId.slice(0, 4)}
          {' '}
          <span className="opacity-90">{masked && maskable ? '••••' : displayId.slice(-4)}</span>
        </p>
        {maskable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMask?.();
            }}
            className="p-1 rounded-full fa-tap opacity-80"
          >
            {masked ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] mt-2 opacity-75 relative z-[2]">{subtitle}</p>
      )}

      {amount != null && (
        <div className="mt-5 pt-4 border-t border-black/15 relative z-[2]">
          <span className="text-[10px] font-bold uppercase fa-muted">{amountLabel}</span>
          <p className="text-[1.75rem] font-bold leading-tight mt-1 tracking-tight fa-hero-accent">
            {amount}
          </p>
        </div>
      )}

      {footer && <div className="mt-3 relative z-[2]">{footer}</div>}
    </Wrapper>
  );
}

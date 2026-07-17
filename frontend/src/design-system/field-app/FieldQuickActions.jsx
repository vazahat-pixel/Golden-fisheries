import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FieldQuickActions({ actions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-2.5">
      {actions.map((a) => {
        const Icon = a.icon;
        const className =
          'fa-action-tile p-2.5 flex flex-col items-center justify-center min-h-[76px] fa-tap';

        const inner = (
          <>
            <div className="fa-action-icon">
              <Icon size={18} strokeWidth={2} />
            </div>
            <span className="text-[10px] text-[var(--fa-muted)] font-semibold text-center leading-tight tracking-tight">
              {a.label}
            </span>
          </>
        );

        if (a.to) {
          return (
            <button key={a.label} type="button" onClick={() => navigate(a.to)} className={className}>
              {inner}
            </button>
          );
        }
        return (
          <button key={a.label} type="button" onClick={a.onClick} className={className}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

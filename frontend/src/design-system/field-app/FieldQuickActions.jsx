import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FieldQuickActions({ actions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((a) => {
        const Icon = a.icon;
        const className =
          'fa-action-tile p-3.5 flex flex-col items-center justify-center min-h-[88px] fa-tap';

        const inner = (
          <>
            <Icon size={22} strokeWidth={1.75} className="text-[var(--fa-text)]" />
            <span className="text-[11px] text-[var(--fa-muted)] font-medium mt-2.5 text-center leading-tight">
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

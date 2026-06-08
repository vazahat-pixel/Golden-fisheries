import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FieldQuickActions({ actions = [] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map((a) => {
        const Icon = a.icon;
        const className =
          'fa-action-tile p-2 flex flex-col items-center justify-center min-h-[68px] fa-tap';

        const inner = (
          <>
            <Icon size={18} strokeWidth={1.75} className="text-[var(--fa-text)]" />
            <span className="text-[10px] text-[var(--fa-muted)] font-medium mt-1.5 text-center leading-tight">
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

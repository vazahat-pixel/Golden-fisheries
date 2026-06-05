import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FieldTransactionList({
  title,
  viewAllTo,
  onViewAll,
  items = [],
  emptyMessage = 'No records yet',
}) {
  const navigate = useNavigate();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="fa-section-title">{title}</h3>
        {(viewAllTo || onViewAll) && (
          <button
            type="button"
            onClick={() => (onViewAll ? onViewAll() : navigate(viewAllTo))}
            className="fa-link fa-tap"
          >
            View All
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-center text-xs fa-muted py-10 fa-surface">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={row.onClick}
                disabled={!row.onClick}
                className={`fa-surface w-full flex items-center gap-3.5 p-3.5 fa-tap transition-all duration-300 text-left ${
                  row.onClick ? 'hover:border-[var(--fa-accent)]/20' : ''
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-[var(--fa-surface-elevated)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--fa-border)]">
                  {row.avatarUrl ? (
                    <img src={row.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-[var(--fa-accent)]">{row.initials || '?'}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium truncate">{row.title}</p>
                  <p className="text-[11px] fa-muted mt-0.5">{row.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  {row.amount && (
                    <p
                      className={`text-sm font-semibold ${
                        row.amountPositive !== false ? 'fa-amount-positive' : 'text-[var(--fa-text)]'
                      }`}
                    >
                      {row.amount}
                    </p>
                  )}
                  <p className="text-[10px] fa-muted mt-0.5">{row.type || row.status}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

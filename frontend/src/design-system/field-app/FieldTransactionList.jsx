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
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h3 className="fa-section-title">{title}</h3>
        {(viewAllTo || onViewAll) && (
          <button
            type="button"
            onClick={() => (onViewAll ? onViewAll() : navigate(viewAllTo))}
            className="fa-link fa-tap uppercase tracking-wide text-[10px]"
          >
            View all →
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-center text-xs fa-muted py-12 fa-glass-card">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                onClick={row.onClick}
                disabled={!row.onClick}
                className={`fa-list-row fa-tap ${row.onClick ? 'cursor-pointer' : 'opacity-80'}`}
              >
                <div className="fa-list-avatar overflow-hidden">
                  {row.avatarUrl ? (
                    <img src={row.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    row.initials || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold truncate tracking-tight">{row.title}</p>
                  <p className="text-[11px] fa-muted mt-0.5">{row.subtitle}</p>
                </div>
                <div className="text-right shrink-0 pl-2">
                  {row.amount && (
                    <p
                      className={`text-sm font-bold ${
                        row.amountPositive !== false ? 'fa-amount-positive' : 'text-[var(--fa-text)]'
                      }`}
                    >
                      {row.amount}
                    </p>
                  )}
                  <p className="text-[10px] fa-muted mt-0.5 font-medium uppercase tracking-wide">
                    {row.type || row.status}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

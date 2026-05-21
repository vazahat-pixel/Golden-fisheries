import React from 'react';
import { clsx } from 'clsx';
import { Loader2, Inbox } from 'lucide-react';

export const AdminPageHeader = ({ title, subtitle, actions, badge }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
    <div>
      {badge && (
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#6B7550] mb-2 block">
          {badge}
        </span>
      )}
      <h1 className="text-2xl md:text-3xl font-black text-text-primary uppercase tracking-tight">{title}</h1>
      {subtitle && <p className="text-[11px] text-text-muted font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const AdminCard = ({ children, className }) => (
  <div className={clsx('bg-white border border-card-border shadow-subtle', className)}>{children}</div>
);

export const StatusBadge = ({ status }) => {
  const s = (status || 'UNKNOWN').toString().toUpperCase().replace(/\s+/g, '_');
  const styles = {
    CREATED: 'bg-slate-100 text-slate-700 border-slate-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    PENDING_APPROVAL: 'bg-amber-50 text-amber-700 border-amber-200',
    ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    DRIVER_ASSIGNED: 'bg-blue-50 text-blue-700 border-blue-200',
    IN_TRANSIT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    RETURNED: 'bg-red-50 text-red-700 border-red-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    AVAILABLE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ON_TRIP: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    UNPAID: 'bg-amber-50 text-amber-700 border-amber-200',
  };
  const label = status?.toString().replace(/_/g, ' ') || '—';
  return (
    <span className={clsx('inline-block px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border', styles[s] || 'bg-slate-50 text-slate-600 border-slate-200')}>
      {label}
    </span>
  );
};

export const AdminDataTable = ({ columns, rows, onRowClick, loading, emptyMessage = 'No records found' }) => (
  <AdminCard className="overflow-hidden">
    {loading ? (
      <div className="flex items-center justify-center py-16 text-text-muted gap-2">
        <Loader2 className="animate-spin" size={20} />
        <span className="text-[11px] font-black uppercase tracking-widest">Loading…</span>
      </div>
    ) : rows.length === 0 ? (
      <div className="flex flex-col items-center justify-center py-16 text-text-muted">
        <Inbox size={32} className="mb-3 opacity-40" />
        <p className="text-[11px] font-black uppercase tracking-widest">{emptyMessage}</p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-card-border bg-slate-50">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row._id || row.id || i}
                onClick={() => onRowClick?.(row)}
                className={clsx('border-b border-card-border last:border-0', onRowClick && 'cursor-pointer hover:bg-olive-50/50 transition-colors')}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-[11px] font-bold text-text-primary whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key] ?? '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </AdminCard>
);

export const AdminSearchBar = ({ value, onChange, placeholder = 'Search…' }) => (
  <input
    type="search"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full md:w-72 border border-card-border px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide outline-none focus:ring-1 focus:ring-accent-olive"
  />
);

export const AdminBtn = ({ children, variant = 'primary', className, ...props }) => (
  <button
    type="button"
    className={clsx(
      'px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all',
      variant === 'primary' && 'bg-black text-white hover:bg-[#6B7550]',
      variant === 'outline' && 'border border-card-border text-text-primary hover:bg-olive-50',
      variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700',
      variant === 'gold' && 'bg-brand-yellow text-brand-dark hover:bg-yellow-500',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

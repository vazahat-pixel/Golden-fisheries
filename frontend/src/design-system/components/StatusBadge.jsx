import React from 'react';
import { cn } from '../utils/cn';

const STATUS_STYLES = {
  CREATED: 'bg-slate-100 text-slate-700 border-slate-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_ACCEPTANCE: 'bg-amber-50 text-amber-800 border-amber-200',
  PENDING_APPROVAL: 'bg-amber-50 text-amber-800 border-amber-200',
  ASSIGNED: 'bg-blue-50 text-blue-800 border-blue-200',
  DRIVER_ASSIGNED: 'bg-blue-50 text-blue-800 border-blue-200',
  IN_TRANSIT: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  DISPATCHED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  COMPLETED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RECEIVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  RETURNED: 'bg-red-50 text-red-800 border-red-200',
  REJECTED: 'bg-red-50 text-red-800 border-red-200',
  CANCELLED: 'bg-red-50 text-red-800 border-red-200',
  ACTIVE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  AVAILABLE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  ON_TRIP: 'bg-amber-50 text-amber-800 border-amber-200',
  PAID: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  UNPAID: 'bg-amber-50 text-amber-800 border-amber-200',
  ISSUED: 'bg-blue-50 text-blue-800 border-blue-200',
  BILLING_DONE: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  BUYER_VERIFIED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const StatusBadge = ({ status, className }) => {
  const key = (status || 'UNKNOWN').toString().toUpperCase().replace(/\s+/g, '_');
  const label = status?.toString().replace(/_/g, ' ') || '—';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border rounded-erp',
        STATUS_STYLES[key] || 'bg-slate-50 text-slate-600 border-slate-200',
        className
      )}
    >
      {label}
    </span>
  );
};

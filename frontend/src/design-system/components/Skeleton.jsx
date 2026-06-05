import React from 'react';
import { cn } from '../utils/cn';

export const Skeleton = ({ className }) => (
  <div className={cn('erp-skeleton rounded-erp', className)} aria-hidden />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="space-y-2 p-3">
    <div className="flex gap-2">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex gap-2">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const KpiSkeleton = ({ count = 4 }) => (
  <div className="erp-grid-kpi">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="erp-section p-3 space-y-2">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-7 w-2/3" />
      </div>
    ))}
  </div>
);

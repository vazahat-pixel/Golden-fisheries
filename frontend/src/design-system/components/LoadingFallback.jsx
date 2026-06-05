import React from 'react';
import { KpiSkeleton, TableSkeleton, Skeleton } from './Skeleton';

export const LoaderSpinner = ({ size = 20, className = '' }) => (
  <div
    className={`animate-spin border-2 border-t-transparent border-accent rounded-full ${className}`}
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);

export const LoadingFallback = ({ type = 'full' }) => {
  if (type === 'full') {
    return (
      <div className="min-h-screen bg-page-bg flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center text-center max-w-xs">
          <img
            src="/IMG_8643-removebg-preview.png"
            alt="Golden Fisheries"
            className="w-12 h-12 object-contain mb-4 opacity-90"
          />
          <div className="erp-section w-full p-4 space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <LoaderSpinner size={16} />
              <span className="text-xs font-medium text-text-secondary">Loading application…</span>
            </div>
            <Skeleton className="h-1 w-full" />
          </div>
          <p className="erp-caption mt-4">Golden Fisheries ERP</p>
        </div>
      </div>
    );
  }

  return (
    <div className="erp-page animate-in fade-in duration-200">
      <div className="erp-section p-3 mb-3">
        <Skeleton className="h-5 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <KpiSkeleton count={4} />
      <div className="erp-section mt-3">
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
};

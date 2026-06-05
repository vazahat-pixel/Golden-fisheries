import React from 'react';
import { cn } from '../utils/cn';

export const PageHeader = ({ title, subtitle, badge, actions, className, dense = false }) => (
  <div
    className={cn(
      'flex flex-col sm:flex-row sm:items-end justify-between gap-3',
      dense ? 'mb-3' : 'mb-4',
      className
    )}
  >
    <div className="min-w-0">
      {badge && <p className="erp-eyebrow mb-1">{badge}</p>}
      <h1 className="erp-h1">{title}</h1>
      {subtitle && <p className="erp-caption mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
  </div>
);

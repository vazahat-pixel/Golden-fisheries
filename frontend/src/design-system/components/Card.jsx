import React from 'react';
import { cn } from '../utils/cn';

const paddings = {
  none: '',
  sm: 'p-2',
  md: 'p-3',
  lg: 'p-4',
};

export const Card = ({ children, className, padding = 'md', as: Tag = 'div', ...props }) => (
  <Tag
    className={cn(
      'bg-card-bg border border-border-strong rounded-erp shadow-erp-md',
      paddings[padding] ?? paddings.md,
      className
    )}
    {...props}
  >
    {children}
  </Tag>
);

export const CardHeader = ({ title, subtitle, actions, className }) => (
  <div className={cn('flex flex-wrap items-start justify-between gap-2 mb-2', className)}>
    <div className="min-w-0">
      {title && <h3 className="erp-h3">{title}</h3>}
      {subtitle && <p className="erp-caption mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-1.5 shrink-0">{actions}</div>}
  </div>
);

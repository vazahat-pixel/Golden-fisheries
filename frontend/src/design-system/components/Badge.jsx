import React from 'react';
import { cn } from '../utils/cn';

const variants = {
  default: 'bg-surface-muted text-text-secondary border-card-border',
  primary: 'bg-primary text-white border-primary',
  accent: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  danger: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  outline: 'bg-white text-text-secondary border-card-border',
};

const sizes = {
  sm: 'px-1.5 py-0 text-[10px]',
  md: 'px-2 py-0.5 text-[10px]',
};

export const Badge = ({ children, className, variant = 'default', size = 'md' }) => (
  <span
    className={cn(
      'inline-flex items-center font-semibold uppercase tracking-wide border rounded-erp',
      variants[variant] ?? variants.default,
      sizes[size] ?? sizes.md,
      className
    )}
  >
    {children}
  </span>
);

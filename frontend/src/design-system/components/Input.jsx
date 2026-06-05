import React from 'react';
import { cn } from '../utils/cn';

const baseField =
  'w-full h-9 px-3 text-erp-sm text-text-primary bg-white border border-card-border rounded-erp ' +
  'placeholder:text-text-muted outline-none transition-colors ' +
  'focus:border-accent focus:ring-1 focus:ring-accent/25 disabled:bg-surface-muted disabled:cursor-not-allowed';

export const Input = React.forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(baseField, error && 'border-danger focus:border-danger focus:ring-danger/25', className)}
    {...props}
  />
));

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({ className, error, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      baseField.replace('h-9', 'min-h-[72px] py-2'),
      'resize-y',
      error && 'border-danger focus:border-danger focus:ring-danger/25',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export const Select = React.forwardRef(({ className, error, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(baseField, 'pr-8', error && 'border-danger focus:border-danger focus:ring-danger/25', className)}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = 'Select';

export const SearchInput = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="search"
    className={cn(baseField, 'max-w-xs', className)}
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

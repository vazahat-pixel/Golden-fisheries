import React from 'react';
import { cn } from '../utils/cn';

export const FormField = ({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
  horizontal = false,
}) => (
  <div
    className={cn(
      horizontal ? 'flex flex-wrap items-center gap-2' : 'space-y-1',
      className
    )}
  >
    {label && (
      <label
        htmlFor={htmlFor}
        className={cn(
          'erp-label block',
          horizontal && 'mb-0 min-w-[120px]',
          required && "after:content-['*'] after:ml-0.5 after:text-danger"
        )}
      >
        {label}
      </label>
    )}
    <div className={cn(horizontal && 'flex-1 min-w-[140px]')}>{children}</div>
    {error && <p className="text-xs text-danger font-medium">{error}</p>}
    {!error && hint && <p className="erp-caption">{hint}</p>}
  </div>
);

export const FormSection = ({ title, description, children, className }) => (
  <fieldset className={cn('erp-section overflow-hidden', className)}>
    {(title || description) && (
      <legend className="erp-section-header w-full px-3 py-2 border-b border-card-border bg-surface-muted">
        {title && <span className="erp-h3 block">{title}</span>}
        {description && <span className="erp-caption block mt-0.5">{description}</span>}
      </legend>
    )}
    <div className="erp-section-body grid gap-3 sm:grid-cols-2">{children}</div>
  </fieldset>
);

export const FormActions = ({ children, className, align = 'end' }) => (
  <div
    className={cn(
      'flex flex-wrap gap-2 pt-2',
      align === 'end' && 'justify-end',
      align === 'start' && 'justify-start',
      align === 'between' && 'justify-between',
      className
    )}
  >
    {children}
  </div>
);

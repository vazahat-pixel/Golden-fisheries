import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'bg-white border border-card-border shadow-erp-md w-full relative z-10 rounded-erp-lg animate-in fade-in zoom-in-95 duration-150',
          sizes[size] ?? sizes.md,
          className
        )}
      >
        {title && (
          <div className="px-3 py-2 border-b border-card-border flex justify-between items-center bg-surface-muted">
            <h3 id="modal-title" className="erp-h3">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-text-muted hover:text-text-primary rounded-erp transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-3 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-3 py-2 border-t border-card-border flex justify-end gap-2 bg-surface-muted">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

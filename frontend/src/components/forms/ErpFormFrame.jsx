import React from 'react';

/** Professional ERP form shell — screen UI (print-friendly via .erp-form-print) */
export const ErpFormFrame = ({ title, subtitle, badge, actions, children, footer, className = '' }) => (
  <div className={`erp-form-shell max-w-4xl mx-auto ${className}`}>
    {(badge || actions) && (
      <div className="erp-form-toolbar no-print flex flex-wrap items-center justify-between gap-2 mb-3">
        {badge && (
          <span className="text-[10px] font-black uppercase tracking-wider text-brand-olive bg-accent/10 border border-accent/25 px-2.5 py-1 rounded-erp">
            {badge}
          </span>
        )}
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    )}
    <div className="erp-form-card border border-border-strong rounded-erp shadow-erp-md overflow-hidden bg-white">
      <div className="erp-form-header px-4 py-3 border-b border-card-border bg-surface-muted">
        <h2 className="text-sm font-black uppercase tracking-wider text-brand-olive">{title}</h2>
        {subtitle && (
          <p className="text-[11px] font-semibold text-text-secondary mt-0.5 uppercase tracking-wide">{subtitle}</p>
        )}
      </div>
      <div className="erp-form-body p-4">{children}</div>
      {footer && (
        <div className="erp-form-footer px-4 py-3 border-t border-card-border bg-surface-muted">{footer}</div>
      )}
    </div>
  </div>
);

export const ErpFieldRow = ({ label, children, className = '', compact = false }) => (
  <div
    className={`erp-form-row grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-1 sm:gap-3 items-center border-b border-card-border py-2 ${
      compact ? 'py-1.5' : ''
    } ${className}`}
  >
    <span className="text-[10px] font-black uppercase tracking-wider text-text-secondary">{label}</span>
    <div className="min-w-0">{children}</div>
  </div>
);

export const erpInputClass =
  'w-full h-8 px-2.5 text-xs font-semibold text-text-primary bg-white border border-border-strong rounded-erp outline-none focus:border-accent focus:ring-1 focus:ring-accent/20 transition-colors';

export const erpSelectClass = `${erpInputClass} cursor-pointer`;

export const ErpSummaryBox = ({ label, value, variant = 'default' }) => {
  const variants = {
    default: 'border-border-strong bg-surface-muted text-brand-olive',
    total: 'border-brand-olive bg-accent/10 text-brand-olive',
    warn: 'border-amber-400 bg-amber-50 text-amber-800',
  };
  return (
    <div className={`erp-summary-box border rounded-erp p-3 ${variants[variant] || variants.default}`}>
      <span className="block text-[9px] font-black uppercase tracking-wider text-text-secondary">{label}</span>
      <span className="text-xl font-black tabular-nums mt-0.5">{value}</span>
    </div>
  );
};

export default ErpFormFrame;

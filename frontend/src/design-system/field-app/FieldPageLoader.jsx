import React from 'react';

/** Branded loader for field / driver app — inline or full-page overlay */
export function FieldPageLoader({ overlay = false, compact = false, label = 'Loading' }) {
  return (
    <div
      className={[
        'fa-page-loader',
        overlay ? 'fa-page-loader--overlay' : '',
        compact ? 'fa-page-loader--compact' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="fa-page-loader-visual">
        <div className="fa-page-loader-ring" aria-hidden />
        <div className="fa-page-loader-ring fa-page-loader-ring--delay" aria-hidden />
        <img
          src="/IMG_8643-removebg-preview.png"
          alt=""
          className="fa-page-loader-logo"
          draggable={false}
        />
      </div>
      {!compact && <p className="fa-page-loader-label">{label}</p>}
      <div className="fa-page-loader-dots" aria-hidden>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export function FieldInlineLoader({ label = 'Loading…' }) {
  return <FieldPageLoader compact label={label} />;
}

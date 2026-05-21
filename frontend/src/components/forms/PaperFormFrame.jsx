import React from 'react';

/**
 * Operational paper-style form shell — print friendly, no dashboard chrome.
 */
export const PaperFormFrame = ({ title, subtitle, children, footer, className = '' }) => (
  <div className={`max-w-4xl mx-auto ${className}`}>
    <div className="border-2 border-black bg-white text-black shadow-sm print:shadow-none print:border-black">
      <div className="border-b-2 border-black px-4 py-3 text-center">
        <h1 className="text-lg font-bold uppercase tracking-widest">{title}</h1>
        {subtitle && <p className="text-xs mt-1 uppercase">{subtitle}</p>}
      </div>
      <div className="p-4">{children}</div>
      {footer && <div className="border-t-2 border-black px-4 py-3">{footer}</div>}
    </div>
  </div>
);

export const PaperFieldRow = ({ label, children, className = '' }) => (
  <div className={`grid grid-cols-[140px_1fr] gap-2 items-center border-b border-gray-300 py-1.5 text-sm ${className}`}>
    <span className="font-semibold uppercase text-xs">{label}</span>
    <div>{children}</div>
  </div>
);

export const paperInputClass =
  'w-full border border-gray-400 px-2 py-1 text-sm bg-white focus:outline-none focus:border-black';

export default PaperFormFrame;

import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export const PrintActions = ({ onBack, title = 'Document' }) => (
  <div className="no-print flex flex-wrap gap-2 mb-4 items-center justify-between">
    {onBack && (
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-semibold">
        <ArrowLeft size={16} /> Back
      </button>
    )}
    <p className="text-xs font-bold uppercase text-gray-500">{title}</p>
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold uppercase"
    >
      <Printer size={14} /> Print
    </button>
  </div>
);

export default PrintActions;

import React from 'react';
import { Check } from 'lucide-react';

/**
 * Accessible toggle button — avoids native checkbox styling issues in ERP tables.
 */
const PermissionToggle = ({ checked, onChange, disabled = false, title = '' }) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={!!checked}
    title={title}
    disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={`w-9 h-9 border-2 inline-flex items-center justify-center transition-all shrink-0 ${
      disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'
    } ${
      checked
        ? 'bg-[#6A7051] border-[#6A7051] text-white shadow-sm'
        : 'bg-white border-slate-300 text-transparent hover:border-[#6A7051]/50'
    }`}
  >
    {checked ? <Check size={18} strokeWidth={3} /> : null}
  </button>
);

export default PermissionToggle;

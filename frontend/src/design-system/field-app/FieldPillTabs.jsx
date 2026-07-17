import React from 'react';

export function FieldPillTabs({ options, value, onChange }) {
  return (
    <div className="fa-segment">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`flex-1 fa-pill fa-tap ${value === opt.value ? 'fa-pill-active' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

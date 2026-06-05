import React from 'react';
import { useNavigate } from 'react-router-dom';

export function FieldSectionHeader({ title, actionLabel = 'View All', actionTo, onAction }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-0.5 mb-3">
      <h2 className="fa-section-title">{title}</h2>
      {(actionTo || onAction) && (
        <button
          type="button"
          onClick={() => (onAction ? onAction() : navigate(actionTo))}
          className="fa-link fa-tap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

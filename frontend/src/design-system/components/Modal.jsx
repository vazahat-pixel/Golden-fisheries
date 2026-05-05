import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-in fade-in" 
        onClick={onClose} 
      />
      <div className="bg-white border border-card-border shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
        <div className="px-4 py-3 border-b border-card-border flex justify-between items-center bg-olive-50/20">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">{title}</h3>
          <button onClick={onClose} className="p-1 text-text-muted hover:text-black transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

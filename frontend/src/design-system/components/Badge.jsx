import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Badge = ({ children, className, variant = 'info' }) => {
  const variants = {
    primary: 'bg-black text-white border border-black shadow-subtle',
    secondary: 'bg-white text-black border border-card-border shadow-subtle',
    success: 'bg-white text-green-600 border border-card-border shadow-subtle',
    warning: 'bg-white text-amber-600 border border-card-border shadow-subtle',
    danger: 'bg-red-600 text-white border border-red-700 shadow-subtle',
    outline: 'bg-white text-black border border-card-border shadow-subtle',
    ghost: 'bg-transparent text-black border-transparent',
    info: 'bg-white text-black border border-card-border shadow-subtle',
  };

  return (
    <span className={twMerge(
      'inline-flex items-center px-2 py-0.5 rounded-none text-[8px] font-bold uppercase tracking-widest',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};

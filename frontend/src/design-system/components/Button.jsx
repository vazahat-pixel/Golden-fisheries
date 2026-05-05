import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold uppercase tracking-[0.2em] transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-none';
  
  const variants = {
    primary: 'bg-black text-white border border-black shadow-subtle hover:bg-black/90 active:scale-95',
    secondary: 'bg-white text-black border border-card-border shadow-subtle hover:bg-olive-50 active:scale-95',
    outline: 'bg-white text-black border border-card-border shadow-subtle hover:bg-olive-50 active:scale-95',
    ghost: 'bg-transparent text-black border-transparent hover:bg-black/5',
    danger: 'bg-red-600 text-white border border-red-700 shadow-subtle hover:bg-red-700 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[9px]',
    md: 'px-4 py-2.5 text-[10px]',
    lg: 'px-6 py-3 text-[11px]',
    icon: 'p-1.5',
  };

  return (
    <button 
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {children}
    </button>
  );
};

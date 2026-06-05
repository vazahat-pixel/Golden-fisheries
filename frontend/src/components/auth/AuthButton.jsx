import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AuthButton = ({ children, className, variant = 'primary', ...props }) => {
  return (
    <button
      className={cn(
        'w-full py-3.5 rounded-xl font-bold uppercase tracking-[0.14em] text-sm transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
        'disabled:opacity-50 disabled:pointer-events-none',
        variant === 'primary'
          ? 'bg-gradient-to-r from-brand-yellow to-[#e6c84a] text-brand-dark shadow-lg shadow-black/25 hover:shadow-xl hover:brightness-105 active:scale-[0.99]'
          : 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30 active:scale-[0.99]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthButton;

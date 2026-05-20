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
        "w-full py-3 rounded-xl font-bold uppercase tracking-wide transition-all shadow-lg active:shadow-sm active:translate-y-0.5",
        variant === 'primary' 
          ? "bg-brand-yellow text-brand-dark hover:bg-yellow-500" 
          : "bg-white/10 text-white hover:bg-white/20 border border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default AuthButton;

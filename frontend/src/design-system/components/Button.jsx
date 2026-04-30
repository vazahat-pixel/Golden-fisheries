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
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-[var(--radius-btn)]';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm',
    secondary: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50',
    ghost: 'text-blue-500 hover:bg-blue-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs md:text-sm min-h-[36px]',
    md: 'px-4 md:px-5 py-2 md:py-2.5 text-sm md:text-base min-h-[44px] md:min-h-0',
    lg: 'px-6 md:px-8 py-3 md:py-3.5 text-base md:text-lg min-h-[52px] md:min-h-0',
    icon: 'p-2 min-h-[40px] min-w-[40px]',
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

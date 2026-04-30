import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, padding = 'md' }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-3 md:p-4',
    md: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  return (
    <div className={twMerge(
      'bg-card-bg border border-card-border shadow-[var(--shadow-card)] rounded-[var(--radius-card)]',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};

import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, padding = 'md' }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-1 md:p-2',
    md: 'p-2 md:p-3',
    lg: 'p-3 md:p-4',
  };

  return (
    <div className={twMerge(
      'bg-card-bg border border-card-border shadow-sm rounded-none',
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
};

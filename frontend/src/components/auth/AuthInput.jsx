import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AuthInput = forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative w-full mb-4 group">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-olive/50 group-focus-within:text-brand-olive transition-colors">
          <Icon size={18} strokeWidth={2.25} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full bg-white/95 text-brand-dark rounded-xl py-3.5 px-4 text-sm font-semibold',
          'placeholder:text-gray-400/90 outline-none border border-transparent',
          'focus:ring-2 focus:ring-brand-yellow/80 focus:border-brand-yellow/40 transition-all duration-200',
          Icon ? 'pl-11' : '',
          className
        )}
        {...props}
      />
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;

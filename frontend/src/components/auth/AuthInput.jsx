import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const AuthInput = forwardRef(({ className, icon: Icon, ...props }, ref) => {
  return (
    <div className="relative w-full mb-4">
      {Icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <Icon size={18} />
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "w-full bg-brand-light text-brand-dark rounded-xl py-3 px-4 font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-yellow transition-shadow",
          Icon ? "pl-11" : "",
          className
        )}
        {...props}
      />
    </div>
  );
});

AuthInput.displayName = 'AuthInput';

export default AuthInput;

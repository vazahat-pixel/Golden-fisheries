import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

const variants = {
  primary:
    'bg-gradient-to-r from-[#6A7051] to-[#555b3f] text-white border border-[#555b3f]/30 hover:from-[#5F6846] hover:to-[#454c2d] active:scale-[0.98] active:translate-y-[0.5px] shadow-erp-sm hover:shadow-erp-md transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6A7051]/40',
  secondary:
    'bg-gradient-to-b from-white to-[#fcfcf9] text-text-primary border border-card-border hover:bg-surface-hover hover:border-gray-400 active:scale-[0.98] shadow-erp-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#6A7051]/30',
  outline:
    'bg-transparent text-text-primary border border-card-border hover:bg-slate-50/80 active:scale-[0.98] transition-all duration-200',
  ghost: 'bg-transparent text-text-primary border-transparent hover:bg-surface-hover active:scale-[0.98] transition-all',
  danger:
    'bg-gradient-to-r from-[#b91c1c] to-[#991b1b] text-white border border-[#991b1b]/20 hover:from-[#991b1b] hover:to-[#7f1d1d] active:scale-[0.98] shadow-erp-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-red-300',
  success:
    'bg-gradient-to-r from-[#15803d] to-[#166534] text-white border border-[#166534]/20 hover:from-[#166534] hover:to-[#14532d] active:scale-[0.98] shadow-erp-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-green-300',
  warning:
    'bg-gradient-to-r from-[#b45309] to-[#92400e] text-white border border-[#92400e]/20 hover:from-[#92400e] hover:to-[#78350f] active:scale-[0.98] shadow-erp-sm transition-all duration-200',
  accent:
    'bg-gradient-to-r from-[#C5A021] to-[#a38217] text-brand-dark border border-[#a38217]/20 hover:from-[#d1ab24] hover:to-[#b5921c] active:scale-[0.98] shadow-erp-sm transition-all duration-200 font-bold focus-visible:ring-2 focus-visible:ring-[#C5A021]/40',
};

const sizes = {
  xs: 'h-7 px-2 text-erp-xs gap-1',
  sm: 'h-8 px-2.5 text-erp-xs gap-1.5',
  md: 'h-9 px-3 text-erp-sm gap-1.5',
  lg: 'h-10 px-4 text-erp-sm gap-2',
  icon: 'h-8 w-8 p-0',
};

export const Button = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  type = 'button',
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-erp transition-colors',
        'focus:outline-none disabled:opacity-50 disabled:pointer-events-none',
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'xs' || size === 'sm' ? 14 : 16} />
      ) : LeftIcon ? (
        <LeftIcon size={14} className="shrink-0" />
      ) : null}
      {children}
      {!loading && RightIcon ? <RightIcon size={14} className="shrink-0" /> : null}
    </button>
  );
};

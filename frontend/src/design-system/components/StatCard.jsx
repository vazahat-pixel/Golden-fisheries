import React from 'react';
import { Card } from './Card';
import { cn } from '../utils/cn';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'up',
  variant = 'default',
  className,
  onClick,
}) => {
  const variantBorder = {
    default: 'border-card-border',
    accent: 'border-accent/30',
    warning: 'border-amber-200',
    danger: 'border-red-200',
  };

  return (
    <Card
      padding="md"
      className={cn(
        variantBorder[variant] ?? variantBorder.default,
        onClick && 'cursor-pointer hover:bg-surface-hover transition-colors',
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        {Icon && (
          <div className="w-8 h-8 flex items-center justify-center rounded-erp bg-surface-muted text-accent border border-card-border shrink-0">
            <Icon size={15} strokeWidth={2} />
          </div>
        )}
        {trend && (
          <span
            className={cn(
              'text-[10px] font-semibold',
              trendType === 'up' ? 'text-success' : 'text-danger'
            )}
          >
            {trend}
          </span>
        )}
      </div>
      <p className="erp-eyebrow">{title}</p>
      <p className="text-xl font-semibold text-text-primary tracking-tight mt-0.5 tabular-nums">
        {value}
      </p>
    </Card>
  );
};

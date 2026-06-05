import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description,
  action,
  actionLabel,
  onAction,
  className,
  compact = false,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center text-text-muted',
      compact ? 'py-8 px-4' : 'py-12 px-6',
      className
    )}
  >
    <Icon size={compact ? 28 : 36} className="mb-3 opacity-40" strokeWidth={1.5} />
    <p className="text-sm font-medium text-text-secondary">{title}</p>
    {description && <p className="erp-caption mt-1 max-w-sm">{description}</p>}
    {action ?? (onAction && actionLabel ? (
      <Button variant="secondary" size="sm" className="mt-4" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null)}
  </div>
);

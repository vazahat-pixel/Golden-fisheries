import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const StatCard = ({ title, value, icon: Icon, trend, trendType = 'up', variant = 'info' }) => {
  return (
    <Card className="p-4 md:p-5 bg-white border border-card-border shadow-subtle">
      <div className="flex justify-between items-start mb-4">
        <div className="w-8 h-8 border border-card-border bg-olive-100/50 flex items-center justify-center text-accent-olive">
          {Icon && <Icon size={16} />}
        </div>
        {trend && (
          <div className={twMerge(
            "text-[9px] font-bold uppercase tracking-widest px-2 py-1",
            trendType === 'up' ? "text-green-600" : "text-red-600"
          )}>
            {trend}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">{title}</p>
        <p className="text-2xl font-serif italic font-bold text-primary tracking-tight">
          {value}
        </p>
      </div>
    </Card>
  );
};

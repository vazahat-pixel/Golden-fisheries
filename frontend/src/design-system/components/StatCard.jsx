import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, trend, icon: Icon, trendType = 'up', variant = 'info' }) => {
  const variants = {
    info: 'bg-blue-50 text-blue-600',
    primary: 'bg-blue-500/10 text-blue-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
    success: 'bg-green-50 text-green-600',
  };

  return (
    <Card className="flex flex-col gap-2 p-4 md:p-6">
      <div className="flex justify-between items-start">
        <div className={`p-2 rounded-lg ${variants[variant] || variants.info}`}>
          {Icon && <Icon size={20} />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${
            trendType === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trendType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-xl md:text-2xl font-black text-gray-900 mt-0.5 md:mt-1 leading-tight">{value}</h3>
      </div>
    </Card>
  );
};

import React from 'react';

export const WelcomeBanner = ({ name = 'Operator' }) => {
  const displayName = name?.split(' ')[0] || 'Operator';
  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white border border-card-border rounded-none p-6 md:p-8 mb-6">
      <div className="relative z-10">
        <p className="text-[9px] md:text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-2">
          SYSTEM OVERVIEW • {today}
        </p>
        <h1 className="text-3xl md:text-4xl font-serif italic font-black text-black tracking-tight mb-2">
          Hello, <span className="text-[#5F6846]">{displayName}.</span>
        </h1>
        <p className="text-text-muted font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] max-w-4xl leading-loose">
          ARCHITECT AND MANAGE YOUR SEAFOOD OPERATIONS WITH PRECISION.
        </p>
      </div>
    </div>
  );
};

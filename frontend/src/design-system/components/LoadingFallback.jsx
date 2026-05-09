import React from 'react';

export const LoaderSpinner = ({ size = 24, className = "" }) => (
  <div 
    className={`animate-spin border-2 border-t-transparent border-black rounded-none ${className}`} 
    style={{ width: size, height: size }}
  />
);

export const LoadingFallback = ({ type = 'full' }) => {
  if (type === 'full') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-6 font-sans select-none animate-in fade-in duration-300">
        <div className="flex flex-col items-center text-center max-w-sm">
          {/* Logo container with elegant pulse and grayscale effect */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#5F6846]/10 blur-xl rounded-none animate-pulse" />
            <img 
              src="/IMG_8643-removebg-preview.png" 
              alt="Golden Fisheries Logo" 
              className="w-16 h-16 object-contain relative z-10 grayscale hover:grayscale-0 transition-all duration-500 animate-pulse" 
            />
          </div>
          
          {/* Brutalist loading console box matching the system theme */}
          <div className="bg-white border-2 border-black p-6 w-80 shadow-[6px_6px_0px_0px_#E8E1C8] relative">
            <div className="flex items-center gap-3 mb-4">
              <LoaderSpinner size={14} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-black">
                INITIALIZING SYSTEMS...
              </span>
            </div>
            
            {/* Shimmer loading bar progress track */}
            <div className="h-1.5 bg-gray-100 overflow-hidden relative border border-gray-200">
              <div className="absolute top-0 bottom-0 left-0 bg-[#5F6846] w-1/3 animate-shimmer" />
            </div>
            
            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.15em] mt-3 text-left leading-relaxed">
              Establishing encrypted tunnel & loading operation consoles...
            </p>
          </div>
          
          <div className="mt-8 text-[9px] font-bold text-gray-400 uppercase tracking-[0.25em]">
            Secure ERP Node v2.06
          </div>
        </div>
      </div>
    );
  }

  // Dashboard / Inner Page Content Area Skeleton Loader
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="bg-white border border-card-border p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2.5 w-full md:w-1/3">
          <div className="h-5 bg-gray-100 border border-gray-200 animate-pulse w-3/4" />
          <div className="h-3 bg-gray-50 border border-gray-100 animate-pulse w-1/2" />
        </div>
        <div className="h-10 bg-gray-100 border border-gray-200 animate-pulse w-32" />
      </div>

      {/* Grid of Cards (Mirroring Dashboard or operational cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E8E1C8] p-6 shadow-subtle space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-3 bg-gray-200 animate-pulse w-1/3" />
              <div className="w-8 h-8 bg-gray-100 border border-gray-200 animate-pulse" />
            </div>
            <div className="h-8 bg-gray-100 border border-gray-200 animate-pulse w-2/3" />
            <div className="h-3 bg-gray-50 border border-gray-100 animate-pulse w-1/2" />
          </div>
        ))}
      </div>

      {/* Table/Content Area Skeleton */}
      <div className="bg-white border border-card-border p-6 space-y-5">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div className="h-4 bg-gray-200 animate-pulse w-1/4" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-50 border border-gray-200 animate-pulse w-20" />
            <div className="h-8 bg-gray-50 border border-gray-200 animate-pulse w-24" />
          </div>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="space-y-2 w-1/4">
                <div className="h-3.5 bg-gray-200 animate-pulse w-full" />
                <div className="h-2.5 bg-gray-100 animate-pulse w-2/3" />
              </div>
              <div className="h-3 bg-gray-200 animate-pulse w-16" />
              <div className="h-3 bg-gray-100 animate-pulse w-24" />
              <div className="h-6 bg-gray-200 animate-pulse w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

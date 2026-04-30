import React from 'react';

export const WelcomeBanner = ({ name = 'Mahesh' }) => {
  const today = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-[20px] p-6 md:p-8 text-white shadow-xl mb-8">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black mb-1 md:mb-2 tracking-tight">
            Welcome back, {name}! 🐟
          </h1>
          <p className="text-blue-100 font-medium text-sm md:text-base">
            Stay updated with your seafood empire today.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[10px] md:text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {today}
          </div>
        </div>
        
        <div className="hidden lg:block relative">
          <div className="absolute -inset-4 bg-white/20 blur-2xl rounded-full"></div>
          <div className="w-32 h-32 flex items-center justify-center text-6xl relative bg-white/10 border border-white/20 rounded-3xl backdrop-blur-md">
            🌊
          </div>
        </div>
      </div>
      
      {/* Decorative abstract shapes */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/5 rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/10 rounded-full"></div>
    </div>
  );
};

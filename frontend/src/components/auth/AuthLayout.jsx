import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-brand-olive flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-brand-yellow/30">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md flex flex-col items-center relative z-10">
        {/* Logo */}
        <div className="mb-6 w-32 h-32 flex items-center justify-center">
          <img 
            src="/logo.PNG" 
            alt="Golden Fisheries Logo" 
            className="max-w-full max-h-full object-contain drop-shadow-md"
          />
        </div>

        {/* Headings */}
        {title && (
          <h1 className="text-white text-3xl font-extrabold uppercase tracking-wider text-center drop-shadow-sm mb-1">
            {title}
          </h1>
        )}
        {subtitle && (
          <h2 className="text-[#a5aa98] text-sm font-semibold uppercase tracking-widest text-center mb-8">
            {subtitle}
          </h2>
        )}

        {/* Content Box */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

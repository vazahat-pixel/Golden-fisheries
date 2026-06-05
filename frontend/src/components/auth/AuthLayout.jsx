import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d4234] via-brand-olive to-[#2a2e26] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-brand-yellow/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-brand-yellow/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 w-[480px] h-[480px] rounded-full bg-white/5 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <div className="w-full max-w-[420px] flex flex-col items-center relative z-10 animate-in fade-in duration-500">
        <div className="mb-5 w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-3 shadow-2xl">
          <img
            src="/logo.PNG"
            alt="Golden Fisheries"
            className="max-w-full max-h-full object-contain drop-shadow-lg"
          />
        </div>

        {title && (
          <h1 className="text-white text-2xl sm:text-3xl font-extrabold uppercase tracking-[0.12em] text-center mb-1">
            {title}
          </h1>
        )}
        {subtitle && (
          <p className="text-white/55 text-xs sm:text-sm font-medium uppercase tracking-[0.2em] text-center mb-6 max-w-sm">
            {subtitle}
          </p>
        )}

        <div className="w-full rounded-2xl border border-white/15 bg-white/[0.07] backdrop-blur-xl shadow-[0_24px_64px_rgba(0,0,0,0.35)] p-6 sm:p-8">
          {children}
        </div>

        <p className="mt-6 text-[10px] text-white/35 uppercase tracking-widest text-center">
          Golden Fisheries ERP · Secure access
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;

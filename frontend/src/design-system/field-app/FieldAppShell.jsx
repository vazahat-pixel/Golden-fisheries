import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LoadingFallback } from '../components/LoadingFallback';
import { FieldBottomNav } from './FieldBottomNav';
import './fieldAppTheme.css';

export function FieldAppShell({ navItems, hideNav = false }) {
  const location = useLocation();

  return (
    <div className="field-app flex flex-col min-h-[100dvh] h-[100dvh] max-w-md mx-auto w-full shadow-2xl border-x border-[var(--fa-border)]">
      <main className="flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar px-3 pt-3 pb-24">
        <div key={location.pathname} className="fa-page-enter flex-1 flex flex-col min-h-0">
          <React.Suspense fallback={<LoadingFallback type="content" />}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>
      {!hideNav && navItems?.length > 0 && (
        <FieldBottomNav items={navItems} />
      )}
    </div>
  );
}

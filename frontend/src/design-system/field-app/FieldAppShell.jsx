import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FieldBottomNav } from './FieldBottomNav';
import { FieldPageLoader } from './FieldPageLoader';
import './fieldAppTheme.css';

export function FieldAppShell({ navItems, hideNav = false }) {
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add('is-field-app');
    return () => {
      document.body.classList.remove('is-field-app');
    };
  }, []);

  return (
    <div className="field-app field-app-viewport flex flex-col min-h-[100dvh] h-[100dvh] w-full">
      <div className="fa-ambient" aria-hidden>
        <div className="fa-ambient-orb fa-ambient-orb--gold" />
        <div className="fa-ambient-orb fa-ambient-orb--olive" />
      </div>

      <main className="field-app-main flex-1 flex flex-col min-h-0 overflow-y-auto no-scrollbar px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-24">
        <div key={location.pathname} className="fa-page-enter flex-1 flex flex-col min-h-0">
          <React.Suspense fallback={<FieldPageLoader label="Opening page" />}>
            <Outlet />
          </React.Suspense>
        </div>
      </main>

      {!hideNav && navItems?.length > 0 && <FieldBottomNav items={navItems} />}
    </div>
  );
}

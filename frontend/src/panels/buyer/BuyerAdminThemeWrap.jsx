import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../design-system/field-app/fieldAppTheme.css';

/** Wraps buyer pages inside Admin ERP so dark field-app tokens apply */
export function BuyerAdminThemeWrap() {
  return (
    <div className="field-app field-app-viewport w-full min-h-[520px] lg:max-w-lg lg:mx-auto lg:rounded-2xl lg:border lg:border-[var(--fa-border)] lg:shadow-lg">
      <main className="px-4 pt-3 pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export default BuyerAdminThemeWrap;

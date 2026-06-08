import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../design-system/field-app/fieldAppTheme.css';

/** Wraps buyer pages inside Admin ERP so dark field-app tokens apply */
export function BuyerAdminThemeWrap() {
  return (
    <div className="field-app max-w-lg mx-auto w-full rounded-2xl overflow-hidden border border-[var(--fa-border)] shadow-lg min-h-[520px]">
      <main className="px-3 pt-3 pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export default BuyerAdminThemeWrap;

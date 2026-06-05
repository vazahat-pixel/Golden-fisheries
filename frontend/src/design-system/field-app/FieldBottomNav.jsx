import React from 'react';
import { NavLink } from 'react-router-dom';

/** Premium dark bottom nav — 4 items, no center FAB */
export function FieldBottomNav({ items = [] }) {
  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `fa-tap flex flex-col items-center flex-1 py-2 transition-all duration-300 ${
          isActive ? 'fa-nav-active' : 'fa-muted'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <div
            className={`fa-nav-icon-wrap p-2.5 rounded-2xl transition-all duration-300 ${
              isActive ? '' : 'bg-transparent'
            }`}
          >
            <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
          </div>
          <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-[var(--fa-accent)]' : ''}`}>
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <footer className="sticky bottom-0 z-40 bg-black/98 backdrop-blur-md border-t border-[var(--fa-border)]">
      <nav className="flex items-center justify-around px-2 pt-2 pb-1 max-w-md mx-auto">
        {items.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>
      <div className="w-[134px] h-1 bg-white/10 mx-auto mb-2 mt-1 rounded-full" />
    </footer>
  );
}

import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

export function FieldBottomNav({ items = [] }) {
  const location = useLocation();
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    setPendingPath(null);
  }, [location.pathname]);

  const NavItem = ({ item }) => {
    const isPending = pendingPath === item.path && location.pathname !== item.path;

    return (
      <NavLink
        to={item.path}
        onClick={() => setPendingPath(item.path)}
        className={({ isActive }) =>
          [
            'fa-tap fa-nav-item flex flex-col items-center flex-1 py-2',
            isActive ? 'fa-nav-active' : 'fa-muted',
            isPending ? 'fa-nav-item--pending' : '',
          ].join(' ')
        }
      >
        {({ isActive }) => (
          <>
            <div
              className={[
                'fa-nav-icon-wrap p-2 rounded-xl transition-all duration-300',
                isActive ? '' : 'bg-transparent border border-transparent',
                isPending ? 'fa-nav-icon-wrap--pulse' : '',
              ].join(' ')}
            >
              <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span
              className={[
                'text-[9px] font-bold mt-1 tracking-wide',
                isActive ? 'text-[var(--fa-accent)] fa-text-glow' : '',
              ].join(' ')}
            >
              {item.label}
            </span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <footer className="fa-bottom-nav sticky bottom-0 z-40 w-full pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around w-full px-3 pt-2.5 pb-0.5">
        {items.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>
      <div className="fa-home-indicator" aria-hidden />
    </footer>
  );
}

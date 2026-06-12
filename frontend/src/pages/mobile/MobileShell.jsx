import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { normalizeRole, ROLES } from '../../constants/rbac';
import { LogOut } from 'lucide-react';
import { FieldAppShell, BUYER_NAV } from '../../design-system/field-app';
import '../../design-system/field-app/fieldAppTheme.css';

const MENU = {
  [ROLES.SUPER_ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Harvest', path: '/admin/procurement/harvest' },
    { label: 'Tapals', path: '/admin/tapals' },
    { label: 'Logistics', path: '/admin/logistics' },
    { label: 'Vehicles', path: '/admin/vehicles' },
    { label: 'Buyer', path: '/admin/buyer/dashboard' },
    { label: 'Restaurant', path: '/restaurant/dashboard' },
    { label: 'Fish Mall', path: '/fishmall/dashboard' },
  ],
  [ROLES.PROCUREMENT_MANAGER]: [
    { label: 'Harvest Slips', path: '/mobile/procurement/harvest' },
    { label: 'New Harvest', path: '/mobile/procurement/harvest/new' },
    { label: 'Purchase Invoice', path: '/mobile/procurement/net-rate' },
    { label: 'Create Tapal', path: '/mobile/procurement/tapal' },
  ],
  [ROLES.VEHICLE_MANAGER]: [
    { label: 'Vehicles', path: '/mobile/vehicles' },
    { label: 'Add Vehicle', path: '/mobile/vehicles/new' },
  ],
};

/** Legacy shell for procurement / admin mobile preview — buyer uses FieldAppShell */
function LegacyMobileShell({ user, role, items, viewOnly, onLogout }) {
  useEffect(() => {
    document.body.classList.add('is-field-app');
    return () => document.body.classList.remove('is-field-app');
  }, []);

  return (
    <div className="field-app field-app-viewport min-h-[100dvh] w-full flex flex-col">
      <header className="bg-[var(--fa-surface)] text-[var(--fa-text)] border-b border-[var(--fa-border)] px-4 py-3 flex justify-between items-center sticky top-0 z-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div>
          <p className="text-[10px] uppercase opacity-80">Golden Fisheries</p>
          <p className="font-bold text-sm">{user?.name || user?.fullName}</p>
          <p className="text-[10px]">
            {role.replace(/_/g, ' ')}
            {viewOnly ? ' · VIEW ONLY' : ''}
          </p>
        </div>
        <button type="button" onClick={onLogout} className="p-2" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </header>
      {items.length > 0 && (
        <nav className="grid grid-cols-2 gap-2 p-3 border-b border-[var(--fa-border)]">
          {items.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className="text-center text-xs font-semibold uppercase py-3 px-2 border border-[var(--fa-accent-soft)] text-[var(--fa-accent)] rounded-[var(--fa-radius-md)] fa-tap"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      )}
      <main className="flex-1 p-4 pb-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function MobileShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const role = normalizeRole(user?.role);
  const isBuyer = role === ROLES.BUYER;
  const viewOnly = role === ROLES.SUPER_ADMIN && user?.platformAccess?.mobileViewOnly;

  const handleLogout = async () => {
    await logout();
    navigate('/auth/home');
  };

  if (isBuyer) {
    return <FieldAppShell navItems={BUYER_NAV} />;
  }

  const items = MENU[role] || [];
  return (
    <LegacyMobileShell
      user={user}
      role={role}
      items={items}
      viewOnly={viewOnly}
      onLogout={handleLogout}
    />
  );
}

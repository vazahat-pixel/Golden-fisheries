import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { normalizeRole, ROLES } from '../../constants/rbac';
import { LogOut } from 'lucide-react';

const MENU = {
  [ROLES.SUPER_ADMIN]: [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Harvest Monitor', path: '/admin/procurement/harvest' },
    { label: 'Tapals', path: '/admin/tapals' },
    { label: 'Trips', path: '/admin/logistics' },
    { label: 'Buyer Portal', path: '/buyer/dashboard' },
    { label: 'Fish Mall', path: '/fishmall/dashboard' },
    { label: 'Restaurant', path: '/restaurant/dashboard' },
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
  [ROLES.BUYER]: [
    { label: 'Dashboard', path: '/buyer/dashboard' },
    { label: 'Tapals', path: '/buyer/tapals' },
    { label: 'Bills', path: '/buyer/invoices' },
    { label: 'Returns', path: '/buyer/returns' },
    { label: 'Settlement', path: '/buyer/reconciliation' },
  ],
  [ROLES.DRIVER]: [
    { label: 'Dashboard', path: '/driver/dashboard' },
    { label: 'Active Trip', path: '/driver/active-trip' },
    { label: 'History', path: '/driver/history' },
    { label: 'Expenses', path: '/driver/expenses' },
  ],
};

export default function MobileShell() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const role = normalizeRole(user?.role);
  const items = MENU[role] || [];
  const viewOnly = role === ROLES.SUPER_ADMIN && user?.platformAccess?.mobileViewOnly;

  const handleLogout = async () => {
    await logout();
    navigate('/auth/home');
  };

  return (
    <div className="min-h-screen bg-[#f4f4f0] flex flex-col max-w-lg mx-auto border-x border-gray-300">
      <header className="bg-[#6A7051] text-white px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div>
          <p className="text-[10px] uppercase opacity-80">Golden Fisheries</p>
          <p className="font-bold text-sm">{user?.name || user?.fullName}</p>
          <p className="text-[10px]">{role.replace(/_/g, ' ')}{viewOnly ? ' · VIEW ONLY' : ''}</p>
        </div>
        <button type="button" onClick={handleLogout} className="p-2" aria-label="Logout">
          <LogOut size={20} />
        </button>
      </header>
      {items.length > 0 && (
        <nav className="grid grid-cols-2 gap-2 p-3 bg-white border-b border-gray-200">
          {items.map((m) => (
            <Link
              key={m.path}
              to={m.path}
              className="text-center text-xs font-semibold uppercase py-3 px-2 border border-[#6A7051] text-[#6A7051] active:bg-[#6A7051] active:text-white"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      )}
      <main className="flex-1 p-3 pb-8">
        <Outlet />
      </main>
    </div>
  );
}

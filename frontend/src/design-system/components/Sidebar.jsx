import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import {
  LayoutDashboard, ClipboardList, Sprout, Package, Truck,
  IndianRupee, ReceiptText, Receipt, Settings, LogOut, Bell,
  ChevronLeft, ChevronRight, UserPlus, Store, Shield,
  AlertTriangle, ShoppingCart, FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';

const allNavItems = [
  // ─── ADMIN / MANAGER / ACCOUNTANT ──────────────────────────────────
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/admin/dashboard',             roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { icon: Sprout,          label: 'Harvest',         path: '/admin/procurement/harvest',   roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'PROCUREMENT_MANAGER'] },
  { icon: ClipboardList,   label: 'Tapals',          path: '/admin/tapals',                roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT', 'PROCUREMENT_MANAGER'] },
  { icon: ClipboardList,   label: 'Sales Approval',  path: '/admin/sales-approval',        roles: ['ADMIN', 'MANAGER'] },
  { icon: Package,         label: 'Inventory',       path: '/admin/inventory',             roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { icon: Truck,           label: 'Logistics',       path: '/admin/logistics',             roles: ['ADMIN', 'MANAGER'] },
  { icon: UserPlus,        label: 'Drivers',         path: '/admin/logistics/drivers',     roles: ['ADMIN', 'MANAGER'] },
  { icon: Truck,           label: 'Driver Console',  path: '/admin/logistics/control',     roles: ['ADMIN', 'MANAGER'] },
  // ─── VEHICLE MANAGER ────────────────────────────────────────────────
  { icon: Truck,           label: 'Vehicle Fleet',   path: '/admin/vehicles',              roles: ['ADMIN', 'MANAGER', 'VEHICLE_MANAGER'] },
  { icon: AlertTriangle,   label: 'Vehicle Alerts',  path: '/admin/vehicles/alerts',       roles: ['ADMIN', 'MANAGER', 'VEHICLE_MANAGER'] },
  // ─── PROCUREMENT MANAGER ────────────────────────────────────────────
  { icon: FileText,        label: 'Net Rate',        path: '/admin/procurement/net-rate',  roles: ['ADMIN', 'MANAGER', 'PROCUREMENT_MANAGER'] },
  // ─── FINANCE ────────────────────────────────────────────────────────
  { icon: Store,           label: 'Outlets',         path: '/admin/outlets',               roles: ['ADMIN', 'MANAGER'] },
  { icon: IndianRupee,     label: 'Finance',         path: '/admin/finance',               roles: ['ADMIN', 'ACCOUNTANT'] },
  { icon: Receipt,         label: 'Expenses',        path: '/admin/expenses',              roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'], badge: 'expenses' },
  { icon: ReceiptText,     label: 'Billing',         path: '/admin/billing',               roles: ['ADMIN', 'ACCOUNTANT'] },
  { icon: Shield,          label: 'Access Control',  path: '/admin/access',                roles: ['ADMIN'], highlight: true },
  { icon: Settings,        label: 'Settings',        path: '/admin/settings',              roles: ['ADMIN'] },
];

export const Sidebar = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { expenses } = useAdminStore();

  const userName = user?.name || user?.fullName || 'Admin';
  const userRole = user?.role || 'ADMIN';

  const pendingExpenseCount = expenses.filter(e => e.status === 'Pending').length;
  const filteredNavItems = allNavItems.filter(item => item.roles.includes(userRole));

  // Role-specific home label
  const roleLabel = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    ACCOUNTANT: 'ACCOUNTANT',
    PROCUREMENT_MANAGER: 'PROCUREMENT MGR',
    VEHICLE_MANAGER: 'VEHICLE MGR',
  }[userRole] || userRole;

  return (
    <div className={twMerge(
      'h-full bg-white flex flex-col text-text-primary overflow-y-auto border-r border-card-border transition-all duration-300',
      isCollapsed ? 'w-20' : 'w-64'
    )}>
      <div className="p-4 flex items-center justify-between border-b border-card-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
            <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          {!isCollapsed && <h1 className="text-xl font-serif italic font-black tracking-tight text-primary whitespace-nowrap">Golden</h1>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 text-text-muted hover:text-black transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Role badge when not collapsed */}
      {!isCollapsed && (
        <div className="px-4 py-2 border-b border-card-border bg-slate-50">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] text-slate-400">{roleLabel}</span>
        </div>
      )}

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-x-hidden">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => { if (window.innerWidth < 1024) onClose?.(); }}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => twMerge(
              'flex items-center gap-4 py-4 rounded-none transition-all duration-300 group border-l-4 border-transparent',
              isCollapsed ? 'px-0 justify-center' : 'px-6',
              isActive
                ? 'bg-black text-white border-black font-black'
                : item.highlight
                  ? 'text-[#6B7550] hover:bg-[#6B7550]/5 hover:text-[#6B7550]'
                  : 'text-text-muted hover:bg-olive-50 hover:text-primary'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={twMerge('shrink-0', isActive ? 'text-white' : item.highlight ? 'text-[#6B7550]' : 'text-text-muted group-hover:text-primary')} />
                {!isCollapsed && <span className={twMerge('flex-1 text-[10px] uppercase tracking-widest font-black whitespace-nowrap', item.highlight && !isActive ? 'text-[#6B7550]' : '')}>{item.label}</span>}
                {!isCollapsed && item.badge === 'expenses' && pendingExpenseCount > 0 && (
                  <span className={twMerge('text-[8px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center', isActive ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-700')}>
                    {pendingExpenseCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-card-border space-y-4">
        <div className={twMerge(
          'flex items-center py-4 bg-white rounded-none border border-card-border shadow-subtle group hover:bg-olive-50 transition-all cursor-pointer overflow-hidden',
          isCollapsed ? 'justify-center px-0' : 'px-3 gap-3'
        )} title={isCollapsed ? `${userName} ${roleLabel}` : undefined}>
          <div className="w-10 h-10 shrink-0 rounded-none bg-accent-olive flex items-center justify-center text-white font-black overflow-hidden shadow-sm border border-card-border">
            <img src={`https://ui-avatars.com/api/?name=${userName}&background=5F6846&color=fff`} alt="User" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate text-text-primary uppercase tracking-tight">{userName}</p>
                <p className="text-[8px] text-text-muted truncate uppercase tracking-widest font-black">{roleLabel}</p>
              </div>
              <button onClick={() => logout()} className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

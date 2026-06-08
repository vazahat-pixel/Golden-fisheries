import React, { useState, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { BUYER_ADMIN_NAV_ITEMS, FULL_ADMIN_NAV_ITEMS } from '../../config/adminNavigation';
import { hasModulePermission, isSuperAdminUser } from '../../utils/permissions';
import { normalizeRole, ROLES } from '../../constants/rbac';

export const Sidebar = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const { expenses } = useAdminStore();

  const userName = user?.name || user?.fullName || 'Admin';
  const userRole = user?.role || 'ADMIN';
  const normalized = normalizeRole(userRole);

  const pendingExpenseCount = expenses.filter((e) => e.status === 'Pending').length;

  const filteredNavItems = useMemo(() => {
    if (!user) return [];
    const role = normalizeRole(user.role);
    const isBuyerOnly = role === ROLES.BUYER;
    const pool = isBuyerOnly ? BUYER_ADMIN_NAV_ITEMS : FULL_ADMIN_NAV_ITEMS;
    const seen = new Set();

    return pool.filter((item) => {
      if (seen.has(item.path)) return false;
      seen.add(item.path);

      if (item.roles?.length && !item.roles.includes(role) && !item.roles.includes(userRole)) {
        return false;
      }

      if (isSuperAdminUser(user)) return true;
      if (!item.module) return true;
      return hasModulePermission(user, item.module, 'read');
    });
  }, [user, userRole]);

  const roleLabel =
    {
      SUPER_ADMIN: 'SUPER ADMIN',
      ADMIN: 'SUPER ADMIN',
      PROCUREMENT_MANAGER: 'PROCUREMENT',
      BUYER: 'BUYER',
      VEHICLE_MANAGER: 'VEHICLE MGR',
      MANAGER: 'MANAGER',
      ACCOUNTANT: 'FINANCE',
    }[normalized] || userRole;

  return (
    <div
      className={twMerge(
        'h-full bg-sidebar-bg flex flex-col text-text-primary overflow-y-auto border-r border-card-border shadow-erp-sm transition-all duration-300 overscroll-contain',
        isCollapsed ? 'w-[56px]' : 'w-56'
      )}
    >
      <div className="h-12 px-3 flex items-center justify-between border-b border-card-border bg-surface-muted">
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-8 h-8 object-contain shrink-0" />
          {!isCollapsed && (
            <h1 className="text-sm font-semibold text-text-primary truncate">Golden Fisheries</h1>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="px-3 py-1.5 border-b border-card-border bg-accent/5">
          <span className="text-[10px] font-medium text-text-muted">{roleLabel}</span>
        </div>
      )}

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-x-hidden">
        {filteredNavItems.length === 0 ? (
          <p className="text-[10px] text-slate-400 px-3 uppercase tracking-widest">
            No modules assigned. Contact admin.
          </p>
        ) : (
          filteredNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (window.innerWidth < 1024) onClose?.();
              }}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                twMerge(
                  'flex items-center rounded-erp transition-colors text-erp-sm font-medium border-l-2',
                  isCollapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-2',
                  isActive
                    ? 'bg-accent/10 text-accent border-accent'
                    : item.highlight
                      ? 'text-accent hover:bg-accent/5 border-transparent'
                      : 'text-text-muted hover:bg-surface-hover hover:text-text-primary border-transparent'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={16} className="shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge === 'expenses' && pendingExpenseCount > 0 && (
                    <span
                      className={twMerge(
                        'text-[8px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center',
                        isActive ? 'bg-amber-400 text-black' : 'bg-amber-100 text-amber-700'
                      )}
                    >
                      {pendingExpenseCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))
        )}
      </nav>

      <div className="p-2 mt-auto border-t border-card-border">
        <div
          className={twMerge(
            'flex items-center rounded-erp border border-card-border bg-white p-1.5 shadow-erp-sm',
            isCollapsed ? 'justify-center' : 'gap-2'
          )}
          title={isCollapsed ? `${userName} ${roleLabel}` : undefined}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=5F6846&color=fff&size=32`}
            alt=""
            className="w-8 h-8 shrink-0 rounded-erp"
          />
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{userName}</p>
                <p className="text-[10px] text-text-muted truncate">{roleLabel}</p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1 text-text-muted hover:text-danger"
                aria-label="Sign out"
              >
                <LogOut size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

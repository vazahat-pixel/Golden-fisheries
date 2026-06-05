import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { socketService } from '../../services/socketService';
import { cn } from '../utils/cn';
import { LoadingFallback } from '../components/LoadingFallback';
import { useFishMallStore } from '../../store/fishMallStore';
import { useRestaurantStore } from '../../store/restaurantStore';
import { NotificationDropdown } from '../components/NotificationDropdown';
import { SearchInput } from '../components/Input';
import { useAuthStore } from '../../store/authStore';

export const PanelLayout = ({
  children,
  navItems,
  panelName,
  userName: userNameProp,
  panelKind = 'fishmall',
}) => {
  const navigate = useNavigate();
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const userName = userNameProp || authUser?.name || authUser?.fullName || 'Operator';

  const handleSignOut = async () => {
    await logout();
    socketService.disconnect();
    if (panelKind === 'restaurant') navigate('/restaurant/auth', { replace: true });
    else if (panelKind === 'fishmall') navigate('/fishmall/auth', { replace: true });
    else navigate('/auth/home', { replace: true });
  };
  const fishUnread = useFishMallStore((s) => s.alerts.filter((a) => !a.read).length);
  const restUnread = useRestaurantStore((s) => s.alerts.filter((a) => !a.read).length);
  const unreadAlerts = panelKind === 'restaurant' ? restUnread : fishUnread;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-page-bg">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 z-50 lg:z-auto h-screen shrink-0 bg-sidebar-bg flex flex-col border-r border-card-border transition-all duration-200',
          isCollapsed ? 'w-[56px]' : 'w-56',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="h-12 px-3 flex items-center justify-between border-b border-card-border gap-2">
          <div className="flex items-center gap-2 overflow-hidden min-w-0">
            <img
              src="/IMG_8643-removebg-preview.png"
              alt="Logo"
              className="w-8 h-8 object-contain shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-text-primary truncate">{panelName}</h1>
                <span className="erp-caption block">Operations</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1 text-text-muted hover:text-text-primary"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-erp transition-colors text-erp-sm font-medium',
                  isCollapsed ? 'justify-center px-2 py-2' : 'gap-2.5 px-2.5 py-2',
                  isActive
                    ? 'bg-accent/10 text-accent border-l-2 border-accent'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-primary border-l-2 border-transparent'
                )
              }
            >
              <item.icon size={16} className="shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-card-border">
          <div
            className={cn(
              'flex items-center rounded-erp border border-card-border bg-white p-1.5',
              isCollapsed ? 'justify-center' : 'gap-2'
            )}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=5F6846&color=fff&size=32`}
              alt=""
              className="w-8 h-8 shrink-0 rounded-erp"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{userName}</p>
                <p className="text-[10px] text-text-muted">Operator</p>
              </div>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 text-text-muted hover:text-danger hover:bg-red-50 rounded-erp shrink-0"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-11 shrink-0 flex items-center justify-between px-3 md:px-4 bg-white border-b border-card-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="lg:hidden p-1.5 text-text-muted hover:bg-surface-hover rounded-erp"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="erp-h3 hidden sm:block">Console</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                size={14}
              />
              <SearchInput
                placeholder="Search…"
                className="w-48 pl-8 h-8 text-xs"
              />
            </div>
            <NotificationDropdown />
            {unreadAlerts > 0 && (
              <span className="hidden sm:inline erp-caption text-warning font-medium">
                {unreadAlerts} alert{unreadAlerts !== 1 ? 's' : ''}
              </span>
            )}
            <button
              type="button"
              className="p-1.5 text-text-muted hover:bg-surface-hover rounded-erp"
              aria-label="Settings"
            >
              <Settings size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 p-3 md:p-4 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto erp-page">
            <React.Suspense fallback={<LoadingFallback type="content" />}>
              {children}
            </React.Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

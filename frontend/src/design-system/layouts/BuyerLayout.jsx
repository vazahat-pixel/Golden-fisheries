import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, FileText, RotateCcw, History, LogOut, LayoutDashboard, Truck, MapPin, Scale } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ROLES } from '../../constants/rbac';

/** Buyer portal: verification, billing, returns — no admin/procurement screens */
const buyerNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/buyer/dashboard' },
  { icon: ShoppingCart, label: 'Verify Tapals', path: '/buyer/tapals' },
  { icon: FileText, label: 'My Bills', path: '/buyer/invoices' },
  { icon: RotateCcw, label: 'Sales Return', path: '/buyer/returns' },
  { icon: Scale, label: 'Settlement', path: '/buyer/reconciliation' },
];

export const BuyerLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const userName = user?.fullName || user?.name || 'Buyer';
  const role = user?.role;
  const navItems = buyerNav;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-card-border flex flex-col shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-card-border flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-serif italic font-black text-slate-900 leading-none">Golden</h1>
            <p className="text-[7px] font-black uppercase tracking-widest text-accent-olive mt-0.5">Buyer Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-4 rounded-none transition-all duration-300 text-[10px] font-black uppercase tracking-widest border-l-4 ${
                  isActive
                    ? 'bg-black text-white border-black font-black shadow-sm'
                    : 'text-text-muted border-transparent hover:bg-olive-50 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card */}
        <div className="px-4 py-4 border-t border-card-border">
          <div className="flex items-center gap-3 bg-white rounded-none border border-card-border shadow-subtle group hover:bg-olive-50 px-3 py-3 transition-all">
            <div className="w-9 h-9 rounded-none bg-accent-olive flex items-center justify-center text-white font-black text-sm shrink-0 border border-card-border/50">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{userName}</p>
              <p className="text-[7px] font-bold text-accent-olive uppercase tracking-widest">BUYER</p>
            </div>
            <button onClick={() => logout()} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

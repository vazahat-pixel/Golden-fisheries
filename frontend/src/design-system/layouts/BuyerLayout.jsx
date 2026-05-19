import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, FileText, RotateCcw, History, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const buyerNav = [
  { icon: LayoutDashboard, label: 'Dashboard',      path: '/buyer/dashboard' },
  { icon: ShoppingCart,    label: 'Incoming Tapals', path: '/buyer/tapals' },
  { icon: FileText,        label: 'My Bills',        path: '/buyer/invoices' },
  { icon: RotateCcw,       label: 'Sales Return',    path: '/buyer/returns' },
];

export const BuyerLayout = ({ children }) => {
  const { user, logout } = useAuthStore();
  const userName = user?.fullName || user?.name || 'Buyer';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 flex items-center justify-center">
            <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-serif italic font-black text-slate-900 leading-none">Golden</h1>
            <p className="text-[7px] font-black uppercase tracking-widest text-blue-600 mt-0.5">Buyer Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {buyerNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
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
        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-3 py-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-slate-900 uppercase tracking-tight truncate">{userName}</p>
              <p className="text-[7px] font-bold text-blue-600 uppercase tracking-widest">BUYER</p>
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

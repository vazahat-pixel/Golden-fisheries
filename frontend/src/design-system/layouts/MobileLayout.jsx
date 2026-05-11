import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Truck, 
  User,
  Bell,
  History
} from 'lucide-react';
import { LoadingFallback } from '../components/LoadingFallback';

export const MobileLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative shadow-2xl border-x border-gray-100 overflow-hidden font-sans">
      {/* Dynamic Background Blur Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-emerald-100 rounded-full blur-3xl opacity-50 z-0 animate-pulse"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 z-0"></div>

      {/* Mobile Top Header - Full Width Glass */}
      <header className="glass sticky top-0 z-30 border-b border-black/5 safe-top">
        <div className="px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src="/logo.PNG" alt="GF" className="w-10 h-10 object-contain drop-shadow-sm" />
          <div>
            <h1 className="text-xs font-black text-black tracking-tight leading-none">GOLDEN FISHERIES</h1>
            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Fleet Pilot</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/driver/notifications" className="p-2 bg-white/80 rounded-xl text-black shadow-soft border border-white/50 relative hover:scale-105 transition-transform active:scale-95">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border-2 border-white"></span>
          </NavLink>
        </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-20">
        <React.Suspense fallback={<LoadingFallback type="content" />}>
          <Outlet />
        </React.Suspense>
      </main>

      {/* Bottom Navigation - Full Width Sticky */}
      <footer className="glass border-t border-black/5 z-40 safe-bottom">
        <nav className="flex justify-between items-center px-2 py-1">
          {[
            { icon: Home, label: 'Home', path: '/driver/dashboard' },
            { icon: ClipboardList, label: 'Tasks', path: '/driver/tasks' },
            { icon: Truck, label: 'Trip', path: '/driver/active-trip' },
            { icon: History, label: 'Ledger', path: '/driver/expenses' },
            { icon: User, label: 'Account', path: '/driver/profile' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex flex-col items-center gap-1 flex-1 py-2 transition-all duration-300 ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-black text-white shadow-lg' : ''}`}>
                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-black' : 'text-gray-400'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        {/* iOS Home Indicator */}
        <div className="w-24 h-1 bg-black/5 mx-auto mb-1 rounded-full"></div>
      </footer>
    </div>
  );
};

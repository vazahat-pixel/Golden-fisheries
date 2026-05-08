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
    <div className="flex flex-col h-screen bg-page-bg max-w-md mx-auto relative shadow-2xl border-x border-[#E6E2C8] overflow-hidden">
      {/* Mobile Top Header */}
      <header className="px-6 py-5 bg-white flex justify-between items-center sticky top-0 z-10 border-b border-[#E6E2C8]">
        <div className="flex items-center gap-2">
          <img src="/logo.PNG" alt="GF" className="w-8 h-8 object-contain rounded-none" />
          <h1 className="text-lg font-serif italic font-black text-black tracking-tight">GF <span className="text-[#6B7550]">Driver</span></h1>
        </div>
        <button className="p-2 bg-[#E6E2C8]/30 text-[#6B7550] border border-[#E6E2C8] rounded-none relative transition-colors hover:bg-[#6B7550] hover:text-white">
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-none border border-white"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-32">
        <React.Suspense fallback={<LoadingFallback type="content" />}>
          <Outlet />
        </React.Suspense>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-0 right-0 max-w-md mx-auto px-4 z-20">
        <nav className="bg-white shadow-wapixo border border-[#E6E2C8] rounded-full px-2 py-2 flex justify-between items-center">
          {[
            { icon: Home, label: 'Home', path: '/driver/dashboard' },
            { icon: ClipboardList, label: 'Tasks', path: '/driver/tasks' },
            { icon: Truck, label: 'Trip', path: '/driver/active-trip' },
            { icon: History, label: 'History', path: '/driver/history' },
            { icon: User, label: 'Profile', path: '/driver/profile' },
          ].map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `flex items-center gap-2 px-4 py-3 rounded-full transition-all duration-300 ${
                isActive ? 'bg-[#E6E2C8] text-[#6B7550]' : 'text-text-muted hover:bg-gray-50'
              }`}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#6B7550]' : 'text-text-muted'} />
                  {isActive && (
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

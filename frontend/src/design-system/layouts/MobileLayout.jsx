import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Truck, 
  User,
  Bell
} from 'lucide-react';

export const MobileLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50 max-w-md mx-auto relative shadow-2xl border-x border-gray-100 overflow-hidden">
      {/* Mobile Top Header */}
      <header className="px-6 py-5 bg-white flex justify-between items-center sticky top-0 z-10 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
            M
          </div>
          <h1 className="text-lg font-black text-gray-900 tracking-tight">MKE Driver</h1>
        </div>
        <button className="p-2 bg-gray-50 text-gray-400 rounded-xl relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-4 fixed bottom-0 left-0 right-0 max-w-md mx-auto flex justify-between items-center z-20">
        {[
          { icon: Home, label: 'Home', path: '/driver/dashboard' },
          { icon: ClipboardList, label: 'Tasks', path: '/driver/tasks' },
          { icon: Truck, label: 'My Trip', path: '/driver/active-trip' },
          { icon: User, label: 'Profile', path: '/driver/profile' },
        ].map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-primary' : 'text-gray-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

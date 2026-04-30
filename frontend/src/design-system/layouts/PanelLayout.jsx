import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Search, 
  Bell, 
  LogOut,
  LayoutDashboard,
  Menu,
  X
} from 'lucide-react';

export const PanelLayout = ({ children, navItems, panelName, userName = 'Manager' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-page-bg overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-md transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Drawer & Desktop Persistent */}
      <aside className={twMerge(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar-bg flex flex-col text-white transform transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto shrink-0 shadow-2xl lg:shadow-none",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center font-black text-xl shadow-xl shadow-primary/30">
              🐟
            </div>
            <h1 className="text-xl font-black tracking-tight">{panelName}</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 text-blue-300 hover:text-white bg-white/5 rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => twMerge(
                'flex items-center gap-4 px-5 py-4 rounded-[20px] transition-all duration-300 group',
                isActive 
                  ? 'bg-primary text-white shadow-2xl shadow-primary/40 scale-[1.02]' 
                  : 'text-blue-200 hover:bg-white/5 hover:text-white font-bold'
              )}
            >
              <item.icon size={22} className={twMerge("shrink-0 transition-transform group-hover:scale-110")} />
              <span className="text-sm font-black tracking-wide">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <div className="flex items-center gap-4 px-5 py-5 bg-white/5 rounded-[24px] border border-white/5 group hover:bg-white/10 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-primary font-black overflow-hidden border-2 border-white/20 shadow-lg">
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=0066FF&color=fff`} alt="User" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black truncate">{userName}</p>
              <p className="text-[10px] text-blue-400 truncate uppercase font-black tracking-[0.2em]">Manager</p>
            </div>
            <button className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-xl transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-20 flex items-center justify-between px-4 md:px-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
          <div className="flex items-center gap-4 md:gap-8">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 text-gray-900 bg-gray-50 hover:bg-blue-50 rounded-2xl lg:hidden transition-all active:scale-90 shadow-sm"
            >
              <Menu size={24} />
            </button>
            
            <div className="relative w-48 md:w-96 max-w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-primary/10 transition-all shadow-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-6">
            <button className="p-3 text-gray-500 hover:bg-gray-50 hover:text-primary rounded-2xl transition-all relative hidden sm:flex border border-transparent hover:border-gray-100">
              <Bell size={22} />
              <span className="absolute top-3.5 right-3.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
            </button>
            <div className="h-10 w-[1px] bg-gray-100 mx-1 hidden md:block"></div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-gray-900 leading-tight">{userName}</p>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{panelName}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-[18px] bg-primary/10 flex items-center justify-center font-black text-primary shadow-sm overflow-hidden border-2 border-white">
                <img src={`https://ui-avatars.com/api/?name=${userName}&background=0066FF&color=fff`} alt="User" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

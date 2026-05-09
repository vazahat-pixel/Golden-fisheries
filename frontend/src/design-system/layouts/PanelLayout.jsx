import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Bell, Search, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { LoadingFallback } from '../components/LoadingFallback';

export const PanelLayout = ({ children, navItems, panelName, userName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Desktop Sidebar */}
      <aside className={twMerge(
        "hidden lg:flex bg-white flex-col border-r border-card-border sticky top-0 h-screen transition-all duration-300",
        isCollapsed ? "w-20" : "w-72"
      )}>
        <div className="p-4 md:p-6 flex items-center justify-between border-b border-card-border gap-2">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
              <img src="/IMG_8643-removebg-preview.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col whitespace-nowrap">
                <h1 className="text-xl font-serif italic font-black tracking-tight text-primary leading-none">{panelName}</h1>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted mt-1">Operational Portal</span>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            className="hidden lg:flex p-1 text-text-muted hover:text-black transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-x-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) => twMerge(
                'flex items-center py-4 rounded-none transition-all duration-300 group border-l-4 border-transparent',
                isCollapsed ? 'px-0 justify-center' : 'px-6 gap-4',
                isActive 
                  ? 'bg-olive-100 text-primary border-accent-olive font-black shadow-sm' 
                  : 'text-text-muted hover:bg-olive-50 hover:text-primary'
              )}
            >
              <item.icon size={18} className={twMerge("shrink-0", "transition-transform group-hover:scale-110")} />
              {!isCollapsed && <span className="text-[10px] uppercase tracking-[0.2em] font-black whitespace-nowrap">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-card-border">
          <div className={twMerge(
            "flex items-center py-4 bg-white rounded-none border border-card-border shadow-subtle group hover:bg-olive-50 transition-all cursor-pointer overflow-hidden",
            isCollapsed ? "justify-center px-0" : "px-3 gap-3"
          )} title={isCollapsed ? userName : undefined}>
            <div className="w-10 h-10 shrink-0 rounded-none bg-accent-olive flex items-center justify-center text-white font-black border border-card-border">
              <img src={`https://ui-avatars.com/api/?name=${userName}&background=5F6846&color=fff`} alt="User" />
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-black truncate text-text-primary uppercase tracking-tight">{userName}</p>
                  <p className="text-[8px] text-text-muted truncate uppercase tracking-widest font-black">Operator</p>
                </div>
                <Link to="/launchpad" className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
                  <LogOut size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="h-16 flex items-center justify-between px-6 md:px-12 bg-white border-b border-card-border sticky top-0 z-30">
          <div className="flex items-center gap-4 md:gap-8">
            <button className="lg:hidden p-2 text-text-muted hover:bg-olive-50 rounded-none">
              <Menu size={22} />
            </button>
            <h2 className="text-sm md:text-md font-serif italic font-black text-black uppercase tracking-widest">
              Management <span className="text-accent-olive">Console</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 md:gap-8">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input 
                type="text" 
                placeholder="SEARCH OPERATIONS..." 
                className="bg-white border border-card-border rounded-none py-2.5 pl-10 pr-6 text-[10px] font-black focus:ring-1 focus:ring-accent-olive outline-none uppercase tracking-widest w-64 transition-all"
              />
            </div>
            <div className="w-[1px] h-6 bg-card-border mx-2"></div>
            <button className="p-2 text-black hover:bg-olive-50 rounded-none transition-colors">
              <Settings size={18} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto">
            <React.Suspense fallback={<LoadingFallback type="content" />}>
              {children}
            </React.Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Search, Bell, Menu, X } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-page-bg">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-all"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto bg-white",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 md:px-12 bg-white border-b border-card-border sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-text-muted hover:bg-white hover:text-primary rounded-none lg:hidden transition-colors"
            >
              <Menu size={22} />
            </button>
            
            <div className="relative w-48 md:w-[450px] max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
              <input 
                type="text" 
                placeholder="Search system..." 
                className="w-full bg-white border border-card-border rounded-none py-2.5 pl-10 pr-4 text-[11px] focus:ring-1 focus:ring-accent-olive transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden md:block">
              <p className="text-[11px] font-black text-text-primary leading-tight uppercase tracking-tight">Mahesh</p>
              <p className="text-[9px] text-text-muted font-black uppercase tracking-widest">ADMIN</p>
            </div>
            <div className="w-10 h-10 rounded-none bg-[#5F6846] flex items-center justify-center font-black text-white shadow-sm border border-card-border">
              MA
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-page-bg">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

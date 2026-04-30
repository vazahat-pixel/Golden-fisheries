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
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 flex items-center justify-between px-3 md:px-8 bg-white border-b border-card-border sticky top-0 z-30">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 text-gray-500 hover:bg-blue-50 rounded-lg lg:hidden transition-colors"
            >
              <Menu size={22} />
            </button>
            
            <div className="relative w-40 md:w-96 max-w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-blue-50 border-none rounded-xl py-2 pl-9 pr-4 text-xs md:text-sm focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 text-gray-500 hover:bg-blue-50 rounded-lg transition-colors relative hidden xs:flex">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-[1px] bg-gray-200 mx-1 hidden sm:block"></div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-bold text-gray-900 leading-tight">Mahesh</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin</p>
              </div>
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-white shadow-sm overflow-hidden border border-blue-50">
                <img src="https://ui-avatars.com/api/?name=Mahesh+Admin&background=0066FF&color=fff" alt="User" />
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-3 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

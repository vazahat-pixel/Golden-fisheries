import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sprout, 
  Package, 
  Truck, 
  IndianRupee, 
  ReceiptText, 
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Tapals', path: '/admin/tapals' },
  { icon: Sprout, label: 'Harvest', path: '/admin/procurement/harvest' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory' },
  { icon: Truck, label: 'Logistics', path: '/admin/logistics' },
  { icon: UserPlus, label: 'Drivers', path: '/admin/logistics/drivers' },
  { icon: IndianRupee, label: 'Finance', path: '/admin/finance' },
  { icon: ReceiptText, label: 'Billing', path: '/admin/billing' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const Sidebar = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={twMerge(
      "h-full bg-white flex flex-col text-text-primary overflow-y-auto border-r border-card-border transition-all duration-300",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-card-border">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 shrink-0 bg-black flex items-center justify-center text-white">
            <span className="font-black text-xl">GF</span>
          </div>
          {!isCollapsed && <h1 className="text-xl font-serif italic font-black tracking-tight text-primary whitespace-nowrap">Golden</h1>}
        </div>
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="hidden lg:flex p-1.5 text-text-muted hover:text-black transition-colors"
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1 overflow-x-hidden">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) => twMerge(
              'flex items-center gap-4 py-4 rounded-none transition-all duration-300 group border-l-4 border-transparent',
              isCollapsed ? 'px-0 justify-center' : 'px-6',
              isActive 
                ? 'bg-black text-white border-black font-black' 
                : 'text-text-muted hover:bg-olive-50 hover:text-primary'
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon size={16} className={twMerge("shrink-0", isActive ? "text-white" : "text-text-muted group-hover:text-primary")} />
                {!isCollapsed && <span className="text-[10px] uppercase tracking-widest font-black whitespace-nowrap">{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-card-border space-y-4">
        <div className="space-y-1">
          <button 
            className={twMerge(
              "w-full flex items-center py-2 text-text-muted hover:text-primary transition-colors",
              isCollapsed ? "justify-center px-0" : "px-4 gap-3"
            )}
            title={isCollapsed ? "Notifications" : undefined}
          >
            <div className="relative">
              <Bell size={18} />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-black"></div>
            </div>
            {!isCollapsed && <span className="font-black text-[9px] uppercase tracking-widest whitespace-nowrap">Notifications</span>}
          </button>
        </div>
        
        <div className={twMerge(
          "flex items-center py-4 bg-white rounded-none border border-card-border shadow-subtle group hover:bg-olive-50 transition-all cursor-pointer overflow-hidden",
          isCollapsed ? "justify-center px-0" : "px-3 gap-3"
        )} title={isCollapsed ? "Mahesh Admin" : undefined}>
          <div className="w-10 h-10 shrink-0 rounded-none bg-accent-olive flex items-center justify-center text-white font-black overflow-hidden shadow-sm border border-card-border">
            <img src="https://ui-avatars.com/api/?name=Mahesh+Admin&background=5F6846&color=fff" alt="User" />
          </div>
          {!isCollapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate text-text-primary">Mahesh Admin</p>
                <p className="text-[8px] text-text-muted truncate uppercase tracking-widest font-black">Admin</p>
              </div>
              <button className="p-1.5 text-text-muted hover:text-red-500 transition-colors">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

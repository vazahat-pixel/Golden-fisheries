import React from 'react';
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
  X
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: ClipboardList, label: 'Tapals', path: '/admin/tapals' },
  { icon: Sprout, label: 'Harvest', path: '/admin/procurement/harvest' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory' },
  { icon: Truck, label: 'Logistics', path: '/admin/logistics' },
  { icon: IndianRupee, label: 'Finance', path: '/admin/finance' },
  { icon: ReceiptText, label: 'Billing', path: '/admin/billing' },
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export const Sidebar = ({ onClose }) => {
  return (
    <div className="w-64 h-full bg-sidebar-bg flex flex-col text-white overflow-y-auto">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-lg">
            🐟
          </div>
          <h1 className="text-xl font-bold tracking-tight">MKE Seafood</h1>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-blue-300 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) => twMerge(
              'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
              isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-blue-200 hover:bg-white/5 hover:text-white'
            )}
          >
            <item.icon size={20} className="shrink-0" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-white/10 space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-blue-200 hover:text-white transition-colors">
          <Bell size={20} />
          <span className="font-medium text-sm">Notifications</span>
          <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
        </button>
        
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold overflow-hidden border-2 border-white/20">
            <img src="https://ui-avatars.com/api/?name=Mahesh+Admin&background=0066FF&color=fff" alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">Mahesh Admin</p>
            <p className="text-xs text-blue-300 truncate">Administrator</p>
          </div>
          <button className="p-2 text-blue-300 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

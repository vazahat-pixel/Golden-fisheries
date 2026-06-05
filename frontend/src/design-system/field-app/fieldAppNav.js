import { Home, ClipboardList, Truck, User, BarChart2, Package, FileText, BarChart3 } from 'lucide-react';

export const DRIVER_NAV = [
  { icon: Home, label: 'Home', path: '/driver/dashboard' },
  { icon: BarChart2, label: 'Stats', path: '/driver/stats' },
  { icon: ClipboardList, label: 'Tasks', path: '/driver/tasks' },
  { icon: User, label: 'Menu', path: '/driver/profile' },
];

export const BUYER_NAV = [
  { icon: Home, label: 'Home', path: '/mobile/buyer/dashboard' },
  { icon: Package, label: 'Tapals', path: '/mobile/buyer/tapals' },
  { icon: FileText, label: 'Bills', path: '/mobile/buyer/invoices' },
  { icon: BarChart3, label: 'Settle', path: '/mobile/buyer/reconciliation' },
];


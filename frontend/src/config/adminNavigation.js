import {
  LayoutDashboard,
  ClipboardList,
  Sprout,
  Package,
  ArrowRightLeft,
  Truck,
  IndianRupee,
  Receipt,
  Wallet,
  ReceiptText,
  ShoppingCart,
  Store,
  Shield,
  FileText,
  RotateCcw,
  Scale,
  Car,
  Users,
  Radio,
  Settings,
  Sliders,
  UtensilsCrossed,
  Fish,
} from 'lucide-react';

/**
 * Core admin ERP sidebar (procurement, logistics, finance, inventory…).
 * Super Admin / office staff also get BUYER_ADMIN_NAV_ITEMS merged in Sidebar.
 */
export const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', module: 'dashboard' },
  { icon: Sprout, label: 'Harvest Slips', path: '/admin/procurement/harvest', module: 'procurement' },
  { icon: FileText, label: 'Purchase Invoice', path: '/admin/procurement/net-rate', module: 'procurement' },
  { icon: ClipboardList, label: 'Tapals', path: '/admin/tapals', module: 'tapals' },
  { icon: IndianRupee, label: 'Farmer Ledger', path: '/admin/procurement/farmer-ledger', module: 'procurement' },
  { icon: Truck, label: 'Logistics & Trips', path: '/admin/logistics', module: 'logistics' },
  { icon: Car, label: 'Vehicle Management', path: '/admin/vehicles', module: 'logistics' },
  { icon: Users, label: 'Driver Management', path: '/admin/logistics/drivers', module: 'logistics' },
  { icon: Truck, label: 'Assign Driver', path: '/admin/logistics/assign-driver', module: 'logistics' },
  { icon: Radio, label: 'Fleet Control', path: '/admin/logistics/control', module: 'logistics' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses', module: 'finance', badge: 'expenses' },
  { icon: Wallet, label: 'Finance / P&L', path: '/admin/finance', module: 'finance' },
  { icon: ReceiptText, label: 'Billing', path: '/admin/billing', module: 'billing' },
  { icon: ShoppingCart, label: 'Return Approval', path: '/admin/sales-approval', module: 'tapals' },
  { icon: ReceiptText, label: 'Buyer Sales', path: '/admin/buyer-sales', module: 'tapals' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory', module: 'inventory' },
  {
    icon: ArrowRightLeft,
    label: 'Transfer to Fish Mall',
    path: '/admin/inventory/transfer-fishmall',
    module: 'inventory',
  },
  { icon: Store, label: 'Outlets', path: '/admin/outlets', module: 'outlets' },
  { icon: Shield, label: 'Access Control', path: '/admin/access', module: 'accessControl', highlight: true },
  {
    icon: Sliders,
    label: 'System Control',
    path: '/admin/system-control',
    module: 'systemControl',
    roles: ['SUPER_ADMIN', 'ADMIN'],
  },
  { icon: Settings, label: 'Users & Roles', path: '/admin/settings', module: 'settings' },
  {
    icon: UtensilsCrossed,
    label: 'Restaurant Panel',
    path: '/restaurant/dashboard',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'],
  },
  {
    icon: Fish,
    label: 'Fish Mall Panel',
    path: '/fishmall/dashboard',
    roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'],
  },
];

/** Buyer workflows inside admin ERP (visible to Super Admin + BUYER role) */
export const BUYER_ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Buyer Dashboard', path: '/admin/buyer/dashboard', module: 'buyerDashboard' },
  { icon: ShoppingCart, label: 'Buyer — Verify Tapals', path: '/admin/buyer/tapals', module: 'buyerVerify' },
  { icon: FileText, label: 'Buyer — My Bills', path: '/admin/buyer/invoices', module: 'buyerBills' },
  { icon: RotateCcw, label: 'Buyer — Sales Return', path: '/admin/buyer/returns', module: 'buyerReturns' },
  { icon: Scale, label: 'Buyer — Settlement', path: '/admin/buyer/reconciliation', module: 'buyerSettlement' },
];

export const BUYER_NAV_MODULES = BUYER_ADMIN_NAV_ITEMS.map((i) => i.module);

/** Full sidebar for office / Super Admin (no duplicate paths) */
export const FULL_ADMIN_NAV_ITEMS = [...ADMIN_NAV_ITEMS, ...BUYER_ADMIN_NAV_ITEMS];

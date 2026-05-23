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
} from 'lucide-react';

/** All admin ERP sidebar entries — visibility driven by permissions.modules[module].read */
export const ADMIN_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard', module: 'dashboard' },
  { icon: Sprout, label: 'Harvest Slips', path: '/admin/procurement/harvest', module: 'procurement' },
  { icon: FileText, label: 'Purchase Invoice', path: '/admin/procurement/net-rate', module: 'procurement' },
  { icon: ClipboardList, label: 'Tapals', path: '/admin/tapals', module: 'tapals' },
  { icon: IndianRupee, label: 'Farmer Ledger', path: '/admin/procurement/farmer-ledger', module: 'procurement' },
  { icon: Truck, label: 'Logistics', path: '/admin/logistics', module: 'logistics' },
  { icon: Truck, label: 'Assign Driver', path: '/admin/logistics/assign-driver', module: 'logistics' },
  { icon: Receipt, label: 'Expenses', path: '/admin/expenses', module: 'finance', badge: 'expenses' },
  { icon: Wallet, label: 'Finance / P&L', path: '/admin/finance', module: 'finance' },
  { icon: ReceiptText, label: 'Billing', path: '/admin/billing', module: 'billing' },
  { icon: ShoppingCart, label: 'Return Approval', path: '/admin/sales-approval', module: 'tapals' },
  { icon: Package, label: 'Inventory', path: '/admin/inventory', module: 'inventory' },
  {
    icon: ArrowRightLeft,
    label: 'Transfer to Fish Mall',
    path: '/admin/inventory/transfer-fishmall',
    module: 'inventory',
  },
  { icon: Store, label: 'Outlets', path: '/admin/outlets', module: 'outlets' },
  { icon: Shield, label: 'Access Control', path: '/admin/access', module: 'accessControl', highlight: true },
  // Buyer workflows inside main admin ERP
  { icon: LayoutDashboard, label: 'Buyer Dashboard', path: '/admin/buyer/dashboard', module: 'buyerDashboard' },
  { icon: ShoppingCart, label: 'Verify Tapals', path: '/admin/buyer/tapals', module: 'buyerVerify' },
  { icon: Truck, label: 'Assign Driver', path: '/admin/buyer/assign-driver', module: 'buyerVerify' },
  { icon: FileText, label: 'My Bills', path: '/admin/buyer/invoices', module: 'buyerBills' },
  { icon: RotateCcw, label: 'Sales Return', path: '/admin/buyer/returns', module: 'buyerReturns' },
  { icon: Scale, label: 'Settlement', path: '/admin/buyer/reconciliation', module: 'buyerSettlement' },
];

export const BUYER_NAV_MODULES = [
  'buyerDashboard',
  'buyerVerify',
  'buyerBills',
  'buyerReturns',
  'buyerSettlement',
];

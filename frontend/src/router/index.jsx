import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminLayout } from '../design-system/layouts/AdminLayout';
import { PanelLayout } from '../design-system/layouts/PanelLayout';
import { 
  LayoutDashboard, 
  Utensils, 
  ShoppingCart, 
  Scale, 
  Layers, 
  ClipboardList,
  Settings
} from 'lucide-react';

// Auth Imports
import AdminAuth from '../panels/auth/AdminAuth';
import RestaurantAuth from '../panels/auth/RestaurantAuth';
import FishMallAuth from '../panels/auth/FishMallAuth';
import DriverAuth from '../panels/auth/DriverAuth';
import ProtectedRoute from '../panels/auth/ProtectedRoute';
import { useAuthStore } from '../store/authStore';

// Admin Imports
import AdminDashboard from '../panels/admin/Dashboard';
import TapalList from '../panels/admin/tapals/TapalList';
import CreatePurchaseTapal from '../panels/admin/tapals/CreatePurchaseTapal';
import CreateSalesTapal from '../panels/admin/tapals/CreateSalesTapal';
import TapalDetail from '../panels/admin/tapals/TapalDetail';
import InventoryOverview from '../panels/admin/inventory/InventoryOverview';
import DriverManagement from '../panels/admin/logistics/DriverManagement';
import TripsAndExpenses from '../panels/admin/logistics/TripsAndExpenses';
import VehicleDocuments from '../panels/admin/logistics/VehicleDocuments';
import FinanceOverview from '../panels/admin/finance/FinanceOverview';
import HarvestSlips from '../panels/admin/procurement/HarvestSlips';
import CreateHarvestSlip from '../panels/admin/procurement/CreateHarvestSlip';
import HarvestSlipDetail from '../panels/admin/procurement/HarvestSlipDetail';
import UsersAndRoles from '../panels/admin/settings/UsersAndRoles';
import AdminBilling from '../panels/admin/billing/AdminBilling';

// Restaurant Imports
import RestaurantDashboard from '../panels/restaurant/RestaurantDashboard';
import RestaurantPOS from '../panels/restaurant/RestaurantPOS';
import RestaurantOrderHistory from '../panels/restaurant/RestaurantOrderHistory';
import RestaurantInventory from '../panels/restaurant/RestaurantInventory';
import RestaurantSettings from '../panels/restaurant/RestaurantSettings';

// Fish Mall Imports
import FishMallDashboard from '../panels/fishmall/FishMallDashboard';
import FishMallBilling from '../panels/fishmall/FishMallBilling';
import FishMallRates from '../panels/fishmall/FishMallRates';
import FishMallStock from '../panels/fishmall/FishMallStock';

// Driver Imports
import { MobileLayout } from '../design-system/layouts/MobileLayout';
import DriverDashboard from '../panels/driver/DriverDashboard';
import DriverTasks from '../panels/driver/DriverTasks';
import ActiveTrip from '../panels/driver/ActiveTrip';
import DriverProfile from '../panels/driver/DriverProfile';

// Public Imports
import BuyerBilling from '../panels/public/BuyerBilling';
import Launchpad from '../pages/Launchpad';

const restaurantNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard' },
  { icon: Utensils, label: 'POS Billing', path: '/restaurant/pos' },
  { icon: ShoppingCart, label: 'Order History', path: '/restaurant/orders' },
  { icon: ClipboardList, label: 'Inventory', path: '/restaurant/inventory' },
  { icon: Settings, label: 'Settings', path: '/restaurant/settings' },
];

const fishMallNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/fishmall/dashboard' },
  { icon: Scale, label: 'Weight Billing', path: '/fishmall/billing' },
  { icon: Layers, label: 'Current Rates', path: '/fishmall/rates' },
  { icon: ClipboardList, label: 'Stock Inflow', path: '/fishmall/stock' },
];

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/launchpad" replace />} />
      <Route path="/launchpad" element={<Launchpad />} />
      
      {/* Admin Panel */}
      <Route path="/admin/*" element={
        <Routes>
          <Route path="auth" element={<AdminAuth />} />
          <Route element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tapals" element={<TapalList />} />
            <Route path="tapals/purchase/new" element={<CreatePurchaseTapal />} />
            <Route path="tapals/sales/new" element={<CreateSalesTapal />} />
            <Route path="tapals/:id" element={<TapalDetail />} />
            <Route path="procurement/harvest" element={<HarvestSlips />} />
            <Route path="procurement/harvest/new" element={<CreateHarvestSlip />} />
            <Route path="procurement/harvest/:id" element={<HarvestSlipDetail />} />
            <Route path="inventory" element={<InventoryOverview />} />
            <Route path="logistics" element={<TripsAndExpenses />} />
            <Route path="logistics/drivers" element={<DriverManagement />} />
            <Route path="logistics/vehicles" element={<VehicleDocuments />} />
            <Route path="finance" element={<FinanceOverview />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="settings" element={<UsersAndRoles />} />
          </Route>
        </Routes>
      } />

      {/* Restaurant Panel */}
      <Route path="/restaurant/*" element={
        <Routes>
          <Route path="auth" element={<RestaurantAuth />} />
          <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'BILLING']}><Outlet /></ProtectedRoute>}>
            <Route path="pos" element={<RestaurantPOS />} />
            <Route element={<PanelLayout navItems={restaurantNav} panelName="GF Restaurant" userName="Suresh"><Outlet /></PanelLayout>}>
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="orders" element={<RestaurantOrderHistory />} />
              <Route path="inventory" element={<RestaurantInventory />} />
              <Route path="settings" element={<RestaurantSettings />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* Fish Mall Panel */}
      <Route path="/fishmall/*" element={
        <Routes>
          <Route path="auth" element={<FishMallAuth />} />
          <Route element={
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER', 'BILLING']}>
              <PanelLayout navItems={fishMallNav} panelName="GF Fish Mall" userName="Ramesh">
                <Outlet />
              </PanelLayout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<FishMallDashboard />} />
            <Route path="billing" element={<FishMallBilling />} />
            <Route path="rates" element={<FishMallRates />} />
            <Route path="stock" element={<FishMallStock />} />
          </Route>
        </Routes>
      } />

      {/* Driver App Panel */}
      <Route path="/driver/*" element={
        <Routes>
          <Route path="auth" element={<DriverAuth />} />
          <Route element={
            <ProtectedRoute allowedRoles={['ADMIN', 'DRIVER']}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route element={<MobileLayout />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="tasks" element={<DriverTasks />} />
              <Route path="active-trip" element={<ActiveTrip />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* Public Routes */}
      <Route path="/pay/:invoiceId" element={<BuyerBilling />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

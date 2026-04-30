import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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

const ProtectedRoute = ({ children }) => children;

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
        <ProtectedRoute>
          <AdminLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="tapals" element={<TapalList />} />
              <Route path="tapals/purchase/new" element={<CreatePurchaseTapal />} />
              <Route path="tapals/sales/new" element={<CreateSalesTapal />} />
              <Route path="tapals/:id" element={<TapalDetail />} />
              <Route path="procurement/harvest" element={<HarvestSlips />} />
              <Route path="inventory" element={<InventoryOverview />} />
              <Route path="logistics" element={<TripsAndExpenses />} />
              <Route path="logistics/drivers" element={<DriverManagement />} />
              <Route path="logistics/vehicles" element={<VehicleDocuments />} />
              <Route path="finance" element={<FinanceOverview />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="settings" element={<UsersAndRoles />} />
            </Routes>
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Restaurant Panel */}
      <Route path="/restaurant/*" element={
        <ProtectedRoute>
          <Routes>
            <Route path="pos" element={<RestaurantPOS />} />
            <Route path="*" element={
              <PanelLayout navItems={restaurantNav} panelName="MKE Restaurant" userName="Suresh">
                <Routes>
                  <Route path="dashboard" element={<RestaurantDashboard />} />
                  <Route path="orders" element={<RestaurantOrderHistory />} />
                  <Route path="inventory" element={<RestaurantInventory />} />
                  <Route path="settings" element={<RestaurantSettings />} />
                </Routes>
              </PanelLayout>
            } />
          </Routes>
        </ProtectedRoute>
      } />

      {/* Fish Mall Panel */}
      <Route path="/fishmall/*" element={
        <ProtectedRoute>
          <PanelLayout navItems={fishMallNav} panelName="MKE Fish Mall" userName="Ramesh">
            <Routes>
              <Route path="dashboard" element={<FishMallDashboard />} />
              <Route path="billing" element={<FishMallBilling />} />
              <Route path="rates" element={<FishMallRates />} />
              <Route path="stock" element={<FishMallStock />} />
            </Routes>
          </PanelLayout>
        </ProtectedRoute>
      } />

      {/* Driver App Panel */}
      <Route path="/driver/*" element={
        <ProtectedRoute>
          <Routes>
            <Route element={<MobileLayout />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="tasks" element={<DriverTasks />} />
              <Route path="active-trip" element={<ActiveTrip />} />
              <Route path="profile" element={<DriverProfile />} />
            </Route>
          </Routes>
        </ProtectedRoute>
      } />

      {/* Public Routes */}
      <Route path="/pay/:invoiceId" element={<BuyerBilling />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

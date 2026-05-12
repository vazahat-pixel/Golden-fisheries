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
  Settings,
  ChefHat,
  Wallet,
  BarChart2,
  ClipboardCheck,
  AlertTriangle
} from 'lucide-react';

// Auth Imports
const AdminAuth = React.lazy(() => import('../panels/auth/AdminAuth'));
const RestaurantAuth = React.lazy(() => import('../panels/auth/RestaurantAuth'));
const FishMallAuth = React.lazy(() => import('../panels/auth/FishMallAuth'));
const DriverAuth = React.lazy(() => import('../panels/auth/DriverAuth'));
import ProtectedRoute from '../panels/auth/ProtectedRoute';
import { useAuthStore } from '../store/authStore';

// Admin Imports
const AdminDashboard = React.lazy(() => import('../panels/admin/Dashboard'));
const TapalList = React.lazy(() => import('../panels/admin/tapals/TapalList'));
const CreatePurchaseTapal = React.lazy(() => import('../panels/admin/tapals/CreatePurchaseTapal'));
const CreateSalesTapal = React.lazy(() => import('../panels/admin/tapals/CreateSalesTapal'));
const TapalDetail = React.lazy(() => import('../panels/admin/tapals/TapalDetail'));
const InventoryOverview = React.lazy(() => import('../panels/admin/inventory/InventoryOverview'));
const AddInventoryItem = React.lazy(() => import('../panels/admin/inventory/AddInventoryItem'));
const DriverManagement = React.lazy(() => import('../panels/admin/logistics/DriverManagement'));
const TripsAndExpenses = React.lazy(() => import('../panels/admin/logistics/TripsAndExpenses'));
const VehicleDocuments = React.lazy(() => import('../panels/admin/logistics/VehicleDocuments'));
const FinanceOverview = React.lazy(() => import('../panels/admin/finance/FinanceOverview'));
const HarvestSlips = React.lazy(() => import('../panels/admin/procurement/HarvestSlips'));
const CreateHarvestSlip = React.lazy(() => import('../panels/admin/procurement/CreateHarvestSlip'));
const HarvestSlipDetail = React.lazy(() => import('../panels/admin/procurement/HarvestSlipDetail'));
const UsersAndRoles = React.lazy(() => import('../panels/admin/settings/UsersAndRoles'));
const AdminBilling = React.lazy(() => import('../panels/admin/billing/AdminBilling'));
const SalesApprovalList = React.lazy(() => import('../panels/admin/sales/SalesApprovalList'));
const SalesApprovalDetail = React.lazy(() => import('../panels/admin/sales/SalesApprovalDetail'));
const OutletManagement = React.lazy(() => import('../panels/admin/outlets/OutletManagement'));
const AccessControl = React.lazy(() => import('../panels/admin/access/AccessControl'));

// Vehicle Management Imports
const VehicleDashboard = React.lazy(() => import('../panels/admin/vehicles/VehicleDashboard'));
const AddVehicle = React.lazy(() => import('../panels/admin/vehicles/AddVehicle'));
const VehicleDetail = React.lazy(() => import('../panels/admin/vehicles/VehicleDetail'));

// Restaurant Imports
const RestaurantDashboard = React.lazy(() => import('../panels/restaurant/RestaurantDashboard'));
const RestaurantPOS = React.lazy(() => import('../panels/restaurant/RestaurantPOS'));
const RestaurantOrderHistory = React.lazy(() => import('../panels/restaurant/RestaurantOrderHistory'));
const RestaurantInventory = React.lazy(() => import('../panels/restaurant/RestaurantInventory'));
const RestaurantKitchen = React.lazy(() => import('../panels/restaurant/RestaurantKitchen'));
const RestaurantSettings = React.lazy(() => import('../panels/restaurant/RestaurantSettings'));

// Fish Mall Imports
const FishMallDashboard = React.lazy(() => import('../panels/fishmall/FishMallDashboard'));
const FishMallBilling = React.lazy(() => import('../panels/fishmall/FishMallBilling'));
const FishMallRates = React.lazy(() => import('../panels/fishmall/FishMallRates'));
const FishMallStock = React.lazy(() => import('../panels/fishmall/FishMallStock'));
const FishMallExpenses = React.lazy(() => import('../panels/fishmall/FishMallExpenses'));
const FishMallReports = React.lazy(() => import('../panels/fishmall/FishMallReports'));
const FishMallClosing = React.lazy(() => import('../panels/fishmall/FishMallClosing'));
const FishMallAlerts = React.lazy(() => import('../panels/fishmall/FishMallAlerts'));

// Driver Imports
import { MobileLayout } from '../design-system/layouts/MobileLayout';
const DriverDashboard = React.lazy(() => import('../panels/driver/DriverDashboard'));
const DriverTasks = React.lazy(() => import('../panels/driver/DriverTasks'));
const ActiveTrip = React.lazy(() => import('../panels/driver/ActiveTrip'));
const DriverHistory = React.lazy(() => import('../panels/driver/DriverHistory'));
const DriverProfile = React.lazy(() => import('../panels/driver/DriverProfile'));
const DriverExpenses = React.lazy(() => import('../panels/driver/DriverExpenses'));
const DriverDocuments = React.lazy(() => import('../panels/driver/DriverDocuments'));
const DriverNotifications = React.lazy(() => import('../panels/driver/DriverNotifications'));
const DriverLiveTracking = React.lazy(() => import('../panels/driver/DriverLiveTracking'));
const DriverAlerts = React.lazy(() => import('../panels/driver/DriverAlerts'));
const DriverSettings = React.lazy(() => import('../panels/driver/DriverSettings'));
const DriverSupport = React.lazy(() => import('../panels/driver/DriverSupport'));
const DriverAddExpense = React.lazy(() => import('../panels/driver/DriverAddExpense'));


// Public Imports
const BuyerBilling = React.lazy(() => import('../panels/public/BuyerBilling'));
const Launchpad = React.lazy(() => import('../pages/Launchpad'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));

const restaurantNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard' },
  { icon: Utensils, label: 'POS Billing', path: '/restaurant/pos' },
  { icon: ChefHat, label: 'Kitchen', path: '/restaurant/kitchen' },
  { icon: ShoppingCart, label: 'Order History', path: '/restaurant/orders' },
  { icon: ClipboardList, label: 'Inventory', path: '/restaurant/inventory' },
  { icon: Settings, label: 'Settings', path: '/restaurant/settings' },
];

const fishMallNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/fishmall/dashboard' },
  { icon: Scale, label: 'Weight Billing', path: '/fishmall/billing' },
  { icon: Wallet, label: 'Expenses', path: '/fishmall/expenses' },
  { icon: BarChart2, label: 'Reports', path: '/fishmall/reports' },
  { icon: ClipboardCheck, label: 'Daily Closing', path: '/fishmall/closing' },
  { icon: AlertTriangle, label: 'Alerts', path: '/fishmall/alerts' },
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
            <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="tapals" element={<TapalList />} />
            <Route path="tapals/purchase/new" element={<CreatePurchaseTapal />} />
            <Route path="tapals/sales/new" element={<CreateSalesTapal />} />
            <Route path="tapals/:id" element={<TapalDetail />} />
            <Route path="sales-approval" element={<SalesApprovalList />} />
            <Route path="sales-approval/:id" element={<SalesApprovalDetail />} />
            <Route path="procurement/harvest" element={<HarvestSlips />} />
            <Route path="procurement/harvest/new" element={<CreateHarvestSlip />} />
            <Route path="procurement/harvest/:id" element={<HarvestSlipDetail />} />
            <Route path="inventory" element={<InventoryOverview />} />
            <Route path="inventory/new" element={<AddInventoryItem />} />
            <Route path="logistics" element={<TripsAndExpenses />} />
            <Route path="logistics/drivers" element={<DriverManagement />} />
            <Route path="logistics/vehicles" element={<Navigate to="/admin/vehicles" replace />} />
            <Route path="vehicles" element={<VehicleDashboard />} />
            <Route path="vehicles/new" element={<AddVehicle />} />
            <Route path="vehicles/:id" element={<VehicleDetail />} />
            <Route path="finance" element={<FinanceOverview />} />
            <Route path="billing" element={<AdminBilling />} />
            <Route path="outlets" element={<OutletManagement />} />
            <Route path="settings" element={<UsersAndRoles />} />
            <Route path="access" element={<AccessControl />} />
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
              <Route path="kitchen" element={<RestaurantKitchen />} />
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
            <Route path="expenses" element={<FishMallExpenses />} />
            <Route path="reports" element={<FishMallReports />} />
            <Route path="closing" element={<FishMallClosing />} />
            <Route path="alerts" element={<FishMallAlerts />} />
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
              <Route path="history" element={<DriverHistory />} />
              <Route path="profile" element={<DriverProfile />} />
              <Route path="expenses" element={<DriverExpenses />} />
              <Route path="expenses/new" element={<DriverAddExpense />} />
              <Route path="documents" element={<DriverDocuments />} />
              <Route path="notifications" element={<DriverNotifications />} />
              <Route path="tracking" element={<DriverLiveTracking />} />
              <Route path="alerts" element={<DriverAlerts />} />
              <Route path="settings" element={<DriverSettings />} />
              <Route path="support" element={<DriverSupport />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* Public Routes */}
      <Route path="/pay/:invoiceId" element={<BuyerBilling />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

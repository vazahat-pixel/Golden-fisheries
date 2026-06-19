import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminLayout } from '../design-system/layouts/AdminLayout';
import { PanelLayout } from '../design-system/layouts/PanelLayout';
import {
  LayoutDashboard, Utensils, ShoppingCart, Scale, Layers,
  ClipboardList, Settings, ChefHat, Wallet, BarChart2,
  ClipboardCheck, AlertTriangle, FileText, Receipt, History, ArrowRightLeft
} from 'lucide-react';

// Auth
// const AdminAuth = React.lazy(() => import('../panels/auth/AdminAuth'));
const RestaurantAuth = React.lazy(() => import('../panels/auth/RestaurantAuth'));
const FishMallAuth = React.lazy(() => import('../panels/auth/FishMallAuth'));
// const DriverAuth = React.lazy(() => import('../panels/auth/DriverAuth'));
// const BuyerAuth = React.lazy(() => import('../panels/auth/BuyerAuth'));

// New Unified Auth Flow
const AuthHome = React.lazy(() => import('../pages/auth/AuthHome'));
const NewAdminLogin = React.lazy(() => import('../pages/auth/AdminLogin'));
const ErpWebLogin = React.lazy(() => import('../pages/auth/ErpWebLogin'));
const LegacyBuyerRedirect = React.lazy(() => import('../pages/auth/LegacyBuyerRedirect'));
const NewDriverLogin = React.lazy(() => import('../pages/auth/DriverLogin'));
const Signup = React.lazy(() => import('../pages/auth/Signup'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));

import ProtectedRoute from '../panels/auth/ProtectedRoute';
import { useAuthStore } from '../store/authStore';
import { ROLES, WEB_ERP_ROLES, REST_ROLES, FISHMALL_ROLES, PLATFORM_ACCESS } from '../constants/rbac';

// Admin
const AdminDashboard = React.lazy(() => import('../panels/admin/Dashboard'));
const TapalList = React.lazy(() => import('../panels/admin/tapals/TapalList'));
const CreateSalesTapal = React.lazy(() => import('../panels/admin/tapals/CreateSalesTapal'));
const TapalDetail = React.lazy(() => import('../panels/admin/tapals/TapalDetail'));
const InventoryOverview = React.lazy(() => import('../panels/admin/inventory/InventoryOverview'));
const AddInventoryItem = React.lazy(() => import('../panels/admin/inventory/AddInventoryItem'));
const ProcurementToFishMallTransfer = React.lazy(
  () => import('../panels/admin/inventory/ProcurementToFishMallTransfer')
);
const SystemControlCenter = React.lazy(() => import('../panels/admin/settings/SystemControlCenter'));
const DriverManagement = React.lazy(() => import('../panels/admin/logistics/DriverManagement'));
const TripsAndExpenses = React.lazy(() => import('../panels/admin/logistics/TripsAndExpenses'));
const VehicleDocuments = React.lazy(() => import('../panels/admin/logistics/VehicleDocuments'));
const FinanceOverview = React.lazy(() => import('../panels/admin/finance/FinanceOverview'));
const HarvestSlips = React.lazy(() => import('../panels/admin/procurement/HarvestSlips'));
const CreateHarvestSlip = React.lazy(() => import('../panels/admin/procurement/CreateHarvestSlipV2'));
const CreateTapalFromHarvest = React.lazy(() => import('../panels/admin/procurement/CreateTapalFromHarvest'));
const MobileShell = React.lazy(() => import('../pages/mobile/MobileShell'));
const MobileLogin = React.lazy(() => import('../pages/auth/MobileLogin'));
const HarvestSlipPreview = React.lazy(() => import('../panels/admin/procurement/HarvestSlipPreview'));
const HarvestSlipDetail = React.lazy(() => import('../panels/admin/procurement/HarvestSlipDetail'));
const NetRate = React.lazy(() => import('../panels/admin/procurement/NetRate'));
const FarmerLedger = React.lazy(() => import('../panels/admin/procurement/FarmerLedger'));
const BuyerManagement = React.lazy(() => import('../panels/admin/buyers/BuyerManagement'));
const UsersAndRoles = React.lazy(() => import('../panels/admin/settings/UsersAndRoles'));
const AdminBilling = React.lazy(() => import('../panels/admin/billing/AdminBilling'));
const SalesApprovalList = React.lazy(() => import('../panels/admin/sales/SalesApprovalList'));
const SalesApprovalDetail = React.lazy(() => import('../panels/admin/sales/SalesApprovalDetail'));
const BuyerSalesAdmin = React.lazy(() => import('../panels/admin/sales/BuyerSalesAdmin'));
const OutletManagement = React.lazy(() => import('../panels/admin/outlets/OutletManagement'));
const AccessControl = React.lazy(() => import('../panels/admin/access/AccessControl'));
const DriverControlConsole = React.lazy(() => import('../panels/admin/logistics/DriverControlConsole'));
const TapalAssignDriver = React.lazy(() => import('../panels/admin/logistics/TapalAssignDriver'));
const ExpenseReviewPage = React.lazy(() => import('../panels/admin/expenses/ExpenseReviewPage'));

// Vehicles
const VehicleDashboard = React.lazy(() => import('../panels/admin/vehicles/VehicleDashboard'));
const AddVehicle = React.lazy(() => import('../panels/admin/vehicles/AddVehicle'));
const VehicleDetail = React.lazy(() => import('../panels/admin/vehicles/VehicleDetail'));

// Restaurant
const RestaurantDashboard = React.lazy(() => import('../panels/restaurant/RestaurantDashboard'));
const RestaurantPOS = React.lazy(() => import('../panels/restaurant/RestaurantPOS'));
const RestaurantOrderHistory = React.lazy(() => import('../panels/restaurant/RestaurantOrderHistory'));
const RestaurantInventory = React.lazy(() => import('../panels/restaurant/RestaurantInventory'));
const RestaurantInternalReceives = React.lazy(
  () => import('../panels/restaurant/RestaurantInternalReceives')
);
const RestaurantMenuSetup = React.lazy(() => import('../panels/restaurant/RestaurantMenuSetup'));
const RestaurantKitchen = React.lazy(() => import('../panels/restaurant/RestaurantKitchen'));
const RestaurantSettings = React.lazy(() => import('../panels/restaurant/RestaurantSettings'));

// Fish Mall
const FishMallDashboard = React.lazy(() => import('../panels/fishmall/FishMallDashboard'));
const FishMallBilling = React.lazy(() => import('../panels/fishmall/FishMallBilling'));
const FishMallRates = React.lazy(() => import('../panels/fishmall/FishMallRates'));
const FishMallStock = React.lazy(() => import('../panels/fishmall/FishMallStock'));
const FishMallInternalSupply = React.lazy(() => import('../panels/fishmall/FishMallInternalSupply'));
const FishMallExpenses = React.lazy(() => import('../panels/fishmall/FishMallExpenses'));
const FishMallReports = React.lazy(() => import('../panels/fishmall/FishMallReports'));
const FishMallClosing = React.lazy(() => import('../panels/fishmall/FishMallClosing'));
const FishMallAlerts = React.lazy(() => import('../panels/fishmall/FishMallAlerts'));

// Driver
import { MobileLayout } from '../design-system/layouts/MobileLayout';
const DriverDashboard = React.lazy(() => import('../panels/driver/DriverDashboard'));
const DriverFieldStats = React.lazy(() => import('../panels/driver/DriverFieldStats'));
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
const DriverTripExpenseForm = React.lazy(() => import('../panels/driver/DriverTripExpenseForm'));
const DriverExpenseBillPrint = React.lazy(() => import('../panels/driver/DriverExpenseBillPrint'));

// Buyer
const BuyerDashboard = React.lazy(() => import('../panels/buyer/BuyerDashboard'));
const BuyerIncomingTapals = React.lazy(() => import('../panels/buyer/BuyerIncomingTapals'));
const BuyerBillView = React.lazy(() => import('../panels/buyer/BuyerBillView'));
const BuyerSalesReturn = React.lazy(() => import('../panels/buyer/BuyerSalesReturn'));
const BuyerInvoiceHistory = React.lazy(() => import('../panels/buyer/BuyerInvoiceHistory'));
const BuyerAssignDriver = React.lazy(() => import('../panels/buyer/BuyerAssignDriver'));
const BuyerTripTracker = React.lazy(() => import('../panels/buyer/BuyerTripTracker'));
const BuyerReconciliation = React.lazy(() => import('../panels/buyer/BuyerReconciliation'));
const BuyerAccount = React.lazy(() => import('../panels/buyer/BuyerAccount'));
const BuyerAdminThemeWrap = React.lazy(() => import('../panels/buyer/BuyerAdminThemeWrap'));

// Public
const BuyerBilling = React.lazy(() => import('../panels/public/BuyerBilling'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));

const restaurantNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/restaurant/dashboard' },
  { icon: Utensils, label: 'POS Billing', path: '/restaurant/pos' },
  { icon: ChefHat, label: 'Kitchen', path: '/restaurant/kitchen' },
  { icon: ShoppingCart, label: 'Order History', path: '/restaurant/orders' },
  { icon: ClipboardList, label: 'Inventory', path: '/restaurant/inventory' },
  { icon: ArrowRightLeft, label: 'Received Stock', path: '/restaurant/received-stock' },
  { icon: ChefHat, label: 'Menu & Recipes', path: '/restaurant/menu-setup' },
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
  { icon: ClipboardList, label: 'Inventory', path: '/fishmall/stock' },
  { icon: ArrowRightLeft, label: 'Bill Restaurant', path: '/fishmall/internal-supply' },
];

const ADMIN_ROLES = [...WEB_ERP_ROLES, ROLES.PROCUREMENT_MANAGER, ROLES.VEHICLE_MANAGER];
const SUPER_ADMIN_ONLY = [...WEB_ERP_ROLES, ROLES.SUPER_ADMIN];

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/home" replace />} />

      {/* ── Unified Auth Flow ── */}
      <Route path="/auth/*" element={
        <Routes>
          <Route path="home" element={<AuthHome />} />
          <Route path="init" element={<Navigate to="/auth/home" replace />} />
          <Route path="admin" element={<ErpWebLogin />} />
          <Route path="erp" element={<Navigate to="/auth/admin" replace />} />
          <Route path="mobile" element={<MobileLogin />} />
          <Route path="driver" element={<NewDriverLogin />} />
          <Route path="restaurant" element={<Navigate to="/restaurant/auth" replace />} />
          <Route path="fishmall" element={<Navigate to="/fishmall/auth" replace />} />
          <Route path="buyer" element={<Navigate to="/auth/admin" replace />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route index element={<Navigate to="/auth/home" replace />} />
        </Routes>
      } />

      {/* ── Admin Panel ── */}
      <Route path="/admin/*" element={
        <Routes>
          <Route path="auth" element={<Navigate to="/auth/admin" replace />} />
          <Route element={
            <ProtectedRoute requireAdminErp requirePlatform={PLATFORM_ACCESS.WEB}>
              <AdminLayout><Outlet /></AdminLayout>
            </ProtectedRoute>
          }>
            <Route element={<ProtectedRoute module="dashboard"><Outlet /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>

            {/* Tapal Routes */}
            <Route element={<ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ROLES.PROCUREMENT_MANAGER]} module="tapals"><Outlet /></ProtectedRoute>}>
              <Route path="tapals" element={<TapalList />} />
              <Route path="buyers" element={<BuyerManagement />} />
              <Route path="tapals/sales/new" element={<CreateSalesTapal />} />
              <Route path="tapals/:id" element={<TapalDetail />} />
              <Route path="sales-approval" element={<SalesApprovalList />} />
              <Route path="sales-approval/:id" element={<SalesApprovalDetail />} />
              <Route path="buyer-sales" element={<BuyerSalesAdmin />} />
            </Route>

            {/* Procurement Routes */}
            <Route element={<ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ROLES.PROCUREMENT_MANAGER]} module="procurement"><Outlet /></ProtectedRoute>}>
              <Route path="procurement/harvest" element={<HarvestSlips />} />
              <Route path="procurement/harvest/new" element={<CreateHarvestSlip />} />
              <Route path="procurement/harvest/preview" element={<HarvestSlipPreview />} />
              <Route path="procurement/harvest/:id" element={<HarvestSlipDetail />} />
              <Route path="procurement/net-rate" element={<NetRate />} />
              <Route path="procurement/tapal/create" element={<CreateTapalFromHarvest />} />
              <Route path="procurement/farmer-ledger" element={<FarmerLedger />} />
            </Route>

            {/* Inventory Routes */}
            <Route element={<ProtectedRoute allowedRoles={WEB_ERP_ROLES} module="inventory"><Outlet /></ProtectedRoute>}>
              <Route path="inventory" element={<InventoryOverview />} />
              <Route path="inventory/transfer-fishmall" element={<ProcurementToFishMallTransfer />} />
              <Route path="inventory/new" element={<AddInventoryItem />} />
            </Route>

            {/* Logistics Routes */}
            <Route element={<ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ROLES.VEHICLE_MANAGER]} module="logistics"><Outlet /></ProtectedRoute>}>
              <Route path="logistics" element={<TripsAndExpenses />} />
              <Route path="logistics/drivers" element={<DriverManagement />} />
              <Route path="logistics/control" element={<DriverControlConsole />} />
              <Route path="logistics/assign-driver" element={<TapalAssignDriver />} />
              <Route path="logistics/vehicles" element={<Navigate to="/admin/vehicles" replace />} />
              <Route path="vehicles" element={<VehicleDashboard />} />
              <Route path="vehicles/new" element={<AddVehicle />} />
              <Route path="vehicles/:id" element={<VehicleDetail />} />
              <Route path="vehicles/documents" element={<VehicleDocuments />} />
              <Route path="vehicles/alerts" element={<VehicleDashboard />} />
            </Route>

            {/* Finance & Billing Routes */}
            <Route element={<ProtectedRoute allowedRoles={WEB_ERP_ROLES} module="finance"><Outlet /></ProtectedRoute>}>
              <Route path="finance" element={<FinanceOverview />} />
              <Route path="expenses" element={<ExpenseReviewPage />} />
            </Route>
            <Route element={<ProtectedRoute allowedRoles={WEB_ERP_ROLES} module="billing"><Outlet /></ProtectedRoute>}>
              <Route path="billing" element={<AdminBilling />} />
            </Route>

            {/* Outlets Routes */}
            <Route element={<ProtectedRoute allowedRoles={WEB_ERP_ROLES} module="outlets"><Outlet /></ProtectedRoute>}>
              <Route path="outlets" element={<OutletManagement />} />
            </Route>

            {/* Access Control & Settings */}
            <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY} module="accessControl"><Outlet /></ProtectedRoute>}>
              <Route path="access" element={<AccessControl />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={SUPER_ADMIN_ONLY} module="systemControl"><Outlet /></ProtectedRoute>}>
              <Route path="system-control" element={<SystemControlCenter />} />
            </Route>

            <Route element={<ProtectedRoute module="settings"><Outlet /></ProtectedRoute>}>
              <Route path="settings" element={<UsersAndRoles />} />
            </Route>

            {/* Buyer workflows inside Admin ERP — dark field-app theme for visibility */}
            <Route element={<BuyerAdminThemeWrap />}>
              <Route element={<ProtectedRoute module="buyerDashboard"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/dashboard" element={<BuyerDashboard />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerVerify"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/tapals" element={<BuyerIncomingTapals />} />
                <Route path="buyer/bill/:tapalId" element={<BuyerBillView />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerBills"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/invoices" element={<BuyerInvoiceHistory />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerReturns"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/returns" element={<BuyerSalesReturn />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerSettlement"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/reconciliation" element={<BuyerReconciliation />} />
              </Route>
              <Route path="buyer/account" element={<BuyerAccount />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* ── Restaurant Panel ── */}
      <Route path="/restaurant/*" element={
        <Routes>
          <Route index element={<Navigate to="/restaurant/auth" replace />} />
          <Route path="auth" element={<RestaurantAuth />} />
          <Route element={<ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ...REST_ROLES]} requirePlatform={PLATFORM_ACCESS.WEB}><Outlet /></ProtectedRoute>}>
            <Route path="pos" element={<RestaurantPOS />} />
            <Route element={
              <PanelLayout
                navItems={restaurantNav}
                panelName="GF Restaurant"
                userName="Suresh"
                panelKind="restaurant"
                alertsHref="/restaurant/received-stock"
              >
                <Outlet />
              </PanelLayout>
            }>
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="kitchen" element={<RestaurantKitchen />} />
              <Route path="orders" element={<RestaurantOrderHistory />} />
              <Route path="inventory" element={<RestaurantInventory />} />
              <Route path="received-stock" element={<RestaurantInternalReceives />} />
              <Route
                path="menu-setup"
                element={
                  <ProtectedRoute allowedRoles={[ROLES.REST_MANAGER, ROLES.SUPER_ADMIN]}>
                    <RestaurantMenuSetup />
                  </ProtectedRoute>
                }
              />
              <Route path="settings" element={<RestaurantSettings />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* ── Fish Mall Panel ── */}
      <Route path="/fishmall/*" element={
        <Routes>
          <Route index element={<Navigate to="/fishmall/auth" replace />} />
          <Route path="auth" element={<FishMallAuth />} />
          <Route element={
            <ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ...FISHMALL_ROLES]} requirePlatform={PLATFORM_ACCESS.WEB}>
              <PanelLayout
                navItems={fishMallNav}
                panelName="GF Fish Mall"
                userName="Ramesh"
                panelKind="fishmall"
                alertsHref="/fishmall/alerts"
              >
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
            <Route
              path="rates"
              element={
                <ProtectedRoute allowedRoles={[ROLES.FISHMALL_MANAGER, ROLES.SUPER_ADMIN]}>
                  <FishMallRates />
                </ProtectedRoute>
              }
            />
            <Route path="stock" element={<FishMallStock />} />
            <Route path="internal-supply" element={<FishMallInternalSupply />} />
          </Route>
        </Routes>
      } />

      {/* ── Mobile field app (procurement / vehicles) ── */}
      <Route path="/mobile/*" element={
        <ProtectedRoute
          allowedRoles={[
            ROLES.PROCUREMENT_MANAGER,
            ROLES.VEHICLE_MANAGER,
            ROLES.BUYER,
            ROLES.DRIVER,
            ROLES.SUPER_ADMIN,
            'ADMIN',
          ]}
          requirePlatform={PLATFORM_ACCESS.MOBILE}
        >
          <Routes>
            <Route element={<MobileShell />}>
              <Route path="procurement" element={<Navigate to="/mobile/procurement/harvest" replace />} />
              <Route path="procurement/harvest" element={<HarvestSlips />} />
              <Route path="procurement/harvest/new" element={<CreateHarvestSlip />} />
              <Route path="procurement/harvest/preview" element={<HarvestSlipPreview />} />
              <Route path="procurement/harvest/:id" element={<HarvestSlipDetail />} />
              <Route path="procurement/net-rate" element={<NetRate />} />
              <Route path="procurement/tapal" element={<CreateTapalFromHarvest />} />
              <Route path="vehicles" element={<VehicleDashboard />} />
              <Route path="vehicles/new" element={<AddVehicle />} />
              <Route path="buyer" element={<Navigate to="/mobile/buyer/dashboard" replace />} />
              <Route element={<ProtectedRoute module="buyerDashboard"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/dashboard" element={<BuyerDashboard />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerVerify"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/tapals" element={<BuyerIncomingTapals />} />
                <Route path="buyer/bill/:tapalId" element={<BuyerBillView />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerBills"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/invoices" element={<BuyerInvoiceHistory />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerReturns"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/returns" element={<BuyerSalesReturn />} />
              </Route>
              <Route element={<ProtectedRoute module="buyerSettlement"><Outlet /></ProtectedRoute>}>
                <Route path="buyer/reconciliation" element={<BuyerReconciliation />} />
              </Route>
              <Route path="buyer/account" element={<BuyerAccount />} />
              <Route path="driver" element={<Navigate to="/driver/dashboard" replace />} />
            </Route>
          </Routes>
        </ProtectedRoute>
      } />

      {/* ── Driver Mobile Panel ── */}
      <Route path="/driver/*" element={
        <Routes>
          <Route path="auth" element={<Navigate to="/auth/driver" replace />} />
          <Route element={
            <ProtectedRoute allowedRoles={[...WEB_ERP_ROLES, ROLES.DRIVER]} requirePlatform={PLATFORM_ACCESS.MOBILE}>
              <Outlet />
            </ProtectedRoute>
          }>
            <Route element={<MobileLayout />}>
              <Route path="dashboard" element={<DriverDashboard />} />
              <Route path="stats" element={<DriverFieldStats />} />
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
              {/* Post-trip expense form + bill */}
              <Route path="trip-expense/:tripId" element={<DriverTripExpenseForm />} />
              <Route path="trip-expense/:tripId/bill" element={<DriverExpenseBillPrint />} />
            </Route>
          </Route>
        </Routes>
      } />

      {/* Legacy buyer URLs → Admin ERP buyer module */}
      <Route path="/buyer/*" element={<LegacyBuyerRedirect />} />

      {/* Public */}
      <Route path="/pay/:invoiceId" element={<BuyerBilling />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRouter;

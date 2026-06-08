import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useDriverStore } from '../store/driverStore';
import { useRestaurantStore } from '../store/restaurantStore';
import { useFishMallStore } from '../store/fishMallStore';
import { useNotificationStore } from '../store/notificationStore';
import { useSystemSettingsStore } from '../store/systemSettingsStore';
import { toast } from 'react-hot-toast';
import { playTripAlertSound, vibrateTripAlert } from '../utils/notificationSound';
import { ROLES, normalizeRole } from '../constants/rbac';


class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  playNotificationSound() {
    playTripAlertSound();
    vibrateTripAlert();
  }

  isDriverUser() {
    const role = normalizeRole(useAuthStore.getState().user?.role);
    return role === ROLES.DRIVER;
  }

  /**
   * Connect to the backend Socket.IO server
   */
  connect() {
    const token = useAuthStore.getState().token;
    if (!token) {
      console.warn('[Socket Client]: Connection deferred. No access token found in AuthStore.');
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

    if (this.socket) {
      // Update the token dynamically in case it was refreshed by Axios interceptor
      this.socket.auth.token = token;
      if (!this.socket.connected) {
        console.log(`[Socket Client]: Reconnecting with fresh token to: ${socketUrl}`);
        this.socket.connect();
      }
      return;
    }

    console.log(`[Socket Client]: Initiating secure handshake to: ${socketUrl}`);
    
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.setupListeners();
  }

  /**
   * Setup core synchronization events
   */
  setupListeners() {
    this.socket.on('connect', () => {
      console.log(`[Socket Connected]: Tunnel established. Socket ID: ${this.socket.id}`);
      this.reconnectAttempts = 0;
    });

    this.socket.on('settings:updated', (data) => {
      const settings = data?.settings;
      if (settings) {
        useSystemSettingsStore.getState().applyFromPayload(settings);
        toast.success('System settings updated live', { duration: 2500, id: 'settings-live' });
      }
    });

    this.socket.on('connect_error', async (error) => {
      console.error('[Socket Connection Error]: Handshake rejected.', error.message);
      
      // If token expired, force a background HTTP request to trigger the Axios interceptor
      // which will automatically refresh the token and update the AuthStore.
      if (error.message.includes('Session expired') || error.message.includes('Authentication failed')) {
        console.log('[Socket Client]: Attempting background token refresh...');
        try {
          const { apiClient } = await import('./apiClient');
          // Hit a protected route lightweight endpoint to trigger the 401 -> interceptor -> refresh flow
          // OR hit refresh directly. Let's just let the interceptor handle it via a dummy ping.
          await apiClient.get('/vehicles/all').catch(() => {}); 
        } catch (e) {
          console.warn('[Socket Client]: Background token refresh failed.');
        }
      }

      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[Socket Client]: Maximum reconnection limit hit. Pausing retries.');
        this.socket.disconnect();
      }
    });

    // 1. Real-Time Inventory Synchronizer
    this.socket.on('inventory:level_update', (data) => {
      if (data?.scope && data.scope !== 'PROCUREMENT') return;
      console.log('[Socket Received - Procurement Inventory Sync]:', data);
      const { name, quantity } = data;
      
      const adminStore = useAdminStore.getState();
      const itemToUpdate = adminStore.inventory.find(
        (item) => item.name.toUpperCase() === name.toUpperCase()
      );

      if (itemToUpdate) {
        // Sync central quantity level
        const diff = quantity - itemToUpdate.qty;
        adminStore.updateInventoryQty(itemToUpdate.id, diff);
        console.log(`[Zustand Sync]: Stock level for ${name} updated to ${quantity} KG.`);
      } else {
        // Fetch fresh inventory if not found locally
        adminStore.fetchInventory?.();
      }
    });

    // Driver live GPS for buyer / admin trackers
    this.socket.on('driver:location_update', (data) => {
      useAdminStore.setState((state) => ({
        buyerTrips: state.buyerTrips.map((t) =>
          (t.id === data.tripId || t.tripNumber === data.tripId)
            ? { ...t, lastLocation: data.coordinates }
            : t
        ),
        trips: (state.trips || []).map((t) =>
          (t.id === data.tripId || t.tripNumber === data.tripId)
            ? { ...t, lastLocation: data.coordinates }
            : t
        )
      }));
    });

    // 2. Real-Time Logistics (Driver Trips) Synchronizer
    this.socket.on('trip:status_change', (data) => {
      console.log('[Socket Received - Trip Sync]:', data);
      const { tripNumber, status, actualDeliveredQty, actualPickupQty } = data;

      const adminStore = useAdminStore.getState();
      const driverStore = useDriverStore.getState();

      // Mapping status terms between backend and frontend Zustand
      let frontendStatus = status;
      if (status === 'ASSIGNED') frontendStatus = 'Assigned';
      else if (status === 'STARTED') frontendStatus = 'In Transit';
      else if (status === 'PICKED') frontendStatus = 'Picked';
      else if (status === 'DELIVERED') frontendStatus = 'Delivered';
      else if (status === 'CLOSED') frontendStatus = 'Closed';

      // Update in admin store
      if (adminStore.trips) {
        const matchingTrip = adminStore.trips.find(t => t.tripNumber === tripNumber || t.id === tripNumber);
        if (matchingTrip) {
          adminStore.updateTapalStatus?.(matchingTrip.tapalId, frontendStatus);
          
          // Trigger local state mutation for live reactive UI updates
          useAdminStore.setState((state) => ({
            trips: state.trips.map(t => (t.tripNumber === tripNumber || t.id === tripNumber) ? {
              ...t,
              status: frontendStatus,
              actualQty: actualDeliveredQty || actualPickupQty || t.actualQty
            } : t)
          }));
        } else {
          // Trigger hard reload of lists
          adminStore.fetchDrivers?.();
        }
      }

      // Update in driver store
      if (driverStore.updateTripStatus) {
        const currentTrip = driverStore.activeTrip || driverStore.trips?.find(t => t.tripNumber === tripNumber);
        if (currentTrip) {
          driverStore.updateTripStatus(currentTrip.id, frontendStatus);
        }
      }
    });

    // 3. Low Stock Alerts & System Announcements
    this.socket.on('dashboard:alert', (alert) => {
      console.warn('[Socket Received - System Alert]:', alert);
      // Integration of toast or badge is naturally reactive via event hooks
    });

    // 5. Restaurant Order Sync
    this.socket.on('restaurant:order_created', (data) => {
      console.log('[Socket Received - Restaurant Order]:', data);
      useRestaurantStore.getState().fetchOrders?.();
    });

    // 6. Fish Mall Sale Sync
    this.socket.on('fishmall:sale_created', (data) => {
      console.log('[Socket Received - Fish Mall Sale]:', data);
      useFishMallStore.getState().fetchStock?.();
    });

    this.socket.on('fishmall:inventory_updated', () => {
      useFishMallStore.getState().fetchStock?.();
    });

    const shouldNotifyFishMall = (data) => {
      const user = useAuthStore.getState().user;
      const role = (user?.role || '').toUpperCase();
      const fishRoles = ['FISHMALL_MANAGER', 'FISHMALL_CASHIER', 'FISHMALL'];
      if (!fishRoles.includes(role)) return false;
      const myOutlet = user?.fishMallOutletId;
      if (!myOutlet || !data?.outletId) return true;
      return String(myOutlet) === String(data.outletId);
    };

    this.socket.on('fishmall:transfer_pending', (data) => {
      if (!shouldNotifyFishMall(data)) return;
      console.log('[Socket] Fish Mall transfer pending:', data);
      useFishMallStore.getState().addProcurementTransferAlert?.(data, 'pending');
      useFishMallStore.getState().fetchPendingTransfers?.();
      const canAccept = data.status === 'IN_TRANSIT' || data.status === 'PENDING_ACCEPTANCE';
      if (canAccept) {
        toast(`Stock dispatch: ${data.transferNumber} — Accept in Inventory`, { icon: '📦', duration: 8000 });
      } else {
        toast(`Transfer ${data.transferNumber} created — admin dispatch pending`, { icon: '⏳', duration: 6000 });
      }
    });

    this.socket.on('fishmall:procurement_transfer', (data) => {
      if (!shouldNotifyFishMall(data)) return;
      console.log('[Socket] Fish Mall procurement transfer received:', data);
      const store = useFishMallStore.getState();
      store.addProcurementTransferAlert?.(data, 'received');
      store.fetchStock?.();
      const lines = (data.lines || [])
        .map((l) => `${l.productName} ${l.quantity}${l.unit || 'KG'}`)
        .join(', ');
      toast.success(
        `Stock received: ${data.transferNumber}${lines ? ` — ${lines}` : ''}`,
        { duration: 7000 }
      );
      this.playNotificationSound();
    });

    const shouldNotifyRestaurant = () => {
      const user = useAuthStore.getState().user;
      const role = (user?.role || '').toUpperCase();
      return ['REST_MANAGER', 'REST_CASHIER', 'RESTAURANT', 'SUPER_ADMIN'].includes(role);
    };

    const handleRestaurantSupply = (data) => {
      if (!shouldNotifyRestaurant()) return;
      const store = useRestaurantStore.getState();
      store.addInternalSupplyAlert?.(data);
      store.fetchKitchenStock?.();
      store.fetchMenu?.();
      const lines = (data?.lines || [])
        .map((l) => `${l.itemName} ${l.quantity}${l.unit || 'KG'}`)
        .join(', ');
      toast.success(
        `Kitchen stock received: ${data.invoiceNumber || 'INT'}${lines ? ` — ${lines}` : ''}`,
        { duration: 7000, icon: '📦' }
      );
    };

    this.socket.on('restaurant:internal_supply_received', handleRestaurantSupply);

    this.socket.on('restaurant:inventory_updated', (data) => {
      if (!shouldNotifyRestaurant()) return;
      const store = useRestaurantStore.getState();
      store.fetchKitchenStock?.();
      store.fetchMenu?.();
      if (data?.invoiceNumber) {
        handleRestaurantSupply(data);
      }
    });

    this.socket.on('restaurant:kot_created', () => {
      useRestaurantStore.getState().fetchKitchenTickets?.();
    });

    this.socket.on('restaurant:kot_updated', () => {
      useRestaurantStore.getState().fetchKitchenTickets?.();
    });

    this.socket.on('restaurant:order_settled', () => {
      const store = useRestaurantStore.getState();
      store.fetchMenu?.();
      store.fetchOrders?.();
      store.fetchKitchenTickets?.();
    });

    this.socket.on('internal:bill_issued', (data) => {
      console.log('[Socket Received - Internal Bill]:', data);
      useFishMallStore.getState().fetchStock?.();
      handleRestaurantSupply(data);
    });

    this.socket.on('inventory:transfer_completed', (data) => {
      console.log('[Socket Received - Procurement Transfer]:', data);
      const adminStore = useAdminStore.getState();
      if (data?.scope === 'PROCUREMENT') {
        adminStore.fetchInventory?.();
      }
      useFishMallStore.getState().fetchStock?.();
    });

    // 4. Driver Assignment Notification (drivers only)
    this.socket.on('trip:new_assignment', (data) => {
      console.log('[Socket Received - New Trip Assignment]:', data);

      const driverStore = useDriverStore.getState();
      if (driverStore.setIncomingAssignment) {
        driverStore.setIncomingAssignment(data);
      }
      if (driverStore.fetchMyTrips) {
        driverStore.fetchMyTrips();
      }

      if (!this.isDriverUser()) return;

      this.playNotificationSound();

      toast.success(`NEW TRIP: #${data.tapalNumber} — tap Active Trip to start`, {
        duration: 10000,
        position: 'top-center',
        style: {
          background: '#6A7051',
          color: '#ffffff',
          fontWeight: '900',
          borderRadius: '12px',
          border: '2px solid #C5A021',
          fontSize: '12px',
          letterSpacing: '0.05em',
        },
      });
    });

    // Real-Time Trip Completion Notification
    this.socket.on('trip:ended', (data) => {
      console.log('[Socket Received - Trip Ended]:', data);
      
      this.playNotificationSound();

      // Display a beautiful top toast notification for Admin
      toast.success(`TRIP COMPLETED: #${data.tripNumber} by ${data.driverName}!`, {
        duration: 8000,
        position: 'top-right',
        style: {
          background: '#6A7051',
          color: '#ffffff',
          fontWeight: '900',
          borderRadius: '0px',
          border: '2px solid #FAF8F5',
          fontSize: '11px',
          letterSpacing: '0.05em'
        }
      });

      const adminStore = useAdminStore.getState();
      if (adminStore.setActiveTripNotification) {
        adminStore.setActiveTripNotification(data);
      }

      // Refresh list under-the-hood to keep administrative dashboard 100% synchronized
      if (adminStore.fetchTrips) adminStore.fetchTrips();
      if (adminStore.fetchExpenses) adminStore.fetchExpenses();
    });

    // 4. Harvest Procurement Synchronizer
    this.socket.on('harvest:status_update', (data) => {
      console.log('[Socket Received - Harvest Sync]:', data);
      const { id, status } = data;
      const adminStore = useAdminStore.getState();
      
      // Update local state reactive collection
      useAdminStore.setState((state) => ({
        harvestSlips: state.harvestSlips.map(s => 
          (s._id === id || s.id === id) ? { ...s, status } : s
        )
      }));
    });

    // 5. Tapal (Contract) Creation Synchronizer
    this.socket.on('tapal:created', (data) => {
      console.log('[Socket Received - Tapal Sync]:', data);
      const adminStore = useAdminStore.getState();
      
      // Add new tapal to list if it doesn't exist
      useAdminStore.setState((state) => ({
        tapals: [data.tapal, ...state.tapals].filter((v, i, a) => a.findIndex(t => t._id === v._id) === i)
      }));
      
      // Optional: Refresh slips to reflect conversion status
      adminStore.fetchHarvestSlips?.();
    });

    // 6. In-App Notification Socket Sync
    this.socket.on('notification:received', (data) => {
      console.log('[Socket] In-app notification received:', data);
      useNotificationStore.getState().addNotification?.(data);

      const isTripAlert =
        this.isDriverUser() &&
        (data?.type === 'ALERT' ||
          /trip|assigned/i.test(`${data?.title || ''} ${data?.message || ''}`));

      if (isTripAlert) {
        this.playNotificationSound();
        toast(data.message || data.title, {
          icon: '🔔',
          duration: 8000,
          position: 'top-center',
          style: {
            background: '#6A7051',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '12px',
          },
        });
        return;
      }

      toast(data.message || data.title, {
        icon: data.type === 'STOCK_TRANSFER' ? '📦' : '🔔',
        duration: 6000,
        position: 'top-right',
      });
    });

    this.socket.on('notification:badge_update', () => {
      useNotificationStore.getState().fetchNotifications?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`[Socket Disconnected]: Connection severed. Reason: ${reason}`);
    });
  }

  /**
   * Send live tracking telemetry
   */
  emitDriverLocation(tripId, latitude, longitude) {
    if (this.socket?.connected) {
      this.socket.emit('driver:location_ping', { tripId, latitude, longitude });
    }
  }

  /**
   * Acquire explicit selection locks in POS
   */
  emitPOSLockTable(tableNumber, orderId) {
    if (this.socket?.connected) {
      this.socket.emit('pos:table_select', { tableNumber, orderId });
    }
  }

  emitPOSReleaseTable(tableNumber) {
    if (this.socket?.connected) {
      this.socket.emit('pos:table_release', { tableNumber });
    }
  }

  /**
   * Settle and close connections cleanly
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('[Socket Client]: Connection severed cleanly.');
    }
  }
}

export const socketService = new SocketService();
export default socketService;

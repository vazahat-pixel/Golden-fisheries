import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { useDriverStore } from '../store/driverStore';

class SocketService {
  constructor() {
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
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

    if (this.socket?.connected) {
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

    this.socket.on('connect_error', (error) => {
      console.error('[Socket Connection Error]: Handshake rejected.', error.message);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('[Socket Client]: Maximum reconnection limit hit. Pausing retries.');
        this.socket.disconnect();
      }
    });

    // 1. Real-Time Inventory Synchronizer
    this.socket.on('inventory:level_update', (data) => {
      console.log('[Socket Received - Inventory Sync]:', data);
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

    // 4. Driver Assignment Notification
    this.socket.on('trip:new_assignment', (data) => {
      console.log('[Socket Received - New Trip Assignment]:', data);
      const driverStore = useDriverStore.getState();
      if (driverStore.setIncomingAssignment) {
        driverStore.setIncomingAssignment(data);
      }
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

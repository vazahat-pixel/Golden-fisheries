import { create } from 'zustand';
import { apiClient } from '../services/apiClient';
import { requestFirebaseToken } from '../services/firebase';

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,
  unreadCount: 0,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await apiClient.get('/notifications');
      const list = Array.isArray(res?.data) ? res.data : res?.data?.data ?? [];
      const unread = list.filter((n) => !n.read).length;
      set({ notifications: list, unreadCount: unread, loading: false });
    } catch (err) {
      set({ notifications: [], unreadCount: 0, loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      set((state) => {
        const list = state.notifications.map((n) =>
          n.id === id || n._id === id ? { ...n, read: true } : n
        );
        return {
          notifications: list,
          unreadCount: list.filter((n) => !n.read).length,
        };
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  },

  addNotification: (notif) => {
    set((state) => {
      const exists = state.notifications.some((n) => n.id === notif.id || n._id === notif._id || n._id === notif.id || n.id === notif._id);
      if (exists) return state;

      const list = [notif, ...state.notifications];
      return {
        notifications: list,
        unreadCount: list.filter((n) => !n.read).length,
      };
    });
  },

  registerDeviceToken: async (token) => {
    try {
      await apiClient.post('/notifications/register-device-token', { token });
    } catch (err) {
      console.error('Failed to register device token:', err);
    }
  },

  unregisterDeviceToken: async (token) => {
    try {
      await apiClient.post('/notifications/unregister-device-token', { token });
    } catch (err) {
      console.error('Failed to unregister device token:', err);
    }
  },

  setupPushNotifications: async () => {
    try {
      const token = await requestFirebaseToken();
      if (token) {
        await get().registerDeviceToken(token);
        localStorage.setItem('fcm_token', token);
        console.log('Firebase Cloud Messaging token registered.');
      }
    } catch (err) {
      console.error('Push notification setup failed:', err);
    }
  },
}));

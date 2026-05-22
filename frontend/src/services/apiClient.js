import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { normalizeRole, resolveClientPlatform } from '../constants/rbac';

// Create a configured Axios instance
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial: Automatically attaches and parses secure HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 1. Request Interceptor: Automatically attach Bearer tokens
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const role = normalizeRole(useAuthStore.getState().user?.role);
    const platform =
      config.headers['X-Client-Platform'] || resolveClientPlatform(pathname, role);
    config.headers['X-Client-Platform'] = platform;
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Safe envelope unpacking & automatic sliding-session token refreshes
apiClient.interceptors.response.use(
  (response) => {
    // Unpack standard backend API envelope { success, message, data, meta }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired/unauthorized token and isn't a retry attempt
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Avoid infinite refresh loops if the refresh or logout call itself is returning 401
      if (originalRequest.url.includes('/auth/refresh') || originalRequest.url.includes('/auth/logout')) {
        if (originalRequest.url.includes('/auth/refresh')) {
          useAuthStore.getState().logout();
        }
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Trigger sliding session refresh
        const refreshResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        
        if (newAccessToken) {
          // Update the localized store
          const { user } = useAuthStore.getState();
          useAuthStore.getState().login(user, newAccessToken);

          processQueue(null, newAccessToken);

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error('New access token not provided in refresh payload');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout(); // Log out on refresh failure
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Format standard error structures for frontend pages to read easily
    const formattedError = {
      message: error.response?.data?.message || 'A network error occurred. Please try again.',
      status: error.response?.status || 500,
      data: error.response?.data?.data || null,
    };

    return Promise.reject(formattedError);
  }
);

export default apiClient;

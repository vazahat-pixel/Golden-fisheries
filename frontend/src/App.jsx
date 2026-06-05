import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './router';
import { Toaster } from 'react-hot-toast';
import { LoadingFallback } from './design-system/components/LoadingFallback';
import { ErrorBoundary } from './design-system/components/ErrorBoundary';
import { OfflineIndicator } from './design-system/components/OfflineIndicator';
import { erpToastOptions } from './design-system/toast';
import { useAuthStore } from './store/authStore';
import { socketService } from './services/socketService';

import { useNotificationStore } from './store/notificationStore';
import { useSystemSettingsStore } from './store/systemSettingsStore';

function App() {
  const { isAuthenticated, token } = useAuthStore();
  const { setupPushNotifications } = useNotificationStore();
  const fetchPublicSettings = useSystemSettingsStore((s) => s.fetchPublic);
  const fetchSettings = useSystemSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchPublicSettings();
  }, [fetchPublicSettings]);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchSettings().catch(() => {});
    }
  }, [isAuthenticated, token, fetchSettings]);

  useEffect(() => {
    if (isAuthenticated && token) {
      socketService.connect();
      // Setup FCM push notifications in background
      setupPushNotifications().catch((err) =>
        console.error('Push notification registration skipped:', err)
      );
    } else {
      socketService.disconnect();
    }
    return () => socketService.disconnect();
  }, [isAuthenticated, token, setupPushNotifications]);

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingFallback type="full" />}>
          <AppRouter />
        </React.Suspense>
      </ErrorBoundary>
      <OfflineIndicator />
      <Toaster
        position={erpToastOptions.position}
        toastOptions={{
          duration: erpToastOptions.duration,
          style: erpToastOptions.style,
          success: erpToastOptions.success,
          error: erpToastOptions.error,
          loading: erpToastOptions.loading,
        }}
      />
    </BrowserRouter>
  );
}

export default App;

import { apiClient } from './apiClient';

export const systemSettingsService = {
  getPublic: () => apiClient.get('/system-settings/public'),
  get: () => apiClient.get('/system-settings'),
  update: (payload) => apiClient.patch('/system-settings', payload),
  resetSection: (section) => apiClient.post('/system-settings/reset-section', { section }),
};

import { PLATFORM_ACCESS } from '../constants/rbac';

/** @deprecated Prefer apiClient interceptor (resolveClientPlatform). Kept for buyer portal only. */
export const mobilePlatformConfig = () => ({
  headers: { 'X-Client-Platform': PLATFORM_ACCESS.MOBILE },
});

/** Buyer portal APIs accept MOBILE header while UI stays on Admin ERP (web path) */
export const buyerPortalPlatformConfig = () => ({
  headers: { 'X-Client-Platform': PLATFORM_ACCESS.MOBILE },
});

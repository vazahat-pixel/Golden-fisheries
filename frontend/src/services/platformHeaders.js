import { PLATFORM_ACCESS } from '../constants/rbac';

/** Field / procurement writes must use MOBILE platform even from /admin URLs */
export const mobilePlatformConfig = () => ({
  headers: { 'X-Client-Platform': PLATFORM_ACCESS.MOBILE },
});

/** Buyer portal APIs accept MOBILE header while UI stays on Admin ERP (web path) */
export const buyerPortalPlatformConfig = () => ({
  headers: { 'X-Client-Platform': PLATFORM_ACCESS.MOBILE },
});

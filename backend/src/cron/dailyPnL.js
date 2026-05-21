import cron from 'node-cron';
import { reportsService } from '../modules/reports/reports.service.js';
import { logger } from '../utils/logger.js';

/**
 * Daily 23:59 Asia/Kolkata — P&L snapshot hooks (persist models in a follow-up).
 */
export function scheduleDailyPnLJob() {
  cron.schedule(
    '59 23 * * *',
    async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        await reportsService.generateDailyPnL(today, 'MKE');
        await reportsService.generateDailyPnL(today, 'REST');
        await reportsService.generateDailyPnL(today, 'FISHMALL');
        await reportsService.generateConsolidatedPnL(today);
        logger.info(`[Cron] Daily P&L hooks completed for ${today}.`);
      } catch (e) {
        logger.error(`[Cron] Daily P&L job failed: ${e.message}`);
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
  logger.info('[Cron] Daily P&L job scheduled (23:59 IST).');
}

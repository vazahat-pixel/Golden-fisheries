import cron from 'node-cron';
import { Vehicle } from '../modules/vehicles/vehicle.model.js';
import { notificationService } from '../modules/notifications/notification.service.js';
import { logger } from '../utils/logger.js';

/**
 * Daily 08:00 Asia/Kolkata — mark vehicle document status from expiry dates.
 */
export function scheduleVehicleDocumentExpiryJob() {
  cron.schedule(
    '0 8 * * *',
    async () => {
      try {
        const today = new Date();
        const in7 = new Date(today);
        in7.setDate(today.getDate() + 7);
        const in30 = new Date(today);
        in30.setDate(today.getDate() + 30);

        const vehicles = await Vehicle.find({});
        const docTypes = ['rc', 'insurance', 'permit', 'fitness', 'pollution'];

        for (const vehicle of vehicles) {
          if (!vehicle.documents) continue;
          let changed = false;
          for (const docType of docTypes) {
            const doc = vehicle.documents[docType];
            if (!doc?.expiry) continue;
            const expiry = new Date(doc.expiry);
            let alertType = null;
            if (expiry < today) alertType = 'OVERDUE';
            else if (expiry <= in7) alertType = 'SEVEN_DAY';
            else if (expiry <= in30) alertType = 'THIRTY_DAY';

            if (alertType) {
              doc.status = alertType === 'OVERDUE' ? 'EXPIRED' : 'EXPIRING_SOON';
              changed = true;
              await notificationService.sendVehicleDocAlert({
                vehicle,
                docType,
                alertType,
                expiryDate: expiry
              });
            } else if (doc.status && doc.status !== 'VALID') {
              doc.status = 'VALID';
              changed = true;
            }
          }
          if (changed) await vehicle.save();
        }
        logger.info('[Cron] Vehicle document expiry sweep completed.');
      } catch (e) {
        logger.error(`[Cron] Vehicle document expiry job failed: ${e.message}`);
      }
    },
    { timezone: 'Asia/Kolkata' }
  );
  logger.info('[Cron] Vehicle document expiry job scheduled (08:00 IST).');
}

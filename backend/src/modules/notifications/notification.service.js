import { logger } from '../../utils/logger.js';

export const notificationService = {
  /**
   * Dispatches WhatsApp Alerts to farmers or buyers
   */
  sendWhatsApp: async (phone, message) => {
    // In production: Integrate Twilio WhatsApp Business API or Meta Cloud API
    logger.info(`[WhatsApp Dispatch API]: Message queued and sent to +91 ${phone} -> "${message}"`);
    return { success: true, channel: 'WHATSAPP', phone, timestamp: new Date() };
  },

  /**
   * Dispatches SMS trip sheets to drivers
   */
  sendDriverAlert: async (phone, vehicleNo, pickupAddr) => {
    const msg = `[Golden Fisheries Logistics]: Cargo Trip assigned. Vehicle: ${vehicleNo}. Pickup point: ${pickupAddr}. Open your driver panel to start trip.`;
    logger.info(`[SMS Dispatch API]: Sent to +91 ${phone} -> "${msg}"`);
    return { success: true, channel: 'SMS', phone, timestamp: new Date() };
  },

  /**
   * Dispatches WhatsApp confirmations upon harvest conversions
   */
  sendHarvestConfirmation: async (farmerPhone, slipNo, date) => {
    const msg = `Respected Partner, your Harvest Slip ${slipNo} scheduled for ${date.toDateString()} has been confirmed. Tapal issued. Golden Fisheries Logistics is in transit.`;
    return await notificationService.sendWhatsApp(farmerPhone, msg);
  },

  /**
   * Low Stock Email/Slack notifications to warehouse administrators
   */
  sendLowStockAlert: async (productName, currentQty, reorderLimit) => {
    logger.warn(`[SYSTEM ALARM]: Product ${productName} stock is critically low. Current reserves: ${currentQty} KG. Reorder Limit is ${reorderLimit} KG.`);
    return { success: true, channel: 'SYSTEM_ALARM', message: `Stock critical for ${productName}` };
  }
};
export default notificationService;

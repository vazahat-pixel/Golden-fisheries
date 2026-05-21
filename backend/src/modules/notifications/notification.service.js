import { logger } from '../../utils/logger.js';
import { smsService } from '../../services/sms.service.js';
import { whatsappService } from '../../services/whatsapp.service.js';

async function dispatch(channel, phone, message) {
  try {
    if (channel === 'SMS') {
      const r = await smsService.sendMessage(phone, message);
      return { ...r, channel: 'SMS', phone };
    }
    if (channel === 'WHATSAPP') {
      return await whatsappService.sendText(phone, message);
    }
    logger.info(`[Notify ${channel}]: ${phone} — ${message}`);
    return { success: true, channel, phone };
  } catch (err) {
    logger.error(`[Notify ${channel} Error]: ${err.message}`);
    return { success: false, channel, phone, error: err.message };
  }
}

export const notificationService = {
  async sendWhatsApp(phone, message) {
    return dispatch('WHATSAPP', phone, message);
  },

  async sendSms(phone, message) {
    return dispatch('SMS', phone, message);
  },

  async sendDriverTripAssigned({ phone, vehicleNo, pickupAddr, tapalNo }) {
    const msg = `[Golden Fisheries] Trip ${tapalNo || ''} assigned. Vehicle: ${vehicleNo || 'TBD'}. Pickup: ${pickupAddr}. Open your driver app to start.`;
    const sms = await dispatch('SMS', phone, msg);
    return sms;
  },

  async sendHarvestConfirmation(farmerPhone, slipNo, date) {
    const msg = `Partner, Harvest Slip ${slipNo} (${date?.toDateString?.() || date}) is confirmed. Tapal issued. Golden Fisheries logistics will coordinate pickup.`;
    if (whatsappService.isConfigured()) {
      return dispatch('WHATSAPP', farmerPhone, msg);
    }
    return dispatch('SMS', farmerPhone, msg);
  },

  async sendBuyerDeliveryReady({ phone, tapalNo, qty }) {
    const msg = `[Golden Fisheries] Shipment ${tapalNo} delivered (${qty || 'cargo'}). Please verify receipt in your buyer portal.`;
    return dispatch('WHATSAPP', phone, msg);
  },

  async sendBuyerBillCreated({ phone, billNo, amount }) {
    const msg = `[Golden Fisheries] Buyer bill ${billNo} generated. Amount: ₹${amount}. View details in your portal.`;
    return dispatch('SMS', phone, msg);
  },

  async sendLowStockAlert(productName, currentQty, reorderLimit) {
    logger.warn(
      `[SYSTEM ALARM]: ${productName} stock low. Current: ${currentQty} KG. Reorder: ${reorderLimit} KG.`
    );
    return { success: true, channel: 'SYSTEM_ALARM', message: `Stock critical for ${productName}` };
  },

  async sendVehicleDocAlert({ vehicle, docType, alertType, expiryDate, assignedDriver }) {
    const msg = `[Vehicle Alert] ${vehicle?.vehicleNumber} — ${docType} ${alertType}. Expiry: ${expiryDate?.toDateString?.() || expiryDate}`;
    logger.warn(msg);
    if (assignedDriver?.phone) {
      await dispatch('SMS', assignedDriver.phone, msg);
    }
    return { success: true, channel: 'VEHICLE_DOC', vehicleNo: vehicle?.vehicleNumber, docType, alertType };
  }
};

export default notificationService;

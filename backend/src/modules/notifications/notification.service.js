import { logger } from '../../utils/logger.js';
import { smsService } from '../../services/sms.service.js';
import { whatsappService } from '../../services/whatsapp.service.js';
import { Notification } from './notification.model.js';
import { User } from '../users/user.model.js';
import { firebaseService } from '../../services/firebase.service.js';
import { broadcastEvent } from '../../sockets/socket.js';

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
  },

  /**
   * Create an in-app notification, save to DB, and broadcast via Socket.IO
   */
  async createInAppNotification({ userId, role, outletId, title, message, type, referenceId, referenceModel }) {
    try {
      const notif = await Notification.create({
        userId: userId || null,
        role: role || null,
        outletId: outletId || null,
        title,
        message,
        type,
        referenceId: referenceId || null,
        referenceModel: referenceModel || null,
      });

      // Format payload for real-time delivery
      const socketPayload = {
        id: notif._id,
        title,
        message,
        type,
        referenceId,
        referenceModel,
        read: false,
        createdAt: notif.createdAt,
      };

      // Broadcast to specific rooms
      if (userId) {
        const uid = String(userId);
        broadcastEvent('notification:received', socketPayload, `user:${uid}`);
      }
      
      if (role) {
        const normRole = role.toUpperCase();
        broadcastEvent('notification:received', socketPayload, `role:${normRole}`);

        // Mirror to updates rooms
        if (normRole.includes('FISHMALL')) {
          broadcastEvent('notification:received', socketPayload, 'fishmall:updates');
          if (outletId) {
            broadcastEvent('notification:received', socketPayload, `fishmall:outlet:${outletId}`);
          }
        }
        if (normRole.includes('REST') || normRole.includes('RESTAURANT')) {
          broadcastEvent('notification:received', socketPayload, 'restaurant:updates');
        }
      }

      // Also trigger a system-wide unread count update socket event
      broadcastEvent('notification:badge_update', { userId, role, outletId });

      // Trigger FCM push notification asynchronously in background
      (async () => {
        try {
          const tokens = [];
          if (userId) {
            const user = await User.findById(userId).select('deviceTokens');
            if (user?.deviceTokens) {
              tokens.push(...user.deviceTokens);
            }
          } else {
            const query = { isActive: true };
            if (role) {
              query.role = role.toUpperCase();
            }
            if (outletId) {
              query.fishMallOutletId = outletId;
            }

            if (role || outletId) {
              const users = await User.find(query).select('deviceTokens');
              for (const u of users) {
                if (u.deviceTokens) {
                  tokens.push(...u.deviceTokens);
                }
              }
            }
          }

          const uniqueTokens = [...new Set(tokens)].filter(Boolean);

          if (uniqueTokens.length > 0) {
            const result = await firebaseService.sendMulticast(uniqueTokens, {
              title,
              body: message,
              data: {
                id: notif._id.toString(),
                type,
                referenceId: referenceId ? referenceId.toString() : '',
                referenceModel: referenceModel || '',
              },
            });

            if (result.failedTokens && result.failedTokens.length > 0) {
              await User.updateMany(
                { deviceTokens: { $in: result.failedTokens } },
                { $pull: { deviceTokens: { $in: result.failedTokens } } }
              );
              logger.info(`[FCM Service] Cleaned up ${result.failedTokens.length} expired/invalid device tokens.`);
            }
          }
        } catch (pushErr) {
          logger.error(`[FCM Service Background Error]: ${pushErr.message}`);
        }
      })();

      return notif;
    } catch (err) {
      logger.error(`[In-App Notification Error]: ${err.message}`);
      return null;
    }
  }
};

export default notificationService;


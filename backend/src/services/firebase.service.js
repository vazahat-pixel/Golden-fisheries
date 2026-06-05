import admin from 'firebase-admin';
import { logger } from '../utils/logger.js';
import fs from 'fs';
import path from 'path';

let fcmInitialized = false;

try {
  const serviceAccountPath = path.join(process.cwd(), 'config/firebase-service-account.json');
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    fcmInitialized = true;
    logger.info('[FCM Service] Firebase Admin SDK initialized successfully.');
  } else if (process.env.FIREBASE_CREDENTIALS_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    fcmInitialized = true;
    logger.info('[FCM Service] Firebase Admin SDK initialized from env JSON.');
  } else {
    logger.warn('[FCM Service] Firebase Service Account JSON not found at config/firebase-service-account.json. Push notifications will be mocked.');
  }
} catch (error) {
  logger.error(`[FCM Service] Error initializing Firebase Admin SDK: ${error.message}`);
}

export const firebaseService = {
  isConfigured() {
    return fcmInitialized;
  },

  /**
   * Send push notification to multiple device tokens
   * @param {string[]} tokens
   * @param {object} payload - { title, body, data }
   * @returns {Promise<{successCount: number, failureCount: number, failedTokens: string[]}>}
   */
  async sendMulticast(tokens, { title, body, data = {} }) {
    // Filter empty tokens
    const validTokens = (tokens || []).filter(t => typeof t === 'string' && t.trim().length > 0);
    
    if (validTokens.length === 0) {
      return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    if (!fcmInitialized) {
      logger.info(`[FCM Push MOCK]: Send to ${validTokens.length} devices: Title="${title}", Body="${body}", Data=${JSON.stringify(data)}`);
      return { successCount: validTokens.length, failureCount: 0, failedTokens: [] };
    }

    // Ensure all data values are string
    const stringifiedData = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== null && val !== undefined) {
        stringifiedData[key] = String(val);
      }
    }

    const message = {
      notification: {
        title,
        body
      },
      data: stringifiedData,
      tokens: validTokens
    };

    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      logger.info(`[FCM Push]: Multicast response: success=${response.successCount}, failure=${response.failureCount}`);
      
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const err = resp.error;
          logger.warn(`[FCM Push Failed Token]: Index ${idx} failed: ${err?.message || 'Unknown error'}`);
          if (err && (
            err.code === 'messaging/invalid-registration-token' ||
            err.code === 'messaging/registration-token-not-registered'
          )) {
            failedTokens.push(validTokens[idx]);
          }
        }
      });

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens
      };
    } catch (error) {
      logger.error(`[FCM Push Error]: ${error.message}`);
      return {
        successCount: 0,
        failureCount: validTokens.length,
        failedTokens: []
      };
    }
  }
};

export default firebaseService;

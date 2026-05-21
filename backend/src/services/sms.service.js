import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

class SmsService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY?.trim() || '';
    this.gatewayUrl = config.integrations.sms.gatewayUrl;
    this.senderId = config.integrations.sms.senderId;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  shouldSkipRealSend() {
    return config.env === 'development' && !config.integrations.sms.forceSendInDev;
  }

  /** Generic transactional SMS (Fast2SMS bulk route). */
  async sendMessage(phone, message) {
    if (this.shouldSkipRealSend()) {
      logger.info(`[SMS Service]: Dev Mode - ${phone}: ${message}`);
      return { success: true, message: 'Dev mode: SMS skipped' };
    }

    if (!this.apiKey) {
      logger.warn('[SMS Service]: No SMS_API_KEY — message not sent.');
      return { success: false, message: 'SMS not configured' };
    }

    const response = await fetch(this.gatewayUrl, {
      method: 'POST',
      headers: {
        authorization: this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        route: 'q',
        message,
        language: 'english',
        numbers: phone
      })
    });

    const data = await response.json();
    if (data?.return === true) {
      logger.info(`[SMS Service]: Message sent to ${phone}`);
      return { success: true, data };
    }
    logger.error(`[SMS Service]: Send failed for ${phone}`, data);
    throw new Error(data?.message || 'Failed to send SMS');
  }

  /** Send OTP via Fast2SMS OTP route */
  async sendOtp(phone, otp) {
    if (this.shouldSkipRealSend()) {
      logger.info(`[SMS Service]: Dev Mode - Skip sending SMS to ${phone}. OTP: ${otp}`);
      return { success: true, message: 'Dev mode: SMS skipped' };
    }

    if (!this.apiKey) {
      logger.warn('[SMS Service]: No SMS_API_KEY found in environment variables.');
      throw new Error('SMS service not configured.');
    }

    try {
      const response = await fetch(this.gatewayUrl, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otp,
          numbers: phone
        })
      });

      const data = await response.json();

      if (data && data.return === true) {
        logger.info(`[SMS Service]: OTP sent successfully to ${phone}`);
        return { success: true, data };
      } else {
        logger.error(`[SMS Service Error]: Failed to send OTP to ${phone}. Response:`, data);
        throw new Error(data.message || 'Failed to send SMS');
      }
    } catch (error) {
      logger.error(`[SMS Service Error]: Exception while sending SMS to ${phone}: ${error.message}`);
      throw error;
    }
  }
}

export const smsService = new SmsService();
export default smsService;

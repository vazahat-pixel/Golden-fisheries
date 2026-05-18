import { logger } from '../utils/logger.js';

class SmsService {
  constructor() {
    this.apiKey = process.env.SMS_API_KEY;
    this.gatewayUrl = 'https://www.fast2sms.com/dev/bulkV2';
  }

  /**
   * Send OTP via Fast2SMS (Indian Gateway)
   * @param {string} phone 10 digit phone number
   * @param {string} otp 6 digit OTP
   */
  async sendOtp(phone, otp) {
    // In development, we don't send real SMS to save credits
    if (process.env.NODE_ENV === 'development') {
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

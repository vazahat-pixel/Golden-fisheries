import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

/** Normalize 10-digit Indian mobile to 91XXXXXXXXXX for gateways. */
function toE164India(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits;
}

function parseSmsIndiaHubResponse(data) {
  const code = String(data?.ErrorCode ?? '').padStart(3, '0');
  if (code === '000') {
    return { ok: true, data };
  }
  const msg = data?.ErrorMessage || `SMS India Hub error ${data?.ErrorCode ?? 'unknown'}`;
  return { ok: false, message: msg, data };
}

class SmsService {
  constructor() {
    const sms = config.integrations.sms;
    this.provider = sms.provider;
    this.apiKey = sms.apiKey;
    this.gatewayUrl = sms.gatewayUrl;
    this.senderId = sms.senderId;
    this.user = sms.user;
    this.password = sms.password;
    this.entityId = sms.entityId;
    this.dltTemplateId = sms.dltTemplateId;
    this.channel = sms.channel;
    this.route = sms.route;
    this.otpTemplate = sms.otpTemplate;
    this.otpBrandName = sms.otpBrandName;
  }

  isConfigured() {
    if (this.provider === 'smsindiahub') {
      const hasAuth = Boolean(this.apiKey) || (Boolean(this.user) && Boolean(this.password));
      return Boolean(
        hasAuth &&
          this.senderId &&
          this.entityId &&
          this.dltTemplateId &&
          this.otpTemplate
      );
    }
    return Boolean(this.apiKey);
  }

  shouldSkipRealSend() {
    return config.env === 'development' && !config.integrations.sms.forceSendInDev;
  }

  buildOtpMessage(otp) {
    const varSlot = /##var##|\{#var#\}/i;
    let text = this.otpTemplate;

    if ((text.match(/##var##|\{#var#\}/gi) || []).length >= 2) {
      text = text.replace(varSlot, this.otpBrandName);
      text = text.replace(varSlot, otp);
      return text;
    }

    return text
      .replace(/\{#var#\}/gi, otp)
      .replace(/##var##/gi, otp)
      .replace(/\{otp\}/gi, otp)
      .replace(/##OTP##/gi, otp);
  }

  usesLegacyPushSms() {
    return /pushsms\.aspx/i.test(this.gatewayUrl);
  }

  /** Legacy panel URL: vendorsms/pushsms.aspx (msisdn, sid, msg, gwid). */
  buildLegacyPushSmsParams(phone, text) {
    const params = new URLSearchParams({
      msisdn: toE164India(phone),
      sid: this.senderId,
      msg: text,
      fl: '0',
      gwid: this.route || '2'
    });
    if (this.apiKey) {
      params.set('APIKey', this.apiKey);
    } else {
      params.set('user', this.user);
      params.set('password', this.password);
    }
    if (this.entityId) params.set('EntityId', this.entityId);
    if (this.dltTemplateId) params.set('dlttemplateid', this.dltTemplateId);
    return params;
  }

  /** Modern API: cloud.smsindiahub.in/api/mt/SendSMS */
  buildSendSmsParams(phone, text, { channel: channelOverride } = {}) {
    const params = new URLSearchParams({
      senderid: this.senderId,
      channel: channelOverride || this.channel,
      DCS: '0',
      flashsms: '0',
      number: toE164India(phone),
      text
    });
    if (this.apiKey) {
      params.set('APIKey', this.apiKey);
    } else {
      params.set('user', this.user);
      params.set('password', this.password);
    }
    if (this.entityId) {
      params.set('EntityId', this.entityId);
      params.set('PEId', this.entityId);
    }
    if (this.dltTemplateId) params.set('dlttemplateid', this.dltTemplateId);
    if (this.route) params.set('route', this.route);
    return params;
  }

  async sendViaSmsIndiaHub(phone, text, { isOtp = false, channel } = {}) {
    const params = this.usesLegacyPushSms()
      ? this.buildLegacyPushSmsParams(phone, text)
      : this.buildSendSmsParams(phone, text, { channel: isOtp ? channel || 'Trans' : channel });

    const url = `${this.gatewayUrl}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      logger.error('[SMS Service]: Non-JSON response from SMS India Hub', raw?.slice(0, 500));
      throw new Error('Invalid response from SMS gateway');
    }

    const parsed = parseSmsIndiaHubResponse(data);
    if (parsed.ok) {
      logger.info(
        `[SMS Service]: ${isOtp ? 'OTP' : 'Message'} submitted to ${phone} (JobId: ${data?.JobId ?? 'n/a'})`
      );
      return { success: true, data };
    }

    logger.error(`[SMS Service]: SMS India Hub rejected send to ${phone}`, data);
    throw new Error(parsed.message);
  }

  async sendViaFast2Sms(phone, payload) {
    const response = await fetch(this.gatewayUrl, {
      method: 'POST',
      headers: {
        authorization: this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (data?.return === true) {
      return { success: true, data };
    }
    throw new Error(data?.message || 'Failed to send SMS');
  }

  /** Generic transactional SMS. */
  async sendMessage(phone, message) {
    if (this.shouldSkipRealSend()) {
      logger.info(`[SMS Service]: Dev Mode - ${phone}: ${message}`);
      return { success: true, message: 'Dev mode: SMS skipped' };
    }

    if (!this.isConfigured()) {
      logger.warn('[SMS Service]: SMS provider not fully configured — message not sent.');
      return { success: false, message: 'SMS not configured' };
    }

    if (this.provider === 'smsindiahub') {
      return this.sendViaSmsIndiaHub(phone, message);
    }

    return this.sendViaFast2Sms(phone, {
      route: 'q',
      message,
      language: 'english',
      numbers: phone
    }).then((r) => {
      logger.info(`[SMS Service]: Message sent to ${phone}`);
      return r;
    });
  }

  /** Send OTP (login / driver panels). */
  async sendOtp(phone, otp) {
    if (this.shouldSkipRealSend()) {
      logger.info(`[SMS Service]: Dev Mode - Skip sending SMS to ${phone}. OTP: ${otp}`);
      return { success: true, message: 'Dev mode: SMS skipped' };
    }

    if (!this.isConfigured()) {
      logger.warn('[SMS Service]: SMS provider not fully configured.');
      throw new Error('SMS service not configured. Set SMS_API_KEY and DLT fields in .env');
    }

    try {
      if (this.provider === 'smsindiahub') {
        const text = this.buildOtpMessage(otp);
        logger.info(`[SMS Service]: OTP message body length=${text.length} (must match DLT template exactly)`);
        // Use transactional credits (Trans). OTP channel often has separate/zero balance.
        return await this.sendViaSmsIndiaHub(phone, text, { isOtp: true, channel: 'Trans' });
      }

      const result = await this.sendViaFast2Sms(phone, {
        route: 'otp',
        variables_values: otp,
        numbers: phone
      });
      logger.info(`[SMS Service]: OTP sent successfully to ${phone}`);
      return result;
    } catch (error) {
      logger.error(`[SMS Service Error]: Exception while sending SMS to ${phone}: ${error.message}`);
      throw error;
    }
  }
}

export const smsService = new SmsService();
export default smsService;

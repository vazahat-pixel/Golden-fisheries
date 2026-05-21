import { logger } from '../utils/logger.js';
import { config } from '../config/config.js';

/** Meta WhatsApp Cloud API — uses WHATSAPP_* from .env */
class WhatsAppService {
  constructor() {
    this.token = process.env.WHATSAPP_ACCESS_TOKEN?.trim() || '';
    this.phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() || '';
    this.apiVersion = config.integrations.whatsapp.apiVersion;
  }

  isConfigured() {
    return Boolean(this.token && this.phoneId);
  }

  normalizePhone(phone) {
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) return `91${digits}`;
    return digits;
  }

  async sendText(phone, message) {
    if (!this.isConfigured()) {
      logger.info(`[WhatsApp Dev]: Would send to ${phone}: ${message}`);
      return { success: true, channel: 'WHATSAPP', mode: 'dev-stub', phone };
    }

    const to = this.normalizePhone(phone);
    const url = `https://graph.facebook.com/${this.apiVersion}/${this.phoneId}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      logger.error('[WhatsApp API Error]:', data);
      throw new Error(data?.error?.message || 'WhatsApp send failed');
    }

    logger.info(`[WhatsApp]: Message queued to ${to}`);
    return { success: true, channel: 'WHATSAPP', phone: to, data };
  }
}

export const whatsappService = new WhatsAppService();
export default whatsappService;

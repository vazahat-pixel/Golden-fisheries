/**
 * Send a test OTP SMS via configured provider.
 * Usage: node scripts/testSms.js 9876543210
 * Requires backend/.env with SMS India Hub (or Fast2SMS) credentials.
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { config } = await import('../src/config/config.js');
const { smsService } = await import('../src/services/sms.service.js');

const phone = process.argv[2];
if (!phone || !/^\d{10}$/.test(phone)) {
  console.error('Usage: node scripts/testSms.js <10-digit-mobile>');
  process.exit(1);
}

console.log('Provider:', config.integrations.sms.provider);
console.log('Configured:', smsService.isConfigured());

if (!smsService.isConfigured()) {
  console.error('SMS not fully configured. See backend/.env.example');
  process.exit(1);
}

const otp = String(Math.floor(100000 + Math.random() * 900000));
try {
  const result = await smsService.sendOtp(phone, otp);
  console.log('Success:', JSON.stringify(result, null, 2));
  console.log('OTP sent (for verification):', otp);
} catch (err) {
  console.error('Failed:', err.message);
  process.exit(1);
}

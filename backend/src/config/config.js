import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with explicit path to ensure reliability
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

/**
 * Validate configuration inputs to ensure the backend fails-fast
 * during startup if critical configurations are missing or invalid.
 */
const requiredEnv = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

const missingEnv = requiredEnv.filter((env) => !process.env[env]);

if (missingEnv.length > 0) {
  console.error('[Config Error] Process CWD:', process.cwd());
  console.error('[Config Error] Loading .env from:', envPath);
  console.error('[Config Error] Current Keys:', Object.keys(process.env).filter(k => !k.startsWith('npm_')));
  throw new Error(
    `[Config Engine Error]: Missing mandatory environment variables: ${missingEnv.join(', ')}`
  );
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI,
    options: {}
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: process.env.CORS_CREDENTIALS === 'true'
  },
  auth: {
    allowDriverSelfRegister: process.env.ALLOW_DRIVER_SELF_REGISTER === 'true',
    allowDevOtpBootstrap: process.env.ALLOW_DEV_OTP_BOOTSTRAP === 'true'
  },
  integrations: {
    sms: (() => {
      const provider = (process.env.SMS_PROVIDER || 'smsindiahub').toLowerCase();
      const apiKey = process.env.SMS_API_KEY?.trim() || '';
      const senderId = process.env.SMS_SENDER_ID?.trim() || null;
      const entityId = process.env.SMS_ENTITY_ID?.trim() || process.env.SMS_PE_ID?.trim() || null;
      const dltTemplateId = process.env.SMS_DLT_TEMPLATE_ID?.trim() || null;
      const otpTemplate =
        process.env.SMS_OTP_TEMPLATE?.trim() ||
        'Welcome to ##var## Powered by IIDMTB. Use OTP ##var## to verify your login.';
      const otpBrandName = process.env.SMS_OTP_BRAND_NAME?.trim() || 'Golden Fisheries';
      const isIndiaHub = provider === 'smsindiahub';
      const indiaHubReady = Boolean(
        apiKey && senderId && entityId && dltTemplateId && otpTemplate
      );
      const rawChannel = (process.env.SMS_CHANNEL?.trim() || 'Trans').toLowerCase();
      const channel =
        rawChannel === 'transactional' || rawChannel === 'trans' ? 'Trans'
        : rawChannel === 'promotional' || rawChannel === 'promo' ? 'Promo'
        : rawChannel === 'otp' ? 'OTP'
        : process.env.SMS_CHANNEL?.trim() || 'Trans';
      const legacyHubUrl = process.env.SMS_INDIA_HUB_URL?.trim() || '';
      const indiaHubGateway =
        process.env.SMS_GATEWAY_URL?.trim() ||
        (legacyHubUrl && !/pushsms\.aspx/i.test(legacyHubUrl) ? legacyHubUrl : null) ||
        'https://cloud.smsindiahub.in/api/mt/SendSMS';
      return {
        provider: isIndiaHub ? 'smsindiahub' : 'fast2sms',
        apiKey,
        user: process.env.SMS_USER?.trim() || null,
        password: process.env.SMS_PASSWORD?.trim() || null,
        gatewayUrl: isIndiaHub
          ? indiaHubGateway
          : process.env.SMS_GATEWAY_URL || 'https://www.fast2sms.com/dev/bulkV2',
        forceSendInDev: process.env.SMS_FORCE_SEND === 'true',
        senderId,
        entityId,
        dltTemplateId,
        otpTemplate,
        otpBrandName,
        channel,
        route: process.env.SMS_ROUTE?.trim() || null,
        enabled: isIndiaHub ? indiaHubReady : Boolean(apiKey)
      };
    })(),
    whatsapp: {
      enabled: Boolean(
        process.env.WHATSAPP_ACCESS_TOKEN?.trim() && process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
      ),
      apiVersion: process.env.WHATSAPP_API_VERSION || 'v21.0',
      verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || null
    },
    maps: {
      enabled: Boolean(process.env.GOOGLE_MAPS_API_KEY?.trim()),
      region: process.env.GOOGLE_MAPS_REGION || 'in'
    }
  }
};

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
  }
};

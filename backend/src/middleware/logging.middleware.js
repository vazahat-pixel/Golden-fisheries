import morgan from 'morgan';
import { logger } from '../utils/logger.js';

// Pipe Morgan output streams directly into our Winston logger
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Log only requests with 4xx or 5xx status codes when in production for database saving, log all in dev
const skip = () => {
  const env = process.env.NODE_ENV || 'development';
  return env !== 'development';
};

export const loggingMiddleware = morgan(
  ':remote-addr - :method :url :status :res[content-length] - :response-time ms',
  { stream }
);

import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

// 1. Core API Rate Limiters to prevent brute-force attacks
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 500, // Increased from 30 to 500 for dev/testing flexibility
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    logger.warn(`[API Rate Limiter Alert]: Brute-force threshold hit from IP: ${req.ip} on route: ${req.originalUrl}`);
    next(new AppError('Too many authentication attempts. Please try again later.', 429));
  }
});

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // Limit each IP to 10 OTP requests per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    logger.warn(`[OTP Rate Limiter Alert]: Brute-force threshold hit from IP: ${req.ip} on route: ${req.originalUrl}`);
    next(new AppError('Too many attempts. Please try again after 15 minutes.', 429));
  }
});

export const generalApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 120, // Limit each IP to 120 API requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many requests. Please slow down.', 429));
  }
});

// 2. Safe NoSQL Injection Sanitizer Middleware
export const sanitizeMongoQueries = (req, res, next) => {
  const clean = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (key.startsWith('$')) {
          logger.warn(`[Security Sanitizer]: Blocked suspected NoSQL Injection parameter: "${key}"`);
          delete obj[key]; // Strip parameter
        } else {
          clean(obj[key]);
        }
      }
    }
  };

  clean(req.body);
  clean(req.query);
  clean(req.params);
  next();
};

// 3. XSS HTML Stripping Sanitizer Middleware
export const sanitizeXSS = (req, res, next) => {
  const htmlTagRegex = /<[^>]*>/g;

  const sanitizeString = (val) => {
    if (typeof val === 'string') {
      const cleaned = val.replace(htmlTagRegex, '');
      if (cleaned !== val) {
        logger.warn(`[Security Sanitizer]: HTML elements stripped from input. Original: "${val}" -> Cleaned: "${cleaned}"`);
      }
      return cleaned;
    }
    return val;
  };

  const traverse = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          obj[key] = sanitizeString(obj[key]);
        } else {
          traverse(obj[key]);
        }
      }
    }
  };

  traverse(req.body);
  traverse(req.query);
  next();
};

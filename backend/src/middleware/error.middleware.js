import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

/**
 * Express Global Error Handling Middleware.
 * Catches all thrown AppErrors and unexpected server exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors to the console/files via Winston
  logger.error(`[Error Trace]: ${err.message}\nStack: ${err.stack}`);

  if (config.env === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }

  // In Production, do not expose system internal execution stack leaks
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  }

  // Programming or other unknown errors: don't leak details to clients
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'A critical internal server error occurred.'
  });
};

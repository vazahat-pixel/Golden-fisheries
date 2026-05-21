import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

/**
 * Express Global Error Handling Middleware.
 * Catches all thrown AppErrors and unexpected server exceptions.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log 500+ errors as errors with full stack traces, and 4xx errors as simple warnings to keep console clean
  if (err.statusCode >= 500) {
    logger.error(`[Error Trace]: ${err.message}\nStack: ${err.stack}`);
  } else {
    logger.warn(`[Client Error]: ${err.statusCode} - ${err.message}`);
  }

  // Handle MongoDB duplicate key errors (11000)
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    err.message = `Duplicate field value: ${field}. Please use another value!`;
    err.statusCode = 400;
    err.isOperational = true;
  }

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err.message = `Invalid input data: ${errors.join('. ')}`;
    err.statusCode = 400;
    err.isOperational = true;
  }

  // Handle Mongoose Cast Errors (Invalid ID)
  if (err.name === 'CastError') {
    err.message = `Invalid ${err.path}: ${err.value}.`;
    err.statusCode = 400;
    err.isOperational = true;
  }

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

import { config } from '../config/config.js';
import { logger } from '../utils/logger.js';

/**
 * Express global error handler — always returns { success, message, data, errors? }.
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  logger.error(`[Error Trace]: ${err.message}\nStack: ${err.stack}`);

  const buildBody = (statusCode, message, errors = null, includeStack = false) => {
    const body = {
      success: false,
      message,
      data: null
    };
    if (errors) body.errors = errors;
    if (includeStack && err.stack) body.stack = err.stack;
    return res.status(statusCode).json(body);
  };

  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    return buildBody(409, `${field} already exists`, [
      { field, message: 'Duplicate value' }
    ]);
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return buildBody(422, 'Validation failed', errors.length ? errors : null);
  }

  if (err.name === 'CastError') {
    return buildBody(400, `Invalid ${err.path}: ${err.value}.`);
  }

  if (err.name === 'JsonWebTokenError') {
    return buildBody(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return buildBody(401, 'Token expired');
  }

  if (config.env === 'development') {
    return buildBody(err.statusCode, err.message, null, true);
  }

  if (err.isOperational) {
    return buildBody(err.statusCode, err.message);
  }

  return buildBody(500, 'A critical internal server error occurred.');
};

/**
 * Custom operational error class to distinguish between 
 * programmed failures (validations, unauthenticated, unauthorized)
 * and unpredictable runtime exceptions (DB down, syntax error, etc.).
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for our error handler to know to send error stack or safe message

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Consistent API success response formatter.
 * Ensures all network requests return a standardized structure to the frontend.
 */
export class ApiResponse {
  /**
   * Format success response
   * @param {number} statusCode - HTTP status code
   * @param {any} data - Response payload
   * @param {string} message - User-facing or log summary message
   * @param {object} meta - Optional pagination, sync stats, or metadata
   */
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
    if (meta !== null) {
      this.meta = meta;
    }
  }

  /**
   * Helper method to send formatted response instantly
   * @param {object} res - Express response object
   */
  send(res) {
    return res.status(this.statusCode).json(this);
  }
}

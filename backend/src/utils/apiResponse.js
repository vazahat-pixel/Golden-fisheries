import { normalizePaginationMeta } from './response.js';

/**
 * Consistent API success response formatter.
 * HTTP status is set via res.status(); body is always { success, message, data, meta? }.
 */
export class ApiResponse {
  constructor(statusCode, data = null, message = 'Success', meta = null) {
    this.success = true;
    this._statusCode = statusCode;
    this.message = message;
    this.data = data === undefined ? null : data;
    if (meta != null) {
      this.meta = normalizePaginationMeta(meta);
    }
  }

  send(res) {
    const payload = {
      success: this.success,
      message: this.message,
      data: this.data
    };
    if (this.meta != null) payload.meta = this.meta;
    return res.status(this._statusCode).json(payload);
  }
}

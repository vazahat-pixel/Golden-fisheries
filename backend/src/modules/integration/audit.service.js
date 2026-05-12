import { AuditLog } from './auditLog.model.js';
import { logger } from '../../utils/logger.js';

export const auditService = {
  /**
   * Appends a security audit entry to the database ledger
   */
  logEvent: async (req, action, resource, resourceId = null, details = null, status = 'SUCCESS') => {
    try {
      const log = new AuditLog({
        userId: req.user.id,
        userPhone: req.user.phone,
        role: req.user.role,
        action,
        resource,
        resourceId,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'unknown',
        status,
        details
      });

      await log.save();
      logger.info(`[Audit Ledger]: User ${req.user.phone} (${req.user.role}) executed action: ${action} on ${resource}`);
      return log;
    } catch (err) {
      logger.error(`[Audit Logger Failure]: ${err.message}`);
    }
  }
};
export default auditService;

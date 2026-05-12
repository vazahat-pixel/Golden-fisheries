import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    userPhone: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true
    },
    action: {
      type: String, // e.g. "CREATE_INVOICE", "SETTLE_ORDER", "MANUAL_ADJUSTMENT"
      required: true,
      index: true
    },
    resource: {
      type: String, // e.g. "Billing", "RestaurantOrder", "Product"
      required: true
    },
    resourceId: {
      type: String, // e.g. record ID
      default: null
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    userAgent: {
      type: String,
      default: 'unknown'
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE'],
      default: 'SUCCESS'
    },
    details: {
      type: mongoose.Schema.Types.Mixed, // Optional detailed payload cache
      default: null
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Audit logs are immutable (no update stamp)
  }
);

export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;

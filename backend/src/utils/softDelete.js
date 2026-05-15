import { logger } from './logger.js';

/**
 * Reusable Mongoose Schema Plugin for Soft Deletes.
 * Appends `isDeleted` and `deletedAt` attributes, hooking query layers.
 */
export const softDeletePlugin = (schema) => {
  // 1. Add fields to schema
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedAt: {
      type: Date,
      default: null
    }
  });

  // 2. Pre-hook query filters to exclude soft-deleted records automatically
  const excludeDeletedHook = function (next) {
    const filter = this.getFilter();
    if (filter.isDeleted === undefined) {
      this.where({ isDeleted: { $ne: true } });
    }
    next();
  };

  const queryMethods = [
    'find',
    'findOne',
    'findOneAndUpdate',
    'update',
    'updateMany',
    'countDocuments',
    'aggregate'
  ];

  queryMethods.forEach((method) => {
    // Note: Mongoose aggregate hook receives aggregate pipeline differently, so we handle standard query methods first
    if (method !== 'aggregate') {
      schema.pre(method, excludeDeletedHook);
    }
  });

  // Support aggregate pipeline filters
  schema.pre('aggregate', function (next) {
    const pipeline = this.pipeline();
    // Prepend a $match stage to exclude deleted documents
    pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
    next();
  });

  // 3. Add custom instance method for soft deleting
  schema.methods.softDelete = async function (userId = null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    if (userId) {
      this.deletedBy = userId; // Bind deleter trace
    }
    logger.info(`[Database Engine - Soft Delete]: Soft deleted document ID: ${this._id} on Collection: ${this.constructor.modelName}`);
    return await this.save();
  };

  // 4. Add custom instance method for restoring records
  schema.methods.restore = async function () {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = undefined;
    logger.info(`[Database Engine - Restore]: Restored document ID: ${this._id} on Collection: ${this.constructor.modelName}`);
    return await this.save();
  };
};

export default softDeletePlugin;

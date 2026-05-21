import { AppError } from '../utils/appError.js';

/**
 * Base Service class embodying the service-layer pattern.
 * Encapsulates standard MongoDB data querying logic to maintain
 * clean, focused, testable, and reusable business operations.
 */
export class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Fetch document by database ID
   */
  async findById(id, populateOptions = '') {
    const q = { _id: id };
    if (this.model.schema.paths.isDeleted) {
      q.isDeleted = { $ne: true };
    }
    const doc = await this.model.findOne(q).populate(populateOptions);
    if (!doc) {
      throw new AppError(`Resource with ID ${id} not found`, 404);
    }
    return doc;
  }

  /**
   * Find single active document by query criteria
   */
  async findOne(filter = {}, populateOptions = '') {
    const activeFilter = { ...filter };
    if (this.model.schema.paths.isActive) {
      Object.assign(activeFilter, { isActive: { $ne: false } });
    }
    if (this.model.schema.paths.isDeleted) {
      Object.assign(activeFilter, { isDeleted: { $ne: true } });
    }
    return await this.model.findOne(activeFilter).populate(populateOptions);
  }

  /**
   * Find list of active documents matching criteria with pagination
   */
  async findMany(filter = {}, queryOptions = {}, populateOptions = '') {
    const page = parseInt(queryOptions.page, 10) || 1;
    const limit = parseInt(queryOptions.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const sort = queryOptions.sort || { createdAt: -1 };

    const activeFilter = { ...filter };
    if (this.model.schema.paths.isActive) {
      Object.assign(activeFilter, { isActive: { $ne: false } });
    }
    if (this.model.schema.paths.isDeleted) {
      Object.assign(activeFilter, { isDeleted: { $ne: true } });
    }

    const [docs, totalDocs] = await Promise.all([
      this.model.find(activeFilter)
         .sort(sort)
         .skip(skip)
         .limit(limit)
         .populate(populateOptions),
      this.model.countDocuments(activeFilter)
    ]);

    const totalPages = Math.ceil(totalDocs / limit);

    return {
      docs,
      meta: {
        totalDocs,
        total: totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Create new document instance
   */
  async create(data) {
    return await this.model.create(data);
  }

  /**
   * Find and update document by ID
   */
  async updateById(id, updateData) {
    const doc = await this.model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });
    if (!doc) {
      throw new AppError(`Resource with ID ${id} not found to update`, 404);
    }
    return doc;
  }

  /**
   * Delete document by ID (Performs automatic Soft Delete if schema supports isActive)
   */
  async deleteById(id) {
    let doc;
    if (this.model.schema.paths.isActive) {
      doc = await this.model.findByIdAndUpdate(id, { isActive: false }, { new: true });
    } else {
      doc = await this.model.findByIdAndDelete(id);
    }
    if (!doc) {
      throw new AppError(`Resource with ID ${id} not found to delete`, 404);
    }
    return doc;
  }
}

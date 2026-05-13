import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { Product } from '../products/product.model.js';
import { InventoryTransaction } from './inventoryTransaction.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';


class InventoryService extends BaseService {
  constructor() {
    super(Product); // Products act as the core stock ledger records
  }

  /**
   * Fetch live stock levels with alerts
   */
  async getLiveStockLevels(queryParams) {
    const { page = 1, limit = 10, search, category } = queryParams;
    const filter = {};

    if (category) filter.category = category;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.name = searchRegex;
    }

    // Return paginated list of products containing stock levels
    return await this.findMany(filter, { page, limit });
  }

  /**
   * Safe Stock Adjustment Engine.
   * Modifies quantities atomically inside a Mongoose transaction, appending to the audit ledger.
   */
  async adjustStock(productId, qtyChange, transactionType, referenceDetails = {}, userId, remarks = '') {
    const session = referenceDetails.session || null;
    const localSession = !session ? await mongoose.startSession() : null;
    
    if (localSession) {
      localSession.startTransaction();
    }

    const activeSession = session || localSession;

    try {
      const product = await Product.findById(productId).session(activeSession);
      if (!product) {
        throw new AppError('Product not found in registry', 404);
      }

      const prevQty = product.quantity || 0;
      const nextQty = prevQty + qtyChange;

      if (nextQty < 0) {
        throw new AppError(`Stock reconciliation failure: Insufficient stock for ${product.name}. Current: ${prevQty}, requested deduction: ${Math.abs(qtyChange)}`, 400);
      }

      // Update product quantity
      product.quantity = nextQty;
      await product.save({ session: activeSession });

      // Trigger real-time inventory level update across browser sessions
      broadcastEvent('inventory:level_update', {
        productId: product._id,
        name: product.name,
        quantity: nextQty,
        transactionType
      });


      // Spawn audit ledger log
      const tx = new InventoryTransaction({
        productId: product._id,
        type: transactionType,
        quantity: qtyChange,
        previousQuantity: prevQty,
        newQuantity: nextQty,
        referenceId: referenceDetails.referenceId || null,
        referenceModel: referenceDetails.referenceModel || null,
        performedBy: userId,
        remarks: remarks || `Stock adjusted via ${transactionType}`
      });

      await tx.save({ session: activeSession });

      if (localSession) {
        await localSession.commitTransaction();
        localSession.endSession();
      }

      logger.info(`[Stock Ledger]: Adjusted ${product.name} stock. Change: ${qtyChange}, New Stock: ${nextQty}, Tx Code: ${tx.transactionCode}`);
      return { product, transaction: tx };
    } catch (error) {
      if (localSession) {
        await localSession.abortTransaction();
        localSession.endSession();
      }
      throw error;
    }
  }

  /**
   * Manual admin audit calibration
   */
  async manualAdjustment(productId, qtyChange, remarks, userId) {
    return await this.adjustStock(
      productId, 
      qtyChange, 
      'MANUAL_ADJUSTMENT', 
      {}, 
      userId, 
      remarks
    );
  }

  /**
   * Fetch all inventory transaction logs with pagination
   */
  async getTransactionHistory(queryParams) {
    const { page = 1, limit = 10, type, productId } = queryParams;
    const filter = {};

    if (type) filter.type = type;
    if (productId) filter.productId = productId;

    // Return audit history paginated list
    const docs = await InventoryTransaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10))
      .populate('productId performedBy');

    const totalDocs = await InventoryTransaction.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limit);

    return {
      docs,
      meta: {
        totalDocs,
        limit,
        page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }
}

export const inventoryService = new InventoryService();
export default inventoryService;

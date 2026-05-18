import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { FishMallSale } from './fishmallSale.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class FishMallService extends BaseService {
  constructor() {
    super(FishMallSale);
  }

  /**
   * Search and filter retail sales
   */
  async findSalesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, paymentMethod } = queryParams;
    const filter = {};

    if (paymentMethod) filter.paymentMethod = paymentMethod;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { saleNumber: searchRegex },
        { customerPhone: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }

  /**
   * Safe Transaction: Completes weight-based scale billing and triggers stock deductions
   */
  async createSale(saleData, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let subtotal = 0;
      const verifiedItems = [];

      for (const item of saleData.items) {
        const lineTotal = item.scaleWeight * item.rate;
        subtotal += lineTotal;
        verifiedItems.push({
          productId: item.productId,
          fishName: item.fishName,
          scaleWeight: item.scaleWeight,
          rate: item.rate,
          amount: lineTotal
        });
      }

      // standard 5% tax or zero tax on raw seafood (defaulting to zero or custom tax rate)
      const taxRate = saleData.taxRate || 0;
      const taxAmount = (subtotal * taxRate) / 100;
      const totalAmount = subtotal + taxAmount;

      const sale = new FishMallSale({
        customerPhone: saleData.customerPhone || 'WALK_IN',
        items: verifiedItems,
        subtotal,
        taxAmount,
        totalAmount,
        paymentMethod: saleData.paymentMethod || 'CASH',
        createdBy: userId
      });

      await sale.save({ session });

      // Trigger stock deduction inside transaction session
      for (const item of sale.items) {
        await inventoryService.adjustStock(
          item.productId,
          -item.scaleWeight, // Deduct weight directly from inventory
          'FISHMALL_SALE',
          {
            referenceId: sale._id,
            referenceModel: 'FishMallSale',
            session
          },
          userId,
          `Scale retail sale completed via FishMall POS ${sale.saleNumber}`
        );
      }

      await session.commitTransaction();
      session.endSession();

      logger.info(`[FishMall Retail]: Sale ${sale.saleNumber} completed. Total: ₹${totalAmount}. Stock deducted.`);
      return sale;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const fishmallService = new FishMallService();
export default fishmallService;

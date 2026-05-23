import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { FishMallSale } from './fishmallSale.model.js';
import { fishMallInventoryService } from './fishMallInventory.service.js';
import { fishMallAccountingService } from './fishMallAccounting.service.js';
import { FishMallCashbookEntry } from './fishMallAccounting.model.js';
import { fishMallOutletService } from '../fishmall-outlet/fishMallOutlet.service.js';
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
    // Resolve active outletId
    const outletId = saleData.outletId || (await fishMallOutletService.ensureDefaultOutlet())._id;

    // Check if the cashier has an active open session. Day cannot start without opening balance.
    const activeSession = await fishMallAccountingService.getActiveSession(userId, outletId);
    if (!activeSession) {
      throw new AppError('Operations are locked! Day cannot start without opening balance. Please open shift first.', 400);
    }

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
          inventoryItemId: item.inventoryItemId,
          fishName: item.fishName,
          scaleWeight: item.scaleWeight,
          rate: item.rate,
          amount: lineTotal
        });
      }

      // standard tax processing
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

      // Deduct from isolated Fish Mall retail inventory only
      await fishMallInventoryService.deductForSale(sale, userId, session);

      // --- ACCOUNTING INTEGRATION ---
      const pm = sale.paymentMethod;
      const cashAmount = pm === 'CASH' ? totalAmount : 0;
      const upiAmount = pm === 'UPI' ? totalAmount : 0;
      const cardAmount = pm === 'CARD' ? totalAmount : 0;

      // Log cashbook inflow ledger entry
      await FishMallCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            outletId,
            type: 'INFLOW',
            category: 'RETAIL_SALE',
            paymentMethod: pm,
            amount: totalAmount,
            cashAmount,
            upiAmount,
            cardAmount,
            description: `Retail POS Sale: ${sale.saleNumber}`,
            referenceId: sale._id,
            referenceModel: 'FishMallSale',
            createdBy: userId
          }
        ],
        { session }
      );

      // Increment active shift session balance counters
      activeSession.salesTotal += totalAmount;
      if (pm === 'CASH') activeSession.cashSalesTotal += totalAmount;
      if (pm === 'UPI') activeSession.upiSalesTotal += totalAmount;
      if (pm === 'CARD') activeSession.cardSalesTotal += totalAmount;

      activeSession.expectedClosingCash = activeSession.openingCash + activeSession.cashSalesTotal - activeSession.cashExpensesTotal;
      activeSession.expectedClosingUpi = activeSession.upiSalesTotal - activeSession.upiExpensesTotal;

      await activeSession.save({ session });

      await session.commitTransaction();
      session.endSession();

      logger.info(`[FishMall Retail]: Sale ${sale.saleNumber} completed. Total: ₹${totalAmount}. Fish Mall stock and cashbook updated.`);
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

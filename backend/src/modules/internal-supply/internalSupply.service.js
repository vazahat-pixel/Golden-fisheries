import mongoose from 'mongoose';
import { InternalSupplyBill } from './internalSupplyBill.model.js';
import { FishMallInventoryItem } from '../fishmall/fishMallInventory.model.js';
import { fishMallInventoryService } from '../fishmall/fishMallInventory.service.js';
import { restaurantInventoryService } from '../restaurant/restaurantInventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';

/**
 * Fish Mall → Restaurant internal supply (invoice + paired stock movement).
 * Procurement inventory is never touched.
 */
class InternalSupplyService {
  /**
   * @param {{ items: Array<{ fishMallItemId, quantity, rate? }>, remarks?: string }} payload
   */
  async createFishMallToRestaurantBill(payload, userId) {
    if (!payload?.items?.length) {
      throw new AppError('At least one line item is required', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const bill = new InternalSupplyBill({
        lines: [],
        subtotal: 0,
        totalAmount: 0,
        status: 'ISSUED',
        remarks: payload.remarks || 'Internal supply to restaurant kitchen',
        createdBy: userId,
      });
      await bill.save({ session });

      const billLines = [];
      let subtotal = 0;

      for (const line of payload.items) {
        const qty = parseFloat(line.quantity);
        if (!qty || qty <= 0) {
          throw new AppError('Quantity must be greater than zero', 400);
        }

        const fmItem = await FishMallInventoryItem.findById(line.fishMallItemId).session(
          session
        );
        if (!fmItem || !fmItem.isActive) {
          throw new AppError('Fish Mall inventory item not found', 404);
        }

        const rate = line.rate != null ? parseFloat(line.rate) : fmItem.rate;
        const amount = Math.round(qty * rate * 100) / 100;
        subtotal += amount;

        await fishMallInventoryService.transferOutForInternal(
          fmItem._id,
          qty,
          userId,
          session,
          bill._id,
          bill.invoiceNumber
        );

        const { item: restItem } = await restaurantInventoryService.receiveInternalTransfer(
          {
            name: fmItem.name,
            quantity: qty,
            unit: fmItem.unit || 'KG',
            rate,
          },
          userId,
          session,
          bill._id,
          bill.invoiceNumber
        );

        billLines.push({
          fishMallItemId: fmItem._id,
          restaurantItemId: restItem._id,
          itemName: fmItem.name,
          quantity: qty,
          unit: fmItem.unit || 'KG',
          rate,
          amount,
        });
      }

      bill.lines = billLines;
      bill.subtotal = subtotal;
      bill.totalAmount = subtotal;
      await bill.save({ session });

      await session.commitTransaction();
      logger.info(
        `[Internal Supply]: ${bill.invoiceNumber} Fish Mall → Restaurant (${billLines.length} lines, ₹${bill.totalAmount})`
      );
      return bill;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async listBills(query = {}) {
    const { page = 1, limit = 50, toScope = 'RESTAURANT' } = query;
    const filter = { toScope, status: 'ISSUED' };
    const skip = (page - 1) * limit;
    const docs = await InternalSupplyBill.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'fullName phone');
    const totalDocs = await InternalSupplyBill.countDocuments(filter);
    return {
      docs,
      meta: { totalDocs, page, limit, flow: 'FISHMALL_TO_RESTAURANT' },
    };
  }

  async getBillById(id) {
    const bill = await InternalSupplyBill.findById(id).populate(
      'createdBy',
      'fullName phone'
    );
    if (!bill) throw new AppError('Internal supply bill not found', 404);
    return bill;
  }

  async getSummary() {
    const bills = await InternalSupplyBill.find({ status: 'ISSUED' });
    const totalValue = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    return {
      totalBills: bills.length,
      totalInternalSupplyValue: totalValue,
      scopes: [INVENTORY_SCOPES.FISHMALL, INVENTORY_SCOPES.RESTAURANT],
    };
  }
}

export const internalSupplyService = new InternalSupplyService();
export default internalSupplyService;

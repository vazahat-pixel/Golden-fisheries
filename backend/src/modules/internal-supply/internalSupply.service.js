import mongoose from 'mongoose';
import { InternalSupplyBill } from './internalSupplyBill.model.js';
import { FishMallInventoryItem, FishMallInventoryLog } from '../fishmall/fishMallInventory.model.js';
import { RestaurantInventoryLog } from '../restaurant/restaurantInventory.model.js';
import { fishMallInventoryService } from '../fishmall/fishMallInventory.service.js';
import { restaurantInventoryService } from '../restaurant/restaurantInventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';

/**
 * Fish Mall → Restaurant internal billing (invoice + paired atomic stock movement).
 * Procurement inventory is never touched.
 */
class InternalSupplyService {
  async _validateBillLines(items, session) {
    const validated = [];
    const seenItems = new Set();

    for (const line of items) {
      const qty = Math.round(parseFloat(line.quantity) * 100) / 100;
      if (!qty || qty <= 0) {
        throw new AppError('Quantity must be greater than zero', 400);
      }

      const itemId = line.fishMallItemId?.toString();
      if (seenItems.has(itemId)) {
        throw new AppError('Duplicate Fish Mall SKU on the same bill — combine quantities into one line', 400);
      }
      seenItems.add(itemId);

      const fmItem = await FishMallInventoryItem.findById(line.fishMallItemId).session(session);
      if (!fmItem || !fmItem.isActive) {
        throw new AppError(`Fish Mall inventory item not found: ${line.fishMallItemId}`, 404);
      }

      const available = fmItem.quantity || 0;
      if (available < qty) {
        throw new AppError(
          `Insufficient Fish Mall stock for ${fmItem.name}. Available: ${available} KG, requested: ${qty} KG`,
          400
        );
      }

      const rate = line.rate != null ? parseFloat(line.rate) : fmItem.rate;
      const amount = Math.round(qty * rate * 100) / 100;

      validated.push({
        fishMallItem: fmItem,
        fishMallItemId: fmItem._id,
        quantity: qty,
        rate,
        amount,
        unit: fmItem.unit || 'KG',
        itemName: fmItem.name,
      });
    }

    return validated;
  }

  /**
   * @param {{ items: Array<{ fishMallItemId, quantity, rate? }>, remarks?: string, destinationName?: string, billDate?: Date }} payload
   */
  async createFishMallToRestaurantBill(payload, userId) {
    if (!payload?.items?.length) {
      throw new AppError('At least one line item is required', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const prevalidated = await this._validateBillLines(payload.items, session);

      const bill = new InternalSupplyBill({
        lines: [],
        subtotal: 0,
        totalAmount: 0,
        status: 'ISSUED',
        remarks: payload.remarks || 'Internal supply to restaurant kitchen',
        destinationName: payload.destinationName || 'GF Restaurant Kitchen',
        billDate: payload.billDate ? new Date(payload.billDate) : new Date(),
        createdBy: userId,
      });
      await bill.save({ session });

      const duplicateOut = await FishMallInventoryLog.findOne({
        referenceId: bill._id,
        referenceModel: 'InternalSupplyBill',
        type: 'INTERNAL_TRANSFER_OUT',
      }).session(session);
      if (duplicateOut) {
        throw new AppError('Internal bill stock movement already recorded', 409);
      }

      const billLines = [];
      let subtotal = 0;

      for (const line of prevalidated) {
        const revalidated = await this._validateBillLines(
          [{ fishMallItemId: line.fishMallItemId, quantity: line.quantity, rate: line.rate }],
          session
        );
        const v = revalidated[0];

        await fishMallInventoryService.transferOutForInternal(
          v.fishMallItemId,
          v.quantity,
          userId,
          session,
          bill._id,
          bill.invoiceNumber
        );

        const { item: restItem } = await restaurantInventoryService.receiveInternalTransfer(
          {
            name: v.itemName,
            quantity: v.quantity,
            unit: v.unit,
            rate: v.rate,
          },
          userId,
          session,
          bill._id,
          bill.invoiceNumber
        );

        billLines.push({
          fishMallItemId: v.fishMallItemId,
          restaurantItemId: restItem._id,
          itemName: v.itemName,
          quantity: v.quantity,
          unit: v.unit,
          rate: v.rate,
          amount: v.amount,
        });
        subtotal += v.amount;
      }

      bill.lines = billLines;
      bill.subtotal = Math.round(subtotal * 100) / 100;
      bill.totalAmount = bill.subtotal;
      await bill.save({ session });

      await session.commitTransaction();

      const supplyPayload = {
        invoiceNumber: bill.invoiceNumber,
        billId: bill._id,
        totalAmount: bill.totalAmount,
        destinationName: bill.destinationName,
        fromScope: INVENTORY_SCOPES.FISHMALL,
        toScope: INVENTORY_SCOPES.RESTAURANT,
        lines: billLines.map((l) => ({
          itemName: l.itemName,
          quantity: l.quantity,
          unit: l.unit || 'KG',
          amount: l.amount,
        })),
      };

      broadcastEvent('internal:bill_issued', supplyPayload, 'fishmall:updates');
      broadcastEvent('restaurant:internal_supply_received', supplyPayload, 'restaurant:updates');
      broadcastEvent('fishmall:inventory_updated', { scope: INVENTORY_SCOPES.FISHMALL }, 'fishmall:updates');
      broadcastEvent(
        'restaurant:inventory_updated',
        { scope: INVENTORY_SCOPES.RESTAURANT, invoiceNumber: bill.invoiceNumber },
        'restaurant:updates'
      );

      logger.info(
        `[Internal Supply]: ${bill.invoiceNumber} Fish Mall → ${bill.destinationName} (${billLines.length} lines, ₹${bill.totalAmount})`
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
    const { page = 1, limit = 50, toScope = 'RESTAURANT', status, from, to } = query;
    const filter = { toScope };
    if (status) filter.status = status;
    else filter.status = 'ISSUED';
    if (from || to) {
      filter.billDate = {};
      if (from) filter.billDate.$gte = new Date(from);
      if (to) filter.billDate.$lte = new Date(to);
    }
    const skip = (page - 1) * limit;
    const docs = await InternalSupplyBill.find(filter)
      .sort({ billDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .populate('createdBy', 'fullName phone');
    const totalDocs = await InternalSupplyBill.countDocuments(filter);
    return {
      docs,
      meta: {
        totalDocs,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalDocs / limit) || 0,
        flow: 'FISHMALL_TO_RESTAURANT',
      },
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

  async getSummary(query = {}) {
    const filter = { status: 'ISSUED', toScope: 'RESTAURANT' };
    if (query.from || query.to) {
      filter.billDate = {};
      if (query.from) filter.billDate.$gte = new Date(query.from);
      if (query.to) filter.billDate.$lte = new Date(query.to);
    }
    const bills = await InternalSupplyBill.find(filter);
    const totalValue = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalQty = bills.reduce(
      (s, b) => s + b.lines.reduce((ls, l) => ls + (l.quantity || 0), 0),
      0
    );
    return {
      totalBills: bills.length,
      totalInternalSupplyValue: Math.round(totalValue * 100) / 100,
      totalQuantityKg: Math.round(totalQty * 100) / 100,
      scopes: [INVENTORY_SCOPES.FISHMALL, INVENTORY_SCOPES.RESTAURANT],
    };
  }

  async getFishMallInternalSalesReport(query = {}) {
    const { limit = 100, from, to } = query;
    const filter = { type: 'INTERNAL_TRANSFER_OUT' };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const logs = await FishMallInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('itemId', 'name rate unit')
      .populate('performedBy', 'fullName');
    const bills = await InternalSupplyBill.find({ status: 'ISSUED' }).sort({ billDate: -1 }).limit(50);
    return {
      scope: INVENTORY_SCOPES.FISHMALL,
      movementLogs: logs,
      recentBills: bills,
      summary: await this.getSummary(query),
    };
  }

  async getRestaurantReceiveReport(query = {}) {
    const { limit = 100, from, to } = query;
    const filter = { type: 'INTERNAL_TRANSFER_IN' };
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const logs = await RestaurantInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('itemId', 'name unit rate category')
      .populate('performedBy', 'fullName');
    const bills = await this.listBills({ ...query, limit: 50 });
    return {
      scope: INVENTORY_SCOPES.RESTAURANT,
      receiveLogs: logs,
      internalBills: bills.docs,
      meta: bills.meta,
    };
  }

  async getMovementReport(query = {}) {
    const [fishMall, restaurant, summary] = await Promise.all([
      this.getFishMallInternalSalesReport(query),
      this.getRestaurantReceiveReport(query),
      this.getSummary(query),
    ]);
    return {
      summary,
      fishMallOut: fishMall.movementLogs,
      restaurantIn: restaurant.receiveLogs,
      bills: restaurant.internalBills,
    };
  }

  async getDailyTransferSummary(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const bills = await InternalSupplyBill.find({
      status: 'ISSUED',
      billDate: { $gte: start, $lte: end },
    });

    const totalAmount = bills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    const totalQty = bills.reduce(
      (s, b) => s + b.lines.reduce((ls, l) => ls + (l.quantity || 0), 0),
      0
    );

    return {
      date: start,
      billCount: bills.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      totalQuantityKg: Math.round(totalQty * 100) / 100,
      bills: bills.map((b) => ({
        invoiceNumber: b.invoiceNumber,
        destinationName: b.destinationName,
        totalAmount: b.totalAmount,
        lineCount: b.lines.length,
      })),
    };
  }
}

export const internalSupplyService = new InternalSupplyService();
export default internalSupplyService;

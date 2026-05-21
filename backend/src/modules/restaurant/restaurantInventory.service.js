import mongoose from 'mongoose';
import {
  RestaurantInventoryItem,
  RestaurantInventoryLog,
} from './restaurantInventory.model.js';
import { AppError } from '../../utils/appError.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';

class RestaurantInventoryService {
  async list(query = {}) {
    const { search, page = 1, limit = 200 } = query;
    const filter = { isActive: true };
    if (search) filter.name = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const docs = await RestaurantInventoryItem.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    const totalDocs = await RestaurantInventoryItem.countDocuments(filter);
    return {
      docs,
      meta: { totalDocs, page, limit, scope: INVENTORY_SCOPES.RESTAURANT },
    };
  }

  async createItem(payload, userId) {
    const item = await RestaurantInventoryItem.create({
      name: payload.name?.trim().toUpperCase(),
      quantity: payload.quantity ?? 0,
      unit: payload.unit || 'KG',
      rate: payload.rate ?? 0,
      category: payload.category || 'Main Course',
      recordDate: payload.recordDate || new Date(),
    });
    if (item.quantity > 0) {
      await this._log(
        item._id,
        'OPENING',
        item.quantity,
        0,
        item.quantity,
        userId,
        'Initial restaurant stock'
      );
    }
    return item;
  }

  async updateItem(id, payload) {
    const item = await RestaurantInventoryItem.findById(id);
    if (!item) throw new AppError('Restaurant inventory item not found', 404);
    Object.assign(item, {
      ...(payload.name != null && { name: payload.name.trim().toUpperCase() }),
      ...(payload.quantity != null && { quantity: payload.quantity }),
      ...(payload.unit != null && { unit: payload.unit }),
      ...(payload.rate != null && { rate: payload.rate }),
      ...(payload.category != null && { category: payload.category }),
      ...(payload.recordDate != null && { recordDate: payload.recordDate }),
      ...(payload.isActive != null && { isActive: payload.isActive }),
    });
    await item.save();
    return item;
  }

  async adjustItem(id, qtyChange, userId, remarks = 'Manual adjustment') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const item = await RestaurantInventoryItem.findById(id).session(session);
      if (!item) throw new AppError('Restaurant inventory item not found', 404);
      const prev = item.quantity || 0;
      const next = prev + qtyChange;
      if (next < 0) {
        throw new AppError(
          `Insufficient restaurant stock for ${item.name}. Available: ${prev}`,
          400
        );
      }
      item.quantity = next;
      item.recordDate = new Date();
      await item.save({ session });
      await this._log(
        item._id,
        'ADJUSTMENT',
        qtyChange,
        prev,
        next,
        userId,
        remarks,
        null,
        null,
        session
      );
      await session.commitTransaction();
      return item;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  /**
   * Deduct restaurant kitchen stock when POS order is settled.
   * Matches by inventoryItemId or item name (case-insensitive).
   */
  async deductForOrder(order, userId, session) {
    for (const line of order.items) {
      let item = null;
      if (line.inventoryItemId) {
        item = await RestaurantInventoryItem.findById(line.inventoryItemId).session(
          session
        );
      }
      if (!item && line.name) {
        item = await RestaurantInventoryItem.findOne({
          name: line.name.trim().toUpperCase(),
          isActive: true,
        }).session(session);
      }
      if (!item) {
        continue;
      }
      const prev = item.quantity || 0;
      const next = prev - line.quantity;
      if (next < 0) {
        throw new AppError(
          `Insufficient restaurant stock for ${item.name}. Available: ${prev} ${item.unit}`,
          400
        );
      }
      item.quantity = next;
      item.recordDate = new Date();
      await item.save({ session });
      await this._log(
        item._id,
        'SALE_OUT',
        -line.quantity,
        prev,
        next,
        userId,
        `Restaurant POS ${order.orderNumber}`,
        order._id,
        'RestaurantOrder',
        session
      );
    }
  }

  async getLogs(query = {}) {
    const { limit = 50 } = query;
    return RestaurantInventoryLog.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('itemId', 'name unit')
      .populate('performedBy', 'fullName phone');
  }

  async getSummary() {
    const items = await RestaurantInventoryItem.find({ isActive: true });
    const lowStock = items.filter((i) => (i.quantity || 0) < 10);
    return {
      scope: INVENTORY_SCOPES.RESTAURANT,
      totalSKUs: items.length,
      totalQuantity: items.reduce((s, i) => s + (i.quantity || 0), 0),
      lowStockCount: lowStock.length,
      items,
    };
  }

  async _log(
    itemId,
    type,
    quantityChange,
    previousQuantity,
    newQuantity,
    userId,
    remarks,
    referenceId = null,
    referenceModel = null,
    session = null
  ) {
    const log = new RestaurantInventoryLog({
      itemId,
      type,
      quantityChange,
      previousQuantity,
      newQuantity,
      remarks,
      referenceId,
      referenceModel,
      performedBy: userId,
    });
    await log.save({ session });
    return log;
  }
}

export const restaurantInventoryService = new RestaurantInventoryService();
export default restaurantInventoryService;

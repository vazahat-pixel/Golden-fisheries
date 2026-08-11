import mongoose from 'mongoose';
import {
  RestaurantInventoryItem,
  RestaurantInventoryLog,
} from './restaurantInventory.model.js';
import { RestaurantMenuItem } from './restaurantMenu.model.js';
import { AppError } from '../../utils/appError.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';
import { logger } from '../../utils/logger.js';

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
   * Deduct kitchen stock when POS order is settled.
   * Uses menu recipe mapping when menuItemId is set; otherwise direct SKU deduction.
   */
  async deductForOrder(order, userId, session) {
    const consumptionMap = new Map();

    for (const line of order.items) {
      const servings = parseFloat(line.quantity) || 1;
      let menu = null;

      if (line.menuItemId) {
        menu = await RestaurantMenuItem.findById(line.menuItemId).session(session);
      }
      if (!menu && line.name) {
        menu = await RestaurantMenuItem.findOne({
          name: line.name.trim().toUpperCase(),
          isActive: true,
        }).session(session);
      }

      if (menu?.recipe?.length) {
        for (const ing of menu.recipe) {
          const deductQty = Math.round(ing.quantityPerServe * servings * 1000) / 1000;
          const key = ing.inventoryItemId.toString();
          consumptionMap.set(key, (consumptionMap.get(key) || 0) + deductQty);
        }
      } else {
        let item = null;
        if (line.inventoryItemId) {
          item = await RestaurantInventoryItem.findById(line.inventoryItemId).session(session);
        }
        if (!item && line.name) {
          item = await RestaurantInventoryItem.findOne({
            name: line.name.trim().toUpperCase(),
            isActive: true,
          }).session(session);
        }
        if (item) {
          const key = item._id.toString();
          consumptionMap.set(key, (consumptionMap.get(key) || 0) + servings);
        } else {
          logger.info(`[POS Stock Deduction]: Dish "${line.name}" billed without stock deduction (no recipe configured)`);
        }
      }
    }

    for (const [itemId, totalDeduct] of consumptionMap.entries()) {
      await this._deductItem(
        itemId,
        totalDeduct,
        userId,
        session,
        `Recipe/POS consumption ${order.orderNumber}`,
        order._id,
        'RestaurantOrder',
        'RECIPE_CONSUMPTION'
      );
    }
  }

  async _deductItem(
    itemId,
    quantity,
    userId,
    session,
    remarks,
    referenceId,
    referenceModel,
    logType = 'RECIPE_CONSUMPTION'
  ) {
    const item = await RestaurantInventoryItem.findById(itemId).session(session);
    if (!item) throw new AppError('Restaurant inventory item not found', 404);

    const prev = item.quantity || 0;
    const next = Math.round((prev - quantity) * 1000) / 1000;
    if (next < 0) {
      throw new AppError(
        `Insufficient kitchen stock for ${item.name}. Available: ${prev} ${item.unit}, required: ${quantity}`,
        400
      );
    }
    item.quantity = next;
    item.recordDate = new Date();
    await item.save({ session });
    await this._log(
      item._id,
      logType,
      -quantity,
      prev,
      next,
      userId,
      remarks,
      referenceId,
      referenceModel,
      session
    );
    return item;
  }

  async recordWastage(itemId, quantity, userId, remarks = 'Kitchen wastage') {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await this._deductItem(
        itemId,
        quantity,
        userId,
        session,
        remarks,
        null,
        null,
        'WASTAGE'
      );
      await session.commitTransaction();
      return { ok: true };
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  /**
   * Credit restaurant kitchen stock from Fish Mall internal bill (within caller's transaction).
   * Creates SKU by name if it does not exist yet.
   */
  async receiveInternalTransfer(payload, userId, session, billId, invoiceNumber) {
    const name = payload.name?.trim().toUpperCase();
    if (!name) throw new AppError('Item name is required for internal transfer', 400);

    let item = await RestaurantInventoryItem.findOne({ name, isActive: true }).session(
      session
    );
    if (!item) {
      const [created] = await RestaurantInventoryItem.create(
        [
          {
            name,
            quantity: 0,
            unit: payload.unit || 'KG',
            rate: payload.rate ?? 0,
            category: 'Kitchen Stock',
            recordDate: new Date(),
          },
        ],
        { session }
      );
      item = created;
    }

    const prev = item.quantity || 0;
    const qty = parseFloat(payload.quantity);
    const next = prev + qty;
    item.quantity = next;
    item.recordDate = new Date();
    if (payload.rate != null) item.rate = payload.rate;
    await item.save({ session });

    await this._log(
      item._id,
      'INTERNAL_TRANSFER_IN',
      qty,
      prev,
      next,
      userId,
      `Internal bill ${invoiceNumber} from Fish Mall`,
      billId,
      'InternalSupplyBill',
      session
    );
    return { item };
  }

  async getLogs(query = {}) {
    const { limit = 50, type, referenceModel } = query;
    const filter = {};
    if (type) filter.type = type;
    if (referenceModel) filter.referenceModel = referenceModel;
    return RestaurantInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('itemId', 'name unit rate category')
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

import {
  FishMallInventoryItem,
  FishMallInventoryLog,
  FishMallDailyClosing,
} from './fishMallInventory.model.js';
import { FishMallSale } from './fishmallSale.model.js';
import { AppError } from '../../utils/appError.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';
import { fishMallOutletService } from '../fishmall-outlet/fishMallOutlet.service.js';

class FishMallInventoryService {
  async _resolveOutletId(explicitId) {
    if (explicitId) {
      const outlet = await fishMallOutletService.getActiveById(explicitId);
      return outlet._id;
    }
    const fallback = await fishMallOutletService.ensureDefaultOutlet();
    return fallback._id;
  }

  async list(query = {}) {
    const { search, page = 1, limit = 200, outletId } = query;
    const filter = { isActive: true };
    if (outletId) filter.outletId = await this._resolveOutletId(outletId);
    if (search) filter.name = new RegExp(search, 'i');
    const skip = (page - 1) * limit;
    const docs = await FishMallInventoryItem.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit, 10));
    const totalDocs = await FishMallInventoryItem.countDocuments(filter);
    return {
      docs,
      meta: { totalDocs, page, limit, scope: INVENTORY_SCOPES.FISHMALL },
    };
  }

  async createItem(payload, userId) {
    const outletId = await this._resolveOutletId(payload.outletId);
    const name = payload.name?.trim().toUpperCase();
    const existing = await FishMallInventoryItem.findOne({ outletId, name });
    if (existing) {
      throw new AppError('Fish Mall item with this name already exists at this outlet', 409);
    }
    const qty = payload.quantity ?? payload.openingStock ?? 0;
    const item = await FishMallInventoryItem.create({
      outletId,
      name,
      quantity: qty,
      openingStock: payload.openingStock ?? qty,
      rate: payload.rate ?? 0,
      unit: 'KG',
      recordDate: payload.recordDate || new Date(),
    });
    if (qty > 0) {
      await this._log(item._id, 'OPENING', qty, 0, qty, userId, 'Opening stock');
    }
    return item;
  }

  async updateItem(id, payload) {
    const item = await FishMallInventoryItem.findById(id);
    if (!item) throw new AppError('Fish Mall inventory item not found', 404);
    if (payload.rate != null) item.rate = payload.rate;
    if (payload.quantity != null) item.quantity = payload.quantity;
    if (payload.openingStock != null) item.openingStock = payload.openingStock;
    if (payload.isActive != null) item.isActive = payload.isActive;
    item.recordDate = new Date();
    await item.save();
    return item;
  }

  async adjustItem(id, qtyChange, userId, remarks = 'Manual adjustment') {
    const item = await FishMallInventoryItem.findById(id);
    if (!item) throw new AppError('Fish Mall inventory item not found', 404);
    const prev = item.quantity || 0;
    const next = prev + qtyChange;
    if (next < 0) {
      throw new AppError(
        `Insufficient Fish Mall stock for ${item.name}. Available: ${prev}`,
        400
      );
    }
    item.quantity = next;
    item.recordDate = new Date();
    await item.save();
    await this._log(item._id, 'ADJUSTMENT', qtyChange, prev, next, userId, remarks);
    return item;
  }

  async deductForSale(sale, userId, session) {
    for (const line of sale.items) {
      let item = null;
      if (line.inventoryItemId) {
        item = await FishMallInventoryItem.findById(line.inventoryItemId).session(session);
      }
      if (!item && line.fishName) {
        item = await FishMallInventoryItem.findOne({
          name: line.fishName.trim().toUpperCase(),
          isActive: true,
        }).session(session);
      }
      if (!item) {
        throw new AppError(
          `Fish Mall stock item not found for "${line.fishName}". Add to Fish Mall inventory first.`,
          400
        );
      }
      const prev = item.quantity || 0;
      const deduct = line.scaleWeight;
      const next = prev - deduct;
      if (next < 0) {
        throw new AppError(
          `Insufficient Fish Mall stock for ${item.name}. Available: ${prev} KG`,
          400
        );
      }
      item.quantity = next;
      item.recordDate = new Date();
      await item.save({ session });
      line.rate = line.rate ?? item.rate;
      await this._log(
        item._id,
        'SALE_OUT',
        -deduct,
        prev,
        next,
        userId,
        `FishMall POS ${sale.saleNumber}`,
        sale._id,
        'FishMallSale',
        session
      );
    }
  }

  async recordDailyClosing(payload, userId) {
    const items = await FishMallInventoryItem.find({ isActive: true });
    const closingStockTotal = items.reduce((s, i) => s + (i.quantity || 0), 0);
    const doc = await FishMallDailyClosing.create({
      closingDate: payload.closingDate || new Date(),
      openingStockTotal: payload.openingStockTotal ?? 0,
      salesTotal: payload.salesTotal ?? 0,
      expensesTotal: payload.expensesTotal ?? 0,
      closingStockTotal,
      netPnL:
        (payload.salesTotal ?? 0) -
        (payload.expensesTotal ?? 0),
      remarks: payload.remarks || '',
      createdBy: userId,
    });
    return doc;
  }

  async getDailyPnL(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    const sales = await FishMallSale.find({
      createdAt: { $gte: start, $lte: end },
    });
    const salesTotal = sales.reduce((s, x) => s + (x.totalAmount || 0), 0);
    let internalSupplyTotal = 0;
    let internalSupplyCount = 0;
    try {
      const { InternalSupplyBill } = await import('../internal-supply/internalSupplyBill.model.js');
      const internalBills = await InternalSupplyBill.find({
        status: 'ISSUED',
        createdAt: { $gte: start, $lte: end },
      });
      internalSupplyCount = internalBills.length;
      internalSupplyTotal = internalBills.reduce((s, b) => s + (b.totalAmount || 0), 0);
    } catch {
      /* model optional during migration */
    }
    const items = await FishMallInventoryItem.find({ isActive: true });
    return {
      date: start,
      salesCount: sales.length,
      salesTotal,
      internalSupplyCount,
      internalSupplyTotal,
      grossRetailAndInternal: salesTotal + internalSupplyTotal,
      closingStockTotal: items.reduce((s, i) => s + (i.quantity || 0), 0),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        rate: i.rate,
        openingStock: i.openingStock,
      })),
    };
  }

  /**
   * Deduct Fish Mall stock for internal supply to Restaurant (within caller's transaction).
   */
  /**
   * Receive stock from procurement transfer (within caller's Mongo transaction).
   */
  async receiveProcurementTransfer(payload, userId, session, transferId, transferNumber) {
    const name = payload.name?.trim().toUpperCase();
    if (!name) throw new AppError('Item name is required for Fish Mall receipt', 400);
    const outletId = await this._resolveOutletId(payload.outletId);

    let item = await FishMallInventoryItem.findOne({ outletId, name, isActive: true }).session(session);
    if (!item) {
      const [created] = await FishMallInventoryItem.create(
        [
          {
            outletId,
            name,
            quantity: 0,
            openingStock: 0,
            rate: payload.rate ?? 0,
            unit: payload.unit || 'KG',
            recordDate: new Date(),
          },
        ],
        { session }
      );
      item = created;
    }

    const qty = parseFloat(payload.quantity);
    if (!qty || qty <= 0) {
      throw new AppError('Receive quantity must be greater than zero', 400);
    }

    const prev = item.quantity || 0;
    const next = prev + qty;
    item.quantity = next;
    if (payload.rate != null && payload.rate > 0) item.rate = payload.rate;
    item.recordDate = new Date();
    await item.save({ session });

    await this._log(
      item._id,
      'PROCUREMENT_TRANSFER_IN',
      qty,
      prev,
      next,
      userId,
      `Procurement transfer ${transferNumber} → Fish Mall outlet`,
      transferId,
      'StockTransfer',
      session
    );

    return { item };
  }

  async transferOutForInternal(itemId, quantity, userId, session, billId, invoiceNumber) {
    const item = await FishMallInventoryItem.findById(itemId).session(session);
    if (!item || !item.isActive) {
      throw new AppError('Fish Mall inventory item not found', 404);
    }
    const prev = item.quantity || 0;
    const next = prev - quantity;
    if (next < 0) {
      throw new AppError(
        `Insufficient Fish Mall stock for ${item.name}. Available: ${prev} KG`,
        400
      );
    }
    item.quantity = next;
    item.recordDate = new Date();
    await item.save({ session });
    await this._log(
      item._id,
      'INTERNAL_TRANSFER_OUT',
      -quantity,
      prev,
      next,
      userId,
      `Internal bill ${invoiceNumber} → Restaurant`,
      billId,
      'InternalSupplyBill',
      session
    );
    return item;
  }

  async getLogs(query = {}) {
    const { limit = 50, type, referenceModel } = query;
    const filter = {};
    if (type) filter.type = type;
    if (referenceModel) filter.referenceModel = referenceModel;
    return FishMallInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('itemId', 'name unit rate');
  }

  async getSummary() {
    const items = await FishMallInventoryItem.find({ isActive: true });
    const lowStock = items.filter((i) => (i.quantity || 0) < 50);
    return {
      scope: INVENTORY_SCOPES.FISHMALL,
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
    const log = new FishMallInventoryLog({
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

export const fishMallInventoryService = new FishMallInventoryService();
export default fishMallInventoryService;

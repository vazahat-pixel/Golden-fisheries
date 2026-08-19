import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { RestaurantOrder } from './restaurantOrder.model.js';
import { restaurantInventoryService } from './restaurantInventory.service.js';
import { RestaurantMenuItem } from './restaurantMenu.model.js';
import { RestaurantInventoryItem } from './restaurantInventory.model.js';
import { normalizeOrderType } from './kitchen.service.js';
import { RestaurantInventoryLog } from './restaurantInventory.model.js';
import { KitchenTicket } from './kitchenTicket.model.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';
import { broadcastEvent } from '../../sockets/socket.js';
import { RestaurantSession, RestaurantCashbookEntry } from './restaurantAccounting.model.js';

class RestaurantService extends BaseService {
  constructor() {
    super(RestaurantOrder);
  }

  async findOrdersWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status, orderType } = queryParams;
    const filter = {};

    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [{ orderNumber: searchRegex }, { tableNumber: searchRegex }];
    }

    return await this.findMany(filter, { page, limit });
  }

  /**
   * Validates raw POS cart lines against the menu/inventory catalog and
   * returns priced line items ready to store on an order.
   */
  async _verifyItems(items) {
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const qty = parseFloat(item.quantity) || 1;
      let rate = parseFloat(item.rate);
      let name = item.name;
      let menuItemId = item.menuItemId || null;
      let inventoryItemId = item.inventoryItemId || null;

      if (menuItemId) {
        const menu = await RestaurantMenuItem.findById(menuItemId);
        if (menu) {
          rate = rate ?? menu.sellingPrice;
          name = name || menu.name;
        } else {
          // Legacy clients sent kitchen inventory id as menuItemId
          const inv = await RestaurantInventoryItem.findById(menuItemId);
          if (inv) {
            inventoryItemId = inv._id;
            menuItemId = null;
            rate = rate ?? inv.rate;
            name = name || inv.name;
          } else {
            throw new AppError('Menu item not found', 404);
          }
        }
      } else if (inventoryItemId) {
        const inv = await RestaurantInventoryItem.findById(inventoryItemId);
        if (!inv) throw new AppError('Kitchen inventory item not found', 404);
        rate = rate ?? inv.rate;
        name = name || inv.name;
      }

      rate = rate ?? 0;
      const lineTotal = Math.round(qty * rate * 100) / 100;
      subtotal += lineTotal;

      verifiedItems.push({
        menuItemId,
        productId: item.productId || null,
        inventoryItemId,
        name: name || 'ITEM',
        quantity: qty,
        rate,
        amount: lineTotal,
      });
    }

    return { verifiedItems, subtotal: Math.round(subtotal * 100) / 100 };
  }

  _recalculateOrderTotals(order, discountAmount) {
    const subtotal = Math.round(
      order.items.reduce((sum, i) => sum + i.amount, 0) * 100
    ) / 100;
    const taxable = Math.max(0, subtotal - discountAmount);
    const cgst = Math.round(taxable * 0.025 * 100) / 100;
    const sgst = Math.round(taxable * 0.025 * 100) / 100;
    order.subtotal = subtotal;
    order.cgst = cgst;
    order.sgst = sgst;
    order.discountAmount = discountAmount;
    order.totalAmount = Math.round((taxable + cgst + sgst) * 100) / 100;
  }

  /**
   * Finds the still-open (unpaid) running tab for a dine-in table, if any.
   * Takeaway/Delivery/Counter sales never have a running tab — each is its own order.
   */
  async findOpenTableOrder(orderType, tableNumber) {
    if (normalizeOrderType(orderType) !== 'DINE_IN') return null;
    if (!tableNumber || ['TAKEAWAY', 'COUNTER', ''].includes(tableNumber.toUpperCase())) return null;
    return this.model.findOne({
      orderType: 'DINE_IN',
      tableNumber,
      status: 'PENDING',
    });
  }

  /**
   * Create a POS order ticket, or — for a dine-in table that already has an
   * open running tab — append this round's items onto it instead of starting
   * a second, disconnected bill. This is what lets "starters now, mains later"
   * settle as ONE bill at the end, the way a real table service works.
   */
  async createOrder(orderData, userId) {
    const { verifiedItems } = await this._verifyItems(orderData.items);
    const tableNumber = orderData.tableNumber || orderData.tableLabel || 'TAKEAWAY';
    const orderType = normalizeOrderType(orderData.orderType);

    const existing = await this.findOpenTableOrder(orderType, tableNumber);
    const newDiscount = orderData.discountAmount ?? orderData.discount;

    if (existing) {
      existing.items.push(...verifiedItems);
      // Discounts/coupons are applied once at final billing, not per kitchen round —
      // only overwrite the running tab's discount if this call actually carries a real one.
      const parsedDiscount = parseFloat(newDiscount) || 0;
      const discountAmount = parsedDiscount > 0 ? Math.round(parsedDiscount * 100) / 100 : existing.discountAmount;
      this._recalculateOrderTotals(existing, discountAmount);
      if (orderData.kitchenTicketId) {
        existing.kitchenTicketIds.push(orderData.kitchenTicketId);
      }
      if (orderData.coupon || orderData.couponCode) {
        existing.couponCode = orderData.coupon || orderData.couponCode;
      }
      await existing.save();
      broadcastEvent('restaurant:order_updated', { order: existing });
      logger.info(`[Restaurant POS]: Added ${verifiedItems.length} item(s) to running tab ${existing.orderNumber} (${tableNumber})`);
      return existing;
    }

    const discountAmount = Math.round((parseFloat(newDiscount) || 0) * 100) / 100;
    const order = new RestaurantOrder({
      orderType,
      tableNumber,
      items: verifiedItems,
      kitchenTicketIds: orderData.kitchenTicketId ? [orderData.kitchenTicketId] : [],
      couponCode: orderData.coupon || orderData.couponCode || '',
      status: 'PENDING',
      createdBy: userId,
      remarks: orderData.remarks || '',
    });
    this._recalculateOrderTotals(order, discountAmount);

    await order.save();
    broadcastEvent('restaurant:order_created', { order });
    broadcastEvent('restaurant:order_updated', { order });
    logger.info(`[Restaurant POS]: Order ${order.orderNumber} created for ${order.tableNumber}`);
    return order;
  }

  /**
   * Settle order: payment + atomic recipe-based stock consumption.
   */
  async settleOrder(orderId, paymentPayload = {}, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await this.model.findById(orderId).session(session);
      if (!order) throw new AppError('Restaurant order ticket not found', 404);
      if (order.status === 'PAID') {
        throw new AppError('Order ticket has already been settled and paid', 409);
      }

      const existingConsumption = await RestaurantInventoryLog.findOne({
          referenceId: order._id,
          referenceModel: 'RestaurantOrder',
          type: { $in: ['RECIPE_CONSUMPTION', 'SALE_OUT'] },
        })
        .session(session);
      if (existingConsumption) {
        throw new AppError('Stock consumption already recorded for this order', 409);
      }

      const paymentMethod = (paymentPayload.paymentMethod || 'CASH').toUpperCase();
      const cashAmount = parseFloat(paymentPayload.cashAmount) || 0;
      const upiAmount = parseFloat(paymentPayload.upiAmount) || 0;

      if (paymentMethod === 'SPLIT' || (cashAmount > 0 && upiAmount > 0)) {
        const sum = Math.round((cashAmount + upiAmount) * 100) / 100;
        const total = Math.round(order.totalAmount * 100) / 100;
        if (Math.abs(sum - total) > 0.05) {
          throw new AppError(
            `Split payment must equal bill total (₹${total}). Received ₹${sum}.`,
            400
          );
        }
        order.paymentMethod = 'SPLIT';
        order.cashAmount = cashAmount;
        order.upiAmount = upiAmount;
      } else if (paymentMethod === 'UPI') {
        order.paymentMethod = 'UPI';
        order.upiAmount = order.totalAmount;
        order.cashAmount = 0;
      } else if (paymentMethod === 'CARD') {
        order.paymentMethod = 'CARD';
        order.cashAmount = 0;
        order.upiAmount = 0;
      } else {
        order.paymentMethod = 'CASH';
        order.cashAmount = order.totalAmount;
        order.upiAmount = 0;
      }

      order.status = 'PAID';
      
      // Check active open shift session for cashier
      const activeSession = await RestaurantSession.findOne({
        cashierId: userId,
        status: 'OPEN'
      }).session(session);

      if (!activeSession) {
        throw new AppError('Operations are locked! Shift is not open. Please open your shift session first.', 400);
      }

      order.sessionId = activeSession._id;
      await order.save({ session });

      // Record inflow in cashbook
      const finalPaymentMethod = order.paymentMethod;
      const amount = order.totalAmount;
      const cashAmt = finalPaymentMethod === 'CASH' ? amount : (finalPaymentMethod === 'SPLIT' ? order.cashAmount : 0);
      const upiAmt = finalPaymentMethod === 'UPI' ? amount : (finalPaymentMethod === 'SPLIT' ? order.upiAmount : 0);
      const cardAmt = finalPaymentMethod === 'CARD' ? amount : 0;

      await RestaurantCashbookEntry.create(
        [
          {
            sessionId: activeSession._id,
            type: 'INFLOW',
            category: 'POS_SALE',
            paymentMethod: finalPaymentMethod,
            amount,
            cashAmount: cashAmt,
            upiAmount: upiAmt,
            cardAmount: cardAmt,
            description: `POS Order Sale: ${order.orderNumber} - Table/Type: ${order.tableNumber || order.orderType}`,
            referenceId: order._id,
            referenceModel: 'RestaurantOrder',
            createdBy: userId
          }
        ],
        { session }
      );

      // Update session aggregates
      activeSession.salesTotal += amount;
      activeSession.cashSalesTotal += cashAmt;
      activeSession.upiSalesTotal += upiAmt;
      activeSession.cardSalesTotal += cardAmt;
      activeSession.discountTotal += order.discountAmount || 0;
      activeSession.expectedClosingCash = activeSession.openingCash + activeSession.cashSalesTotal - activeSession.cashExpensesTotal;
      activeSession.expectedClosingUpi = activeSession.upiSalesTotal - activeSession.upiExpensesTotal;
      activeSession.netPnL = activeSession.salesTotal - activeSession.expensesTotal;

      await activeSession.save({ session });

      await restaurantInventoryService.deductForOrder(order, userId, session);

      // Close every kitchen round tied to this table's tab (starters, mains, etc.) —
      // billing the table settles all of them together.
      for (const ticketId of order.kitchenTicketIds || []) {
        const ticket = await KitchenTicket.findById(ticketId).session(session);
        if (ticket && ticket.status === 'ACTIVE') {
          ticket.items.forEach((line) => {
            line.lineStatus = 'SERVED';
          });
          ticket.status = 'COMPLETED';
          ticket.orderId = order._id;
          await ticket.save({ session });
        }
      }

      await session.commitTransaction();

      broadcastEvent('restaurant:order_settled', { order });
      broadcastEvent('restaurant:inventory_updated', {});

      logger.info(`[Restaurant POS]: Settled ${order.orderNumber}. Shift Cashbook updated.`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Real occupancy for the POS table picker — any table with an open (PENDING)
   * dine-in tab shows as occupied with its running total, instead of a static list.
   */
  async getTablesWithStatus() {
    const tables = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      label: `T${String(i + 1).padStart(2, '0')}`,
      status: 'available',
      capacity: i < 4 ? 2 : i < 14 ? 4 : 6,
    }));

    const openOrders = await this.model.find({ orderType: 'DINE_IN', status: 'PENDING' });
    const byTable = new Map(openOrders.map((o) => [o.tableNumber, o]));

    return tables.map((t) => {
      const order = byTable.get(t.label);
      if (!order) return t;
      return {
        ...t,
        status: 'occupied',
        orderId: order._id,
        orderNumber: order.orderNumber,
        runningTotal: order.totalAmount,
        itemCount: order.items.length,
      };
    });
  }

  async updateOrderStatus(orderId, status) {
    const allowed = ['PENDING', 'PREPARING', 'SERVED', 'PAID', 'CANCELLED'];
    if (!allowed.includes(status)) throw new AppError(`Invalid status: ${status}`, 400);
    const order = await this.model.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) throw new AppError('Order not found', 404);
    broadcastEvent('restaurant:order_updated', { order });
    return order;
  }

  /**
   * Removes one dish from a table's still-open (unpaid) running tab — e.g. the
   * customer changed their mind before the bill was closed. If that was the
   * last item, the whole tab is cancelled and the table frees up.
   */
  async removeOrderItem(orderId, itemId) {
    const order = await this.model.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'PENDING') {
      throw new AppError('Only an unpaid, still-open bill can have items removed', 400);
    }
    const item = order.items.id(itemId);
    if (!item) throw new AppError('Item not found on this order', 404);

    order.items.pull(itemId);
    if (order.items.length === 0) {
      order.status = 'CANCELLED';
      order.voidReason = 'All items removed from draft';
      order.subtotal = 0;
      order.cgst = 0;
      order.sgst = 0;
      order.totalAmount = 0;

      if (order.kitchenTicketIds && order.kitchenTicketIds.length > 0) {
        await KitchenTicket.updateMany(
          { _id: { $in: order.kitchenTicketIds }, status: 'ACTIVE' },
          { $set: { status: 'CANCELLED' } }
        );
      }
    } else {
      this._recalculateOrderTotals(order, order.discountAmount);
    }
    await order.save();
    broadcastEvent('restaurant:order_updated', { order });
    broadcastEvent('restaurant:kot_updated', {});
    return order;
  }

  /**
   * Cancels an entire unpaid draft order / running tab for a table.
   */
  async cancelDraftOrder(orderId, reason = 'Draft cancelled by staff', userId) {
    const order = await this.model.findById(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'PENDING') {
      throw new AppError('Only an unpaid, still-open draft bill can be cancelled', 400);
    }
    order.status = 'CANCELLED';
    order.voidReason = reason || 'Draft cancelled by staff';
    order.voidedBy = userId;
    order.voidedAt = new Date();
    await order.save();

    if (order.kitchenTicketIds && order.kitchenTicketIds.length > 0) {
      await KitchenTicket.updateMany(
        { _id: { $in: order.kitchenTicketIds }, status: 'ACTIVE' },
        { $set: { status: 'CANCELLED' } }
      );
    }

    broadcastEvent('restaurant:order_updated', { order });
    broadcastEvent('restaurant:kot_updated', {});
    logger.info(`[Restaurant POS]: Draft order ${order.orderNumber} cancelled for table ${order.tableNumber}`);
    return order;
  }

  /**
   * Reverses a PAID order: restores kitchen stock, posts a reversal entry to
   * the cashbook, and adjusts the shift session's totals — all inside one
   * transaction so nothing is left half-reversed. Only possible while the
   * order's shift is still open; a closed shift's books are locked.
   */
  async voidOrder(orderId, reason, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await this.model.findById(orderId).session(session);
      if (!order) throw new AppError('Order not found', 404);
      if (order.status !== 'PAID') {
        throw new AppError('Only a paid, settled bill can be voided', 400);
      }
      if (!reason || !reason.trim()) {
        throw new AppError('A reason is required to void a bill', 400);
      }

      const shiftSession = order.sessionId
        ? await RestaurantSession.findById(order.sessionId).session(session)
        : null;
      if (!shiftSession || shiftSession.status !== 'OPEN') {
        throw new AppError(
          "This bill's shift has already been closed — it can no longer be voided.",
          400
        );
      }

      await restaurantInventoryService.restoreForOrder(order, userId, session);

      const cashAmt = order.paymentMethod === 'CASH' ? order.totalAmount : (order.paymentMethod === 'SPLIT' ? order.cashAmount : 0);
      const upiAmt = order.paymentMethod === 'UPI' ? order.totalAmount : (order.paymentMethod === 'SPLIT' ? order.upiAmount : 0);
      const cardAmt = order.paymentMethod === 'CARD' ? order.totalAmount : 0;

      await RestaurantCashbookEntry.create(
        [
          {
            sessionId: shiftSession._id,
            type: 'OUTFLOW',
            category: 'POS_SALE_VOID',
            paymentMethod: order.paymentMethod,
            amount: order.totalAmount,
            cashAmount: cashAmt,
            upiAmount: upiAmt,
            cardAmount: cardAmt,
            description: `Voided bill ${order.orderNumber} — ${reason.trim()}`,
            referenceId: order._id,
            referenceModel: 'RestaurantOrder',
            createdBy: userId,
          },
        ],
        { session }
      );

      shiftSession.salesTotal -= order.totalAmount;
      shiftSession.cashSalesTotal -= cashAmt;
      shiftSession.upiSalesTotal -= upiAmt;
      shiftSession.cardSalesTotal -= cardAmt;
      shiftSession.discountTotal -= order.discountAmount || 0;
      shiftSession.expectedClosingCash = shiftSession.openingCash + shiftSession.cashSalesTotal - shiftSession.cashExpensesTotal;
      shiftSession.expectedClosingUpi = shiftSession.upiSalesTotal - shiftSession.upiExpensesTotal;
      shiftSession.netPnL = shiftSession.salesTotal - shiftSession.expensesTotal;
      await shiftSession.save({ session });

      order.status = 'CANCELLED';
      order.voidReason = reason.trim();
      order.voidedBy = userId;
      order.voidedAt = new Date();
      await order.save({ session });

      await session.commitTransaction();

      broadcastEvent('restaurant:order_voided', { order });
      broadcastEvent('restaurant:inventory_updated', {});
      logger.info(`[Restaurant POS]: Voided ${order.orderNumber} — ${reason.trim()}`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Merges two dine-in table running orders together into a single tab.
   * Transports all dish lines and linked kitchen tickets to the primary table.
   */
  async mergeTables({ sourceTable, targetTable }, userId) {
    const src = (sourceTable || '').trim().toUpperCase();
    const tgt = (targetTable || '').trim().toUpperCase();

    if (!src || !tgt) {
      throw new AppError('Both source and target table numbers are required', 400);
    }
    if (src === tgt) {
      throw new AppError('Cannot merge a table with itself', 400);
    }

    const sourceOrder = await this.findOpenTableOrder('DINE_IN', src);
    const targetOrder = await this.findOpenTableOrder('DINE_IN', tgt);

    if (!sourceOrder && !targetOrder) {
      throw new AppError(`Neither ${src} nor ${tgt} has an active running order to merge`, 404);
    }

    // If source exists but target is empty: transfer running order to target table
    if (sourceOrder && !targetOrder) {
      sourceOrder.tableNumber = tgt;
      if (sourceOrder.remarks) {
        sourceOrder.remarks += ` (Transferred from ${src})`;
      } else {
        sourceOrder.remarks = `Transferred from ${src}`;
      }
      await sourceOrder.save();

      // Update any active kitchen tickets
      await KitchenTicket.updateMany(
        { tableNumber: src, status: 'ACTIVE' },
        { $set: { tableNumber: tgt } }
      );

      broadcastEvent('restaurant:table_merged', {
        sourceTable: src,
        targetTable: tgt,
        order: sourceOrder,
      });
      broadcastEvent('restaurant:order_updated', { order: sourceOrder });

      logger.info(`[Restaurant POS]: Transferred running tab ${sourceOrder.orderNumber} from ${src} to ${tgt}`);
      return {
        targetOrder: sourceOrder,
        sourceTable: src,
        targetTable: tgt,
        mergedItemsCount: sourceOrder.items.length,
      };
    }

    // If target exists but source is empty: target already has order, nothing to merge from source
    if (!sourceOrder && targetOrder) {
      return {
        targetOrder,
        sourceTable: src,
        targetTable: tgt,
        mergedItemsCount: targetOrder.items.length,
      };
    }

    // Both source and target have running tabs: combine them into targetOrder
    targetOrder.items.push(...sourceOrder.items);

    // Merge kitchen ticket IDs without duplicates
    const combinedTicketIds = new Set([
      ...(targetOrder.kitchenTicketIds || []).map((id) => id.toString()),
      ...(sourceOrder.kitchenTicketIds || []).map((id) => id.toString()),
    ]);
    targetOrder.kitchenTicketIds = Array.from(combinedTicketIds);

    // Combine discounts if any
    const totalDiscount = (targetOrder.discountAmount || 0) + (sourceOrder.discountAmount || 0);
    this._recalculateOrderTotals(targetOrder, totalDiscount);

    if (sourceOrder.couponCode && !targetOrder.couponCode) {
      targetOrder.couponCode = sourceOrder.couponCode;
    }

    targetOrder.remarks = (targetOrder.remarks ? `${targetOrder.remarks} | ` : '') +
      `Merged with ${src} (${sourceOrder.orderNumber})`;

    await targetOrder.save();

    // Cancel source order with audit reason
    sourceOrder.status = 'CANCELLED';
    sourceOrder.voidReason = `Merged into ${tgt} (#${targetOrder.orderNumber})`;
    sourceOrder.voidedBy = userId;
    sourceOrder.voidedAt = new Date();
    await sourceOrder.save();

    // Update active kitchen tickets for source table to point to target table
    await KitchenTicket.updateMany(
      { tableNumber: src, status: 'ACTIVE' },
      { $set: { tableNumber: tgt, orderId: targetOrder._id } }
    );

    broadcastEvent('restaurant:table_merged', {
      sourceTable: src,
      targetTable: tgt,
      targetOrder,
      sourceOrder,
    });
    broadcastEvent('restaurant:order_updated', { order: targetOrder });

    logger.info(
      `[Restaurant POS]: Merged table ${src} (#${sourceOrder.orderNumber}) into ${tgt} (#${targetOrder.orderNumber}). Total items: ${targetOrder.items.length}`
    );

    return {
      targetOrder,
      sourceOrder,
      sourceTable: src,
      targetTable: tgt,
      mergedItemsCount: targetOrder.items.length,
    };
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;

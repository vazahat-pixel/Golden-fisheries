import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { RestaurantOrder } from './restaurantOrder.model.js';
import { restaurantInventoryService } from './restaurantInventory.service.js';
import { restaurantMenuService } from './restaurantMenu.service.js';
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
   * Create POS order ticket (PENDING until settled).
   */
  async createOrder(orderData, userId) {
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of orderData.items) {
      const qty = parseFloat(item.quantity) || 1;
      let rate = parseFloat(item.rate);
      let name = item.name;

      if (item.menuItemId) {
        const menu = await restaurantMenuService.getById(item.menuItemId);
        rate = rate ?? menu.sellingPrice;
        name = name || menu.name;
      }

      rate = rate ?? 0;
      const lineTotal = Math.round(qty * rate * 100) / 100;
      subtotal += lineTotal;

      verifiedItems.push({
        menuItemId: item.menuItemId || null,
        productId: item.productId || null,
        inventoryItemId: item.inventoryItemId || null,
        name: name || 'ITEM',
        quantity: qty,
        rate,
        amount: lineTotal,
      });
    }

    subtotal = Math.round(subtotal * 100) / 100;
    const discountAmount = Math.round((parseFloat(orderData.discountAmount ?? orderData.discount) || 0) * 100) / 100;
    const taxable = Math.max(0, subtotal - discountAmount);
    const cgst = Math.round(taxable * 0.025 * 100) / 100;
    const sgst = Math.round(taxable * 0.025 * 100) / 100;
    const totalAmount = Math.round((taxable + cgst + sgst) * 100) / 100;

    const order = new RestaurantOrder({
      orderType: normalizeOrderType(orderData.orderType),
      tableNumber: orderData.tableNumber || orderData.tableLabel || 'TAKEAWAY',
      items: verifiedItems,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      discountAmount,
      couponCode: orderData.coupon || orderData.couponCode || '',
      kitchenTicketId: orderData.kitchenTicketId || null,
      status: 'PENDING',
      createdBy: userId,
      remarks: orderData.remarks || '',
    });

    await order.save();
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

      if (order.kitchenTicketId) {
        await KitchenTicket.findByIdAndUpdate(
          order.kitchenTicketId,
          { status: 'COMPLETED' },
          { session }
        );
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

  async updateOrderStatus(orderId, status) {
    const allowed = ['PENDING', 'PREPARING', 'SERVED', 'PAID', 'CANCELLED'];
    if (!allowed.includes(status)) throw new AppError(`Invalid status: ${status}`, 400);
    const order = await this.model.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) throw new AppError('Order not found', 404);
    broadcastEvent('restaurant:order_updated', { order });
    return order;
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;

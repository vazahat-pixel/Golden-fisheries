import mongoose from 'mongoose';
import { BaseService } from '../../services/base.service.js';
import { RestaurantOrder } from './restaurantOrder.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { AppError } from '../../utils/appError.js';
import { logger } from '../../utils/logger.js';

class RestaurantService extends BaseService {
  constructor() {
    super(RestaurantOrder);
  }

  /**
   * Search and filter restaurant orders
   */
  async findOrdersWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status, orderType } = queryParams;
    const filter = {};

    if (status) filter.status = status;
    if (orderType) filter.orderType = orderType;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { orderNumber: searchRegex },
        { tableNumber: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }

  /**
   * Create an initial order ticket
   */
  async createOrder(orderData, userId) {
    let subtotal = 0;
    const verifiedItems = [];

    for (const item of orderData.items) {
      const lineTotal = item.quantity * item.rate;
      subtotal += lineTotal;
      verifiedItems.push({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        rate: item.rate,
        amount: lineTotal
      });
    }

    // 5% standard GST split (2.5% CGST + 2.5% SGST)
    const cgst = subtotal * 0.025;
    const sgst = subtotal * 0.025;
    const totalAmount = subtotal + cgst + sgst;

    const order = new RestaurantOrder({
      orderType: orderData.orderType || 'DINE_IN',
      tableNumber: orderData.tableNumber || 'TAKEAWAY',
      items: verifiedItems,
      subtotal,
      cgst,
      sgst,
      totalAmount,
      status: 'PENDING',
      createdBy: userId,
      remarks: orderData.remarks || ''
    });

    await order.save();
    logger.info(`[Restaurant POS]: Order ticket ${order.orderNumber} issued for ${order.tableNumber}`);
    return order;
  }

  /**
   * Settle Order: Locks payment and triggers automated stock deduction from central inventory
   */
  async settleOrder(orderId, paymentMethod, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await this.model.findById(orderId).session(session);
      if (!order) {
        throw new AppError('Restaurant order ticket not found', 404);
      }

      if (order.status === 'PAID') {
        throw new AppError('Order ticket has already been settled and paid', 400);
      }

      // Update Order Status
      order.status = 'PAID';
      order.paymentMethod = paymentMethod || 'CASH';
      await order.save({ session });

      // Trigger automatic stock updates inside transaction session
      for (const item of order.items) {
        if (!item.productId) {
          logger.info(`[Restaurant POS]: Skipping stock deduction for item without productId: ${item.name}`);
          continue;
        }
        try {
          await inventoryService.adjustStock(
            item.productId,
            -item.quantity, // Deduct ingredients/fish quantity from central stock
            'RESTAURANT_CONSUMPTION',
            {
              referenceId: order._id,
              referenceModel: 'RestaurantOrder',
              session
            },
            userId,
            `Ingredient stock consumed for Restaurant POS Order ${order.orderNumber}`
          );
        } catch (err) {
          logger.warn(`[Restaurant POS]: Failed to adjust stock for item ${item.productId}: ${err.message}`);
        }
      }

      await session.commitTransaction();
      session.endSession();

      logger.info(`[Restaurant POS]: Settled order ${order.orderNumber}. Inventory updated.`);
      return order;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }
}

export const restaurantService = new RestaurantService();
export default restaurantService;

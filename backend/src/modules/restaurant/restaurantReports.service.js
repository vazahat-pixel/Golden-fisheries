import { RestaurantOrder } from './restaurantOrder.model.js';
import { RestaurantInventoryLog } from './restaurantInventory.model.js';
import { KitchenTicket } from './kitchenTicket.model.js';
import { INVENTORY_SCOPES } from '../../constants/inventoryScopes.js';

class RestaurantReportsService {
  async getDailySales(date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await RestaurantOrder.find({
      status: 'PAID',
      createdAt: { $gte: start, $lte: end },
    });

    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const byPayment = {};
    for (const o of orders) {
      const m = o.paymentMethod || 'CASH';
      byPayment[m] = (byPayment[m] || 0) + (o.totalAmount || 0);
    }

    return {
      date: start,
      orderCount: orders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      byPaymentMethod: byPayment,
      orders,
    };
  }

  async getItemWiseSales(query = {}) {
    const filter = { status: 'PAID' };
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }
    const orders = await RestaurantOrder.find(filter);
    const itemMap = new Map();

    for (const order of orders) {
      for (const line of order.items) {
        const key = line.name || 'UNKNOWN';
        const prev = itemMap.get(key) || { name: key, quantity: 0, revenue: 0 };
        prev.quantity += line.quantity || 0;
        prev.revenue += line.amount || line.quantity * line.rate || 0;
        itemMap.set(key, prev);
      }
    }

    return {
      items: [...itemMap.values()].sort((a, b) => b.revenue - a.revenue),
    };
  }

  async getKitchenConsumptionReport(query = {}) {
    const filter = { type: { $in: ['RECIPE_CONSUMPTION', 'SALE_OUT'] } };
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }
    const logs = await RestaurantInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(query.limit, 10) || 200)
      .populate('itemId', 'name unit');
    const totalConsumed = logs.reduce((s, l) => s + Math.abs(l.quantityChange || 0), 0);
    return { scope: INVENTORY_SCOPES.RESTAURANT, logs, totalConsumedKg: totalConsumed };
  }

  async getWastageReport(query = {}) {
    const filter = { type: 'WASTAGE' };
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }
    const logs = await RestaurantInventoryLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(query.limit, 10) || 100)
      .populate('itemId', 'name unit');
    const totalWastage = logs.reduce((s, l) => s + Math.abs(l.quantityChange || 0), 0);
    return { logs, totalWastageKg: totalWastage };
  }

  async getTableRevenueReport(query = {}) {
    const filter = { status: 'PAID', orderType: 'DINE_IN' };
    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }
    const orders = await RestaurantOrder.find(filter);
    const tableMap = new Map();
    for (const o of orders) {
      const t = o.tableNumber || 'UNKNOWN';
      const prev = tableMap.get(t) || { table: t, orders: 0, revenue: 0 };
      prev.orders += 1;
      prev.revenue += o.totalAmount || 0;
      tableMap.set(t, prev);
    }
    return { tables: [...tableMap.values()].sort((a, b) => b.revenue - a.revenue) };
  }

  async getProfitSummary(query = {}) {
    const sales = await this.getDailySales(query.date ? new Date(query.date) : new Date());
    return {
      grossSales: sales.totalRevenue,
      orderCount: sales.orderCount,
      note: 'Operational P&L — exclude Fish Mall cost allocation in v1',
    };
  }

  async getKitchenQueueSummary() {
    const active = await KitchenTicket.countDocuments({ status: 'ACTIVE' });
    const completedToday = await KitchenTicket.countDocuments({
      status: 'COMPLETED',
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    return { activeTickets: active, completedToday };
  }
}

export const restaurantReportsService = new RestaurantReportsService();
export default restaurantReportsService;

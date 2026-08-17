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

  async getDishHistoryAnalysis(query = {}) {
    const filter = { status: 'PAID' };
    
    if (query.date) {
      const start = new Date(query.date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(query.date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    } else if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) {
        const start = new Date(query.from);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (query.to) {
        const end = new Date(query.to);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const orders = await RestaurantOrder.find(filter).sort({ createdAt: -1 });

    const searchStr = (query.search || '').trim().toLowerCase();
    const dailyMap = new Map();
    const dishAggMap = new Map();
    let totalPortionsSold = 0;
    let totalDishRevenue = 0;

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().slice(0, 10);
      
      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          displayDate: new Date(dateKey).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            weekday: 'short',
          }),
          totalPortions: 0,
          totalRevenue: 0,
          orderCount: 0,
          orderNumbers: new Set(),
          dishMap: new Map(),
        });
      }

      const dayRecord = dailyMap.get(dateKey);
      dayRecord.orderNumbers.add(order.orderNumber);

      for (const line of order.items || []) {
        const name = (line.name || 'UNKNOWN ITEM').trim();
        if (searchStr && !name.toLowerCase().includes(searchStr)) {
          continue;
        }

        const qty = line.quantity || 1;
        const lineRev = line.amount || (qty * (line.rate || 0)) || 0;

        totalPortionsSold += qty;
        totalDishRevenue += lineRev;

        // Add to daily dish map
        const prevDayDish = dayRecord.dishMap.get(name) || {
          name,
          quantity: 0,
          rate: line.rate || 0,
          revenue: 0,
          orderCount: 0,
        };
        prevDayDish.quantity += qty;
        prevDayDish.revenue += lineRev;
        prevDayDish.orderCount += 1;
        dayRecord.dishMap.set(name, prevDayDish);

        dayRecord.totalPortions += qty;
        dayRecord.totalRevenue += lineRev;

        // Add to overall dish aggregation
        const prevAgg = dishAggMap.get(name) || {
          name,
          totalQuantity: 0,
          totalRevenue: 0,
          totalOrders: 0,
          avgRate: line.rate || 0,
          datesSet: new Set(),
        };
        prevAgg.totalQuantity += qty;
        prevAgg.totalRevenue += lineRev;
        prevAgg.totalOrders += 1;
        prevAgg.datesSet.add(dateKey);
        dishAggMap.set(name, prevAgg);
      }
    }

    // Format daily breakdown
    const dailyBreakdown = Array.from(dailyMap.values())
      .filter((d) => d.dishMap.size > 0)
      .map((d) => ({
        date: d.date,
        displayDate: d.displayDate,
        totalPortions: d.totalPortions,
        totalRevenue: Math.round(d.totalRevenue * 100) / 100,
        orderCount: d.orderNumbers.size,
        dishes: Array.from(d.dishMap.values()).sort((a, b) => b.quantity - a.quantity),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // Format dish aggregates
    const dishAggregates = Array.from(dishAggMap.values())
      .map((d) => ({
        name: d.name,
        totalQuantity: d.totalQuantity,
        totalRevenue: Math.round(d.totalRevenue * 100) / 100,
        totalOrders: d.totalOrders,
        daysOrdered: d.datesSet.size,
        avgPerDay: d.datesSet.size ? Math.round((d.totalQuantity / d.datesSet.size) * 10) / 10 : d.totalQuantity,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity);

    const topSellingDish = dishAggregates[0] || null;
    const daysCount = dailyBreakdown.length;
    const avgPortionsPerDay = daysCount ? Math.round((totalPortionsSold / daysCount) * 10) / 10 : 0;

    return {
      summary: {
        totalPortionsSold,
        totalDishRevenue: Math.round(totalDishRevenue * 100) / 100,
        uniqueDishesCount: dishAggregates.length,
        daysCount,
        averagePortionsPerDay: avgPortionsPerDay,
        topSellingDish: topSellingDish ? {
          name: topSellingDish.name,
          quantity: topSellingDish.totalQuantity,
          revenue: topSellingDish.totalRevenue,
        } : null,
      },
      dailyBreakdown,
      dishAggregates,
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

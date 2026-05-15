import { Billing } from '../billing/billing.model.js';
import { RestaurantOrder } from '../restaurant/restaurantOrder.model.js';
import { FishMallSale } from '../fishmall/fishmallSale.model.js';
import { Expense } from '../expenses/expense.model.js';
import { Product } from '../products/product.model.js';

export const reportsService = {
  /**
   * Aggregates dynamic sales trends across all panels (Wholesale Billing, Restaurant POS, FishMall Retail)
   */
  getSalesSummary: async () => {
    try {
      // 1. Wholesale Invoicing
      const wholesale = await Billing.aggregate([
        { $match: { paymentStatus: { $ne: 'OVERDUE' } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            subtotal: { $sum: { $ifNull: ['$subtotal', 0] } },
            taxCollected: { $sum: { $ifNull: ['$taxAmount', 0] } },
            invoiceCount: { $sum: 1 }
          }
        }
      ]);

      // 2. Restaurant POS Dine-In/Takeaway
      const restaurant = await RestaurantOrder.aggregate([
        { $match: { status: 'PAID' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            subtotal: { $sum: { $ifNull: ['$subtotal', 0] } },
            totalCgst: { $sum: { $ifNull: ['$cgst', 0] } },
            totalSgst: { $sum: { $ifNull: ['$sgst', 0] } },
            ticketCount: { $sum: 1 }
          }
        },
        {
          $project: {
            totalRevenue: 1,
            subtotal: 1,
            ticketCount: 1,
            taxCollected: { $add: ['$totalCgst', '$totalSgst'] }
          }
        }
      ]);

      // 3. FishMall retail stores
      const fishmall = await FishMallSale.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $ifNull: ['$totalAmount', 0] } },
            subtotal: { $sum: { $ifNull: ['$subtotal', 0] } },
            taxCollected: { $sum: { $ifNull: ['$taxAmount', 0] } },
            retailSaleCount: { $sum: 1 }
          }
        }
      ]);

      const wRes = wholesale[0] || { totalRevenue: 0, subtotal: 0, taxCollected: 0, invoiceCount: 0 };
      const rRes = restaurant[0] || { totalRevenue: 0, subtotal: 0, taxCollected: 0, ticketCount: 0 };
      const fRes = fishmall[0] || { totalRevenue: 0, subtotal: 0, taxCollected: 0, retailSaleCount: 0 };

      return {
        wholesale: wRes,
        restaurant: rRes,
        fishmall: fRes,
        totalCumulativeRevenue: (wRes.totalRevenue || 0) + (rRes.totalRevenue || 0) + (fRes.totalRevenue || 0),
        totalCumulativeSubtotal: (wRes.subtotal || 0) + (rRes.subtotal || 0) + (fRes.subtotal || 0),
        totalCumulativeTax: (wRes.taxCollected || 0) + (rRes.taxCollected || 0) + (fRes.taxCollected || 0)
      };
    } catch (error) {
      logger.error(`[Sales Report Failure]: ${error.message}`);
      throw error; // Re-throw to be caught by asyncWrapper
    }
  },

  /**
   * Aggregates corporate operational expenses
   */
  getExpenseSummary: async () => {
    return await Expense.aggregate([
      { $match: { status: 'APPROVED' } },
      {
        $group: {
          _id: '$expenseType',
          totalSpent: { $sum: '$amount' },
          recordCount: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } }
    ]);
  },

  /**
   * Lists inventory stock reserves and triggers alert triggers for critical stock drops
   */
  getInventorySummary: async () => {
    const products = await Product.find({});
    
    const stockLevels = [];
    const criticalReorderList = [];

    for (const p of products) {
      const pQty = p.quantity || 0;
      const minLimit = p.minStockLimit || 50;

      const info = {
        productId: p._id,
        name: p.name,
        category: p.category,
        quantity: pQty,
        minStockLimit: minLimit,
        unit: p.baseUnit,
        status: pQty <= minLimit ? 'CRITICAL_LOW' : 'OK'
      };

      stockLevels.push(info);
      if (pQty <= minLimit) {
        criticalReorderList.push(info);
      }
    }

    return {
      totalProductSKUs: products.length,
      criticalItemsCount: criticalReorderList.length,
      stockLevels,
      criticalReorderList
    };
  },

  /**
   * Calculates corporate net profitability metrics (Sales - Expenses)
   */
  getProfitSummary: async () => {
    const sales = await reportsService.getSalesSummary();
    const expensesAgg = await reportsService.getExpenseSummary();

    const totalSpentExpenses = expensesAgg.reduce((sum, item) => sum + item.totalSpent, 0);
    const netProfit = sales.totalCumulativeRevenue - totalSpentExpenses;

    return {
      grossSalesRevenue: sales.totalCumulativeRevenue,
      operationalExpenses: totalSpentExpenses,
      netProfits: netProfit,
      marginPercentage: sales.totalCumulativeRevenue > 0 ? (netProfit / sales.totalCumulativeRevenue) * 100 : 0
    };
  }
};
export default reportsService;

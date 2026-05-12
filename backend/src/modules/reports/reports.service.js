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
    // 1. Wholesale Invoicing
    const wholesale = await Billing.aggregate([
      { $match: { paymentStatus: { $ne: 'OVERDUE' } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          subtotal: { $sum: '$subtotal' },
          taxCollected: { $sum: '$taxAmount' },
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
          totalRevenue: { $sum: '$totalAmount' },
          subtotal: { $sum: '$subtotal' },
          taxCollected: { $add: [{ $sum: '$cgst' }, { $sum: '$sgst' }] },
          ticketCount: { $sum: 1 }
        }
      }
    ]);

    // 3. FishMall retail stores
    const fishmall = await FishMallSale.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          subtotal: { $sum: '$subtotal' },
          taxCollected: { $sum: '$taxAmount' },
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
      totalCumulativeRevenue: wRes.totalRevenue + rRes.totalRevenue + fRes.totalRevenue,
      totalCumulativeSubtotal: wRes.subtotal + rRes.subtotal + fRes.subtotal,
      totalCumulativeTax: wRes.taxCollected + rRes.taxCollected + fRes.taxCollected
    };
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

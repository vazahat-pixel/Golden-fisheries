import { Billing } from '../billing/billing.model.js';
import { RestaurantOrder } from '../restaurant/restaurantOrder.model.js';
import { FishMallSale } from '../fishmall/fishmallSale.model.js';
import { Expense } from '../expenses/expense.model.js';
import { Product } from '../products/product.model.js';
import { Tapal } from '../tapals/tapal.model.js';
import { User } from '../users/user.model.js';

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
  },

  /**
   * Aggregates dashboard stats
   */
  getDashboardStats: async () => {
    try {
      const sales = await reportsService.getSalesSummary();
      
      const totalTapals = await Tapal.countDocuments();
      const pendingTapals = await Tapal.countDocuments({ status: 'CREATED' });
      const activeTapals = await Tapal.countDocuments({ status: { $in: ['DRIVER_ASSIGNED', 'TRIP_STARTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'BILL_PENDING'] } });
      const completedTapals = await Tapal.countDocuments({ status: 'COMPLETED' });
      
      const products = await Product.find({});
      const totalInventoryKg = products.reduce((sum, p) => sum + (p.quantity || 0), 0);
      
      const totalRevenue = sales.totalCumulativeRevenue;
      
      const activeDrivers = await User.countDocuments({ role: 'driver', isActive: true });
      const pendingExpenses = await Expense.countDocuments({ status: 'PENDING' });
      
      // Real data for charts
      const wholesaleChartData = await Billing.aggregate([
        { $group: { _id: { $month: "$createdAt" }, amount: { $sum: "$totalAmount" } } }
      ]);
      const restaurantChartData = await RestaurantOrder.aggregate([
        { $match: { status: 'PAID' } },
        { $group: { _id: { $month: "$createdAt" }, amount: { $sum: "$totalAmount" } } }
      ]);
      const fishmallChartData = await FishMallSale.aggregate([
        { $group: { _id: { $month: "$createdAt" }, amount: { $sum: "$totalAmount" } } }
      ]);

      // Merge results by month
      const monthlyData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      wholesaleChartData.forEach(item => {
        monthlyData[item._id] = (monthlyData[item._id] || 0) + item.amount;
      });
      restaurantChartData.forEach(item => {
        monthlyData[item._id] = (monthlyData[item._id] || 0) + item.amount;
      });
      fishmallChartData.forEach(item => {
        monthlyData[item._id] = (monthlyData[item._id] || 0) + item.amount;
      });

      const revenueChart = Object.keys(monthlyData).map(monthId => ({
        month: months[parseInt(monthId) - 1] || 'Unknown',
        amount: monthlyData[monthId]
      })).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
      
      const tapalChartData = await Tapal.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } },
        { $limit: 7 }
      ]);
      const tapalChart = tapalChartData.map(item => ({
        date: item._id,
        count: item.count
      }));

      const wholesaleProducts = await Billing.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.productName", value: { $sum: "$items.quantity" } } }
      ]);
      const restaurantProducts = await RestaurantOrder.aggregate([
        { $match: { status: 'PAID' } },
        { $unwind: "$items" },
        { $group: { _id: "$items.name", value: { $sum: "$items.quantity" } } }
      ]);
      const fishmallProducts = await FishMallSale.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.fishName", value: { $sum: "$items.scaleWeight" } } }
      ]);

      // Merge results by product name
      const productData = {};
      
      wholesaleProducts.forEach(item => {
        const name = (item._id || 'Unknown').toUpperCase();
        productData[name] = (productData[name] || 0) + item.value;
      });
      restaurantProducts.forEach(item => {
        const name = (item._id || 'Unknown').toUpperCase();
        productData[name] = (productData[name] || 0) + item.value;
      });
      fishmallProducts.forEach(item => {
        const name = (item._id || 'Unknown').toUpperCase();
        productData[name] = (productData[name] || 0) + item.value;
      });

      const topProducts = Object.keys(productData).map(name => ({
        name,
        value: productData[name]
      })).sort((a, b) => b.value - a.value).slice(0, 4);

      return {
        totalTapals,
        pendingTapals,
        activeTapals,
        completedTapals,
        totalInventoryKg,
        totalRevenue,
        activeDrivers,
        pendingExpenses,
        revenueChart,
        tapalChart,
        topProducts
      };
    } catch (error) {
      console.error(`[Dashboard Stats Failure]: ${error.message}`);
      throw error;
    }
  }
};
export default reportsService;

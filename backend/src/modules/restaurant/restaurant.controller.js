import { restaurantService } from './restaurant.service.js';
import { restaurantMenuService } from './restaurantMenu.service.js';
import { restaurantInventoryService } from './restaurantInventory.service.js';
import { kitchenService } from './kitchen.service.js';
import { restaurantReportsService } from './restaurantReports.service.js';
import { restaurantAccountingService } from './restaurantAccounting.service.js';
import { restaurantOutletService } from '../restaurant-outlet/restaurantOutlet.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { broadcastEvent } from '../../sockets/socket.js';

export const restaurantController = {
  create: asyncWrapper(async (req, res) => {
    const order = await restaurantService.createOrder(req.body, req.user.id);
    broadcastEvent('restaurant:order_created', { order });
    new ApiResponse(201, { order }, 'Order ticket created successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await restaurantService.findOrdersWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Order tickets fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const order = await restaurantService.findById(req.params.id);
    new ApiResponse(200, { order }, 'Order retrieved successfully').send(res);
  }),

  settle: asyncWrapper(async (req, res) => {
    const order = await restaurantService.settleOrder(req.params.id, req.body, req.user.id);
    new ApiResponse(200, { order }, 'Order settled — payment recorded and kitchen stock consumed').send(
      res
    );
  }),

  updateStatus: asyncWrapper(async (req, res) => {
    const order = await restaurantService.updateOrderStatus(req.params.id, req.body.status);
    new ApiResponse(200, { order }, 'Order status updated').send(res);
  }),

  removeOrderItem: asyncWrapper(async (req, res) => {
    const order = await restaurantService.removeOrderItem(req.params.orderId, req.params.itemId);
    new ApiResponse(200, { order }, 'Item removed from the bill').send(res);
  }),

  voidOrder: asyncWrapper(async (req, res) => {
    const order = await restaurantService.voidOrder(req.params.id, req.body.reason, req.user.id);
    new ApiResponse(200, { order }, 'Bill voided — stock and cashbook reversed').send(res);
  }),

  getMenu: asyncWrapper(async (req, res) => {
    let menu = await restaurantMenuService.listWithStockHints(req.query);
    if (!menu.length) {
      const inv = await restaurantInventoryService.list({ limit: 500 });
      menu = inv.docs.map((item) => ({
        _id: item._id,
        id: item._id,
        menuItemId: null,
        inventoryItemId: item._id,
        name: item.name,
        category: item.category || 'Kitchen',
        price: item.rate,
        sellingPrice: item.rate,
        rate: item.rate,
        gstRate: 5,
        image: '🐟',
        stock: item.quantity,
        recipe: [],
      }));
    }
    new ApiResponse(200, menu, 'Restaurant POS menu fetched').send(res);
  }),

  createMenuItem: asyncWrapper(async (req, res) => {
    const item = await restaurantMenuService.create(req.body, req.user.id);
    new ApiResponse(201, item, 'Menu item with recipe created').send(res);
  }),

  updateMenuItem: asyncWrapper(async (req, res) => {
    const item = await restaurantMenuService.update(req.params.id, req.body);
    new ApiResponse(200, item, 'Menu item updated').send(res);
  }),

  deleteMenuItem: asyncWrapper(async (req, res) => {
    await restaurantMenuService.delete(req.params.id);
    new ApiResponse(200, { success: true }, 'Menu item deleted').send(res);
  }),

  listMenuAdmin: asyncWrapper(async (req, res) => {
    const result = await restaurantMenuService.list({ ...req.query, limit: 500 });
    new ApiResponse(200, result.docs, 'Menu catalog fetched', result.meta).send(res);
  }),

  createKitchenTicket: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.createTicket(req.body, req.user.id);
    new ApiResponse(201, { ticket }, 'Kitchen order ticket created').send(res);
  }),

  listKitchenTickets: asyncWrapper(async (req, res) => {
    const activeOnly = req.query.active === 'true' || req.query.active === '1';
    const result = activeOnly
      ? await kitchenService.listActive(req.query)
      : (await kitchenService.listAll(req.query)).docs;
    new ApiResponse(200, result, 'Kitchen tickets fetched').send(res);
  }),

  getKitchenTicket: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.getById(req.params.id);
    new ApiResponse(200, { ticket }, 'Kitchen ticket retrieved').send(res);
  }),

  advanceKitchenLine: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.advanceLineStatus(
      req.params.ticketId,
      req.params.lineId
    );
    new ApiResponse(200, { ticket }, 'Kitchen line status advanced').send(res);
  }),

  updateKitchenLine: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.updateLineStatus(
      req.params.ticketId,
      req.params.lineId,
      req.body.lineStatus
    );
    new ApiResponse(200, { ticket }, 'Kitchen line status updated').send(res);
  }),

  cancelKitchenTicket: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.cancelTicket(req.params.id);
    new ApiResponse(200, { ticket }, 'Kitchen ticket cancelled').send(res);
  }),

  voidKitchenLine: asyncWrapper(async (req, res) => {
    const ticket = await kitchenService.voidLine(
      req.params.ticketId,
      req.params.lineId,
      req.body.reason
    );
    new ApiResponse(200, { ticket }, 'Kitchen line voided').send(res);
  }),

  // Restaurant's own bill/GST identity — self-service for managers, no full outlet CRUD access needed
  getOutletSettings: asyncWrapper(async (req, res) => {
    const outlet = await restaurantOutletService.getMySettings();
    new ApiResponse(200, { outlet }, 'Restaurant bill settings fetched').send(res);
  }),

  updateOutletSettings: asyncWrapper(async (req, res) => {
    const outlet = await restaurantOutletService.updateMySettings(req.body);
    new ApiResponse(200, { outlet }, 'Restaurant bill settings updated').send(res);
  }),

  listInventory: asyncWrapper(async (req, res) => {
    const result = await restaurantInventoryService.list(req.query);
    new ApiResponse(200, result.docs, 'Restaurant kitchen inventory fetched', result.meta).send(
      res
    );
  }),

  adjustInventory: asyncWrapper(async (req, res) => {
    const { quantityChange, remarks } = req.body;
    const item = await restaurantInventoryService.adjustItem(
      req.params.id,
      quantityChange,
      req.user.id,
      remarks
    );
    broadcastEvent('restaurant:inventory_updated', {});
    new ApiResponse(200, item, 'Restaurant stock adjusted').send(res);
  }),

  recordWastage: asyncWrapper(async (req, res) => {
    await restaurantInventoryService.recordWastage(
      req.body.inventoryItemId,
      req.body.quantity,
      req.user.id,
      req.body.remarks
    );
    broadcastEvent('restaurant:inventory_updated', {});
    new ApiResponse(200, { ok: true }, 'Wastage recorded').send(res);
  }),

  inventorySummary: asyncWrapper(async (req, res) => {
    const summary = await restaurantInventoryService.getSummary();
    new ApiResponse(200, summary, 'Restaurant inventory summary').send(res);
  }),

  inventoryLogs: asyncWrapper(async (req, res) => {
    const logs = await restaurantInventoryService.getLogs(req.query);
    new ApiResponse(200, logs, 'Restaurant inventory logs').send(res);
  }),

  getTables: asyncWrapper(async (req, res) => {
    const tables = await restaurantService.getTablesWithStatus();
    new ApiResponse(200, tables, 'Tables fetched successfully').send(res);
  }),

  // Fetch a dine-in table's currently open (unpaid) running tab, if any
  getTableOrder: asyncWrapper(async (req, res) => {
    const { tableNumber } = req.query;
    if (!tableNumber) {
      return new ApiResponse(200, { order: null }, 'No table specified').send(res);
    }
    const order = await restaurantService.findOpenTableOrder('DINE_IN', tableNumber);
    new ApiResponse(200, { order: order || null }, 'Table running tab fetched').send(res);
  }),

  reportDailySales: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getDailySales(
      req.query.date ? new Date(req.query.date) : new Date()
    );
    new ApiResponse(200, data, 'Daily restaurant sales report').send(res);
  }),

  reportItemSales: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getItemWiseSales(req.query);
    new ApiResponse(200, data, 'Item-wise sales report').send(res);
  }),

  reportDishHistory: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getDishHistoryAnalysis(req.query);
    new ApiResponse(200, data, 'Dish history and daily order count analysis').send(res);
  }),

  mergeTables: asyncWrapper(async (req, res) => {
    const result = await restaurantService.mergeTables(req.body, req.user.id);
    new ApiResponse(200, result, 'Tables merged successfully').send(res);
  }),

  reportConsumption: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getKitchenConsumptionReport(req.query);
    new ApiResponse(200, data, 'Kitchen consumption report').send(res);
  }),

  reportWastage: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getWastageReport(req.query);
    new ApiResponse(200, data, 'Wastage report').send(res);
  }),

  reportTables: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getTableRevenueReport(req.query);
    new ApiResponse(200, data, 'Table revenue report').send(res);
  }),

  reportProfit: asyncWrapper(async (req, res) => {
    const data = await restaurantReportsService.getProfitSummary(req.query);
    new ApiResponse(200, data, 'Restaurant P&L summary').send(res);
  }),

  // Shift & Accounting Sessions
  activeSession: asyncWrapper(async (req, res) => {
    const session = await restaurantAccountingService.getActiveSession(req.user.id);
    new ApiResponse(200, { activeSession: session || null }, 'Active shift session loaded').send(res);
  }),

  openSession: asyncWrapper(async (req, res) => {
    const session = await restaurantAccountingService.openSession(req.user.id, req.body);
    new ApiResponse(201, { session }, 'Shift session opened successfully').send(res);
  }),

  closeSession: asyncWrapper(async (req, res) => {
    const session = await restaurantAccountingService.closeSession(req.user.id, req.body);
    new ApiResponse(200, { session }, 'Shift session closed successfully').send(res);
  }),

  sessionSummary: asyncWrapper(async (req, res) => {
    const active = await restaurantAccountingService.getActiveSession(req.user.id);
    if (!active) {
      return new ApiResponse(200, { session: null, cashbook: [], expenses: [] }, 'No active open session').send(res);
    }
    const summary = await restaurantAccountingService.getSessionSummary(active._id);
    new ApiResponse(200, summary, 'Session shift summary loaded').send(res);
  }),

  recordExpense: asyncWrapper(async (req, res) => {
    const expense = await restaurantAccountingService.recordExpense(req.user.id, req.body);
    new ApiResponse(201, { expense }, 'Operational expense recorded successfully').send(res);
  }),

  listExpenses: asyncWrapper(async (req, res) => {
    const active = await restaurantAccountingService.getActiveSession(req.user.id);
    if (!active) {
      return new ApiResponse(200, [], 'No active session').send(res);
    }
    const summary = await restaurantAccountingService.getSessionSummary(active._id);
    new ApiResponse(200, summary.expenses, 'Session expenses loaded').send(res);
  }),

  listCashbook: asyncWrapper(async (req, res) => {
    const active = await restaurantAccountingService.getActiveSession(req.user.id);
    if (!active) {
      return new ApiResponse(200, [], 'No active session').send(res);
    }
    const summary = await restaurantAccountingService.getSessionSummary(active._id);
    new ApiResponse(200, summary.cashbook, 'Cashbook entries loaded').send(res);
  }),
};

export default restaurantController;

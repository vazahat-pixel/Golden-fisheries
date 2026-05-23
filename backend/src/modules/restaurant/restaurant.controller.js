import { restaurantService } from './restaurant.service.js';
import { restaurantMenuService } from './restaurantMenu.service.js';
import { restaurantInventoryService } from './restaurantInventory.service.js';
import { kitchenService } from './kitchen.service.js';
import { restaurantReportsService } from './restaurantReports.service.js';
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
    const tables = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      label: `T${String(i + 1).padStart(2, '0')}`,
      status: 'available',
      capacity: i < 4 ? 2 : i < 14 ? 4 : 6,
    }));
    new ApiResponse(200, tables, 'Tables fetched successfully').send(res);
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
};

export default restaurantController;

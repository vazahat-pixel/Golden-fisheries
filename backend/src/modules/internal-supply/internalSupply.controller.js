import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { internalSupplyService } from './internalSupply.service.js';

export const internalSupplyController = {
  createRestaurantBill: asyncWrapper(async (req, res) => {
    const bill = await internalSupplyService.createFishMallToRestaurantBill(
      req.body,
      req.user.id
    );
    new ApiResponse(
      201,
      { bill },
      'Internal bill issued — Fish Mall stock reduced, pending Restaurant acceptance'
    ).send(res);
  }),

  acceptBill: asyncWrapper(async (req, res) => {
    const bill = await internalSupplyService.acceptInternalBill(
      req.params.id,
      req.user.id,
      req.body
    );
    new ApiResponse(
      200,
      { bill },
      `Internal supply transfer resolved successfully as ${bill.status}`
    ).send(res);
  }),

  listBills: asyncWrapper(async (req, res) => {
    const result = await internalSupplyService.listBills(req.query);
    new ApiResponse(200, result.docs, 'Internal supply bills fetched', result.meta).send(
      res
    );
  }),

  getBill: asyncWrapper(async (req, res) => {
    const bill = await internalSupplyService.getBillById(req.params.id);
    new ApiResponse(200, { bill }, 'Internal supply bill retrieved').send(res);
  }),

  summary: asyncWrapper(async (req, res) => {
    const summary = await internalSupplyService.getSummary(req.query);
    new ApiResponse(200, summary, 'Internal supply summary').send(res);
  }),

  fishMallSalesReport: asyncWrapper(async (req, res) => {
    const data = await internalSupplyService.getFishMallInternalSalesReport(req.query);
    new ApiResponse(200, data, 'Fish Mall internal sales report').send(res);
  }),

  restaurantReceiveReport: asyncWrapper(async (req, res) => {
    const data = await internalSupplyService.getRestaurantReceiveReport(req.query);
    new ApiResponse(200, data, 'Restaurant stock receive report').send(res);
  }),

  movementReport: asyncWrapper(async (req, res) => {
    const data = await internalSupplyService.getMovementReport(req.query);
    new ApiResponse(200, data, 'Internal inventory movement report').send(res);
  }),

  dailyTransferSummary: asyncWrapper(async (req, res) => {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const data = await internalSupplyService.getDailyTransferSummary(date);
    new ApiResponse(200, data, 'Daily internal transfer summary').send(res);
  }),
};

export default internalSupplyController;

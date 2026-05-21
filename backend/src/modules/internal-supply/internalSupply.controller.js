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
      'Internal supply bill issued — Fish Mall stock reduced, Restaurant stock increased'
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
    const summary = await internalSupplyService.getSummary();
    new ApiResponse(200, summary, 'Internal supply summary').send(res);
  }),
};

export default internalSupplyController;

import { BaseService } from '../../services/base.service.js';
import { Buyer } from './buyer.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

class BuyerService extends BaseService {
  constructor() {
    super(Buyer);
  }

  /**
   * Search and filter buyers
   */
  async findBuyersWithFilters(queryParams) {
    const { page = 1, limit = 10, search, buyerType, isActive } = queryParams;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (buyerType) {
      filter.buyerType = buyerType;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { buyerName: searchRegex },
        { buyerCode: searchRegex },
        { phone: searchRegex },
        { deliveryAddress: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }
}

export const buyerService = new BuyerService();

export const buyerController = {
  create: asyncWrapper(async (req, res) => {
    const buyer = await buyerService.create(req.body);
    new ApiResponse(201, { buyer }, 'Buyer registered successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await buyerService.findBuyersWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Buyers fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const buyer = await buyerService.findById(req.params.id);
    new ApiResponse(200, { buyer }, 'Buyer retrieved successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const buyer = await buyerService.updateById(req.params.id, req.body);
    new ApiResponse(200, { buyer }, 'Buyer updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await buyerService.deleteById(req.params.id);
    new ApiResponse(200, null, 'Buyer deleted successfully').send(res);
  })
};

import { BaseService } from '../../services/base.service.js';
import { Farmer } from './farmer.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

class FarmerService extends BaseService {
  constructor() {
    super(Farmer);
  }

  /**
   * Search and filter farmers
   */
  async findFarmersWithFilters(queryParams) {
    const { page = 1, limit = 10, search, isActive } = queryParams;
    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { farmerCode: searchRegex },
        { phone: searchRegex },
        { location: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }
}

export const farmerService = new FarmerService();

export const farmerController = {
  create: asyncWrapper(async (req, res) => {
    const farmer = await farmerService.create(req.body);
    new ApiResponse(201, { farmer }, 'Farmer registered successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await farmerService.findFarmersWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Farmers fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const farmer = await farmerService.findById(req.params.id);
    new ApiResponse(200, { farmer }, 'Farmer retrieved successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const farmer = await farmerService.updateById(req.params.id, req.body);
    new ApiResponse(200, { farmer }, 'Farmer updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await farmerService.deleteById(req.params.id);
    new ApiResponse(200, null, 'Farmer deleted successfully').send(res);
  })
};

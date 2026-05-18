import { BaseService } from '../../services/base.service.js';
import { Vehicle } from './vehicle.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

class VehicleService extends BaseService {
  constructor() {
    super(Vehicle);
  }

  /**
   * Search and filter vehicles
   */
  async findVehiclesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, status } = queryParams;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { vehicleNumber: searchRegex },
        { type: searchRegex }
      ];
    }

    return await this.findMany(filter, { page, limit });
  }
}

export const vehicleService = new VehicleService();

export const vehicleController = {
  create: asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.create(req.body);
    new ApiResponse(201, { vehicle }, 'Vehicle registered successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await vehicleService.findVehiclesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Vehicles fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.findById(req.params.id);
    new ApiResponse(200, { vehicle }, 'Vehicle retrieved successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const vehicle = await vehicleService.updateById(req.params.id, req.body);
    new ApiResponse(200, { vehicle }, 'Vehicle updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await vehicleService.deleteById(req.params.id);
    new ApiResponse(200, null, 'Vehicle deleted successfully').send(res);
  })
};

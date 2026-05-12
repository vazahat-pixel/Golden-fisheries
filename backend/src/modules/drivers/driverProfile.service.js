import { BaseService } from '../../services/base.service.js';
import { DriverProfile } from './driverProfile.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

class DriverProfileService extends BaseService {
  constructor() {
    super(DriverProfile);
  }

  /**
   * Search and filter driver profiles
   */
  async findDriverProfilesWithFilters(queryParams) {
    const { page = 1, limit = 10, search, registrationStatus } = queryParams;
    const filter = {};

    if (registrationStatus) {
      filter.registrationStatus = registrationStatus;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { licenseNumber: searchRegex }
      ];
    }

    // Populate user profile and assigned vehicle details
    return await this.findMany(filter, { page, limit }, 'userId vehicleId');
  }
}

export const driverProfileService = new DriverProfileService();

export const driverProfileController = {
  create: asyncWrapper(async (req, res) => {
    const driverProfile = await driverProfileService.create(req.body);
    new ApiResponse(201, { driverProfile }, 'Driver Profile created successfully').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const result = await driverProfileService.findDriverProfilesWithFilters(req.query);
    new ApiResponse(200, result.docs, 'Driver Profiles fetched successfully', result.meta).send(res);
  }),

  getById: asyncWrapper(async (req, res) => {
    const driverProfile = await driverProfileService.findOne({ _id: req.params.id }, 'userId vehicleId');
    new ApiResponse(200, { driverProfile }, 'Driver Profile retrieved successfully').send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const driverProfile = await driverProfileService.updateById(req.params.id, req.body);
    new ApiResponse(200, { driverProfile }, 'Driver Profile updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await driverProfileService.deleteById(req.params.id);
    new ApiResponse(200, null, 'Driver Profile deleted successfully').send(res);
  })
};

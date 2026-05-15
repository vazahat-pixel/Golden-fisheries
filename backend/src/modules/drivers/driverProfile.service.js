/**
 * driverProfile.service.js — Legacy re-export shim.
 * All driver logic has been moved to driverProfile.controller.js.
 * This file is kept for any modules that may still import from it.
 */
import { DriverProfile } from './driverProfile.model.js';
import { BaseService } from '../../services/base.service.js';

class DriverProfileService extends BaseService {
  constructor() {
    super(DriverProfile);
  }

  async getActiveDrivers() {
    return await this.model
      .find({ registrationStatus: 'active' })
      .populate('userId', 'fullName phone role')
      .populate('vehicleId', 'vehicleNumber vehicleType');
  }
}

export const driverProfileService = new DriverProfileService();
export default driverProfileService;

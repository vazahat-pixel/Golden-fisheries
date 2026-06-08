import { BaseService } from '../../services/base.service.js';
import { User } from './user.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';
import { AppError } from '../../utils/appError.js';
import { ROLES } from '../../constants/roles.js';
import { syncUserMasterRecords, syncAllBuyerUsersToMaster } from '../../services/userMasterSync.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Service Layer dealing with core User data operations.
 * Inherits generic operational interfaces from BaseService.
 */
class UserService extends BaseService {
  constructor() {
    super(User);
  }

  /**
   * Find a user by phone number (includes password hash for login verification)
   * @param {string} phone 
   * @returns {Promise<User|null>}
   */
  async findByPhoneWithPassword(phone) {
    return await this.model.findOne({ phone }).select('+password');
  }

  /**
   * Find a user by phone number and check their OTP
   * @param {string} phone 
   * @returns {Promise<User|null>}
   */
  async findByPhoneWithOtp(phone) {
    return await this.model.findOne({ phone }).select('+otp.code +otp.expiresAt');
  }

  /**
   * Check if phone number is already registered
   * @param {string} phone 
   * @returns {Promise<boolean>}
   */
  async isPhoneTaken(phone) {
    const user = await this.model.findOne({ phone });
    return !!user;
  }

  /**
   * Update user with save() so password pre-save hook runs when password changes.
   */
  async updateUserSecure(id, payload) {
    const user = await this.model.findById(id);
    if (!user) throw new AppError('User not found', 404);
    const allowed = [
      'fullName',
      'email',
      'role',
      'businessUnits',
      'isActive',
      'status',
      'permissions',
    ];
    for (const key of allowed) {
      if (payload[key] !== undefined) user[key] = payload[key];
    }
    if (payload.password) {
      user.password = payload.password;
    }
    await user.save();
    await syncUserMasterRecords(user).catch((err) => {
      logger.warn(`[User Service]: Master sync after update failed: ${err.message}`);
    });
    return user;
  }
}

export const userService = new UserService();

export const userController = {
  drivers: asyncWrapper(async (req, res) => {
    const drivers = await User.find({
      role: ROLES.DRIVER,
      isActive: true,
      status: { $ne: 'revoked' },
    })
      .select('fullName phone _id role isActive status')
      .sort({ fullName: 1 });
    new ApiResponse(200, drivers, 'Active drivers fetched successfully').send(res);
  }),

  syncMaster: asyncWrapper(async (req, res) => {
    const result = await syncAllBuyerUsersToMaster();
    new ApiResponse(200, result, 'User → master data sync completed').send(res);
  }),

  all: asyncWrapper(async (req, res) => {
    const users = await userService.findMany({}, req.query);
    new ApiResponse(200, users.docs, 'Users fetched successfully', users.meta).send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const user = await userService.updateUserSecure(req.params.id, req.body);
    new ApiResponse(200, { user }, 'User updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await userService.deleteById(req.params.id);
    new ApiResponse(200, null, 'User deleted successfully').send(res);
  })
};

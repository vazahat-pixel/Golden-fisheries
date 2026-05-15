import { BaseService } from '../../services/base.service.js';
import { User } from './user.model.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

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
}

export const userService = new UserService();

export const userController = {
  all: asyncWrapper(async (req, res) => {
    const users = await userService.findMany({}, req.query);
    new ApiResponse(200, users.docs, 'Users fetched successfully', users.meta).send(res);
  }),

  update: asyncWrapper(async (req, res) => {
    const user = await userService.updateById(req.params.id, req.body);
    new ApiResponse(200, { user }, 'User updated successfully').send(res);
  }),

  delete: asyncWrapper(async (req, res) => {
    await userService.deleteById(req.params.id);
    new ApiResponse(200, null, 'User deleted successfully').send(res);
  })
};

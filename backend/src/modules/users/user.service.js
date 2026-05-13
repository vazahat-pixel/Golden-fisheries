import { BaseService } from '../../services/base.service.js';
import { User } from './user.model.js';

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

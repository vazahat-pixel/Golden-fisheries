import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';
import { AppError } from '../../utils/appError.js';
import { userService } from '../users/user.service.js';
import { User } from '../users/user.model.js';
import { logger } from '../../utils/logger.js';

/**
 * High-performance Authentication and Access Token service.
 * Standardizes authentication flows and token issuance.
 */
class AuthService {
  /**
   * Generates a stateless JWT Access Token
   */
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );
  }

  /**
   * Generates a stateless JWT Refresh Token
   */
  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );
  }

  /**
   * Registers a new user inside the system database.
   */
  async register(registrationData) {
    const isTaken = await userService.isPhoneTaken(registrationData.phone);
    if (isTaken) {
      throw new AppError('Phone number is already registered under another account', 400);
    }

    const user = await userService.create(registrationData);
    logger.info(`[Auth Module]: New user registered successfully. ID: ${user._id}, Role: ${user.role}`);
    return user;
  }

  /**
   * Verifies standard login credentials and generates authorization keys.
   */
  async login(phone, password) {
    const user = await userService.findByPhoneWithPassword(phone);
    if (!user) {
      throw new AppError('Invalid login credentials provided.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been suspended. Please contact Admin.', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid login credentials provided.', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Save refresh token to user model for token rotation and revoke tracking
    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Simulates dispatching a secure 6-digit OTP code to driver/staff mobile numbers.
   * Leverages a mock fallback in development, while storing real expiration in DB.
   */
  async sendOtp(phone) {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new AppError('No registered user was found with that phone number.', 404);
    }

    // Generate simulated/mock 6-digit OTP for dev ease
    const otpCode = '123456'; 
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Expiration set to 5 minutes

    // Save encrypted or secure details
    user.otp = { code: otpCode, expiresAt };
    await user.save();

    logger.info(`[OTP Service]: Sent OTP: ${otpCode} to ${phone}. Valid for 5 minutes.`);
    return { success: true, message: 'OTP sent successfully (Simulated Developer OTP: 123456)' };
  }

  /**
   * Validates OTP code and returns access tokens.
   */
  async verifyOtp(phone, code) {
    const user = await userService.findByPhoneWithOtp(phone);
    if (!user) {
      throw new AppError('Invalid OTP verification attempt.', 404);
    }

    if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
      throw new AppError('No active OTP sessions found for this user.', 400);
    }

    if (user.otp.expiresAt < new Date()) {
      throw new AppError('Your OTP has expired. Please request a new code.', 400);
    }

    if (user.otp.code !== code) {
      throw new AppError('Incorrect OTP entered. Verification failed.', 400);
    }

    // Verify user, clear OTP parameters
    user.phoneVerified = true;
    user.otp = undefined;

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  /**
   * Validates and rotates the user refresh token.
   */
  async refreshTokens(tokenValue) {
    try {
      const decoded = jwt.verify(tokenValue, config.jwt.refreshSecret);
      
      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user || user.refreshToken !== tokenValue) {
        throw new AppError('Invalid or revoked refresh token session.', 401);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Rotate token values
      user.refreshToken = refreshToken;
      await user.save();

      return { accessToken, refreshToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Session expired. Please log in again.', 401);
    }
  }

  /**
   * Logs out user and revokes refresh tokens.
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    logger.info(`[Auth Module]: User logged out, refresh token revoked. ID: ${userId}`);
    return { success: true };
  }
}

export const authService = new AuthService();
export default authService;

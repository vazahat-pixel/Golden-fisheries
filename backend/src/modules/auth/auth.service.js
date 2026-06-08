import jwt from 'jsonwebtoken';
import { config } from '../../config/config.js';
import { AppError } from '../../utils/appError.js';
import { userService } from '../users/user.service.js';
import { User } from '../users/user.model.js';
import { logger } from '../../utils/logger.js';
import { smsService } from '../../services/sms.service.js';
import { isRoleAllowedForPortal } from '../../constants/authPortals.js';
import { syncUserMasterRecords } from '../../services/userMasterSync.service.js';

/**
 * High-performance Authentication and Access Token service.
 * Standardizes authentication flows and token issuance.
 */
class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      { id: user._id, role: user.role, phone: user.phone },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );
  }

  async register(registrationData) {
    const isTaken = await userService.isPhoneTaken(registrationData.phone);
    if (isTaken) {
      throw new AppError('Phone number is already registered under another account', 400);
    }

    const user = await userService.create(registrationData);
    await syncUserMasterRecords(user).catch((err) => {
      logger.warn(`[Auth Module]: Master sync after register failed: ${err.message}`);
    });
    logger.info(`[Auth Module]: New user registered successfully. ID: ${user._id}, Role: ${user.role}`);
    return user;
  }

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

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  assertPortalAccess(user, loginPortal) {
    if (!loginPortal) return;

    if (!isRoleAllowedForPortal(user.role, loginPortal)) {
      throw new AppError(
        'This phone number is not authorized for this login screen. Use the correct app or contact Admin.',
        403
      );
    }
  }

  assertAccountActiveForOtp(user) {
    if (user.role === 'DRIVER' && !user.isActive) {
      throw new AppError(
        'Your registration is pending admin approval. Please wait for verification.',
        403
      );
    }
    if (!user.isActive) {
      throw new AppError('Your account is inactive. Please contact Admin.', 403);
    }
  }

  /**
   * Send OTP to a pre-registered user (invite-only). Optional loginPortal restricts role.
   */
  async sendOtp(phone, loginPortal) {
    let user = await User.findOne({ phone });

    if (!user && config.env === 'development' && config.auth.allowDevOtpBootstrap) {
      user = await User.create({
        phone,
        fullName: 'DEVELOPER ADMIN',
        role: 'SUPER_ADMIN',
        password: 'dev_password_123',
        phoneVerified: false
      });
      logger.info(`[OTP Service]: Dev bootstrap user created for ${phone}`);
    }

    if (!user) {
      throw new AppError(
        'No account found for this mobile number. Ask Admin to create your user first.',
        404
      );
    }

    this.assertPortalAccess(user, loginPortal);
    this.assertAccountActiveForOtp(user);

    const useRealOtpInDev = config.integrations.sms.forceSendInDev && config.integrations.sms.enabled;
    const otpCode =
      config.env === 'development' && !useRealOtpInDev
        ? '123456'
        : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    user.otp = { code: otpCode, expiresAt };
    await user.save();

    try {
      await smsService.sendOtp(phone, otpCode);
    } catch (err) {
      logger.error(`[OTP Service Error]: SMS send failed: ${err.message}`);
      throw new AppError(`Failed to send SMS: ${err.message}`, 500);
    }

    logger.info(`[OTP Service]: Sent OTP to ${phone} (portal: ${loginPortal || 'any'})`);

    const payload = {
      success: true,
      message:
        config.env === 'development'
          ? `OTP sent successfully (Dev OTP: ${otpCode})`
          : 'OTP sent successfully'
    };
    if (config.env === 'development') {
      payload.devOtp = otpCode;
    }
    return payload;
  }

  async verifyOtp(phone, code, loginPortal) {
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

    this.assertPortalAccess(user, loginPortal);
    this.assertAccountActiveForOtp(user);

    user.phoneVerified = true;
    user.otp = undefined;

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return { user, accessToken, refreshToken };
  }

  async refreshTokens(tokenValue) {
    try {
      if (!tokenValue) {
        throw new AppError('Refresh token required.', 401);
      }

      let decoded;
      try {
        decoded = jwt.verify(tokenValue, config.jwt.refreshSecret);
      } catch {
        throw new AppError('Session expired. Please log in again.', 401);
      }

      const user = await User.findById(decoded.id).select('+refreshToken');
      if (!user) {
        throw new AppError('User session not found.', 401);
      }

      if (user.refreshToken && user.refreshToken !== tokenValue) {
        user.refreshToken = undefined;
        await user.save();
        logger.error(
          `[SECURITY ALERT]: Refresh token reuse attempt detected for User [ID: ${user._id}]`
        );
        throw new AppError(
          'Security Warning: Session hijacked or token replayed. Access entirely revoked.',
          401
        );
      }

      if (!user.refreshToken) {
        throw new AppError('Session expired or revoked. Please log in again.', 401);
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();

      return { accessToken, refreshToken };
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Session expired. Please log in again.', 401);
    }
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
    logger.info(`[Auth Module]: User logged out, refresh token revoked. ID: ${userId}`);
    return { success: true };
  }
}

export const authService = new AuthService();
export default authService;

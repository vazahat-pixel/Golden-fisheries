import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authValidators, validateBody } from '../../validators/auth.validator.js';
import { protect } from '../../middleware/auth.middleware.js';
import { otpRateLimiter } from '../../middleware/security.middleware.js';

const router = Router();

// User Registration Router Hook
router.post(
  '/register',
  validateBody(authValidators.register),
  authController.register
);

// Password Login Route Hook
router.post(
  '/login',
  validateBody(authValidators.login),
  authController.login
);

// Send OTP Route Hook
router.post(
  '/otp/send',
  otpRateLimiter,
  validateBody(authValidators.sendOtp),
  authController.sendOtp
);

// Verify OTP Route Hook
router.post(
  '/otp/verify',
  otpRateLimiter,
  validateBody(authValidators.verifyOtp),
  authController.verifyOtp
);

// Token Refresh Route Hook (Supports cookies or body)
router.post(
  '/refresh',
  authController.refresh
);

// Logout Route (Requires authentication/protection)
router.post(
  '/logout',
  protect,
  authController.logout
);

export default router;

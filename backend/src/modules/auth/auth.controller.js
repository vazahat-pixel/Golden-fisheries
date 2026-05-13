import { authService } from './auth.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

// Secure cookie parameters for HTTPOnly refresh tokens
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // Match refresh token expiration (7 Days)
  };
};

export const authController = {
  // Register new staff/user
  register: asyncWrapper(async (req, res) => {
    const user = await authService.register(req.body);
    new ApiResponse(201, { user }, 'User registration successful').send(res);
  }),

  // Standard Login (Phone + Password)
  login: asyncWrapper(async (req, res) => {
    const { phone, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(phone, password);

    // Save refresh token in HttpOnly cookie to mitigate XSS vulnerabilities
    res.cookie('refreshToken', refreshToken, getCookieOptions());

    new ApiResponse(200, { user, accessToken }, 'Login successful').send(res);
  }),

  // Send OTP to user's registered phone
  sendOtp: asyncWrapper(async (req, res) => {
    const result = await authService.sendOtp(req.body.phone);
    new ApiResponse(200, result, 'Verification code sent').send(res);
  }),

  // Verify OTP and issue tokens
  verifyOtp: asyncWrapper(async (req, res) => {
    const { phone, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyOtp(phone, otp);

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    new ApiResponse(200, { user, accessToken }, 'Phone verification successful').send(res);
  }),

  // Rotate Refresh Tokens
  refresh: asyncWrapper(async (req, res) => {
    // Look in cookies first, fall back to body
    const tokenValue = req.cookies.refreshToken || req.body.refreshToken;
    
    const { accessToken, refreshToken } = await authService.refreshTokens(tokenValue);

    res.cookie('refreshToken', refreshToken, getCookieOptions());

    new ApiResponse(200, { accessToken }, 'Access token refreshed').send(res);
  }),

  // Settle user sessions cleanly
  logout: asyncWrapper(async (req, res) => {
    const userId = req.user.id;
    await authService.logout(userId);

    // Clear refresh token cookies instantly
    res.clearCookie('refreshToken', getCookieOptions());

    new ApiResponse(200, null, 'Logged out successfully').send(res);
  })
};

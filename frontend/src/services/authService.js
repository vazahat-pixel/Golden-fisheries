import { apiClient } from './apiClient';

export const authService = {
  /**
   * Password Authentication (Admin, Managers, Accountants)
   */
  login: async (phone, password) => {
    const response = await apiClient.post('/auth/login', { phone, password });
    return response.data; // { user, accessToken }
  },

  /**
   * Request an OTP code
   */
  requestOtp: async (phone, loginPortal) => {
    const response = await apiClient.post('/auth/otp/send', { phone, loginPortal });
    return response.data;
  },

  /**
   * Verify OTP and complete login session
   */
  verifyOtp: async (phone, otp, loginPortal) => {
    const response = await apiClient.post('/auth/otp/verify', { phone, otp, loginPortal });
    return response.data;
  },

  /**
   * Settle user session on backend
   */
  logout: async () => {
    try {
      await apiClient.post('/auth/logout', {});
    } catch (error) {
      console.warn('[Auth Service Warning]: Backend logout failed or session already cleared.', error.message);
    }
  }
};

export default authService;

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
  requestOtp: async (phone) => {
    const response = await apiClient.post('/auth/otp/send', { phone });
    return response.data; // { devOtp } in staging/dev modes
  },

  /**
   * Verify OTP and complete login session
   */
  verifyOtp: async (phone, otp) => {
    const response = await apiClient.post('/auth/otp/verify', { phone, otp });
    return response.data; // { user, accessToken }
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

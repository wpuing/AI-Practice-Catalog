/**
 * 认证服务 API
 */

import http from '@utils/http.js';

export const authApi = {
  /**
   * 用户登录
   */
  login(username, password) {
    return http.post('/auth/login', { username, password });
  },

  /**
   * 用户登出
   */
  logout() {
    return http.post('/auth/logout');
  },

  /**
   * 获取当前用户信息
   */
  getCurrentUser() {
    return http.get('/auth/current');
  },

  /**
   * 刷新 Token
   */
  refreshToken(refreshToken) {
    return http.post('/auth/refresh', { refreshToken });
  },

  /**
   * 修改密码
   */
  changePassword(oldPassword, newPassword) {
    return http.post('/auth/change-password', { oldPassword, newPassword });
  }
};

export default authApi;


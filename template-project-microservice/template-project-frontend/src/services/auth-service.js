/**
 * 认证服务
 * 封装认证相关的业务逻辑
 */

import authApi from '@api/auth.js';
import { localStore, sessionStore } from '@utils/storage.js';
import { STORAGE_CONFIG } from '@config/index.js';
import logger from '@utils/logger.js';
import store from '@utils/store.js';

class AuthService {
  /**
   * 登录
   */
  async login(username, password) {
    try {
      const response = await authApi.login(username, password);
      const { token, user } = response.data || response;

      // 存储 token 和用户信息
      localStore.set(STORAGE_CONFIG.TOKEN_KEY, token);
      localStore.set(STORAGE_CONFIG.USER_KEY, user);

      // 更新状态
      store.setState({ user, isAuthenticated: true });

      logger.info('User logged in', { username });
      return { success: true, user };
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  }

  /**
   * 登出
   */
  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      logger.warn('Logout API call failed', error);
    } finally {
      // 清除本地存储
      localStore.remove(STORAGE_CONFIG.TOKEN_KEY);
      localStore.remove(STORAGE_CONFIG.USER_KEY);

      // 更新状态
      store.setState({ user: null, isAuthenticated: false });

      logger.info('User logged out');
    }
  }

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    const user = localStore.get(STORAGE_CONFIG.USER_KEY);
    if (user) {
      store.setState({ user, isAuthenticated: true });
    }
    return user;
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated() {
    const token = localStore.get(STORAGE_CONFIG.TOKEN_KEY);
    const user = localStore.get(STORAGE_CONFIG.USER_KEY);
    return !!(token && user);
  }

  /**
   * 获取 Token
   */
  getToken() {
    return localStore.get(STORAGE_CONFIG.TOKEN_KEY);
  }

  /**
   * 刷新用户信息
   */
  async refreshUserInfo() {
    try {
      const response = await authApi.getCurrentUser();
      const user = response.data || response;
      localStore.set(STORAGE_CONFIG.USER_KEY, user);
      store.setState({ user });
      return user;
    } catch (error) {
      logger.error('Failed to refresh user info', error);
      throw error;
    }
  }
}

// 导出单例
export default new AuthService();


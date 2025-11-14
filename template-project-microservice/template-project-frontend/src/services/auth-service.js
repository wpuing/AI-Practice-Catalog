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
      console.log('=== AuthService.login Start ===');
      console.log('Username:', username);
      console.log('Password provided:', !!password);
      
      const response = await authApi.login(username, password);
      console.log('=== AuthService.login API Response ===');
      console.log('Response type:', typeof response);
      console.log('Response:', JSON.stringify(response, null, 2));
      console.log('Response.code:', response?.code);
      console.log('Response.message:', response?.message);
      console.log('Response.data:', response?.data);
      
      // 后端返回格式：Result<LoginResponse> = { code, message, data: { token, userId, username } }
      // 检查响应格式
      let loginData;
      
      // 首先检查是否是Result格式
      if (response && typeof response === 'object') {
        if ('data' in response && response.data) {
          // 标准Result格式：{ code, message, data: { token, userId, username } }
          console.log('Detected Result format with data field');
          loginData = response.data;
        } else if ('token' in response) {
          // 直接返回LoginResponse格式：{ token, userId, username }
          console.log('Detected direct LoginResponse format');
          loginData = response;
        } else {
          console.error('Unknown response format:', response);
          throw new Error(response?.message || '登录失败：响应格式错误');
        }
      } else {
        console.error('Invalid response:', response);
        throw new Error('登录失败：响应格式错误');
      }
      
      console.log('=== Extracted Login Data ===');
      console.log('LoginData:', loginData);
      console.log('Token:', loginData?.token);
      console.log('UserId:', loginData?.userId);
      console.log('Username:', loginData?.username);
      
      if (!loginData || !loginData.token) {
        console.error('Missing token in loginData:', loginData);
        throw new Error(response?.message || '登录失败：未获取到Token');
      }

      // 构建用户信息对象
      const user = {
        id: loginData.userId,
        userId: loginData.userId,
        username: loginData.username
      };

      console.log('=== Storing User Data ===');
      console.log('User object:', user);
      console.log('Token:', loginData.token);

      // 存储 token 和用户信息
      localStore.set(STORAGE_CONFIG.TOKEN_KEY, loginData.token);
      localStore.set(STORAGE_CONFIG.USER_KEY, user);

      // 更新状态
      store.setState({ user, isAuthenticated: true });

      console.log('=== Login Success ===');
      logger.info('User logged in', { username, userId: user.userId });
      return { success: true, user };
    } catch (error) {
      console.error('=== AuthService.login Error ===');
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error code:', error?.code);
      console.error('Error data:', error?.data);
      console.error('Error stack:', error?.stack);
      
      logger.error('Login failed', error);
      
      // 提取错误消息
      let errorMessage = '登录失败，请检查用户名和密码';
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.data?.message) {
        errorMessage = error.data.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('Final error message:', errorMessage);
      throw new Error(errorMessage);
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


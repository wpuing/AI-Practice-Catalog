/**
 * 用户服务
 */

import userApi from '@api/user.js';
import logger from '@utils/logger.js';

class UserService {
  /**
   * 获取用户列表
   */
  async getUsers(params = {}) {
    try {
      const response = await userApi.getUsers(params);
      // 处理分页响应
      if (response.data && response.data.list) {
        return {
          list: response.data.list,
          total: response.data.total || 0,
          pageNum: response.data.pageNum || 1,
          pageSize: response.data.pageSize || 10,
          pages: response.data.pages || 0
        };
      }
      // 处理简单列表响应
      return {
        list: response.data || [],
        total: response.data?.length || 0,
        pageNum: 1,
        pageSize: 10,
        pages: 1
      };
    } catch (error) {
      logger.error('Failed to get users', error);
      throw error;
    }
  }

  /**
   * 获取用户详情
   */
  async getUserById(id) {
    try {
      const response = await userApi.getUserById(id);
      return response.data || response;
    } catch (error) {
      logger.error('Failed to get user', error);
      throw error;
    }
  }

  /**
   * 创建用户
   */
  async createUser(data) {
    try {
      const response = await userApi.createUser(data);
      logger.info('User created', { id: response.data?.id });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * 更新用户
   */
  async updateUser(id, data) {
    try {
      const response = await userApi.updateUser(id, data);
      logger.info('User updated', { id });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to update user', error);
      throw error;
    }
  }

  /**
   * 删除用户
   */
  async deleteUser(id) {
    try {
      await userApi.deleteUser(id);
      logger.info('User deleted', { id });
    } catch (error) {
      logger.error('Failed to delete user', error);
      throw error;
    }
  }

  /**
   * 批量删除用户
   */
  async batchDeleteUsers(ids) {
    try {
      await userApi.batchDeleteUsers(ids);
      logger.info('Users batch deleted', { count: ids.length });
    } catch (error) {
      logger.error('Failed to batch delete users', error);
      throw error;
    }
  }
}

export default new UserService();


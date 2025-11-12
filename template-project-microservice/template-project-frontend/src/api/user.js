/**
 * 用户服务 API
 */

import http from '@utils/http.js';

export const userApi = {
  /**
   * 获取用户列表
   */
  getUsers(params = {}) {
    return http.get('/users', params);
  },

  /**
   * 获取用户详情
   */
  getUserById(id) {
    return http.get(`/users/${id}`);
  },

  /**
   * 创建用户
   */
  createUser(data) {
    return http.post('/users', data);
  },

  /**
   * 更新用户
   */
  updateUser(id, data) {
    return http.put(`/users/${id}`, data);
  },

  /**
   * 删除用户
   */
  deleteUser(id) {
    return http.delete(`/users/${id}`);
  },

  /**
   * 批量删除用户
   */
  batchDeleteUsers(ids) {
    return http.post('/users/batch-delete', { ids });
  }
};

export default userApi;


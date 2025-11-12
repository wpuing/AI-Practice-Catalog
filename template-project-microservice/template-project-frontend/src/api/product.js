/**
 * 商品服务 API
 */

import http from '@utils/http.js';

export const productApi = {
  /**
   * 获取商品列表
   */
  getProducts(params = {}) {
    return http.get('/products', params);
  },

  /**
   * 获取商品详情
   */
  getProductById(id) {
    return http.get(`/products/${id}`);
  },

  /**
   * 创建商品
   */
  createProduct(data) {
    return http.post('/products', data);
  },

  /**
   * 更新商品
   */
  updateProduct(id, data) {
    return http.put(`/products/${id}`, data);
  },

  /**
   * 删除商品
   */
  deleteProduct(id) {
    return http.delete(`/products/${id}`);
  },

  /**
   * 获取商品类型列表
   */
  getProductTypes() {
    return http.get('/products/types');
  }
};

export default productApi;


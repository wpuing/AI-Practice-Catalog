/**
 * 商品服务
 */

import productApi from '@api/product.js';
import logger from '@utils/logger.js';

class ProductService {
  /**
   * 获取商品列表
   */
  async getProducts(params = {}) {
    try {
      const response = await productApi.getProducts(params);
      if (response.data && response.data.list) {
        return {
          list: response.data.list,
          total: response.data.total || 0,
          pageNum: response.data.pageNum || 1,
          pageSize: response.data.pageSize || 10,
          pages: response.data.pages || 0
        };
      }
      return {
        list: response.data || [],
        total: response.data?.length || 0,
        pageNum: 1,
        pageSize: 10,
        pages: 1
      };
    } catch (error) {
      logger.error('Failed to get products', error);
      throw error;
    }
  }

  /**
   * 获取商品详情
   */
  async getProductById(id) {
    try {
      const response = await productApi.getProductById(id);
      return response.data || response;
    } catch (error) {
      logger.error('Failed to get product', error);
      throw error;
    }
  }

  /**
   * 创建商品
   */
  async createProduct(data) {
    try {
      const response = await productApi.createProduct(data);
      logger.info('Product created', { id: response.data?.id });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to create product', error);
      throw error;
    }
  }

  /**
   * 更新商品
   */
  async updateProduct(id, data) {
    try {
      const response = await productApi.updateProduct(id, data);
      logger.info('Product updated', { id });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to update product', error);
      throw error;
    }
  }

  /**
   * 删除商品
   */
  async deleteProduct(id) {
    try {
      await productApi.deleteProduct(id);
      logger.info('Product deleted', { id });
    } catch (error) {
      logger.error('Failed to delete product', error);
      throw error;
    }
  }

  /**
   * 获取商品类型列表
   */
  async getProductTypes() {
    try {
      const response = await productApi.getProductTypes();
      return response.data || [];
    } catch (error) {
      logger.error('Failed to get product types', error);
      return [];
    }
  }
}

export default new ProductService();


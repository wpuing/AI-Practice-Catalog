/**
 * 本地存储工具类
 * 封装 localStorage 和 sessionStorage，提供统一的存储接口
 */

import logger from './logger.js';

class Storage {
  constructor(storageType = 'localStorage') {
    this.storage = storageType === 'localStorage' ? localStorage : sessionStorage;
    this.type = storageType;
  }

  /**
   * 设置存储项
   */
  set(key, value) {
    try {
      const serializedValue = JSON.stringify(value);
      this.storage.setItem(key, serializedValue);
      logger.debug(`Storage set: ${key}`, { type: this.type });
      return true;
    } catch (error) {
      logger.error(`Failed to set storage: ${key}`, error);
      return false;
    }
  }

  /**
   * 获取存储项
   */
  get(key, defaultValue = null) {
    try {
      const item = this.storage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      logger.error(`Failed to get storage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 移除存储项
   */
  remove(key) {
    try {
      this.storage.removeItem(key);
      logger.debug(`Storage removed: ${key}`, { type: this.type });
      return true;
    } catch (error) {
      logger.error(`Failed to remove storage: ${key}`, error);
      return false;
    }
  }

  /**
   * 清空所有存储项
   */
  clear() {
    try {
      this.storage.clear();
      logger.debug('Storage cleared', { type: this.type });
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return false;
    }
  }

  /**
   * 检查存储项是否存在
   */
  has(key) {
    return this.storage.getItem(key) !== null;
  }

  /**
   * 获取所有键
   */
  keys() {
    const keys = [];
    for (let i = 0; i < this.storage.length; i++) {
      keys.push(this.storage.key(i));
    }
    return keys;
  }

  /**
   * 获取存储大小（字节）
   */
  getSize() {
    let size = 0;
    for (const key in this.storage) {
      if (this.storage.hasOwnProperty(key)) {
        size += this.storage[key].length + key.length;
      }
    }
    return size;
  }
}

// 导出 localStorage 和 sessionStorage 实例
export const localStore = new Storage('localStorage');
export const sessionStore = new Storage('sessionStorage');

export default Storage;


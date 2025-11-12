/**
 * HTTP 请求工具类
 * 封装 fetch API，提供统一的请求接口
 */

import { API_CONFIG, STORAGE_CONFIG } from '@config/index.js';
import logger from './logger.js';
import { localStore } from './storage.js';

class Http {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.retryCount = API_CONFIG.RETRY_COUNT;
    this.retryDelay = API_CONFIG.RETRY_DELAY;
  }

  /**
   * 获取请求头
   */
  getHeaders(customHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...customHeaders
    };

    // 添加认证 token
    const token = localStore.get(STORAGE_CONFIG.TOKEN_KEY);
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * 处理响应
   */
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error = new Error(data.message || `HTTP error! status: ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * 请求超时处理
   */
  timeoutPromise(promise, timeout) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  /**
   * 重试请求
   */
  async retryRequest(requestFn, retries = this.retryCount) {
    try {
      return await requestFn();
    } catch (error) {
      if (retries > 0 && this.shouldRetry(error)) {
        logger.warn(`Request failed, retrying... (${retries} retries left)`, error);
        await this.delay(this.retryDelay);
        return this.retryRequest(requestFn, retries - 1);
      }
      throw error;
    }
  }

  /**
   * 判断是否应该重试
   */
  shouldRetry(error) {
    // 网络错误或5xx错误可以重试
    return (
      !error.status ||
      (error.status >= 500 && error.status < 600) ||
      error.message === 'Request timeout'
    );
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 通用请求方法
   */
  async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retry = true,
      ...restOptions
    } = options;

    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const requestHeaders = this.getHeaders(headers);

    const requestOptions = {
      method,
      headers: requestHeaders,
      ...restOptions
    };

    if (body && method !== 'GET' && method !== 'HEAD') {
      if (body instanceof FormData) {
        delete requestOptions.headers['Content-Type'];
        requestOptions.body = body;
      } else {
        requestOptions.body = JSON.stringify(body);
      }
    }

    logger.debug(`HTTP ${method} ${fullUrl}`, { options: requestOptions });

    const requestFn = () => {
      const promise = fetch(fullUrl, requestOptions);
      return timeout > 0
        ? this.timeoutPromise(promise, timeout)
        : promise.then(response => this.handleResponse(response));
    };

    try {
      const response = retry
        ? await this.retryRequest(requestFn)
        : await requestFn();
      return response;
    } catch (error) {
      logger.error(`HTTP ${method} ${fullUrl} failed`, error);

      // 处理认证错误
      if (error.status === 401) {
        localStore.remove(STORAGE_CONFIG.TOKEN_KEY);
        localStore.remove(STORAGE_CONFIG.USER_KEY);
        window.dispatchEvent(new CustomEvent('auth:logout'));
      }

      throw error;
    }
  }

  /**
   * GET 请求
   */
  get(url, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return this.request(fullUrl, { ...options, method: 'GET' });
  }

  /**
   * POST 请求
   */
  post(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'POST', body: data });
  }

  /**
   * PUT 请求
   */
  put(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body: data });
  }

  /**
   * PATCH 请求
   */
  patch(url, data = {}, options = {}) {
    return this.request(url, { ...options, method: 'PATCH', body: data });
  }

  /**
   * DELETE 请求
   */
  delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * 上传文件
   */
  upload(url, file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(url, {
      ...options,
      method: 'POST',
      body: formData,
      headers: {}
    });
  }

  /**
   * 下载文件
   */
  async download(url, filename, options = {}) {
    const response = await this.request(url, {
      ...options,
      method: 'GET',
      responseType: 'blob'
    });

    const blob = response instanceof Blob ? response : new Blob([response]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 导出单例
export default new Http();


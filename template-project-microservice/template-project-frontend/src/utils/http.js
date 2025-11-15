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
  async handleResponse(response, requestUrl = null) {
    const contentType = response.headers.get('content-type');
    let data;

    // 处理401错误，避免浏览器弹出基本认证框
    if (response.status === 401) {
      try {
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          try {
            data = JSON.parse(text);
          } catch {
            data = { message: text || '未授权，请重新登录' };
          }
        }
      } catch (e) {
        data = { message: '未授权，请重新登录' };
      }
      
      const error = new Error(data?.message || '未授权，请重新登录');
      error.status = 401;
      error.code = data?.code;
      error.data = data;
      throw error;
    }

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // 404错误 - 服务未找到
      if (response.status === 404) {
        const reqUrl = requestUrl || this._lastRequestUrl || 'unknown';
        console.error('404 Not Found - 可能的原因：');
        console.error('1. Gateway服务未启动（检查端口8888）');
        console.error('2. 后端服务未启动（user-service, product-service, report-service, dfs-service）');
        console.error('3. Gateway路由配置不正确');
        console.error('4. 后端Controller未实现');
        console.error('Request URL:', reqUrl);
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      }
      
      // 403错误可能是CORS或认证问题
      if (response.status === 403) {
        console.error('403 Forbidden - 可能的原因：');
        console.error('1. Gateway CORS配置问题');
        console.error('2. 认证拦截器拦截了请求');
        console.error('3. 路由配置问题');
        console.error('Response status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        console.error('Response data:', data);
        console.error('Response data type:', typeof data);
        console.error('Response data string:', typeof data === 'string' ? data : JSON.stringify(data));
      }
      
      // 后端返回格式：Result = { code, message, data }
      let errorMessage = data?.message || `HTTP error! status: ${response.status}`;
      
      // 如果响应体是空的，尝试从响应头获取信息
      if (response.status === 404) {
        errorMessage = '后端服务未找到，请检查：1) Gateway服务是否启动(端口8888) 2) 后端服务是否启动 3) Gateway路由配置是否正确';
      } else if (response.status === 403 && (!data || (typeof data === 'string' && data.trim() === ''))) {
        const contentType = response.headers.get('content-type');
        const wwwAuthenticate = response.headers.get('www-authenticate');
        console.error('Empty response body for 403');
        console.error('Content-Type:', contentType);
        console.error('WWW-Authenticate:', wwwAuthenticate);
        errorMessage = '访问被拒绝，请检查Gateway配置和CORS设置';
      } else if (response.status === 403) {
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string' && data.trim()) {
          errorMessage = data;
        } else {
          errorMessage = '访问被拒绝，请检查Gateway配置和CORS设置';
        }
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.code = data?.code;
      error.data = data;
      throw error;
    }

    // 后端统一返回 Result 格式：{ code, message, data }
    // 检查是否是Result格式
    if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
      // 标准Result格式，检查code是否为成功
      if (data.code === 200 || data.code === 0) {
        return data; // 返回整个Result对象，调用方从data.data获取实际数据
      } else {
        // code不是成功状态，抛出错误
        const error = new Error(data.message || '请求失败');
        error.status = response.status;
        error.code = data.code;
        error.data = data;
        throw error;
      }
    }

    // 如果不是Result格式，直接返回
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
      // 设置 credentials，确保携带 cookie 和 Authorization header
      credentials: 'include',
      // 不触发浏览器基本认证弹窗
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
      const promise = fetch(fullUrl, requestOptions)
        .then(response => {
          // 如果返回401，先读取响应体，避免浏览器弹出基本认证框
          if (response.status === 401) {
            return response.text().then(text => {
              // 创建一个新的Response对象，保持原始状态
              const clonedResponse = new Response(text, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
              });
              // 添加json方法以支持后续处理
              clonedResponse.json = () => Promise.resolve(JSON.parse(text || '{}'));
              return clonedResponse;
            });
          }
          return response;
        })
        .then(response => this.handleResponse(response, fullUrl));
      return timeout > 0
        ? this.timeoutPromise(promise, timeout)
        : promise;
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
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const requestHeaders = this.getHeaders(options.headers || {});
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: requestHeaders,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
}

// 导出单例
export default new Http();


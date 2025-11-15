/**
 * 文件服务 API
 */

import http from '@utils/http.js';

export const fileApi = {
  /**
   * 上传文件
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);
    
    // 使用 XMLHttpRequest 支持上传进度
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const token = localStorage.getItem('auth_token');
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const percentCompleted = Math.round((e.loaded * 100) / e.total);
          onProgress(percentCompleted);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });
      
      xhr.open('POST', `${http.baseURL}/dfs/upload`);
      xhr.withCredentials = true; // 确保携带凭证
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }
      // 获取用户ID
      try {
        const userInfo = localStorage.getItem('user_info');
        if (userInfo) {
          const user = JSON.parse(userInfo);
          if (user.userId) {
            xhr.setRequestHeader('X-User-Id', user.userId);
          }
        }
      } catch (e) {
        // 忽略错误
      }
      // 不设置 Content-Type，让浏览器自动设置（包含 boundary）
      xhr.send(formData);
    });
  },

  /**
   * 获取文件列表
   */
  getFiles(params = {}) {
    return http.get('/dfs', params);
  },

  /**
   * 获取文件详情
   */
  getFileById(id) {
    return http.get(`/dfs/${id}`);
  },

  /**
   * 删除文件
   */
  deleteFile(id) {
    return http.delete(`/dfs/${id}`);
  },

  /**
   * 下载文件
   */
  downloadFile(id, filename) {
    return http.download(`/dfs/${id}/download`, filename);
  },

  /**
   * 获取文件预览 URL
   */
  getPreviewUrl(id) {
    return `${http.baseURL}/dfs/${id}/preview`;
  }
};

export default fileApi;


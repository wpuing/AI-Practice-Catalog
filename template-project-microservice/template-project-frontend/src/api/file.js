/**
 * 文件服务 API
 */

import http from '@utils/http.js';

export const fileApi = {
  /**
   * 上传文件
   */
  uploadFile(file, onProgress) {
    return http.upload('/files/upload', file, {
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.lengthComputable) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      }
    });
  },

  /**
   * 获取文件列表
   */
  getFiles(params = {}) {
    return http.get('/files', params);
  },

  /**
   * 获取文件详情
   */
  getFileById(id) {
    return http.get(`/files/${id}`);
  },

  /**
   * 删除文件
   */
  deleteFile(id) {
    return http.delete(`/files/${id}`);
  },

  /**
   * 下载文件
   */
  downloadFile(id, filename) {
    return http.download(`/files/${id}/download`, filename);
  },

  /**
   * 获取文件预览 URL
   */
  getPreviewUrl(id) {
    return `${http.baseURL}/files/${id}/preview`;
  }
};

export default fileApi;


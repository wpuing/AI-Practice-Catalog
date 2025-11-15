/**
 * 文件服务
 */

import fileApi from '@api/file.js';
import logger from '@utils/logger.js';

class FileService {
  /**
   * 上传文件
   */
  async uploadFile(file, onProgress) {
    try {
      const response = await fileApi.uploadFile(file, onProgress);
      logger.info('File uploaded', { filename: file.name });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to upload file', error);
      throw error;
    }
  }

  /**
   * 获取文件列表
   */
  async getFiles(params = {}) {
    try {
      const response = await fileApi.getFiles(params);
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
      logger.error('Failed to get files', error);
      throw error;
    }
  }

  /**
   * 获取文件详情
   */
  async getFileById(id) {
    try {
      const response = await fileApi.getFileById(id);
      return response.data || response;
    } catch (error) {
      logger.error('Failed to get file', error);
      throw error;
    }
  }

  /**
   * 删除文件
   */
  async deleteFile(id) {
    try {
      await fileApi.deleteFile(id);
      logger.info('File deleted', { id });
    } catch (error) {
      logger.error('Failed to delete file', error);
      throw error;
    }
  }

  /**
   * 下载文件
   */
  async downloadFile(id, filename) {
    try {
      await fileApi.downloadFile(id, filename);
      logger.info('File downloaded', { id, filename });
    } catch (error) {
      logger.error('Failed to download file', error);
      throw error;
    }
  }

  /**
   * 获取文件预览 URL
   */
  getPreviewUrl(id) {
    return fileApi.getPreviewUrl(id);
  }
}

export default new FileService();


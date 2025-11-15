/**
 * 报表服务
 */

import reportApi from '@api/report.js';
import logger from '@utils/logger.js';

class ReportService {
  /**
   * 获取报表列表
   */
  async getReports(params = {}) {
    try {
      const response = await reportApi.getReports(params);
      console.log('ReportService.getReports - response:', response);
      
      // 后端返回格式：Result<PageResult<ReportDTO>>
      // response = { code, message, data: { list, total, pageNum, pageSize, pages } }
      if (response && response.data) {
        const pageData = response.data;
        console.log('ReportService.getReports - pageData:', pageData);
        
        // 检查是否有 list 字段
        if (pageData.list && Array.isArray(pageData.list)) {
          return {
            list: pageData.list,
            total: pageData.total || 0,
            pageNum: pageData.pageNum || 1,
            pageSize: pageData.pageSize || 10,
            pages: pageData.pages || 0
          };
        }
        
        // 如果没有 list 字段，可能是 records（MyBatis-Plus 默认字段名）
        if (pageData.records && Array.isArray(pageData.records)) {
          return {
            list: pageData.records,
            total: pageData.total || 0,
            pageNum: pageData.pageNum || 1,
            pageSize: pageData.pageSize || 10,
            pages: pageData.pages || 0
          };
        }
        
        // 如果 data 本身就是数组
        if (Array.isArray(pageData)) {
          return {
            list: pageData,
            total: pageData.length,
            pageNum: 1,
            pageSize: 10,
            pages: 1
          };
        }
      }
      
      // 如果 response 本身就是数组
      if (Array.isArray(response)) {
        return {
          list: response,
          total: response.length,
          pageNum: 1,
          pageSize: 10,
          pages: 1
        };
      }
      
      console.warn('ReportService.getReports - Unexpected response format:', response);
      return {
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        pages: 0
      };
    } catch (error) {
      logger.error('Failed to get reports', error);
      throw error;
    }
  }

  /**
   * 获取报表详情
   */
  async getReportById(id) {
    try {
      const response = await reportApi.getReportById(id);
      return response.data || response;
    } catch (error) {
      logger.error('Failed to get report', error);
      throw error;
    }
  }

  /**
   * 创建报表
   */
  async createReport(data) {
    try {
      const response = await reportApi.createReport(data);
      logger.info('Report created', { id: response.data?.id });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to create report', error);
      throw error;
    }
  }

  /**
   * 生成报表
   */
  async generateReport(templateId, params = {}) {
    try {
      const response = await reportApi.generateReport(templateId, params);
      logger.info('Report generated', { templateId });
      return response.data || response;
    } catch (error) {
      logger.error('Failed to generate report', error);
      throw error;
    }
  }

  /**
   * 获取报表模板列表
   */
  async getTemplates() {
    try {
      const response = await reportApi.getTemplates();
      return response.data || [];
    } catch (error) {
      logger.error('Failed to get templates', error);
      return [];
    }
  }

  /**
   * 导出报表
   */
  async exportReport(id, format = 'excel') {
    try {
      await reportApi.exportReport(id, format);
      logger.info('Report exported', { id, format });
    } catch (error) {
      logger.error('Failed to export report', error);
      throw error;
    }
  }

  /**
   * 删除报表
   */
  async deleteReport(id) {
    try {
      await reportApi.deleteReport(id);
      logger.info('Report deleted', { id });
    } catch (error) {
      logger.error('Failed to delete report', error);
      throw error;
    }
  }
}

export default new ReportService();


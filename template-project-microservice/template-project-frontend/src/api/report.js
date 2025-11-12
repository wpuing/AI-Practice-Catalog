/**
 * 报表服务 API
 */

import http from '@utils/http.js';

export const reportApi = {
  /**
   * 获取报表列表
   */
  getReports(params = {}) {
    return http.get('/reports', params);
  },

  /**
   * 获取报表详情
   */
  getReportById(id) {
    return http.get(`/reports/${id}`);
  },

  /**
   * 创建报表
   */
  createReport(data) {
    return http.post('/reports', data);
  },

  /**
   * 生成报表
   */
  generateReport(templateId, params = {}) {
    return http.post(`/reports/generate/${templateId}`, params);
  },

  /**
   * 获取报表模板列表
   */
  getTemplates() {
    return http.get('/reports/templates');
  },

  /**
   * 导出报表
   */
  exportReport(id, format = 'excel') {
    return http.get(`/reports/${id}/export`, { format });
  }
};

export default reportApi;


/**
 * 仪表盘页面
 */

import store from '@utils/store.js';
import { formatNumber, formatDate } from '@utils/format.js';
import { createMainLayout } from '@layouts/MainLayout.js';
import userService from '@services/user-service.js';
import productService from '@services/product-service.js';
import reportService from '@services/report-service.js';
import fileService from '@services/file-service.js';
import logger from '@utils/logger.js';

let stats = {
  userCount: 0,
  productCount: 0,
  reportCount: 0,
  fileCount: 0
};

export default async function DashboardPage() {
  const state = store.getState();
  const user = state.user || {};

  const html = `
    <div class="dashboard-page">
      <div class="page-header">
        <h1>仪表盘</h1>
        <p>欢迎回来，${user.username || '用户'}</p>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>用户总数</h3>
            <p class="stat-value" id="userCount">-</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>商品总数</h3>
            <p class="stat-value" id="productCount">-</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>报表总数</h3>
            <p class="stat-value" id="reportCount">-</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📁</div>
          <div class="stat-content">
            <h3>文件总数</h3>
            <p class="stat-value" id="fileCount">-</p>
          </div>
        </div>
      </div>
      
      <div class="dashboard-content">
        <div class="content-card">
          <h2>最近活动</h2>
          <p>暂无活动记录</p>
        </div>
      </div>
    </div>
  `;

  return {
    html: createMainLayout(html),
    init: loadDashboardStats
  };
}

async function loadDashboardStats() {
  try {
    // 并行加载所有统计数据
    const [userResult, productResult, reportResult, fileResult] = await Promise.allSettled([
      userService.getUsers({ pageNum: 1, pageSize: 1 }),
      productService.getProducts({ pageNum: 1, pageSize: 1 }),
      reportService.getReports({ pageNum: 1, pageSize: 1 }),
      fileService.getFiles({ pageNum: 1, pageSize: 1 })
    ]);

    // 更新统计数据
    if (userResult.status === 'fulfilled') {
      stats.userCount = userResult.value.total || 0;
      updateStatValue('userCount', stats.userCount);
    } else {
      logger.warn('Failed to load user count', userResult.reason);
      updateStatValue('userCount', '-');
    }

    if (productResult.status === 'fulfilled') {
      stats.productCount = productResult.value.total || 0;
      updateStatValue('productCount', stats.productCount);
    } else {
      logger.warn('Failed to load product count', productResult.reason);
      updateStatValue('productCount', '-');
    }

    if (reportResult.status === 'fulfilled') {
      stats.reportCount = reportResult.value.total || 0;
      updateStatValue('reportCount', stats.reportCount);
    } else {
      logger.warn('Failed to load report count', reportResult.reason);
      updateStatValue('reportCount', '-');
    }

    if (fileResult.status === 'fulfilled') {
      stats.fileCount = fileResult.value.total || 0;
      updateStatValue('fileCount', stats.fileCount);
    } else {
      logger.warn('Failed to load file count', fileResult.reason);
      updateStatValue('fileCount', '-');
    }
  } catch (error) {
    logger.error('Failed to load dashboard stats', error);
  }
}

function updateStatValue(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = typeof value === 'number' ? formatNumber(value) : value;
  }
}


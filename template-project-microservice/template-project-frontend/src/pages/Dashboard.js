/**
 * 仪表盘页面
 */

import store from '@utils/store.js';
import { formatNumber, formatDate } from '@utils/format.js';

export default async function DashboardPage() {
  const state = store.getState();
  const user = state.user || {};

  return `
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
            <p class="stat-value">0</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>商品总数</h3>
            <p class="stat-value">0</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>报表总数</h3>
            <p class="stat-value">0</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">📁</div>
          <div class="stat-content">
            <h3>文件总数</h3>
            <p class="stat-value">0</p>
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
}


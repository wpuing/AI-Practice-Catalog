/**
 * 主布局组件
 */

import authService from '@services/auth-service.js';
import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';
import store from '@utils/store.js';

export function createMainLayout(content) {
  const state = store.getState();
  const user = state.user || {};

  return `
    <div class="main-layout">
      <header class="main-header">
        <div class="header-content">
          <div class="header-logo">
            <h1>Template Project</h1>
          </div>
          <nav class="header-nav">
            <a href="${ROUTE_CONFIG.DASHBOARD}" data-router class="nav-link">仪表盘</a>
            <a href="${ROUTE_CONFIG.USER_MANAGEMENT}" data-router class="nav-link">用户管理</a>
            <a href="${ROUTE_CONFIG.PRODUCT_MANAGEMENT}" data-router class="nav-link">商品管理</a>
            <a href="${ROUTE_CONFIG.REPORT_MANAGEMENT}" data-router class="nav-link">报表管理</a>
            <a href="${ROUTE_CONFIG.FILE_MANAGEMENT}" data-router class="nav-link">文件管理</a>
          </nav>
          <div class="header-user">
            <span class="user-name">${user.username || '用户'}</span>
            <button id="logoutBtn" class="btn btn-text">退出</button>
          </div>
        </div>
      </header>
      
      <main class="main-content">
        ${content}
      </main>
      
      <footer class="main-footer">
        <p>&copy; 2024 Template Project. All rights reserved.</p>
      </footer>
    </div>
  `;
}

export function initMainLayout() {
  // 处理登出
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'logoutBtn') {
      await authService.logout();
      router.push(ROUTE_CONFIG.LOGIN);
    }
  });

  // 监听认证状态变化
  store.subscribe((state) => {
    if (!state.isAuthenticated) {
      router.push(ROUTE_CONFIG.LOGIN);
    }
  });
}

export default { createMainLayout, initMainLayout };


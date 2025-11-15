/**
 * 主布局组件
 */

import authService from '@services/auth-service.js';
import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';
import store from '@utils/store.js';

export function createMainLayout(content) {
  // 安全获取用户信息，避免认证问题
  let user = {};
  try {
    const state = store.getState();
    user = state.user || {};
  } catch (error) {
    // 忽略错误，使用默认值
  }

  return `
    <div class="main-layout">
      <header class="main-header">
        <div class="header-content">
          <div class="header-logo">
            <h1>Template Project</h1>
          </div>
          <nav class="header-nav">
            <a href="${ROUTE_CONFIG.HOME}" data-router class="nav-link">首页</a>
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
        <p class="page-copyright">
          © 2025 版权所有 | 作者：<span class="author-name">靓仔</span>
          <span class="footer-email"> | 邮箱：<a href="mailto:weiyzhong@126.com" class="email-link">weiyzhong@126.com</a></span>
        </p>
      </footer>
    </div>
  `;
}

export function initMainLayout() {
  // 处理登出
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'logoutBtn') {
      try {
        await authService.logout();
      } catch (error) {
        // 即使登出失败，也清除本地状态
        console.warn('Logout failed', error);
      }
      router.push(ROUTE_CONFIG.LOGIN);
    }
  });

  // 监听认证状态变化（仅在非首页时跳转）
  store.subscribe((state) => {
    const currentPath = window.location.pathname;
    // 首页和登录页不需要认证，不进行跳转
    if (!state.isAuthenticated && currentPath !== ROUTE_CONFIG.HOME && currentPath !== ROUTE_CONFIG.LOGIN) {
      router.push(ROUTE_CONFIG.LOGIN);
    }
  });
}

export default { createMainLayout, initMainLayout };


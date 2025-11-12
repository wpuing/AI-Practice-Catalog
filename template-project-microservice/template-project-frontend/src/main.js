/**
 * 应用主入口
 */

import './styles/main.css';
import router from '@utils/router.js';
import store from '@utils/store.js';
import errorHandler from '@utils/error-handler.js';
import logger from '@utils/logger.js';
import authService from '@services/auth-service.js';
import { ROUTE_CONFIG } from '@config/index.js';
import { createMainLayout, initMainLayout } from '@layouts/MainLayout.js';

// 导入页面组件
import LoginPage from '@pages/Login.js';
import DashboardPage from '@pages/Dashboard.js';
import NotFoundPage from '@pages/NotFound.js';

// 初始化错误处理
errorHandler.init();

// 初始化日志
logger.info('Application starting...');

// 初始化状态管理
store.setState({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated()
});

// 注册路由
router.addRoute(ROUTE_CONFIG.LOGIN, LoginPage, { requiresAuth: false });
router.addRoute(ROUTE_CONFIG.DASHBOARD, async () => {
  const html = await DashboardPage();
  return createMainLayout(html);
}, { requiresAuth: true });
router.addRoute(ROUTE_CONFIG.NOT_FOUND, NotFoundPage);

// 路由守卫：检查认证状态
router.beforeEach(async (to, from) => {
  const isAuthenticated = authService.isAuthenticated();
  const requiresAuth = to.meta?.requiresAuth !== false;

  if (requiresAuth && !isAuthenticated) {
    logger.warn('Unauthorized access attempt', { path: to.path });
    router.replace(ROUTE_CONFIG.LOGIN);
    return false;
  }

  if (to.path === ROUTE_CONFIG.LOGIN && isAuthenticated) {
    router.replace(ROUTE_CONFIG.DASHBOARD);
    return false;
  }

  return true;
});

// 路由后置守卫：更新导航状态
router.afterEach((to) => {
  // 更新导航链接的 active 状态
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === to.path) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
});

// 监听认证登出事件
window.addEventListener('auth:logout', () => {
  router.push(ROUTE_CONFIG.LOGIN);
});

// 初始化主布局
initMainLayout();

// 应用启动完成
logger.info('Application started successfully');

// 导出供调试使用
window.__APP__ = {
  router,
  store,
  authService,
  logger
};


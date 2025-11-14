/**
 * 应用主入口
 */

import './styles/main.css';
import './styles/login/index.css';
import router from '@utils/router.js';
import store from '@utils/store.js';
import errorHandler from '@utils/error-handler.js';
import logger from '@utils/logger.js';
import authService from '@services/auth-service.js';
import { ROUTE_CONFIG } from '@config/index.js';
import { createMainLayout, initMainLayout } from '@layouts/MainLayout.js';

// 导入页面组件
import LoginPage from '@pages/Login.js';
import HomePage from '@pages/Home.js';
import DashboardPage from '@pages/Dashboard.js';
import NotFoundPage from '@pages/NotFound.js';

// 初始化错误处理
errorHandler.init();

// 初始化日志
logger.info('Application starting...');

// 初始化状态管理（安全初始化，避免认证检查导致的问题）
try {
  const user = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  store.setState({
    user: user || null,
    isAuthenticated: isAuthenticated || false
  });
} catch (error) {
  logger.warn('Failed to initialize auth state', error);
  store.setState({
    user: null,
    isAuthenticated: false
  });
}

// 注册路由
router.addRoute(ROUTE_CONFIG.LOGIN, LoginPage, { requiresAuth: false });
router.addRoute(ROUTE_CONFIG.HOME, async () => {
  const html = await HomePage();
  return createMainLayout(html);
}, { requiresAuth: false });
router.addRoute(ROUTE_CONFIG.DASHBOARD, async () => {
  const html = await DashboardPage();
  return createMainLayout(html);
}, { requiresAuth: true });
router.addRoute(ROUTE_CONFIG.NOT_FOUND, NotFoundPage);

// 路由守卫：检查认证状态
router.beforeEach(async (to, from) => {
  const isAuthenticated = authService.isAuthenticated();
  
  // 如果已登录，访问登录页则跳转到仪表盘
  if (to.path === ROUTE_CONFIG.LOGIN && isAuthenticated) {
    router.replace(ROUTE_CONFIG.DASHBOARD);
    return false;
  }

  // 如果未登录，访问需要认证的页面则跳转到登录页
  const requiresAuth = to.meta?.requiresAuth !== false;
  if (requiresAuth && !isAuthenticated) {
    logger.warn('Unauthorized access attempt', { path: to.path });
    router.replace(ROUTE_CONFIG.LOGIN);
    return false;
  }

  // 如果访问首页且未登录，跳转到登录页
  if (to.path === ROUTE_CONFIG.HOME && !isAuthenticated) {
    router.replace(ROUTE_CONFIG.LOGIN);
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

// 启动路由（在所有路由注册完成后）
router.start();

// 如果当前路径是首页且未登录，跳转到登录页
if (window.location.pathname === ROUTE_CONFIG.HOME && !authService.isAuthenticated()) {
  router.replace(ROUTE_CONFIG.LOGIN);
}

// 应用启动完成
logger.info('Application started successfully');

// 导出供调试使用
window.__APP__ = {
  router,
  store,
  authService,
  logger
};


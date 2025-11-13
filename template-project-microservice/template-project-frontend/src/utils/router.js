/**
 * 路由管理器
 * 基于原生 JavaScript 的 SPA 路由实现
 */

import logger from './logger.js';

class Router {
  constructor() {
    this.routes = [];
    this.currentRoute = null;
    this.beforeEachHooks = [];
    this.afterEachHooks = [];
    this.initialized = false;
    this.init();
  }

  /**
   * 初始化路由
   */
  init() {
    // 监听浏览器前进后退
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // 拦截链接点击
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-router]');
      if (link) {
        e.preventDefault();
        const href = link.getAttribute('href');
        if (href) {
          this.push(href);
        }
      }
    });

    this.initialized = true;
  }

  /**
   * 启动路由（在所有路由注册完成后调用）
   */
  start() {
    if (this.initialized) {
      this.handleRouteChange();
    }
  }

  /**
   * 注册路由
   */
  addRoute(path, component, meta = {}) {
    const route = {
      path,
      component,
      meta,
      regex: this.pathToRegex(path)
    };
    this.routes.push(route);
    logger.debug('Route added', { path, meta });
  }

  /**
   * 将路径转换为正则表达式
   */
  pathToRegex(path) {
    const keys = [];
    // 特殊处理根路径
    if (path === '/') {
      return {
        regex: /^\/$/,
        keys
      };
    }
    
    // 转义特殊字符，但保留 / 用于路径匹配
    let pattern = path
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // 转义特殊字符
      .replace(/\//g, '\\/') // 转义斜杠
      .replace(/:(\w+)/g, (_, key) => {
        keys.push(key);
        return '([^/]+)';
      })
      .replace(/\*/g, '.*');

    return {
      regex: new RegExp(`^${pattern}$`),
      keys
    };
  }

  /**
   * 匹配路由
   */
  matchRoute(path) {
    for (const route of this.routes) {
      const match = path.match(route.regex.regex);
      if (match) {
        const params = {};
        route.regex.keys.forEach((key, index) => {
          params[key] = match[index + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  /**
   * 处理路由变化
   */
  async handleRouteChange() {
    const path = window.location.pathname;
    logger.debug('Handling route change', { path, routes: this.routes.map(r => r.path) });
    const match = this.matchRoute(path);

    if (!match) {
      logger.warn('Route not found', { path, availableRoutes: this.routes.map(r => r.path) });
      this.renderNotFound();
      return;
    }

    const { route, params } = match;

    // 执行前置守卫
    for (const hook of this.beforeEachHooks) {
      const result = await hook(route, this.currentRoute);
      if (result === false) {
        return;
      }
    }

    // 更新当前路由
    const previousRoute = this.currentRoute;
    this.currentRoute = { ...route, params, path };

    // 渲染组件
    await this.renderComponent(route.component, params);

    // 执行后置守卫
    for (const hook of this.afterEachHooks) {
      await hook(route, previousRoute);
    }

    logger.debug('Route changed', { path, route: route.path });
  }

  /**
   * 渲染组件
   */
  async renderComponent(component, params) {
    const container = document.getElementById('app');
    if (!container) {
      logger.error('App container not found');
      return;
    }

    try {
      if (typeof component === 'function') {
        const html = await component(params);
        container.innerHTML = html;
      } else if (typeof component === 'string') {
        container.innerHTML = component;
      } else {
        logger.error('Invalid component type', { component });
      }
    } catch (error) {
      logger.error('Failed to render component', error);
      container.innerHTML = '<div class="error">组件渲染失败</div>';
    }
  }

  /**
   * 渲染404页面
   */
  renderNotFound() {
    const container = document.getElementById('app');
    if (container) {
      container.innerHTML = '<div class="not-found"><h1>404</h1><p>页面未找到</p></div>';
    }
  }

  /**
   * 导航到指定路径
   */
  push(path) {
    window.history.pushState({}, '', path);
    this.handleRouteChange();
  }

  /**
   * 替换当前路径
   */
  replace(path) {
    window.history.replaceState({}, '', path);
    this.handleRouteChange();
  }

  /**
   * 返回上一页
   */
  back() {
    window.history.back();
  }

  /**
   * 前进一页
   */
  forward() {
    window.history.forward();
  }

  /**
   * 添加前置守卫
   */
  beforeEach(hook) {
    this.beforeEachHooks.push(hook);
  }

  /**
   * 添加后置守卫
   */
  afterEach(hook) {
    this.afterEachHooks.push(hook);
  }

  /**
   * 获取当前路由
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   * 获取查询参数
   */
  getQuery() {
    const params = new URLSearchParams(window.location.search);
    const query = {};
    for (const [key, value] of params.entries()) {
      query[key] = value;
    }
    return query;
  }
}

// 导出单例
export default new Router();


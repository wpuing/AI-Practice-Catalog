/**
 * 错误处理器
 * 统一处理应用中的错误
 */

import logger from './logger.js';

class ErrorHandler {
  constructor() {
    this.init();
  }

  /**
   * 初始化错误处理
   */
  init() {
    // 捕获未处理的 Promise 错误
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
    });

    // 捕获全局错误
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event.message, 'Global Error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * 处理错误
   */
  handleError(error, type = 'Error', context = {}) {
    const errorInfo = {
      type,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    logger.error(`[${type}] ${errorInfo.message}`, errorInfo);

    // 可以在这里添加错误上报逻辑
    // this.reportError(errorInfo);

    // 显示用户友好的错误提示
    this.showUserFriendlyError(errorInfo);
  }

  /**
   * 显示用户友好的错误提示
   */
  showUserFriendlyError(errorInfo) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-toast';
    errorDiv.innerHTML = `
      <div class="error-toast-content">
        <span class="error-toast-icon">⚠️</span>
        <span class="error-toast-message">操作失败，请稍后重试</span>
        <button class="error-toast-close">×</button>
      </div>
    `;

    // 添加样式
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 16px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
    `;

    // 添加关闭按钮事件
    const closeBtn = errorDiv.querySelector('.error-toast-close');
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      margin-left: 12px;
    `;
    closeBtn.onclick = () => errorDiv.remove();

    // 添加到页面
    document.body.appendChild(errorDiv);

    // 3秒后自动移除
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.remove();
      }
    }, 3000);
  }

  /**
   * 错误上报（可以集成 Sentry 等错误监控服务）
   */
  reportError(errorInfo) {
    // TODO: 实现错误上报逻辑
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorInfo)
    // });
  }

  /**
   * 创建错误边界
   */
  createErrorBoundary(component, fallback) {
    return async (...args) => {
      try {
        return await component(...args);
      } catch (error) {
        this.handleError(error, 'Component Error', { component: component.name });
        return fallback || '<div class="error">组件加载失败</div>';
      }
    };
  }
}

// 导出单例
export default new ErrorHandler();


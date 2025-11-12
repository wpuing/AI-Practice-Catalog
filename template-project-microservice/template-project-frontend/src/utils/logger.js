/**
 * 日志工具类
 * 提供统一的日志记录功能
 */

import { LOG_CONFIG, STORAGE_CONFIG } from '@config/index.js';

class Logger {
  constructor() {
    this.logs = [];
    this.maxSize = LOG_CONFIG.MAX_STORAGE_SIZE;
  }

  /**
   * 格式化日志消息
   */
  formatMessage(level, message, data) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      data: data || null
    };
  }

  /**
   * 存储日志到本地
   */
  storeLog(logEntry) {
    if (!LOG_CONFIG.ENABLE_STORAGE) {
      return;
    }

    this.logs.push(logEntry);
    if (this.logs.length > this.maxSize) {
      this.logs.shift();
    }

    try {
      localStorage.setItem('app_logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Failed to store logs:', error);
    }
  }

  /**
   * 输出到控制台
   */
  outputToConsole(level, message, data) {
    if (!LOG_CONFIG.ENABLE_CONSOLE) {
      return;
    }

    const styles = {
      debug: 'color: #999',
      info: 'color: #2196F3',
      warn: 'color: #FF9800',
      error: 'color: #F44336'
    };

    const style = styles[level] || '';
    const prefix = `[${level.toUpperCase()}]`;

    if (data) {
      console.log(`%c${prefix}`, style, message, data);
    } else {
      console.log(`%c${prefix}`, style, message);
    }
  }

  /**
   * 记录日志
   */
  log(level, message, data) {
    const logEntry = this.formatMessage(level, message, data);
    this.storeLog(logEntry);
    this.outputToConsole(level, message, data);
  }

  /**
   * Debug 级别日志
   */
  debug(message, data) {
    this.log(LOG_CONFIG.LEVEL.DEBUG, message, data);
  }

  /**
   * Info 级别日志
   */
  info(message, data) {
    this.log(LOG_CONFIG.LEVEL.INFO, message, data);
  }

  /**
   * Warn 级别日志
   */
  warn(message, data) {
    this.log(LOG_CONFIG.LEVEL.WARN, message, data);
  }

  /**
   * Error 级别日志
   */
  error(message, error) {
    const errorData = error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      : error;
    this.log(LOG_CONFIG.LEVEL.ERROR, message, errorData);
  }

  /**
   * 获取存储的日志
   */
  getStoredLogs() {
    try {
      const stored = localStorage.getItem('app_logs');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to get stored logs:', error);
      return [];
    }
  }

  /**
   * 清空存储的日志
   */
  clearStoredLogs() {
    this.logs = [];
    try {
      localStorage.removeItem('app_logs');
    } catch (error) {
      console.warn('Failed to clear stored logs:', error);
    }
  }
}

// 导出单例
export default new Logger();


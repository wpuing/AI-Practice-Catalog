/**
 * 应用配置文件
 * 统一管理应用的所有配置项
 */

// 环境配置
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

// 当前环境
export const CURRENT_ENV = import.meta.env.MODE || ENV.DEVELOPMENT;

// API 配置
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000
};

// 应用配置
export const APP_CONFIG = {
  NAME: 'Template Project Frontend',
  VERSION: '1.0.0',
  TITLE: '企业级微服务前端系统',
  DESCRIPTION: '基于 JavaScript 原生的企业级前端应用',
  COPYRIGHT: '© 2025 版权所有 | 作者：靓仔 | 邮箱：weiyzhong@126.com'
};

// 存储配置
export const STORAGE_CONFIG = {
  TOKEN_KEY: 'auth_token',
  USER_KEY: 'user_info',
  THEME_KEY: 'app_theme',
  LANGUAGE_KEY: 'app_language'
};

// 路由配置
export const ROUTE_CONFIG = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USER_MANAGEMENT: '/users',
  PRODUCT_MANAGEMENT: '/products',
  REPORT_MANAGEMENT: '/reports',
  FILE_MANAGEMENT: '/files',
  SETTINGS: '/settings',
  NOT_FOUND: '/404'
};

// 分页配置
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  DEFAULT_PAGE: 1
};

// 主题配置
export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  DEFAULT: 'light'
};

// 语言配置
export const LANGUAGE_CONFIG = {
  ZH_CN: 'zh-CN',
  EN_US: 'en-US',
  DEFAULT: 'zh-CN'
};

// 日期时间格式配置
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  TIMESTAMP: 'YYYY-MM-DD HH:mm:ss.SSS'
};

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword'],
  CHUNK_SIZE: 2 * 1024 * 1024 // 2MB
};

// 日志配置
export const LOG_CONFIG = {
  LEVEL: {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error'
  },
  ENABLE_CONSOLE: CURRENT_ENV === ENV.DEVELOPMENT,
  ENABLE_STORAGE: true,
  MAX_STORAGE_SIZE: 1000
};

export default {
  ENV,
  CURRENT_ENV,
  API_CONFIG,
  APP_CONFIG,
  STORAGE_CONFIG,
  ROUTE_CONFIG,
  PAGINATION_CONFIG,
  THEME_CONFIG,
  LANGUAGE_CONFIG,
  DATE_FORMAT,
  UPLOAD_CONFIG,
  LOG_CONFIG
};


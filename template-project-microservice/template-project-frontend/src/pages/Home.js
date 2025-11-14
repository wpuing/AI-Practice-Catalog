/**
 * 系统首页 - 微服务管理系统概览
 */

import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';
import logger from '@utils/logger.js';
import store from '@utils/store.js';

export default async function HomePage() {
  // 不依赖store，避免认证检查导致的问题
  let user = {};
  try {
    const state = store.getState();
    user = state.user || {};
  } catch (error) {
    logger.warn('Failed to get user state', error);
  }

  // 初始化页面交互
  setTimeout(() => {
    initPageInteractions();
  }, 0);

  return `
    <div class="home-page">
      <!-- 欢迎区域 -->
      <section class="home-hero">
        <div class="hero-background">
          <div class="hero-gradient"></div>
          <div class="hero-pattern"></div>
        </div>
        <div class="hero-content">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span class="badge-text">微服务架构平台</span>
          </div>
          <h1 class="hero-title">
            <span class="title-line">微服务</span>
            <span class="title-line title-accent">管理系统</span>
          </h1>
          <p class="hero-subtitle">企业级分布式架构 · 统一配置管理 · 服务治理</p>
          <div class="hero-actions">
            <a href="${ROUTE_CONFIG.DASHBOARD}" data-router class="hero-btn hero-btn-primary">
              <span class="btn-content">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span class="btn-label">进入仪表盘</span>
              </span>
              <div class="btn-ripple"></div>
            </a>
            <a href="${ROUTE_CONFIG.USER_MANAGEMENT}" data-router class="hero-btn hero-btn-outline">
              <span class="btn-content">
                <svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                <span class="btn-label">用户管理</span>
              </span>
              <div class="btn-ripple"></div>
            </a>
          </div>
        </div>
      </section>

      <!-- 系统概览 -->
      <section class="home-overview">
        <div class="container">
          <h2 class="section-title">系统概览</h2>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="overview-icon">🔐</div>
              <h3 class="overview-title">认证服务</h3>
              <p class="overview-desc">用户认证与授权管理</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="overview-icon">👥</div>
              <h3 class="overview-title">用户服务</h3>
              <p class="overview-desc">用户信息与权限管理</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="overview-icon">📦</div>
              <h3 class="overview-title">商品服务</h3>
              <p class="overview-desc">商品信息管理</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="overview-icon">📊</div>
              <h3 class="overview-title">报表服务</h3>
              <p class="overview-desc">数据报表与分析</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="overview-icon">📁</div>
              <h3 class="overview-title">文件服务</h3>
              <p class="overview-desc">文件存储与管理</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
            
            <div class="overview-card">
              <div class="overview-icon">🚪</div>
              <h3 class="overview-title">网关服务</h3>
              <p class="overview-desc">API 网关与路由</p>
              <div class="overview-status">
                <span class="status-dot status-online"></span>
                <span class="status-text">运行中</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 快速入口 -->
      <section class="home-quick-access">
        <div class="container">
          <h2 class="section-title">快速入口</h2>
          <div class="quick-access-grid">
            <a href="${ROUTE_CONFIG.DASHBOARD}" data-router class="quick-access-item">
              <div class="quick-access-icon">📊</div>
              <h3 class="quick-access-title">仪表盘</h3>
              <p class="quick-access-desc">查看系统统计信息</p>
            </a>
            
            <a href="${ROUTE_CONFIG.USER_MANAGEMENT}" data-router class="quick-access-item">
              <div class="quick-access-icon">👥</div>
              <h3 class="quick-access-title">用户管理</h3>
              <p class="quick-access-desc">管理用户账户</p>
            </a>
            
            <a href="${ROUTE_CONFIG.PRODUCT_MANAGEMENT}" data-router class="quick-access-item">
              <div class="quick-access-icon">📦</div>
              <h3 class="quick-access-title">商品管理</h3>
              <p class="quick-access-desc">管理商品信息</p>
            </a>
            
            <a href="${ROUTE_CONFIG.REPORT_MANAGEMENT}" data-router class="quick-access-item">
              <div class="quick-access-icon">📈</div>
              <h3 class="quick-access-title">报表管理</h3>
              <p class="quick-access-desc">查看数据报表</p>
            </a>
            
            <a href="${ROUTE_CONFIG.FILE_MANAGEMENT}" data-router class="quick-access-item">
              <div class="quick-access-icon">📁</div>
              <h3 class="quick-access-title">文件管理</h3>
              <p class="quick-access-desc">管理文件资源</p>
            </a>
            
            <a href="${ROUTE_CONFIG.SETTINGS}" data-router class="quick-access-item">
              <div class="quick-access-icon">⚙️</div>
              <h3 class="quick-access-title">系统设置</h3>
              <p class="quick-access-desc">配置系统参数</p>
            </a>
          </div>
        </div>
      </section>

      <!-- 系统信息 -->
      <section class="home-info">
        <div class="container">
          <div class="info-grid">
            <div class="info-card">
              <h3 class="info-title">技术栈</h3>
              <ul class="info-list">
                <li>Spring Cloud Alibaba</li>
                <li>Nacos 配置中心</li>
                <li>Spring Cloud Gateway</li>
                <li>PostgreSQL 数据库</li>
                <li>Redis 缓存</li>
              </ul>
            </div>
            
            <div class="info-card">
              <h3 class="info-title">系统特性</h3>
              <ul class="info-list">
                <li>微服务架构</li>
                <li>统一配置管理</li>
                <li>服务注册发现</li>
                <li>API 网关路由</li>
                <li>JWT 认证授权</li>
              </ul>
            </div>
            
            <div class="info-card">
              <h3 class="info-title">当前用户</h3>
              <div class="user-info">
                <p><strong>用户名：</strong>${user.username || '未登录'}</p>
                <p><strong>状态：</strong><span class="status-badge status-active">已登录</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// 初始化页面交互
function initPageInteractions() {
  // 可以在这里添加页面交互逻辑
  logger.info('Home page initialized');
}


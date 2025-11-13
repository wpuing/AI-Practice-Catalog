/**
 * 商城首页
 */

import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';
import logger from '@utils/logger.js';

export default async function HomePage() {
  // 初始化搜索功能
  setTimeout(() => {
    initSearch();
  }, 0);

  return `
    <div class="home-page">
      <!-- 顶部横幅区域 -->
      <section class="home-hero">
        <div class="hero-content">
          <h1 class="hero-title">欢迎来到精品商城</h1>
          <p class="hero-subtitle">发现优质商品，享受购物乐趣</p>
          
          <!-- 搜索框 -->
          <div class="search-container">
            <div class="search-box">
              <input 
                type="text" 
                id="searchInput" 
                class="search-input" 
                placeholder="搜索商品、品牌、分类..."
                autocomplete="off"
              />
              <button id="searchBtn" class="search-btn">
                <span class="search-icon">🔍</span>
                <span class="search-text">搜索</span>
              </button>
            </div>
            <div class="search-suggestions">
              <span class="suggestion-label">热门搜索：</span>
              <a href="#" class="suggestion-tag" data-keyword="手机">手机</a>
              <a href="#" class="suggestion-tag" data-keyword="电脑">电脑</a>
              <a href="#" class="suggestion-tag" data-keyword="服装">服装</a>
              <a href="#" class="suggestion-tag" data-keyword="食品">食品</a>
              <a href="#" class="suggestion-tag" data-keyword="家电">家电</a>
            </div>
          </div>
        </div>
      </section>

      <!-- 商品分类区域 -->
      <section class="home-categories">
        <div class="container">
          <h2 class="section-title">商品分类</h2>
          <div class="category-grid">
            <div class="category-card">
              <div class="category-icon">📱</div>
              <h3 class="category-name">电子产品</h3>
              <p class="category-desc">手机、电脑、数码配件</p>
            </div>
            <div class="category-card">
              <div class="category-icon">👔</div>
              <h3 class="category-name">服装配饰</h3>
              <p class="category-desc">男装、女装、配饰</p>
            </div>
            <div class="category-card">
              <div class="category-icon">🍔</div>
              <h3 class="category-name">食品饮料</h3>
              <p class="category-desc">零食、饮料、生鲜</p>
            </div>
            <div class="category-card">
              <div class="category-icon">🏠</div>
              <h3 class="category-name">家居用品</h3>
              <p class="category-desc">家具、装饰、日用品</p>
            </div>
            <div class="category-card">
              <div class="category-icon">💄</div>
              <h3 class="category-name">美妆护肤</h3>
              <p class="category-desc">化妆品、护肤品、香水</p>
            </div>
            <div class="category-card">
              <div class="category-icon">⚽</div>
              <h3 class="category-name">运动户外</h3>
              <p class="category-desc">运动装备、户外用品</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 推荐商品区域 -->
      <section class="home-products">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">热门推荐</h2>
            <a href="${ROUTE_CONFIG.PRODUCT_MANAGEMENT}" data-router class="section-more">查看更多 →</a>
          </div>
          <div class="product-grid">
            <div class="product-card">
              <div class="product-image">
                <div class="product-placeholder">📦</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">示例商品 1</h3>
                <p class="product-desc">商品描述信息</p>
                <div class="product-footer">
                  <span class="product-price">¥99.00</span>
                  <button class="btn btn-primary btn-small">立即购买</button>
                </div>
              </div>
            </div>
            <div class="product-card">
              <div class="product-image">
                <div class="product-placeholder">📦</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">示例商品 2</h3>
                <p class="product-desc">商品描述信息</p>
                <div class="product-footer">
                  <span class="product-price">¥199.00</span>
                  <button class="btn btn-primary btn-small">立即购买</button>
                </div>
              </div>
            </div>
            <div class="product-card">
              <div class="product-image">
                <div class="product-placeholder">📦</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">示例商品 3</h3>
                <p class="product-desc">商品描述信息</p>
                <div class="product-footer">
                  <span class="product-price">¥299.00</span>
                  <button class="btn btn-primary btn-small">立即购买</button>
                </div>
              </div>
            </div>
            <div class="product-card">
              <div class="product-image">
                <div class="product-placeholder">📦</div>
              </div>
              <div class="product-info">
                <h3 class="product-name">示例商品 4</h3>
                <p class="product-desc">商品描述信息</p>
                <div class="product-footer">
                  <span class="product-price">¥399.00</span>
                  <button class="btn btn-primary btn-small">立即购买</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 特色服务区域 -->
      <section class="home-features">
        <div class="container">
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🚚</div>
              <h3 class="feature-title">快速配送</h3>
              <p class="feature-desc">24小时内发货</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🛡️</div>
              <h3 class="feature-title">正品保证</h3>
              <p class="feature-desc">100%正品保障</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">↩️</div>
              <h3 class="feature-title">7天退换</h3>
              <p class="feature-desc">无忧退换货</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💳</div>
              <h3 class="feature-title">安全支付</h3>
              <p class="feature-desc">多种支付方式</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

// 初始化搜索功能
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const suggestionTags = document.querySelectorAll('.suggestion-tag');

  // 搜索按钮点击事件
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  // 回车键搜索
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  // 热门搜索标签点击
  suggestionTags.forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.preventDefault();
      const keyword = tag.getAttribute('data-keyword');
      if (searchInput) {
        searchInput.value = keyword;
        handleSearch();
      }
    });
  });

  function handleSearch() {
    const keyword = searchInput?.value.trim();
    if (!keyword) {
      logger.warn('Search keyword is empty');
      return;
    }

    logger.info('Search triggered', { keyword });
    // 跳转到商品管理页面并传递搜索关键词
    router.push(`${ROUTE_CONFIG.PRODUCT_MANAGEMENT}?keyword=${encodeURIComponent(keyword)}`);
  }
}


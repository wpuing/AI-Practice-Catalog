/**
 * 登录页面
 */

import authService from '@services/auth-service.js';
import router from '@utils/router.js';
import { ROUTE_CONFIG } from '@config/index.js';
import { validateEmail, validatePhone } from '@utils/validator.js';
import { Input } from '@components/Input.js';
import { Button } from '@components/Button.js';
import logger from '@utils/logger.js';
import { initThemeRotation } from '@components/login/ThemeManager.js';
import { initCubeAnimation } from '@components/login/CubeAnimation.js';
import { initCodeRain } from '@components/login/CodeRain.js';

// 初始化登录页面函数 - 在DOM渲染后调用
function initLoginPage() {
  console.log('=== initLoginPage called ===');
  
  // 初始化主题切换和3D动画
  setTimeout(() => {
    initThemeRotation();
    initCubeAnimation();
  }, 100);

  // 处理表单提交
  const form = document.querySelector('#loginForm');
  const errorDiv = document.querySelector('#loginError');

  if (!form) {
    console.error('Login form not found!');
    return;
  }

  console.log('Login form found, binding events...');

  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }

  if (form) {
    // 自定义验证消息
    const usernameInput = form.querySelector('#username');
    const passwordInput = form.querySelector('#password');
    
    // 自定义验证消息
    if (usernameInput) {
      usernameInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        const message = usernameInput.getAttribute('data-validation-message') || '请输入用户名';
        showValidationError(usernameInput, message);
        usernameInput.focus();
      });
      
      usernameInput.addEventListener('input', () => {
        clearValidationError(usernameInput);
      });
    }
    
    if (passwordInput) {
      passwordInput.addEventListener('invalid', (e) => {
        e.preventDefault();
        const message = passwordInput.getAttribute('data-validation-message') || '请输入密码';
        showValidationError(passwordInput, message);
        passwordInput.focus();
      });
      
      passwordInput.addEventListener('input', () => {
        clearValidationError(passwordInput);
      });
    }
    
    function showValidationError(input, message) {
      const wrapper = input.closest('.input-wrapper');
      const validationMsg = wrapper?.querySelector('.validation-message');
      if (validationMsg) {
        validationMsg.textContent = message;
        validationMsg.classList.add('show');
        input.classList.add('invalid');
      } else {
        showError(message);
      }
    }
    
    function clearValidationError(input) {
      const wrapper = input.closest('.input-wrapper');
      const validationMsg = wrapper?.querySelector('.validation-message');
      if (validationMsg) {
        validationMsg.classList.remove('show');
        input.classList.remove('invalid');
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const formData = new FormData(form);
      const username = formData.get('username')?.trim();
      const password = formData.get('password')?.trim();

      // 验证
      if (!username || !password) {
        showError('请输入用户名和密码');
        return;
      }
      
      // 清除之前的错误
      errorDiv.style.display = 'none';

      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn?.querySelector('.btn-text');
      const btnArrow = submitBtn?.querySelector('.btn-arrow');
      
      // 设置按钮为加载状态
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        if (btnText) {
          btnText.textContent = '登录中...';
        }
        if (btnArrow) {
          btnArrow.style.display = 'none';
        }
      }

      try {
        logger.info('Attempting login', { username });
        console.log('=== Login Request Start ===');
        console.log('Username:', username);
        console.log('Password length:', password?.length);
        
        const result = await authService.login(username, password);
        console.log('=== Login Success ===');
        console.log('Login result:', result);
        
        if (result && result.success) {
          // 验证认证状态是否已更新
          const isAuthenticated = authService.isAuthenticated();
          console.log('=== Authentication Check ===');
          console.log('Is authenticated:', isAuthenticated);
          
          if (!isAuthenticated) {
            console.error('Authentication state not updated after login');
            throw new Error('登录状态更新失败，请重试');
          }
          
          logger.info('Login successful', { username });
          console.log('Redirecting to dashboard...');
          
          // 使用 replace 而不是 push，避免历史记录问题
          // 确保在下一个事件循环中跳转，让所有状态更新完成
          await new Promise(resolve => setTimeout(resolve, 50));
          router.replace(ROUTE_CONFIG.DASHBOARD);
          
          // 登录成功，不重置按钮状态（因为页面即将跳转）
          return;
        } else {
          console.error('Login result missing success flag:', result);
          throw new Error('登录失败：未返回成功结果');
        }
      } catch (error) {
        console.error('Login error:', error);
        logger.error('Login failed', error);
        
        // 提取错误消息
        let errorMsg = '登录失败，请检查用户名和密码';
        if (error?.data?.message) {
          errorMsg = error.data.message;
        } else if (error?.message) {
          errorMsg = error.message;
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        showError(errorMsg);
        
        // 登录失败，重置按钮状态
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          if (btnText) {
            btnText.textContent = '登录';
          }
          if (btnArrow) {
            btnArrow.style.display = 'block';
          }
        }
      }
    });
  }



}

export default async function LoginPage() {
  // 返回HTML和初始化函数
  return {
    html: `
    <div class="login-page">
    <div class="login-background" data-theme="0">
      <div class="login-gradient"></div>
      <div class="login-tunnel"></div>
      <div class="login-tunnel-grid-1"></div>
      <div class="login-tunnel-grid-2"></div>
      <div class="login-tunnel-grid-3"></div>
      <div class="login-pattern"></div>
      <div class="login-particles"></div>
      <div class="login-grid-3d"></div>
      <div class="login-geometric-shapes"></div>
      <div class="login-scan-lines"></div>
      <div class="login-light-rays"></div>
      <div class="login-stars"></div>
      <div class="login-shooting-stars">
        <div class="particle-trail trail-1">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
        <div class="particle-trail trail-2">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
        <div class="particle-trail trail-3">
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
          <div class="particle"></div>
        </div>
      </div>
    </div>
    <div class="login-wrapper">
      <!-- 左侧3D几何图形 -->
      <div class="login-left">
          <div class="geometric-container">
            <div class="geometric-shape-wrapper">
              <div class="cube-frame-3d">
                <div class="cube-frame-face cube-frame-front"></div>
                <div class="cube-frame-face cube-frame-back"></div>
                <div class="cube-frame-face cube-frame-right"></div>
                <div class="cube-frame-face cube-frame-left"></div>
                <div class="cube-frame-face cube-frame-top"></div>
                <div class="cube-frame-face cube-frame-bottom"></div>
              </div>
              <div class="cube-3d" id="geometricShape">
                <div class="cube-face cube-front">
                  <div class="code-rain"></div>
                </div>
                <div class="cube-face cube-back">
                  <div class="code-rain"></div>
                </div>
                <div class="cube-face cube-right">
                  <div class="code-rain"></div>
                </div>
                <div class="cube-face cube-left">
                  <div class="code-rain"></div>
                </div>
                <div class="cube-face cube-top">
                  <div class="code-rain"></div>
                </div>
                <div class="cube-face cube-bottom">
                  <div class="code-rain"></div>
                </div>
              </div>
            </div>
          <div class="geometric-title">
            <h2>XXX微服务管理系统</h2>
            <p>企业级分布式架构平台</p>
          </div>
        </div>
      </div>
      
      <!-- 右侧登录表单 -->
      <div class="login-right">
        <div class="login-card" data-theme="0">
          <div class="login-card-circuit">
            <div class="circuit-line circuit-line-1"></div>
            <div class="circuit-line circuit-line-2"></div>
            <div class="circuit-line circuit-line-3"></div>
            <div class="circuit-line circuit-line-4"></div>
            <div class="circuit-line circuit-line-5"></div>
            <div class="circuit-line circuit-line-6"></div>
            <div class="circuit-line circuit-line-7"></div>
            <div class="circuit-line circuit-line-8"></div>
            <div class="circuit-line circuit-line-9"></div>
            <div class="circuit-line circuit-line-10"></div>
            <div class="circuit-line circuit-line-11"></div>
            <div class="circuit-line circuit-line-12"></div>
            <div class="circuit-line circuit-line-13"></div>
            <div class="circuit-line circuit-line-14"></div>
            <div class="circuit-line circuit-line-15"></div>
            <div class="circuit-line circuit-line-16"></div>
            <div class="circuit-line circuit-line-17"></div>
            <div class="circuit-line circuit-line-18"></div>
            <div class="circuit-line circuit-line-19"></div>
            <div class="circuit-line circuit-line-20"></div>
            <div class="circuit-line circuit-line-21"></div>
            <div class="circuit-line circuit-line-22"></div>
            <div class="circuit-line circuit-line-23"></div>
            <div class="circuit-line circuit-line-24"></div>
            <div class="circuit-node circuit-node-1"></div>
            <div class="circuit-node circuit-node-2"></div>
            <div class="circuit-node circuit-node-3"></div>
            <div class="circuit-node circuit-node-4"></div>
            <div class="circuit-node circuit-node-5"></div>
            <div class="circuit-node circuit-node-6"></div>
            <div class="circuit-node circuit-node-7"></div>
            <div class="circuit-node circuit-node-8"></div>
            <div class="circuit-node circuit-node-9"></div>
            <div class="circuit-node circuit-node-10"></div>
            <div class="circuit-node circuit-node-11"></div>
            <div class="circuit-node circuit-node-12"></div>
            <div class="circuit-pulse circuit-pulse-1"></div>
            <div class="circuit-pulse circuit-pulse-2"></div>
            <div class="circuit-pulse circuit-pulse-3"></div>
            <div class="circuit-pulse circuit-pulse-4"></div>
            <div class="circuit-pulse circuit-pulse-5"></div>
            <div class="circuit-pulse circuit-pulse-6"></div>
          </div>
          <div class="login-header">
            <div class="login-badge">
              <span class="badge-dot"></span>
              <span class="badge-text">微服务架构平台</span>
            </div>
            <h1 class="login-title">
              <span class="title-main">欢迎回来</span>
              <span class="title-sub">登录您的账户</span>
            </h1>
          </div>
          <form id="loginForm" class="login-form">
            <div class="form-group">
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <input 
                  type="text" 
                  id="username" 
                  name="username" 
                  class="form-input"
                  placeholder="用户名"
                  required 
                  autocomplete="username"
                  data-validation-message="请输入用户名"
                />
                <div class="input-line"></div>
                <div class="validation-message"></div>
              </div>
            </div>
            <div class="form-group">
              <div class="input-wrapper">
                <svg class="input-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  class="form-input"
                  placeholder="密码"
                  required 
                  autocomplete="current-password"
                  data-validation-message="请输入密码"
                />
                <div class="input-line"></div>
                <div class="validation-message"></div>
              </div>
            </div>
            <div id="loginError" class="error-message" style="display: none;"></div>
            <div class="form-group">
              <button type="submit" class="btn-login">
                <span class="btn-text">登录</span>
                <svg class="btn-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </form>
          <div class="login-footer">
            <p class="footer-text">企业级微服务架构管理平台</p>
          </div>
        </div>
      </div>
    </div>
    </div>
    <div class="page-footer">
      <p class="page-copyright">
        © 2025 版权所有 | 作者：<span class="author-name">靓仔</span>
        <span class="footer-email"> | 邮箱：<a href="mailto:weiyzhong@126.com" class="email-link">weiyzhong@126.com</a></span>
      </p>
    </div>
    `,
    init: initLoginPage
  };
}

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

export default async function LoginPage() {
  const container = document.createElement('div');
  container.className = 'login-page';

  container.innerHTML = `
    <div class="login-container">
      <div class="login-card">
        <h1 class="login-title">用户登录</h1>
        <form id="loginForm" class="login-form">
          <div class="form-group">
            <label for="username">用户名</label>
            <input type="text" id="username" name="username" required autocomplete="username" />
          </div>
          <div class="form-group">
            <label for="password">密码</label>
            <input type="password" id="password" name="password" required autocomplete="current-password" />
          </div>
          <div class="form-group">
            <button type="submit" class="btn btn-primary btn-block">登录</button>
          </div>
        </form>
        <div id="loginError" class="error-message" style="display: none;"></div>
      </div>
    </div>
  `;

  // 处理表单提交
  const form = container.querySelector('#loginForm');
  const errorDiv = container.querySelector('#loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');

    // 验证
    if (!username || !password) {
      showError('请输入用户名和密码');
      return;
    }

    try {
      errorDiv.style.display = 'none';
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = '登录中...';

      await authService.login(username, password);
      logger.info('Login successful', { username });
      router.push(ROUTE_CONFIG.DASHBOARD);
    } catch (error) {
      logger.error('Login failed', error);
      showError(error.message || '登录失败，请检查用户名和密码');
    } finally {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = '登录';
    }
  });

  function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
  }

  return container.outerHTML;
}


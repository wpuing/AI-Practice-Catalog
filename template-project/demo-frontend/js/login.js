/**
 * 登录页面逻辑
 */

document.addEventListener('DOMContentLoaded', () => {
    // 如果已登录，跳转到主页
    if (api.isAuthenticated()) {
        window.location.href = 'home.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');

    // 切换显示登录/注册表单
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
        });
    }

    // 登录表单提交
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showMessage('请输入用户名和密码', 'error');
                return;
            }

            try {
                const loginBtn = loginForm.querySelector('button[type="submit"]');
                loginBtn.disabled = true;
                loginBtn.textContent = '登录中...';

                await api.login(username, password);
                showMessage('登录成功，正在跳转...', 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 500);
            } catch (error) {
                showMessage(error.message || '登录失败', 'error');
            } finally {
                const loginBtn = loginForm.querySelector('button[type="submit"]');
                if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.textContent = '登录';
                }
            }
        });
    }

    // 注册表单提交
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value;
            const passwordConfirm = document.getElementById('regPasswordConfirm').value;

            if (!username || !password) {
                showMessage('请输入用户名和密码', 'error');
                return;
            }

            if (password !== passwordConfirm) {
                showMessage('两次密码输入不一致', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('密码长度至少6位', 'error');
                return;
            }

            try {
                const registerBtn = registerForm.querySelector('button[type="submit"]');
                registerBtn.disabled = true;
                registerBtn.textContent = '注册中...';

                const response = await api.register(username, password);
                if (response.code === 200) {
                    showMessage('注册成功，请登录', 'success');
                    registerForm.style.display = 'none';
                    loginForm.style.display = 'block';
                    // 自动填充用户名
                    document.getElementById('username').value = username;
                } else {
                    showMessage(response.message || '注册失败', 'error');
                }
            } catch (error) {
                showMessage(error.message || '注册失败', 'error');
            } finally {
                const registerBtn = registerForm.querySelector('button[type="submit"]');
                if (registerBtn) {
                    registerBtn.disabled = false;
                    registerBtn.textContent = '注册';
                }
            }
        });
    }
});


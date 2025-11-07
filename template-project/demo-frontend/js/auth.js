/**
 * 认证相关功能
 */

/**
 * 检查登录状态，未登录则跳转
 */
function checkAuth() {
    if (!api.isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

/**
 * 显示消息提示（优化版：成功消息自动消失，样式更美观）
 */
function showMessage(message, type = 'info') {
    // 移除已存在的消息提示
    const existingMessage = document.querySelector('.toast-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    // 创建新的消息提示元素
    const messageEl = document.createElement('div');
    messageEl.className = `toast-message toast-${type}`;
    messageEl.textContent = message;
    
    // 添加图标
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    messageEl.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>`;
    
    // 添加到页面
    document.body.appendChild(messageEl);
    
    // 触发动画
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 10);
    
    // 自动消失（成功消息2.5秒，错误消息4秒）
    const duration = type === 'success' ? 2500 : type === 'error' ? 4000 : 3000;
    setTimeout(() => {
        messageEl.classList.remove('show');
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 300);
    }, duration);
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}


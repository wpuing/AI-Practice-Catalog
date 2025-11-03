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
 * 显示消息提示
 */
function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        setTimeout(() => {
            messageEl.className = 'message';
        }, 3000);
    } else {
        // 如果没有消息元素，使用alert
        alert(message);
    }
}

/**
 * 格式化日期
 */
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN');
}


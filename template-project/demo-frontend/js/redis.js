/**
 * Redis管理模块
 */

/**
 * 加载Redis信息
 */
async function loadRedisInfo() {
    try {
        const response = await api.getRedisInfo();
        const infoEl = document.getElementById('redisInfo');
        if (!infoEl) return;

        if (response.code === 200) {
            const info = response.data || {};
            infoEl.innerHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
                    ${Object.keys(info).map(key => `
                        <div style="padding: 12px; background: var(--bg-secondary); border-radius: 6px;">
                            <strong>${key}:</strong> ${info[key] || '-'}
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            infoEl.innerHTML = `<p style="color: var(--danger-color);">${response.message || '加载失败'}</p>`;
        }
    } catch (error) {
        const infoEl = document.getElementById('redisInfo');
        if (infoEl) {
            infoEl.innerHTML = `<p style="color: var(--danger-color);">${error.message || '加载失败'}</p>`;
        }
    }
}

/**
 * 初始化Redis管理
 */
function initRedis() {
    loadRedisInfo();
}


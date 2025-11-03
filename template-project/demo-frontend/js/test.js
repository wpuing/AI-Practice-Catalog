/**
 * 接口测试模块
 */

/**
 * 测试用例配置
 */
const testCases = [
    {
        name: '健康检查',
        api: () => api.healthCheck(),
        description: '测试公共健康检查接口'
    },
    {
        name: '获取公共信息',
        api: () => api.getPublicInfo(),
        description: '测试公共信息接口'
    },
    {
        name: '获取当前用户信息',
        api: () => api.getCurrentUser(),
        description: '测试获取当前用户信息接口',
        requireAuth: true
    },
    {
        name: '刷新Token',
        api: () => api.refreshToken(),
        description: '测试刷新Token接口',
        requireAuth: true
    },
    {
        name: '获取用户列表',
        api: () => api.getUsers(1, 10),
        description: '测试获取用户列表接口',
        requireAuth: true
    },
    {
        name: '获取商品类型列表',
        api: () => api.getProductTypes(1, 10),
        description: '测试获取商品类型列表接口',
        requireAuth: true
    },
    {
        name: '获取商品列表',
        api: () => api.getProducts(1, 10),
        description: '测试获取商品列表接口',
        requireAuth: true
    },
    {
        name: '获取管理员信息',
        api: () => api.getAdminInfo(),
        description: '测试获取管理员信息接口',
        requireAuth: true,
        requireAdmin: true
    },
    {
        name: '获取角色列表',
        api: () => api.getRoles(),
        description: '测试获取角色列表接口',
        requireAuth: true,
        requireAdmin: true
    },
    {
        name: '获取白名单列表',
        api: () => api.getWhitelist(),
        description: '测试获取白名单列表接口',
        requireAuth: true,
        requireAdmin: true
    },
    {
        name: '获取权限列表',
        api: () => api.getPermissions(),
        description: '测试获取权限列表接口',
        requireAuth: true,
        requireAdmin: true
    },
    {
        name: '获取Redis信息',
        api: () => api.getRedisInfo(),
        description: '测试获取Redis信息接口',
        requireAuth: true,
        requireAdmin: true
    },
];

/**
 * 运行单个测试
 */
async function runTest(testCase) {
    const startTime = Date.now();
    let status = 'fail';
    let message = '';
    let duration = 0;

    try {
        // 检查认证要求
        if (testCase.requireAuth && !api.isAuthenticated()) {
            throw new Error('需要登录');
        }

        // 检查管理员权限要求
        if (testCase.requireAdmin && !api.isAdmin()) {
            throw new Error('需要管理员权限');
        }

        const response = await testCase.api();
        duration = Date.now() - startTime;

        if (response.code === 200) {
            status = 'pass';
            message = '测试通过';
        } else {
            message = response.message || '测试失败';
        }
    } catch (error) {
        duration = Date.now() - startTime;
        message = error.message || '测试失败';
    }

    return {
        name: testCase.name,
        description: testCase.description,
        status,
        message,
        duration
    };
}

/**
 * 运行所有测试
 */
async function runAllTests() {
    const resultsEl = document.getElementById('testResults');
    if (!resultsEl) return;

    resultsEl.innerHTML = '<div class="loading">正在运行测试...</div>';

    const results = [];
    for (const testCase of testCases) {
        const result = await runTest(testCase);
        results.push(result);
    }

    renderTestResults(results);
}

/**
 * 渲染测试结果
 */
function renderTestResults(results) {
    const resultsEl = document.getElementById('testResults');
    if (!resultsEl) return;

    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status === 'fail').length;

    resultsEl.innerHTML = `
        <div style="margin-bottom: 24px; padding: 16px; background: var(--bg-secondary); border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0;">测试统计</h3>
            <div style="display: flex; gap: 24px;">
                <div>
                    <strong>总计:</strong> ${results.length}
                </div>
                <div style="color: var(--success-color);">
                    <strong>通过:</strong> ${passCount}
                </div>
                <div style="color: var(--danger-color);">
                    <strong>失败:</strong> ${failCount}
                </div>
            </div>
        </div>
        ${results.map(result => `
            <div class="test-item">
                <div>
                    <strong>${result.name}</strong>
                    <p style="margin: 4px 0; color: var(--text-secondary); font-size: 12px;">
                        ${result.description}
                    </p>
                    <p style="margin: 4px 0; color: var(--text-secondary); font-size: 12px;">
                        耗时: ${result.duration}ms | ${result.message}
                    </p>
                </div>
                <span class="test-status ${result.status}">
                    ${result.status === 'pass' ? '✓ 通过' : '✗ 失败'}
                </span>
            </div>
        `).join('')}
    `;
}

/**
 * 初始化测试模块
 */
function initTest() {
    const runAllBtn = document.getElementById('runAllTestsBtn');
    if (runAllBtn) {
        runAllBtn.addEventListener('click', runAllTests);
    }

    // 自动运行一次测试
    runAllTests();
}


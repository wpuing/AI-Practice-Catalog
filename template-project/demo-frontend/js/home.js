/**
 * 主页逻辑
 */

/**
 * 初始化主页
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 检查登录状态
    if (!checkAuth()) {
        return;
    }

    // 显示用户信息
    updateUserInfo();

    // 显示/隐藏管理员功能
    if (api.isAdmin()) {
        const adminSection = document.getElementById('adminSection');
        if (adminSection) {
            adminSection.style.display = 'block';
        }
    }

    // 使用事件委托绑定所有新增按钮的点击事件（必须在页面加载后立即执行）
    bindAddButtons();

    // 初始化页面导航
    initNavigation();

    // 初始化控制台（默认页面）
    initDashboard();

    // 其他模块在切换到对应页面时再初始化
    // 绑定其他事件
    bindEvents();
});

/**
 * 更新用户信息显示
 */
function updateUserInfo() {
    const usernameEl = document.getElementById('currentUsername');
    const roleEl = document.getElementById('currentRole');

    if (usernameEl) {
        usernameEl.textContent = api.username || '-';
    }

    if (roleEl) {
        const roles = api.roles || [];
        roleEl.textContent = roles.length > 0 ? roles.join(', ') : '-';
    }
}

/**
 * 初始化页面导航
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                showPage(page);
            }
        });
    });

    // 默认显示控制台
    showPage('dashboard');
}

/**
 * 显示指定页面
 */
function showPage(pageName) {
    // 隐藏所有页面
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // 更新导航状态
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageName) {
            link.classList.add('active');
        }
    });

    // 根据页面加载数据
    switch (pageName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'users':
            // 重新初始化用户管理（确保事件绑定）
            initUsers();
            break;
        case 'product-types':
            // 重新初始化商品类型管理
            initProductTypes();
            break;
        case 'products':
            // 重新初始化商品管理
            initProducts();
            break;
        case 'roles':
            if (api.isAdmin()) {
                initRoles();
            }
            break;
        case 'security':
            if (api.isAdmin()) {
                initSecurity();
            }
            break;
        case 'redis':
            if (api.isAdmin()) {
                loadRedisInfo();
            }
            break;
        case 'test':
            runAllTests();
            break;
    }
}

/**
 * 加载控制台数据
 */
async function loadDashboard() {
    try {
        // 并行加载统计数据
        const [usersRes, typesRes, productsRes] = await Promise.all([
            api.getUsers(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
            api.getProductTypes(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
            api.getProducts(1, 1).catch(() => ({ code: 200, data: { total: 0 } }))
        ]);

        // 获取启用商品数量
        let activeProductsCount = 0;
        try {
            const activeProductsRes = await api.getProducts(1, 1000, null, true);
            if (activeProductsRes.code === 200) {
                const activeProducts = activeProductsRes.data.records || activeProductsRes.data.list || [];
                activeProductsCount = activeProducts.length;
            }
        } catch (error) {
            console.error('获取启用商品失败:', error);
        }

        const userCount = usersRes.data?.total || 0;
        const typeCount = typesRes.data?.total || 0;
        const productCount = productsRes.data?.total || 0;

        // 更新显示
        const userCountEl = document.getElementById('userCount');
        const typeCountEl = document.getElementById('productTypeCount');
        const productCountEl = document.getElementById('productCount');
        const activeProductCountEl = document.getElementById('activeProductCount');

        if (userCountEl) userCountEl.textContent = userCount;
        if (typeCountEl) typeCountEl.textContent = typeCount;
        if (productCountEl) productCountEl.textContent = productCount;
        if (activeProductCountEl) activeProductCountEl.textContent = activeProductsCount;
    } catch (error) {
        console.error('加载控制台数据失败:', error);
    }
}

/**
 * 绑定所有新增按钮的事件（使用事件委托）
 */
function bindAddButtons() {
    // 使用事件委托，绑定到整个文档
    document.addEventListener('click', (e) => {
        // 新增用户按钮
        if (e.target && e.target.id === 'addUserBtn') {
            e.preventDefault();
            editUser();
            return;
        }
        // 新增商品类型按钮
        if (e.target && e.target.id === 'addProductTypeBtn') {
            e.preventDefault();
            editProductType();
            return;
        }
        // 新增商品按钮
        if (e.target && e.target.id === 'addProductBtn') {
            e.preventDefault();
            editProduct();
            return;
        }
        // 新增角色按钮
        if (e.target && e.target.id === 'addRoleBtn') {
            e.preventDefault();
            editRole();
            return;
        }
    });
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('确定要退出登录吗？')) {
                try {
                    await api.logout();
                } catch (error) {
                    console.error('退出登录失败:', error);
                }
                window.location.href = 'index.html';
            }
        });
    }

    // 刷新Token
    const refreshTokenBtn = document.getElementById('refreshTokenBtn');
    if (refreshTokenBtn) {
        refreshTokenBtn.addEventListener('click', async () => {
            try {
                await api.refreshToken();
                showMessage('Token刷新成功', 'success');
            } catch (error) {
                showMessage(error.message || 'Token刷新失败', 'error');
            }
        });
    }

    // 侧边栏切换（移动端）
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        });
    }
}

/**
 * 分页组件（简化版）
 */
function renderPagination(total, current, pageType) {
    // 分页功能可以在后续优化中实现
    // 目前使用简单的分页，通过修改current变量来切换页码
    console.log(`分页信息: 总计${total}, 当前页${current}, 类型${pageType}`);
}

// 全局分页切换函数
window.goToPage = function(page, pageType) {
    switch (pageType) {
        case 'users':
            currentPage = page;
            loadUsers(page);
            break;
        case 'product-types':
            productTypesPage = page;
            loadProductTypes(page);
            break;
        case 'products':
            productsPage = page;
            loadProducts(page);
            break;
    }
};


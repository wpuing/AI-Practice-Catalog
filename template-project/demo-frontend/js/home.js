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

    // 初始化页面导航（会默认显示控制台）
    initNavigation();

    // 其他模块在切换到对应页面时再初始化
    // 绑定其他事件（包括侧边栏切换和退出按钮）
    bindEvents();
    
    // 确保侧边栏切换按钮已绑定（延迟一点确保DOM完全加载）
    setTimeout(() => {
        bindSidebarToggle();
    }, 100);
});

/**
 * 更新用户信息显示
 */
function updateUserInfo() {
    const usernameEl = document.getElementById('currentUsername');
    const roleEl = document.getElementById('currentRole');

    if (usernameEl) {
        usernameEl.textContent = api.username || '-';
        // 添加点击事件查看用户详情
        usernameEl.style.cursor = 'pointer';
        usernameEl.style.textDecoration = 'underline';
        usernameEl.title = '点击查看用户详情';
        usernameEl.onclick = showUserDetail;
    }

    if (roleEl) {
        const roles = api.roles || [];
        roleEl.textContent = roles.length > 0 ? roles.join(', ') : '-';
    }
}

/**
 * 显示当前用户详情
 */
async function showUserDetail() {
    try {
        const response = await api.getCurrentUser();
        if (response.code === 200 && response.data) {
            const userData = response.data.user || {};
            const roles = response.data.roles || [];
            
            // 创建详情内容
            const detailContent = `
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: var(--primary-color);">用户详情</h3>
                    <div style="line-height: 2;">
                        <p><strong>用户ID:</strong> ${userData.id || '-'}</p>
                        <p><strong>用户名:</strong> ${userData.username || '-'}</p>
                        <p><strong>角色:</strong> ${roles.length > 0 ? roles.join(', ') : '无'}</p>
                        <p><strong>创建时间:</strong> ${userData.createTime ? new Date(userData.createTime).toLocaleString('zh-CN') : '-'}</p>
                        <p><strong>更新时间:</strong> ${userData.updateTime ? new Date(userData.updateTime).toLocaleString('zh-CN') : '-'}</p>
                    </div>
                </div>
            `;
            
            const modal = createModal('用户详情', detailContent, '');
        } else {
            showMessage(response.message || '获取用户信息失败', 'error');
        }
    } catch (error) {
        console.error('获取用户详情失败:', error);
        showMessage(error.message || '获取用户信息失败', 'error');
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
 * 侧边栏切换功能
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    
    if (!sidebar) {
        console.error('未找到侧边栏元素');
        return;
    }
    
    if (!sidebarToggle) {
        console.error('未找到侧边栏切换按钮');
        return;
    }
    
    // 桌面端：使用 collapsed 类来收放
    if (window.innerWidth > 768) {
        const isCollapsed = sidebar.classList.contains('collapsed');
        
        if (isCollapsed) {
            // 展开侧边栏
            sidebar.classList.remove('collapsed');
            sidebar.style.cssText = 'width: 260px !important; min-width: 260px !important; max-width: none !important; visibility: visible !important; opacity: 1 !important; pointer-events: auto !important;';
            sidebarToggle.style.transform = 'rotate(0deg)';
            console.log('侧边栏已展开');
        } else {
            // 收起侧边栏
            sidebar.classList.add('collapsed');
            sidebar.style.cssText = 'width: 0 !important; min-width: 0 !important; max-width: 0 !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
            sidebarToggle.style.transform = 'rotate(90deg)';
            console.log('侧边栏已收起');
        }
    } else {
        // 移动端：使用 active 类来显示/隐藏
        sidebar.classList.toggle('active');
    }
}

/**
 * 绑定侧边栏切换按钮事件
 */
function bindSidebarToggle() {
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    
    if (sidebarToggleBtn) {
        // 移除之前的事件监听器（如果存在）
        const newBtn = sidebarToggleBtn.cloneNode(true);
        sidebarToggleBtn.parentNode.replaceChild(newBtn, sidebarToggleBtn);
        
        // 方式1：使用onclick（最可靠）
        newBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('侧边栏按钮被点击（onclick）');
            toggleSidebar();
            return false;
        };
        
        // 方式2：使用addEventListener
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('侧边栏按钮被点击（addEventListener）');
            toggleSidebar();
        }, { capture: false, once: false });
        
        // 确保按钮可点击
        newBtn.style.pointerEvents = 'auto';
        newBtn.style.cursor = 'pointer';
        newBtn.setAttribute('role', 'button');
        newBtn.setAttribute('aria-label', '切换侧边栏');
        newBtn.setAttribute('tabindex', '0');
        
        // 支持键盘操作
        newBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleSidebar();
            }
        });
        
        console.log('侧边栏切换按钮已绑定事件');
    } else {
        console.error('未找到侧边栏切换按钮');
    }
}

/**
 * 绑定事件
 */
function bindEvents() {
    // 退出登录
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        // 移除之前的事件监听器
        const newLogoutBtn = logoutBtn.cloneNode(true);
        logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
        
        newLogoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('退出按钮被点击');
            
            try {
                const confirmed = await showConfirmModal('确认退出', '确定要退出登录吗？');
                console.log('确认结果:', confirmed);
                
                if (confirmed) {
                    try {
                        await api.logout();
                        showMessage('退出成功', 'success');
                    } catch (error) {
                        console.error('退出登录失败:', error);
                        // 即使API调用失败，也清除本地信息并跳转
                    } finally {
                        // 清除本地存储
                        localStorage.removeItem('token');
                        localStorage.removeItem('username');
                        localStorage.removeItem('roles');
                        // 跳转到登录页
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 500);
                    }
                }
            } catch (error) {
                console.error('显示确认框失败:', error);
            }
        });
        
        console.log('退出按钮已绑定事件');
    } else {
        console.error('未找到退出按钮');
    }

    // 刷新Token
    const refreshTokenBtn = document.getElementById('refreshTokenBtn');
    if (refreshTokenBtn) {
        refreshTokenBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                refreshTokenBtn.disabled = true;
                refreshTokenBtn.textContent = '刷新中...';
                const response = await api.refreshToken();
                if (response.code === 200) {
                    showMessage('Token刷新成功', 'success');
                } else {
                    showMessage(response.message || 'Token刷新失败', 'error');
                }
            } catch (error) {
                console.error('刷新Token失败:', error);
                showMessage(error.message || 'Token刷新失败', 'error');
            } finally {
                refreshTokenBtn.disabled = false;
                refreshTokenBtn.textContent = '刷新Token';
            }
        });
    }
    
    // 绑定侧边栏切换按钮
    bindSidebarToggle();
    
    // 同时使用事件委托作为备选方案（处理动态加载的情况）
    // 注意：使用 once: false 确保可以多次触发
    let sidebarDelegateBound = false;
    if (!sidebarDelegateBound) {
        document.addEventListener('click', function(e) {
            // 检查点击的是按钮本身，或者是按钮内的元素
            const clickedButton = e.target.closest('#sidebarToggle') || 
                                  (e.target.id === 'sidebarToggle' ? e.target : null);
            
            if (clickedButton && clickedButton.id === 'sidebarToggle') {
                // 如果直接绑定没有生效，使用事件委托
                e.preventDefault();
                e.stopPropagation();
                console.log('侧边栏按钮被点击（事件委托）');
                toggleSidebar();
            }
        }, { capture: true });
        sidebarDelegateBound = true;
    }

    // 窗口大小改变时，重置侧边栏状态（移动端切换到桌面端时）
    window.addEventListener('resize', () => {
        const sidebar = document.querySelector('.sidebar');
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebar && sidebarToggle) {
            if (window.innerWidth > 768) {
                // 桌面端：移除移动端的 active 类
                sidebar.classList.remove('active');
                // 重置按钮旋转
                if (!sidebar.classList.contains('collapsed')) {
                    sidebarToggle.style.transform = 'rotate(0deg)';
                }
            } else {
                // 移动端：移除桌面端的 collapsed 类
                sidebar.classList.remove('collapsed');
                sidebarToggle.style.transform = '';
            }
        }
    });
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


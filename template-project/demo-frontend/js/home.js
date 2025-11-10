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

    // 从后端获取最新的角色和菜单信息
    try {
        const userResponse = await api.getCurrentUser();
        if (userResponse.code === 200 && userResponse.data) {
            // 更新角色信息
            if (userResponse.data.roles) {
                api.roles = userResponse.data.roles;
                localStorage.setItem('roles', JSON.stringify(api.roles));
                console.log('用户角色已更新:', api.roles);
            }
            // 更新菜单信息
            if (userResponse.data.menus) {
                api.menus = userResponse.data.menus;
                localStorage.setItem('menus', JSON.stringify(api.menus));
                console.log('用户菜单已更新:', api.menus);
            }
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
    }

    // 显示用户信息
    updateUserInfo();

    // 根据权限显示/隐藏菜单项
    updateMenuVisibility();
    
    // 初始化头部信息栏（时间、日期、温度、在线人数）
    initHeaderInfoBar();

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
        // 如果有角色，显示角色名称；如果没有角色，显示"普通用户"
        if (roles.length > 0) {
            // 将角色代码转换为中文显示
            const roleNames = roles.map(role => {
                switch(role) {
                    case 'SUPER_ADMIN':
                        return '超级管理员';
                    case 'ADMIN':
                        return '管理员';
                    case 'USER':
                        return '普通用户';
                    default:
                        return role;
                }
            });
            roleEl.textContent = roleNames.join(', ');
        } else {
            roleEl.textContent = '普通用户';
        }
    }
}

/**
 * 根据用户权限更新菜单可见性
 */
function updateMenuVisibility() {
    const menus = api.menus || [];
    const isSuperAdmin = api.isSuperAdmin();
    const isAdmin = api.isAdmin();
    
    // 菜单代码到菜单项的映射
    const menuMap = {
        'DASHBOARD': { selector: 'a[data-page="dashboard"]' },
        'USERS': { selector: 'a[data-page="users"]' },
        'PRODUCT_TYPES': { selector: 'a[data-page="product-types"]' },
        'PRODUCTS': { selector: 'a[data-page="products"]' },
        'ROLES': { selector: '#rolesMenuItem' },
        'SECURITY': { selector: '#securityMenuItem' },
        'PERMISSIONS': { selector: '#permissionsMenuItem' },
        'REDIS': { selector: '#redisMenuItem' },
        'LOGS': { selector: '#logsMenuItem' },
        'MENUS': { selector: '#menusMenuItem' },
        'TEST': { selector: 'a[data-page="test"]' }
    };
    
    // 管理员功能区域标题
    const adminSection = document.getElementById('adminSection');
    if (adminSection) {
        // 如果有任何管理员专用菜单，显示标题
        const hasAdminMenus = menus.some(m => 
            ['ROLES', 'SECURITY', 'PERMISSIONS', 'REDIS', 'LOGS', 'MENUS'].includes(m.menuCode)
        ) || isAdmin;
        adminSection.style.display = hasAdminMenus ? 'block' : 'none';
    }
    
    // 根据菜单权限显示/隐藏菜单项
    Object.keys(menuMap).forEach(menuCode => {
        const config = menuMap[menuCode];
        const element = document.querySelector(config.selector);
        if (element) {
            const li = element.closest('li');
            if (li) {
                // 超级管理员拥有所有权限
                if (isSuperAdmin) {
                    li.style.display = 'block';
                } else {
                    // 检查用户是否有该菜单权限
                    const hasPermission = api.hasMenuPermission(menuCode);
                    li.style.display = hasPermission ? 'block' : 'none';
                }
            }
        }
    });
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
            
            // 将角色代码转换为中文显示
            const roleNames = roles.map(role => {
                switch(role) {
                    case 'SUPER_ADMIN':
                        return '超级管理员';
                    case 'ADMIN':
                        return '管理员';
                    case 'USER':
                        return '普通用户';
                    default:
                        return role;
                }
            });
            
            // 格式化时间
            const formatDateTime = (dateTimeStr) => {
                if (!dateTimeStr) return '-';
                try {
                    const date = new Date(dateTimeStr);
                    return date.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch (e) {
                    return dateTimeStr;
                }
            };
            
            // 创建详情内容
            const detailContent = `
                <div class="user-detail-container">
                    <div class="user-detail-header">
                        <div class="user-avatar">
                            <span style="font-size: 48px;">👤</span>
                        </div>
                        <div class="user-basic-info">
                            <h3 class="user-name">${escapeHtml(userData.username || '-')}</h3>
                            <div class="user-roles">
                                ${roles.length > 0 ? roleNames.map(role => {
                                    let roleClass = 'badge-secondary';
                                    if (role === '超级管理员') roleClass = 'badge-danger';
                                    else if (role === '管理员') roleClass = 'badge-info';
                                    else if (role === '普通用户') roleClass = 'badge-success';
                                    return `<span class="badge ${roleClass}">${escapeHtml(role)}</span>`;
                                }).join(' ') : '<span class="badge badge-secondary">无角色</span>'}
                            </div>
                        </div>
                    </div>
                    <div class="user-detail-body">
                        <div class="detail-info-grid">
                            <div class="detail-info-item">
                                <div class="detail-info-icon">🆔</div>
                                <div class="detail-info-content">
                                    <div class="detail-info-label">用户ID</div>
                                    <div class="detail-info-value">${escapeHtml(userData.id || '-')}</div>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-icon">👤</div>
                                <div class="detail-info-content">
                                    <div class="detail-info-label">用户名</div>
                                    <div class="detail-info-value">${escapeHtml(userData.username || '-')}</div>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-icon">🔐</div>
                                <div class="detail-info-content">
                                    <div class="detail-info-label">角色</div>
                                    <div class="detail-info-value">
                                        ${roles.length > 0 ? roleNames.map(role => {
                                            let roleClass = 'badge-secondary';
                                            if (role === '超级管理员') roleClass = 'badge-danger';
                                            else if (role === '管理员') roleClass = 'badge-info';
                                            else if (role === '普通用户') roleClass = 'badge-success';
                                            return `<span class="badge ${roleClass}">${escapeHtml(role)}</span>`;
                                        }).join(' ') : '<span class="badge badge-secondary">无角色</span>'}
                                    </div>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-icon">📅</div>
                                <div class="detail-info-content">
                                    <div class="detail-info-label">创建时间</div>
                                    <div class="detail-info-value">${formatDateTime(userData.createDate)}</div>
                                </div>
                            </div>
                            <div class="detail-info-item">
                                <div class="detail-info-icon">🔄</div>
                                <div class="detail-info-content">
                                    <div class="detail-info-label">更新时间</div>
                                    <div class="detail-info-value">${formatDateTime(userData.updateDate)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            const modal = createModal('用户详情', detailContent, '', null, 'medium');
        } else {
            showMessage(response.message || '获取用户信息失败', 'error');
        }
    } catch (error) {
        console.error('获取用户详情失败:', error);
        showMessage(error.message || '获取用户信息失败', 'error');
    }
}

/**
 * HTML转义函数
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
    // 页面名称到菜单代码的映射
    const pageMenuMap = {
        'dashboard': 'DASHBOARD',
        'users': 'USERS',
        'product-types': 'PRODUCT_TYPES',
        'products': 'PRODUCTS',
        'roles': 'ROLES',
        'security': 'SECURITY',
        'redis': 'REDIS',
        'logs': 'LOGS',
        'menus': 'MENUS',
        'test': 'TEST'
    };
    
    // 检查权限：根据菜单权限控制访问
    const menuCode = pageMenuMap[pageName];
    
    // 调试信息
    if (menuCode) {
        console.log('页面权限检查:', {
            pageName,
            menuCode,
            isSuperAdmin: api.isSuperAdmin(),
            roles: api.roles,
            hasMenuPermission: api.hasMenuPermission(menuCode),
            menus: api.menus
        });
    }
    
    // 超级管理员拥有所有权限，直接允许访问
    if (menuCode && !api.isSuperAdmin() && !api.hasMenuPermission(menuCode)) {
        // 无权限访问，重定向到控制台
        console.warn('无权限访问页面:', pageName, '菜单代码:', menuCode);
        showMessage('您没有权限访问此页面', 'error');
        showPage('dashboard');
        return;
    }
    
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
        case 'permissions':
            if (api.isAdmin()) {
                // 检查initPermissions函数是否存在
                if (typeof initPermissions === 'function') {
                    initPermissions();
                } else if (typeof window.initPermissions === 'function') {
                    window.initPermissions();
                } else {
                    // 如果函数还未加载，延迟执行
                    setTimeout(() => {
                        if (typeof window.initPermissions === 'function') {
                            window.initPermissions();
                        } else {
                            console.error('initPermissions 函数未找到');
                        }
                    }, 100);
                }
            }
            break;
        case 'redis':
            if (api.isAdmin()) {
                loadRedisInfo();
            }
            break;
            case 'logs':
                if (api.isAdmin()) {
                    // 检查initLogs函数是否存在，如果不存在则延迟加载
                    if (typeof initLogs === 'function') {
                        initLogs();
                    } else if (typeof window.initLogs === 'function') {
                        window.initLogs();
                    } else {
                        // 如果函数还未加载，延迟执行
                        setTimeout(() => {
                            if (typeof window.initLogs === 'function') {
                                window.initLogs();
                            } else {
                                console.error('initLogs函数未找到，请检查logs.js是否已加载');
                            }
                        }, 100);
                    }
                }
                break;
        case 'menus':
            if (api.isSuperAdmin()) {
                // 检查initMenus函数是否存在
                if (typeof initMenus === 'function') {
                    initMenus();
                } else if (typeof window.initMenus === 'function') {
                    window.initMenus();
                } else {
                    // 如果函数还未加载，延迟执行
                    setTimeout(() => {
                        if (typeof window.initMenus === 'function') {
                            window.initMenus();
                        } else {
                            console.error('initMenus函数未找到，请检查menus.js是否已加载');
                        }
                    }, 100);
                }
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
        // 使用专门的统计API获取真实数据库统计（不受权限过滤影响）
        let userCount = 0;
        let typeCount = 0;
        let productCount = 0;
        let activeProductsCount = 0;
        let disabledProductsCount = 0;
        
        try {
            const statisticsRes = await api.getStatistics();
            if (statisticsRes.code === 200 && statisticsRes.data) {
                userCount = statisticsRes.data.userCount || 0;
                typeCount = statisticsRes.data.productTypeCount || 0;
                productCount = statisticsRes.data.productCount || 0;
                activeProductsCount = statisticsRes.data.activeProductCount || 0;
                disabledProductsCount = statisticsRes.data.disabledProductCount || 0;
            } else {
                // 如果统计API失败，回退到原来的方式
                console.warn('统计API调用失败，使用备用方式');
                const [usersRes, typesRes, productsRes] = await Promise.all([
                    api.getUsers(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
                    api.getProductTypes(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
                    api.getProducts(1, 1).catch(() => ({ code: 200, data: { total: 0 } }))
                ]);
                
                userCount = usersRes.data?.total || 0;
                typeCount = typesRes.data?.total || 0;
                productCount = productsRes.data?.total || 0;
                
                // 获取启用商品数量
                try {
                    const activeProductsRes = await api.getProducts(1, 1000, null, true);
                    if (activeProductsRes.code === 200) {
                        const activeProducts = activeProductsRes.data.records || activeProductsRes.data.list || [];
                        activeProductsCount = activeProducts.length;
                    }
                    const allProductsRes = await api.getProducts(1, 1000);
                    if (allProductsRes.code === 200) {
                        const allProducts = allProductsRes.data.records || allProductsRes.data.list || [];
                        disabledProductsCount = allProducts.length - activeProductsCount;
                    }
                } catch (error) {
                    console.error('获取启用商品失败:', error);
                }
            }
        } catch (error) {
            console.error('获取统计数据失败:', error);
            // 如果统计API不存在或失败，回退到原来的方式
            const [usersRes, typesRes, productsRes] = await Promise.all([
                api.getUsers(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
                api.getProductTypes(1, 1).catch(() => ({ code: 200, data: { total: 0 } })),
                api.getProducts(1, 1).catch(() => ({ code: 200, data: { total: 0 } }))
            ]);
            
            userCount = usersRes.data?.total || 0;
            typeCount = typesRes.data?.total || 0;
            productCount = productsRes.data?.total || 0;
            
            // 获取启用商品数量
            try {
                const activeProductsRes = await api.getProducts(1, 1000, null, true);
                if (activeProductsRes.code === 200) {
                    const activeProducts = activeProductsRes.data.records || activeProductsRes.data.list || [];
                    activeProductsCount = activeProducts.length;
                }
                const allProductsRes = await api.getProducts(1, 1000);
                if (allProductsRes.code === 200) {
                    const allProducts = allProductsRes.data.records || allProductsRes.data.list || [];
                    disabledProductsCount = allProducts.length - activeProductsCount;
                }
            } catch (error) {
                console.error('获取启用商品失败:', error);
            }
        }

        // 更新显示
        const userCountEl = document.getElementById('userCount');
        const typeCountEl = document.getElementById('productTypeCount');
        const productCountEl = document.getElementById('productCount');
        const activeProductCountEl = document.getElementById('activeProductCount');

        if (userCountEl) userCountEl.textContent = userCount;
        if (typeCountEl) typeCountEl.textContent = typeCount;
        if (productCountEl) productCountEl.textContent = productCount;
        if (activeProductCountEl) activeProductCountEl.textContent = activeProductsCount;

        // 初始化图表
        initCharts(userCount, typeCount, productCount, activeProductsCount, disabledProductsCount);
    } catch (error) {
        console.error('加载控制台数据失败:', error);
    }
}

/**
 * 初始化ECharts图表
 */
function initCharts(userCount, typeCount, productCount, activeProductsCount, disabledProductsCount) {
    // 确保ECharts已加载
    if (typeof echarts === 'undefined') {
        console.error('ECharts未加载');
        return;
    }

    // 数据统计概览图表（柱状图）
    const overviewChartEl = document.getElementById('overviewChart');
    if (overviewChartEl) {
        const overviewChart = echarts.init(overviewChartEl);
        const overviewOption = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: ['用户', '商品类型', '商品总数', '启用商品'],
                axisLabel: {
                    color: '#666'
                }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: '#666'
                }
            },
            series: [{
                name: '数量',
                type: 'bar',
                data: [userCount, typeCount, productCount, activeProductsCount],
                itemStyle: {
                    // 为每个柱子设置不同的颜色
                    color: function(params) {
                        const colors = [
                            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#2E86AB' },
                                { offset: 1, color: '#06A77D' }
                            ]),
                            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#F18F01' },
                                { offset: 1, color: '#C73E1D' }
                            ]),
                            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#6A4C93' },
                                { offset: 1, color: '#9B59B6' }
                            ]),
                            new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: '#27AE60' },
                                { offset: 1, color: '#2ECC71' }
                            ])
                        ];
                        return colors[params.dataIndex] || colors[0];
                    }
                },
                label: {
                    show: true,
                    position: 'top',
                    color: '#333'
                }
            }]
        };
        overviewChart.setOption(overviewOption);

        // 响应式调整
        window.addEventListener('resize', () => {
            overviewChart.resize();
        });
    }

    // 商品状态分布图表（饼图）
    const productStatusChartEl = document.getElementById('productStatusChart');
    if (productStatusChartEl) {
        const productStatusChart = echarts.init(productStatusChartEl);
        const productStatusOption = {
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                textStyle: {
                    color: '#666'
                }
            },
            series: [{
                name: '商品状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}\n({d}%)'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '16',
                        fontWeight: 'bold'
                    }
                },
                data: [
                    { value: activeProductsCount, name: '启用商品', itemStyle: { color: '#06A77D' } },
                    { value: disabledProductsCount, name: '禁用商品', itemStyle: { color: '#E63946' } }
                ]
            }]
        };
        productStatusChart.setOption(productStatusOption);

        // 响应式调整
        window.addEventListener('resize', () => {
            productStatusChart.resize();
        });
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
    
    // 初始化头部信息栏
    initHeaderInfoBar();
    
    // 绑定统计卡片点击事件（跳转到对应页面）
    document.addEventListener('click', function(e) {
        const statCard = e.target.closest('.stat-card');
        if (statCard && statCard.dataset.page) {
            e.preventDefault();
            e.stopPropagation();
            const targetPage = statCard.dataset.page;
            console.log('统计卡片被点击，跳转到:', targetPage);
            showPage(targetPage);
        }
    });

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
 * 分页组件
 * @param {number} total - 总记录数
 * @param {number} current - 当前页码
 * @param {number|string} totalPagesOrPageType - 总页数或页面类型（兼容旧调用）
 * @param {string} pageType - 页面类型
 */
function renderPagination(total, current, totalPagesOrPageType, pageType) {
    let totalPages;
    
    // 兼容旧调用方式：renderPagination(total, current, pageType)
    if (typeof totalPagesOrPageType === 'string') {
        pageType = totalPagesOrPageType;
        totalPages = undefined;
    } else {
        totalPages = totalPagesOrPageType;
    }
    
    // 如果totalPages未提供，则计算
    if (totalPages === undefined) {
        let pageSize = 15;
        if (pageType === 'users') {
            pageSize = typeof pageSize !== 'undefined' ? pageSize : 15;
        } else if (pageType === 'product-types') {
            pageSize = typeof productTypesPageSize !== 'undefined' ? productTypesPageSize : 15;
        } else if (pageType === 'products') {
            pageSize = typeof productsPageSize !== 'undefined' ? productsPageSize : 15;
        }
        totalPages = Math.ceil(total / pageSize);
    }
    
    const paginationId = pageType === 'users' ? 'userPagination' : 
                        pageType === 'product-types' ? 'productTypePagination' : 
                        pageType === 'products' ? 'productPagination' : 'pagination';
    
    const pagination = document.getElementById(paginationId);
    if (!pagination) {
        console.warn(`未找到分页容器: ${paginationId}`);
        return;
    }
    
    if (totalPages <= 1) {
        pagination.innerHTML = `<div class="pagination-controls"><span class="page-info">共 ${total} 条</span></div>`;
        return;
    }
    
    let html = '<div class="pagination-controls">';
    
    // 上一页
    if (current > 1) {
        html += `<button class="btn btn-sm" onclick="goToPage(${current - 1}, '${pageType}')">上一页</button>`;
    } else {
        html += `<button class="btn btn-sm" disabled>上一页</button>`;
    }
    
    // 页码
    html += `<span class="page-info">第 ${current} / ${totalPages} 页，共 ${total} 条</span>`;
    
    // 下一页
    if (current < totalPages) {
        html += `<button class="btn btn-sm" onclick="goToPage(${current + 1}, '${pageType}')">下一页</button>`;
    } else {
        html += `<button class="btn btn-sm" disabled>下一页</button>`;
    }
    
    html += '</div>';
    pagination.innerHTML = html;
}

/**
 * 初始化头部信息栏（时间、日期、温度、在线人数）
 */
function initHeaderInfoBar() {
    // 立即更新一次
    updateHeaderInfo();
    
    // 每秒更新时间
    setInterval(() => {
        updateTimeAndDate();
    }, 1000);
    
    // 每30秒更新在线人数
    setInterval(() => {
        updateOnlineUserCount();
    }, 30000);
    
    // 每5分钟更新温度（模拟数据）
    setInterval(() => {
        updateTemperature();
    }, 300000);
    
    // 立即更新在线人数和温度
    updateOnlineUserCount();
    updateTemperature();
}

/**
 * 更新头部信息（时间、日期）
 */
function updateTimeAndDate() {
    const now = new Date();
    
    // 更新日期
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        const weekday = weekdays[now.getDay()];
        dateEl.textContent = `${year}-${month}-${day} ${weekday}`;
    }
    
    // 更新时间
    const timeEl = document.getElementById('currentTime');
    if (timeEl) {
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

/**
 * 更新在线人数
 */
async function updateOnlineUserCount() {
    const countEl = document.getElementById('onlineUserCount');
    if (!countEl) return;
    
    try {
        const response = await api.getRedisInfo();
        if (response.code === 200 && response.data) {
            const tokenCount = response.data.tokenCount || 0;
            countEl.textContent = tokenCount;
            // 添加点击事件，点击后显示在线用户列表
            if (!countEl.dataset.clickBound) {
                countEl.style.cursor = 'pointer';
                countEl.style.textDecoration = 'underline';
                countEl.title = '点击查看在线用户列表';
                countEl.addEventListener('click', showOnlineUsersModal);
                countEl.dataset.clickBound = 'true';
            }
        } else {
            countEl.textContent = '-';
        }
    } catch (error) {
        console.error('获取在线人数失败:', error);
        countEl.textContent = '-';
    }
}

/**
 * 显示在线用户列表模态框
 */
async function showOnlineUsersModal() {
    // 检查权限
    if (!api.isAdmin()) {
        showMessage('您没有权限查看在线用户列表', 'error');
        return;
    }
    
    // 获取当前登录用户信息
    let currentUsername = '';
    try {
        const userResponse = await api.getCurrentUser();
        if (userResponse.code === 200 && userResponse.data && userResponse.data.user) {
            currentUsername = userResponse.data.user.username || '';
        }
    } catch (error) {
        console.error('获取当前用户信息失败:', error);
    }
    
    let currentPage = 1;
    let pageSize = 15;
    let searchKeyword = '';
    
    // 创建模态框内容
    const modalContent = `
        <div class="online-users-container">
            <div class="filter-bar">
                <div class="filter-item">
                    <label>搜索：</label>
                    <input type="text" id="onlineUserSearchInput" class="form-control" placeholder="输入用户名或用户ID" style="width: 250px;">
                </div>
                <div class="filter-item">
                    <button type="button" class="btn btn-primary" id="searchOnlineUsersBtn">查询</button>
                    <button type="button" class="btn btn-secondary" id="resetOnlineUsersBtn">重置</button>
                </div>
            </div>
            <div class="table-container" style="overflow-x: auto;">
                <table class="data-table" id="onlineUsersTable" style="min-width: 1200px; table-layout: fixed;">
                    <thead>
                        <tr>
                            <th style="width: 120px;">用户名</th>
                            <th style="width: 150px;">用户ID</th>
                            <th style="width: 150px;">角色</th>
                            <th style="width: 180px;">登录时间</th>
                            <th style="width: 180px;">最后刷新</th>
                            <th style="width: 180px;">过期时间</th>
                            <th style="width: 100px;">操作</th>
                        </tr>
                    </thead>
                    <tbody id="onlineUsersTableBody">
                        <tr><td colspan="7" class="loading">加载中...</td></tr>
                    </tbody>
                </table>
            </div>
            <div id="onlineUsersPagination" class="pagination-toolbar">
                <!-- 分页控件将在这里动态渲染 -->
            </div>
        </div>
    `;
    
    const modal = createModal('在线用户列表', modalContent, '', null, 'xlarge');
    
    // 加载在线用户列表
    async function loadOnlineUsers(page = 1, keyword = '') {
        currentPage = page;
        searchKeyword = keyword;
        try {
            const response = await api.getOnlineUsers(page, pageSize, keyword);
            if (response.code === 200 && response.data) {
                const users = response.data.records || [];
                const total = response.data.total || 0;
                const totalPages = response.data.pages || 0;
                
                renderOnlineUsersTable(users);
                if (typeof renderCommonPagination === 'function') {
                    renderCommonPagination({
                        total: total,
                        current: page,
                        size: pageSize,
                        pages: totalPages,
                        records: users
                    }, 'onlineUsers', document.getElementById('onlineUsersPagination'));
                }
            } else {
                showMessage(response.message || '加载失败', 'error');
            }
        } catch (error) {
            console.error('加载在线用户列表失败:', error);
            showMessage(error.message || '加载失败', 'error');
        }
    }
    
    // 渲染在线用户表格
    function renderOnlineUsersTable(users) {
        const tbody = document.getElementById('onlineUsersTableBody');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="loading">暂无在线用户</td></tr>';
            return;
        }
        
        tbody.innerHTML = users.map(user => {
            const formatDateTime = (dateTime) => {
                if (!dateTime) return '-';
                try {
                    const date = new Date(dateTime);
                    return date.toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    });
                } catch (e) {
                    return dateTime;
                }
            };
            
            const roles = user.roles || [];
            const rolesDisplay = roles.length > 0 
                ? roles.map(r => {
                    if (r === 'SUPER_ADMIN') return '超级管理员';
                    if (r === 'ADMIN') return '管理员';
                    if (r === 'USER') return '普通用户';
                    return r;
                }).join(', ')
                : '无';
            
            // 检查当前用户是否有权限踢该用户下线
            const isSuperAdmin = api.isSuperAdmin();
            const isAdmin = api.isAdmin();
            const hasSuperAdminRole = roles.includes('SUPER_ADMIN');
            const isCurrentUser = currentUsername && user.username && currentUsername === user.username;
            
            // 权限规则：
            // 1. 不能踢自己下线
            // 2. 管理员不能踢超级管理员
            // 3. 超级管理员可以踢任何人（包括管理员和普通用户，但不能踢自己）
            let canKick = false;
            let kickButtonHtml = '';
            
            if (isCurrentUser) {
                // 不能踢自己下线
                canKick = false;
                kickButtonHtml = '<span class="text-muted" style="font-size: 12px;">自己</span>';
            } else if (isSuperAdmin) {
                // 超级管理员可以踢任何人（除了自己）
                canKick = true;
            } else if (isAdmin) {
                // 管理员不能踢超级管理员
                canKick = !hasSuperAdminRole;
            }
            
            if (canKick && !isCurrentUser) {
                kickButtonHtml = `<button class="btn btn-sm btn-danger" onclick="kickUserOffline('${escapeHtml(user.token)}', '${escapeHtml(user.username || '')}')">踢下线</button>`;
            } else if (!isCurrentUser) {
                kickButtonHtml = '<span class="text-muted" style="font-size: 12px;">无权限</span>';
            }
            
            return `
                <tr>
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(user.username || '-')}">${escapeHtml(user.username || '-')}</td>
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(user.userId || '-')}">${escapeHtml(user.userId || '-')}</td>
                    <td style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(rolesDisplay)}">${escapeHtml(rolesDisplay)}</td>
                    <td style="white-space: nowrap;">${formatDateTime(user.createTime)}</td>
                    <td style="white-space: nowrap;">${formatDateTime(user.lastRefreshTime)}</td>
                    <td style="white-space: nowrap;">${formatDateTime(user.expireTime)}</td>
                    <td style="white-space: nowrap;">${kickButtonHtml}</td>
                </tr>
            `;
        }).join('');
    }
    
    // 绑定搜索事件
    const searchBtn = document.getElementById('searchOnlineUsersBtn');
    const resetBtn = document.getElementById('resetOnlineUsersBtn');
    const searchInput = document.getElementById('onlineUserSearchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            searchKeyword = searchInput ? searchInput.value.trim() : '';
            currentPage = 1;
            loadOnlineUsers(1, searchKeyword);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            searchKeyword = '';
            currentPage = 1;
            loadOnlineUsers(1, '');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchKeyword = searchInput.value.trim();
                currentPage = 1;
                loadOnlineUsers(1, searchKeyword);
            }
        });
    }
    
    // 将loadOnlineUsers暴露到全局，供分页控件使用
    window.loadOnlineUsersInModal = (page) => {
        loadOnlineUsers(page, searchKeyword);
    };
    
    // 初始化加载
    loadOnlineUsers(1, '');
    
    // 定义踢用户下线函数（在模态框作用域内）
    window.kickUserOffline = async function(token, username) {
        if (!await showConfirmModal('确认踢下线', `确定要踢用户 "${username}" 下线吗？`)) {
            return;
        }
        
        try {
            const response = await api.kickUserOffline(token);
            if (response.code === 200) {
                showMessage('用户已下线', 'success');
                // 重新加载列表
                loadOnlineUsers(currentPage, searchKeyword);
                // 更新在线人数
                updateOnlineUserCount();
            } else {
                showMessage(response.message || '操作失败', 'error');
            }
        } catch (error) {
            console.error('踢用户下线失败:', error);
            showMessage(error.message || '操作失败', 'error');
        }
    };
}

/**
 * 更新温度（模拟数据，实际项目中可以接入天气API）
 */
function updateTemperature() {
    const tempEl = document.getElementById('currentTemperature');
    if (!tempEl) return;
    
    // 模拟温度：15-30度之间随机，带小数
    const baseTemp = 22;
    const variation = Math.random() * 8 - 4; // -4 到 +4 的随机变化
    const temperature = (baseTemp + variation).toFixed(1);
    tempEl.textContent = `${temperature}°C`;
}

/**
 * 更新所有头部信息
 */
function updateHeaderInfo() {
    updateTimeAndDate();
    updateOnlineUserCount();
    updateTemperature();
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


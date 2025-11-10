/**
 * 菜单管理模块
 */

let menus = [];
let currentMenuPage = 1;
let menuPageSize = 15;
let menuSearchKeyword = '';

/**
 * 初始化菜单管理
 */
function initMenus() {
    loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
    bindMenuEvents();
}

/**
 * 绑定菜单管理事件
 */
function bindMenuEvents() {
    const addBtn = document.getElementById('addMenuBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editMenu();
        });
    }
    
    const configBtn = document.getElementById('configurePermissionsBtn');
    if (configBtn) {
        configBtn.addEventListener('click', () => {
            configureMenuPermissions();
        });
    }
    
    // 绑定查询和重置事件
    const searchBtn = document.getElementById('searchMenusBtn');
    const resetBtn = document.getElementById('resetMenusBtn');
    const searchInput = document.getElementById('menuSearchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            menuSearchKeyword = searchInput ? searchInput.value.trim() : '';
            currentMenuPage = 1;
            loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            menuSearchKeyword = '';
            currentMenuPage = 1;
            loadMenus(currentMenuPage, menuPageSize, '');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                menuSearchKeyword = searchInput.value.trim();
                currentMenuPage = 1;
                loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
            }
        });
    }
}

/**
 * 加载菜单列表
 */
async function loadMenus(page = 1, size = 15, keyword = '') {
    try {
        const response = await api.getMenus(page, size, keyword);
        if (response.code === 200) {
            const pageData = response.data;
            menus = pageData.records || [];
            renderMenusTable(menus);
            
            // 渲染分页控件
            const total = pageData.total || 0;
            const current = pageData.current || 1;
            const pageSize = pageData.size || 15;
            const pages = pageData.pages || 1;
            
            renderCommonPagination({
                total,
                current,
                size: pageSize,
                pages,
                paginationId: 'menusPagination',
                pageType: 'menus',
                onPageChange: (newPage) => {
                    currentMenuPage = newPage;
                    loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
                },
                onSizeChange: (newSize) => {
                    menuPageSize = newSize;
                    currentMenuPage = 1;
                    loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
                },
                defaultSize: 15
            });
        } else {
            showMessage(response.message || '加载菜单列表失败', 'error');
        }
    } catch (error) {
        console.error('加载菜单列表失败:', error);
        showMessage(error.message || '加载菜单列表失败', 'error');
        document.getElementById('menusTableBody').innerHTML = 
            '<tr><td colspan="8" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染菜单表格
 */
function renderMenusTable(menuList) {
    const tbody = document.getElementById('menusTableBody');
    
    if (menuList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = menuList.map(menu => {
        const statusText = menu.enabled ? '启用' : '禁用';
        const statusClass = menu.enabled ? 'success' : 'secondary';
        
        return `
            <tr>
                <td>
                    <input type="checkbox" class="menu-row-checkbox" value="${menu.id}" 
                           onchange="updatePermissionConfigButtonState()">
                </td>
                <td>${escapeHtml(menu.menuName || '-')}</td>
                <td>${escapeHtml(menu.menuCode || '-')}</td>
                <td>${escapeHtml(menu.path || '-')}</td>
                <td>${escapeHtml(menu.icon || '-')}</td>
                <td>${menu.sortOrder || 0}</td>
                <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editMenu('${menu.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteMenu('${menu.id}')">删除</button>
                </td>
            </tr>
        `;
    }).join('');
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
 * 更新权限配置按钮状态
 */
function updatePermissionConfigButtonState() {
    const checkboxes = document.querySelectorAll('.menu-row-checkbox:checked');
    const configBtn = document.getElementById('configurePermissionsBtn');
    if (configBtn) {
        if (checkboxes.length === 1) {
            configBtn.disabled = false;
        } else {
            configBtn.disabled = true;
        }
    }
}

/**
 * 全选/取消全选菜单
 */
function toggleSelectAllMenusInTable(checkbox) {
    const checkboxes = document.querySelectorAll('.menu-row-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checkbox.checked;
    });
    updatePermissionConfigButtonState();
}

/**
 * 编辑菜单（新增或修改）
 */
async function editMenu(menuId = null) {
    let menu = null;
    if (menuId) {
        try {
            const response = await api.getMenuById(menuId);
            if (response.code === 200) {
                menu = response.data;
            } else {
                showMessage(response.message || '获取菜单信息失败', 'error');
                return;
            }
        } catch (error) {
            showMessage(error.message || '获取菜单信息失败', 'error');
            return;
        }
    }
    
    const isEdit = !!menu;
    const title = isEdit ? '编辑菜单' : '新增菜单';
    
    const formContent = `
        <form id="menuForm">
            <div class="form-group">
                <label>菜单名称 <span class="required">*</span></label>
                <input type="text" id="menuName" class="form-control" value="${menu?.menuName || ''}" required>
            </div>
            <div class="form-group">
                <label>菜单代码 <span class="required">*</span></label>
                <input type="text" id="menuCode" class="form-control" value="${menu?.menuCode || ''}" required>
            </div>
            <div class="form-group">
                <label>路径</label>
                <input type="text" id="menuPath" class="form-control" value="${menu?.path || ''}" placeholder="前端路由路径">
            </div>
            <div class="form-group">
                <label>图标</label>
                <input type="text" id="menuIcon" class="form-control" value="${menu?.icon || ''}" placeholder="图标（如：📊）">
            </div>
            <div class="form-group">
                <label>排序</label>
                <input type="number" id="menuSortOrder" class="form-control" value="${menu?.sortOrder || 0}" min="0">
            </div>
            <div class="form-group">
                <label>菜单类型</label>
                <select id="menuType" class="form-control">
                    <option value="MENU" ${menu?.menuType === 'MENU' || !menu ? 'selected' : ''}>菜单</option>
                    <option value="BUTTON" ${menu?.menuType === 'BUTTON' ? 'selected' : ''}>按钮</option>
                </select>
            </div>
            <div class="form-group">
                <label>状态</label>
                <select id="menuEnabled" class="form-control">
                    <option value="true" ${menu?.enabled !== false ? 'selected' : ''}>启用</option>
                    <option value="false" ${menu?.enabled === false ? 'selected' : ''}>禁用</option>
                </select>
            </div>
            <div class="form-group">
                <label>描述</label>
                <textarea id="menuDescription" class="form-control" rows="3">${menu?.description || ''}</textarea>
            </div>
        </form>
    `;
    
    const modal = createModal(title, formContent, '', async () => {
        const menuName = document.getElementById('menuName').value.trim();
        const menuCode = document.getElementById('menuCode').value.trim();
        const path = document.getElementById('menuPath').value.trim();
        const icon = document.getElementById('menuIcon').value.trim();
        const sortOrder = parseInt(document.getElementById('menuSortOrder').value) || 0;
        const menuType = document.getElementById('menuType').value;
        const enabled = document.getElementById('menuEnabled').value === 'true';
        const description = document.getElementById('menuDescription').value.trim();
        
        if (!menuName || !menuCode) {
            showMessage('菜单名称和菜单代码不能为空', 'error');
            return false;
        }
        
        const menuData = {
            menuName,
            menuCode,
            path: path || null,
            icon: icon || null,
            sortOrder,
            menuType,
            enabled,
            description: description || null
        };
        
        try {
            let response;
            if (isEdit) {
                response = await api.updateMenu(menuId, menuData);
            } else {
                response = await api.createMenu(menuData);
            }
            
            if (response.code === 200) {
                showMessage(isEdit ? '更新成功' : '创建成功', 'success');
                loadMenus();
                // 刷新菜单权限（重新加载用户信息）
                if (typeof updateUserInfo === 'function') {
                    const userResponse = await api.getCurrentUser();
                    if (userResponse.code === 200 && userResponse.data) {
                        api.setUserInfo(
                            userResponse.data.user?.username || api.username,
                            userResponse.data.roles || [],
                            userResponse.data.menus || []
                        );
                        updateUserInfo();
                        updateMenuVisibility();
                    }
                }
                return true;
            } else {
                showMessage(response.message || (isEdit ? '更新失败' : '创建失败'), 'error');
                return false;
            }
        } catch (error) {
            showMessage(error.message || (isEdit ? '更新失败' : '创建失败'), 'error');
            return false;
        }
    });
}

/**
 * 删除菜单
 */
async function deleteMenu(menuId) {
    const menu = menus.find(m => m.id === menuId);
    if (!menu) {
        showMessage('菜单不存在', 'error');
        return;
    }
    
    const confirmed = await showConfirmModal(
        '确认删除',
        `确定要删除菜单"${menu.menuName}"吗？此操作不可恢复。`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await api.deleteMenu(menuId);
        if (response.code === 200) {
            showMessage('删除成功', 'success');
            loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
            // 刷新菜单权限
            if (typeof updateUserInfo === 'function') {
                const userResponse = await api.getCurrentUser();
                if (userResponse.code === 200 && userResponse.data) {
                    api.setUserInfo(
                        userResponse.data.user?.username || api.username,
                        userResponse.data.roles || [],
                        userResponse.data.menus || []
                    );
                    updateUserInfo();
                    updateMenuVisibility();
                }
            }
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 配置菜单权限
 */
async function configureMenuPermissions() {
    // 获取选中的菜单
    const checkboxes = document.querySelectorAll('.menu-row-checkbox:checked');
    if (checkboxes.length !== 1) {
        showMessage('请选择一条菜单信息', 'error');
        return;
    }
    
    const menuId = checkboxes[0].value;
    const menu = menus.find(m => m.id === menuId);
    if (!menu) {
        showMessage('菜单不存在', 'error');
        return;
    }
    
    // 获取菜单已关联的安全权限ID
    let menuPermissionIds = [];
    try {
        const permissionIdsResponse = await api.getMenuPermissionIds(menuId);
        if (permissionIdsResponse.code === 200) {
            menuPermissionIds = permissionIdsResponse.data || [];
        }
    } catch (error) {
        console.warn('获取菜单权限失败:', error);
        // 不阻止继续，只是警告
    }
    
    // 创建权限配置表单
    const formContent = `
        <form id="menuPermissionForm">
            <div class="form-group" style="margin-bottom: 20px;">
                <label style="font-size: 16px; font-weight: bold;">菜单：<strong>${escapeHtml(menu.menuName)}</strong> (${escapeHtml(menu.menuCode)})</label>
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
                <label>路径：<span class="text-muted">${escapeHtml(menu.path || '-')}</span></label>
            </div>
            <div class="form-group" style="margin-bottom: 20px;">
                <label>已选接口权限：</label>
                <div id="selectedPermissionsList" style="min-height: 50px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; margin-bottom: 12px;">
                    <span class="text-muted">已选接口权限将显示在这里</span>
                </div>
            </div>
            <div class="form-group">
                <label style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">选择接口权限（可多选）：</label>
                <div style="margin-bottom: 12px;">
                    <div class="filter-bar" style="margin-bottom: 12px;">
                        <div class="filter-item">
                            <label>搜索：</label>
                            <input type="text" id="permissionSearchInput" class="form-control" placeholder="输入路径模式、描述或所需角色" style="width: 250px;">
                        </div>
                        <div class="filter-item">
                            <button type="button" class="btn btn-primary" id="searchPermissionsBtn">查询</button>
                            <button type="button" class="btn btn-secondary" id="resetPermissionsBtn">重置</button>
                        </div>
                    </div>
                    <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                        <table class="data-table" id="menuPermissionTable">
                            <thead>
                                <tr>
                                    <th style="width: 50px;">
                                        <input type="checkbox" id="selectAllMenuPermissions" onchange="toggleSelectAllPermissions(this)">
                                    </th>
                                    <th>路径模式</th>
                                    <th>HTTP方法</th>
                                    <th>所需角色</th>
                                    <th>描述</th>
                                </tr>
                            </thead>
                            <tbody id="menuPermissionTableBody">
                                <tr><td colspan="5" class="loading">加载中...</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="menuPermissionPagination" style="margin-top: 12px; text-align: center;">
                        <!-- 分页控件将在这里动态渲染 -->
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">保存</button>
            </div>
        </form>
    `;
    
    const modal = createModal('配置菜单接口权限', formContent, '', null, 'xlarge');
    
    // 存储数据到模态框
    modal.dataset.menuId = menuId;
    modal.dataset.permissionPage = '1';
    modal.dataset.permissionPageSize = '15';
    modal.dataset.permissionKeyword = '';
    modal.dataset.selectedPermissionIds = JSON.stringify(menuPermissionIds);
    
    // 等待模态框完全渲染后再初始化
    setTimeout(() => {
        // 初始化权限列表（第一页）
        renderSecurityPermissionTable(1, modal);
        
        // 初始化已选权限列表
        updateSelectedPermissionsList();
        
        // 绑定查询和重置事件
        bindSecurityPermissionSearchEvents(modal);
    }, 200);
    
    // 绑定表单提交事件
    const formEl = modal.querySelector('#menuPermissionForm');
    if (formEl) {
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
            
            const confirmed = await showConfirmModal(
                '确认保存',
                `确定要为菜单"${menu.menuName}"配置 ${selectedPermissionIds.length} 个接口权限吗？`
            );
            
            if (!confirmed) {
                return;
            }
            
            try {
                const submitBtn = formEl.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : '保存';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = '保存中...';
                }
                
                const response = await api.assignPermissionsToMenu(menuId, selectedPermissionIds);
                if (response.code === 200) {
                    showMessage('接口权限配置成功', 'success');
                    closeModal();
                    loadMenus(currentMenuPage, menuPageSize, menuSearchKeyword);
                } else {
                    showMessage(response.message || '接口权限配置失败', 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            } catch (error) {
                console.error('保存接口权限配置失败:', error);
                showMessage('保存接口权限配置失败: ' + (error.message || '未知错误'), 'error');
                const submitBtn = formEl.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = '保存';
                }
            }
        });
    }
}

/**
 * 更新已选权限列表显示
 */
async function updateSelectedPermissionsList() {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) return;
    
    const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
    
    if (selectedPermissionIds.length === 0) {
        const selectedListEl = document.getElementById('selectedPermissionsList');
        if (selectedListEl) {
            selectedListEl.innerHTML = '<span class="text-muted">已选接口权限将显示在这里</span>';
        }
        return;
    }
    
    // 获取所有权限信息（用于显示）
    try {
        const response = await api.getAllPermissionsList();
        if (response.code === 200) {
            const allPermissions = response.data || [];
            const selectedPermissions = allPermissions.filter(p => selectedPermissionIds.includes(p.id));
            
            const selectedListEl = document.getElementById('selectedPermissionsList');
            if (selectedListEl) {
                selectedListEl.innerHTML = selectedPermissions.map(permission => `
                    <span class="selected-permission-item" data-permission-id="${permission.id}" style="display: inline-block; padding: 4px 8px; margin: 4px; background: #28a745; color: white; border-radius: 4px; font-size: 12px;">
                        ${escapeHtml(permission.pathPattern || '-')} (${escapeHtml(permission.requiredRoles || '-')})
                        <span onclick="removeSelectedSecurityPermission('${permission.id}')" style="margin-left: 4px; cursor: pointer;">×</span>
                    </span>
                `).join('');
            }
        }
    } catch (error) {
        console.error('获取权限信息失败:', error);
    }
}

/**
 * 移除已选安全权限
 */
function removeSelectedSecurityPermission(permissionId) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
    const index = selectedPermissionIds.indexOf(permissionId);
    
    if (index > -1) {
        selectedPermissionIds.splice(index, 1);
        modal.dataset.selectedPermissionIds = JSON.stringify(selectedPermissionIds);
        
        const checkbox = modal ? modal.querySelector(`#menuPermissionTableBody input[type="checkbox"][value="${permissionId}"]`) : document.querySelector(`#menuPermissionTableBody input[type="checkbox"][value="${permissionId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // 更新全选复选框状态（在模态框内查找）
        let allCheckboxes = [];
        let selectAllCheckbox = null;
        if (modal) {
            allCheckboxes = Array.from(modal.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
            selectAllCheckbox = modal.querySelector('#selectAllMenuPermissions');
        }
        if (allCheckboxes.length === 0) {
            allCheckboxes = Array.from(document.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
        }
        if (!selectAllCheckbox) {
            selectAllCheckbox = document.getElementById('selectAllMenuPermissions');
        }
        if (selectAllCheckbox && allCheckboxes.length > 0) {
            const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
            const someChecked = Array.from(allCheckboxes).some(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        }
        
        updateSelectedPermissionsList();
    }
}

/**
 * 渲染权限表格（已废弃，保留用于兼容）
 */
function renderPermissionTable(page = 1, modalElement = null) {
    let modal = modalElement;
    if (!modal) {
        modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    }
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const allPermissionsStr = modal.dataset.allPermissions;
    if (!allPermissionsStr) {
        console.error('模态框中没有权限数据');
        const tbody = document.getElementById('permissionTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">未找到权限数据</td></tr>';
        }
        return;
    }
    
    let allPermissions;
    try {
        allPermissions = JSON.parse(allPermissionsStr);
    } catch (e) {
        console.error('解析权限数据失败:', e);
        const tbody = document.getElementById('permissionTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">权限数据格式错误</td></tr>';
        }
        return;
    }
    
    if (!Array.isArray(allPermissions)) {
        console.error('权限数据格式错误，不是数组:', allPermissions);
        const tbody = document.getElementById('permissionTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">权限数据格式错误</td></tr>';
        }
        return;
    }
    
    const permissionPageSize = 15;
    
    // 获取搜索关键词
    const searchInput = document.getElementById('permissionSearchInput');
    const keyword = searchInput ? searchInput.value.trim() : '';
    
    // 过滤权限
    let filteredPermissions = allPermissions;
    if (keyword) {
        filteredPermissions = allPermissions.filter(permission => 
            (permission.pathPattern && permission.pathPattern.toLowerCase().includes(keyword.toLowerCase())) ||
            (permission.description && permission.description.toLowerCase().includes(keyword.toLowerCase()))
        );
    }
    
    // 更新过滤后的权限列表
    modal.dataset.filteredPermissions = JSON.stringify(filteredPermissions);
    
    // 分页
    const totalPages = Math.ceil(filteredPermissions.length / permissionPageSize);
    const start = (page - 1) * permissionPageSize;
    const end = start + permissionPageSize;
    const pagePermissions = filteredPermissions.slice(start, end);
    
    // 获取已选中的权限ID
    const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
    
    // 渲染表格
    const tbody = document.getElementById('permissionTableBody');
    if (!tbody) {
        console.error('未找到表格tbody元素');
        return;
    }
    
    if (pagePermissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = pagePermissions.map(permission => {
            const isChecked = selectedPermissionIds.includes(permission.id);
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="permission-checkbox" value="${permission.id}" 
                               ${isChecked ? 'checked' : ''} 
                               onchange="toggleSecurityPermissionSelection('${permission.id}', this)">
                    </td>
                    <td>${escapeHtml(permission.pathPattern || '-')}</td>
                    <td>${escapeHtml(permission.httpMethod || '-')}</td>
                    <td>${escapeHtml(permission.requiredRoles || '-')}</td>
                    <td>${escapeHtml(permission.description || '-')}</td>
                </tr>
            `;
        }).join('');
    }
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAllPermissions');
    if (selectAllCheckbox && pagePermissions.length > 0) {
        const allChecked = pagePermissions.every(permission => selectedPermissionIds.includes(permission.id));
        const someChecked = pagePermissions.some(permission => selectedPermissionIds.includes(permission.id));
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    } else if (selectAllCheckbox) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    }
    
    // 更新分页控件（已废弃，使用 updateSecurityPermissionPagination）
    // updatePermissionPagination(page, totalPages, filteredPermissions.length);
    
    // 更新已选权限列表
    updateSelectedPermissionsList();
}

/**
 * 绑定安全权限查询事件
 */
function bindSecurityPermissionSearchEvents(modal) {
    setTimeout(() => {
        // 在模态框内查找元素，避免与页面中的同名元素冲突
        let searchBtn = null;
        let resetBtn = null;
        let searchInput = null;
        if (modal) {
            searchBtn = modal.querySelector('#searchPermissionsBtn');
            resetBtn = modal.querySelector('#resetPermissionsBtn');
            searchInput = modal.querySelector('#permissionSearchInput');
        }
        if (!searchBtn) searchBtn = document.getElementById('searchPermissionsBtn');
        if (!resetBtn) resetBtn = document.getElementById('resetPermissionsBtn');
        if (!searchInput) searchInput = document.getElementById('permissionSearchInput');
        
        if (searchBtn) {
            const newSearchBtn = searchBtn.cloneNode(true);
            searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
            newSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (searchInput) {
                    modal.dataset.permissionKeyword = searchInput.value.trim();
                }
                modal.dataset.permissionPage = '1';
                renderSecurityPermissionTable(1, modal);
            });
        }
        
        if (resetBtn) {
            const newResetBtn = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
            newResetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (searchInput) searchInput.value = '';
                modal.dataset.permissionKeyword = '';
                modal.dataset.permissionPage = '1';
                renderSecurityPermissionTable(1, modal);
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    modal.dataset.permissionKeyword = searchInput.value.trim();
                    modal.dataset.permissionPage = '1';
                    renderSecurityPermissionTable(1, modal);
                }
            });
        }
    }, 100);
}

/**
 * 全选/取消全选安全权限
 */
function toggleSelectAllPermissions(checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    // 在模态框内查找复选框
    let checkboxes = [];
    if (modal) {
        checkboxes = Array.from(modal.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
    }
    if (checkboxes.length === 0) {
        checkboxes = Array.from(document.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
    }
    const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
    
    checkboxes.forEach(cb => {
        const permissionId = cb.value;
        const index = selectedPermissionIds.indexOf(permissionId);
        
        if (checkbox.checked) {
            cb.checked = true;
            if (index === -1) {
                selectedPermissionIds.push(permissionId);
            }
        } else {
            cb.checked = false;
            if (index > -1) {
                selectedPermissionIds.splice(index, 1);
            }
        }
    });
    
    modal.dataset.selectedPermissionIds = JSON.stringify(selectedPermissionIds);
    updateSelectedPermissionsList();
}

/**
 * 切换安全权限选择
 */
function toggleSecurityPermissionSelection(permissionId, checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
    const index = selectedPermissionIds.indexOf(permissionId);
    
    if (checkbox.checked) {
        if (index === -1) {
            selectedPermissionIds.push(permissionId);
        }
    } else {
        if (index > -1) {
            selectedPermissionIds.splice(index, 1);
        }
    }
    
    modal.dataset.selectedPermissionIds = JSON.stringify(selectedPermissionIds);
    
    // 更新全选复选框状态（在模态框内查找）
    let allCheckboxes = [];
    let selectAllCheckbox = null;
    if (modal) {
        allCheckboxes = Array.from(modal.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
        selectAllCheckbox = modal.querySelector('#selectAllMenuPermissions');
    }
    if (allCheckboxes.length === 0) {
        allCheckboxes = Array.from(document.querySelectorAll('#menuPermissionTableBody input[type="checkbox"].permission-checkbox'));
    }
    if (!selectAllCheckbox) {
        selectAllCheckbox = document.getElementById('selectAllMenuPermissions');
    }
    if (selectAllCheckbox && allCheckboxes.length > 0) {
        const allChecked = Array.from(allCheckboxes).every(cb => cb.checked);
        const someChecked = Array.from(allCheckboxes).some(cb => cb.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    updateSelectedPermissionsList();
}

/**
 * 渲染安全权限表格
 */
async function renderSecurityPermissionTable(page = 1, modalElement = null) {
    let modal = modalElement;
    if (!modal) {
        modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    }
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    // 在模态框内查找 tbody 元素，避免与页面中的同名元素冲突
    let tbody = null;
    if (modal) {
        tbody = modal.querySelector('#menuPermissionTableBody');
    }
    if (!tbody) {
        // 回退到全局查找
        tbody = document.getElementById('menuPermissionTableBody');
    }
    if (!tbody) {
        console.error('未找到表格tbody元素，modal:', modal);
        return;
    }
    
    // 显示加载状态
    tbody.innerHTML = '<tr><td colspan="5" class="loading">加载中...</td></tr>';
    
    try {
        // 获取分页参数
        const pageSize = parseInt(modal.dataset.permissionPageSize || '15');
        const keyword = modal.dataset.permissionKeyword || '';
        
        console.log('开始获取权限列表，页码:', page, '每页:', pageSize, '关键词:', keyword);
        
        // 从后端获取分页数据
        const response = await api.getPermissions(page, pageSize, keyword);
        
        console.log('权限列表响应:', response);
        
        if (response.code === 200) {
            const pageData = response.data;
            console.log('分页数据:', pageData);
            
            const permissions = pageData.records || [];
            const total = pageData.total || 0;
            const totalPages = pageData.pages || 1;
            const current = pageData.current || page;
            
            console.log('权限列表:', permissions, '总数:', total, '总页数:', totalPages, '当前页:', current);
            
            // 更新模态框中的分页信息
            modal.dataset.permissionPage = current.toString();
            
            // 获取已选中的权限ID
            const selectedPermissionIds = JSON.parse(modal.dataset.selectedPermissionIds || '[]');
            console.log('已选权限ID:', selectedPermissionIds);
            
            // 渲染表格
            if (permissions.length === 0) {
                console.log('权限列表为空');
                tbody.innerHTML = '<tr><td colspan="5" class="text-center">暂无数据</td></tr>';
            } else {
                console.log('开始渲染权限表格，共', permissions.length, '条记录');
                const tableHTML = permissions.map(permission => {
                    const isChecked = selectedPermissionIds.includes(permission.id);
                    console.log('权限项:', permission, '是否选中:', isChecked);
                    return `
                        <tr>
                            <td>
                                <input type="checkbox" class="permission-checkbox" value="${permission.id}" 
                                       ${isChecked ? 'checked' : ''} 
                                       onchange="toggleSecurityPermissionSelection('${permission.id}', this)">
                            </td>
                            <td>${escapeHtml(permission.pathPattern || '-')}</td>
                            <td>${escapeHtml(permission.httpMethod || '-')}</td>
                            <td>${escapeHtml(permission.requiredRoles || '-')}</td>
                            <td>${escapeHtml(permission.description || '-')}</td>
                        </tr>
                    `;
                }).join('');
                console.log('生成的表格HTML长度:', tableHTML.length);
                console.log('设置前的tbody内容:', tbody.innerHTML.substring(0, 100));
                tbody.innerHTML = tableHTML;
                console.log('设置后的tbody内容:', tbody.innerHTML.substring(0, 200));
                console.log('tbody子元素数量:', tbody.children.length);
                console.log('tbody元素:', tbody);
                console.log('表格渲染完成');
                
                // 验证渲染结果
                setTimeout(() => {
                    const renderedRows = tbody.querySelectorAll('tr');
                    console.log('延迟检查：tbody中的tr数量:', renderedRows.length);
                    if (renderedRows.length === 0) {
                        console.error('警告：tbody中没有渲染出任何行！');
                        console.log('tbody.innerHTML:', tbody.innerHTML);
                    } else {
                        console.log('成功渲染', renderedRows.length, '行数据');
                    }
                }, 100);
            }
            
            // 更新全选复选框状态（在模态框内查找）
            let selectAllCheckbox = null;
            if (modal) {
                selectAllCheckbox = modal.querySelector('#selectAllMenuPermissions');
            }
            if (!selectAllCheckbox) {
                selectAllCheckbox = document.getElementById('selectAllMenuPermissions');
            }
            if (selectAllCheckbox && permissions.length > 0) {
                const allChecked = permissions.every(permission => selectedPermissionIds.includes(permission.id));
                const someChecked = permissions.some(permission => selectedPermissionIds.includes(permission.id));
                selectAllCheckbox.checked = allChecked;
                selectAllCheckbox.indeterminate = someChecked && !allChecked;
            } else if (selectAllCheckbox) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
            
            // 更新分页控件
            updateSecurityPermissionPagination(current, totalPages, total);
            
            // 更新已选权限列表
            updateSelectedPermissionsList();
        } else {
            console.error('获取权限列表失败:', response.message);
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">加载失败: ' + escapeHtml(response.message || '未知错误') + '</td></tr>';
        }
    } catch (error) {
        console.error('渲染权限表格失败:', error);
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">加载失败: ' + escapeHtml(error.message || '未知错误') + '</td></tr>';
    }
}

/**
 * 更新安全权限分页控件
 */
function updateSecurityPermissionPagination(currentPage, totalPages, total = 0) {
    // 在模态框内查找分页元素
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    let paginationEl = null;
    if (modal) {
        paginationEl = modal.querySelector('#menuPermissionPagination');
    }
    if (!paginationEl) {
        paginationEl = document.getElementById('menuPermissionPagination');
    }
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = total > 0 ? `<span style="color: #6c757d;">共 ${total} 条记录</span>` : '';
        return;
    }
    
    let paginationHTML = '<div style="display: flex; justify-content: center; align-items: center; gap: 8px;">';
    
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeSecurityPermissionPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeSecurityPermissionPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button type="button" class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changeSecurityPermissionPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeSecurityPermissionPage(${totalPages})">${totalPages}</button>`;
    }
    
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeSecurityPermissionPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    paginationHTML += `<span style="margin-left: 16px; color: #6c757d;">共 ${total} 条记录，${totalPages} 页</span>`;
    paginationHTML += '</div>';
    
    paginationEl.innerHTML = paginationHTML;
}

/**
 * 切换安全权限分页
 */
function changeSecurityPermissionPage(page) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('menuPermissionForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    modal.dataset.permissionPage = page.toString();
    renderSecurityPermissionTable(page, modal);
}


// 导出供全局使用
window.initMenus = initMenus;
window.editMenu = editMenu;
window.deleteMenu = deleteMenu;
window.loadMenus = loadMenus;
window.configureMenuPermissions = configureMenuPermissions;
window.updatePermissionConfigButtonState = updatePermissionConfigButtonState;
window.toggleSelectAllMenusInTable = toggleSelectAllMenusInTable;
window.renderSecurityPermissionTable = renderSecurityPermissionTable;
window.bindSecurityPermissionSearchEvents = bindSecurityPermissionSearchEvents;
window.toggleSelectAllPermissions = toggleSelectAllPermissions;
window.toggleSecurityPermissionSelection = toggleSecurityPermissionSelection;
window.changeSecurityPermissionPage = changeSecurityPermissionPage;
window.updateSecurityPermissionPagination = updateSecurityPermissionPagination;
window.updateSelectedPermissionsList = updateSelectedPermissionsList;
window.removeSelectedSecurityPermission = removeSelectedSecurityPermission;
window.escapeHtml = escapeHtml;
window.currentMenuPage = currentMenuPage;
window.menuPageSize = menuPageSize;
window.menuSearchKeyword = menuSearchKeyword;


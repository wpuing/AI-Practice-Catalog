/**
 * 用户管理模块
 */

let currentPage = 1;
let pageSize = 15; // 默认15条
let userSearchKeyword = ''; // 用户搜索关键词

/**
 * 加载用户列表
 */
async function loadUsers(page = 1, keyword = userSearchKeyword) {
    try {
        userSearchKeyword = keyword || '';
        const response = await api.getUsers(page, pageSize, keyword);
        // 兼容两种响应格式：Result格式和Map格式
        const isSuccess = response.code === 200 || (response.success === true);
        
        if (isSuccess) {
            // 兼容不同的数据结构
            let users = [];
            let total = 0;
            
            if (response.data) {
                // MyBatis-Plus分页格式：response.data.records 或 response.data.list
                if (Array.isArray(response.data.records)) {
                    users = response.data.records;
                    total = response.data.total || 0;
                } else if (Array.isArray(response.data.list)) {
                    users = response.data.list;
                    total = response.data.total || 0;
                } else if (Array.isArray(response.data)) {
                    // 直接是数组
                    users = response.data;
                    total = users.length;
                } else {
                    // Map格式：response.data是数组，total在外层
                    users = Array.isArray(response.data) ? response.data : [];
                    total = response.total || users.length;
                }
            }
            
            renderUsersTable(users);
            // 计算总页数
            const totalPages = Math.ceil(total / pageSize);
            // 使用通用分页控件
            if (typeof renderCommonPagination === 'function') {
                renderCommonPagination({
                    total: total,
                    current: page,
                    size: pageSize,
                    pages: totalPages,
                    paginationId: 'userPagination',
                    pageType: 'users',
                    defaultSize: pageSize
                });
            } else {
                // 降级使用旧的分页控件
                renderPagination(total, page, totalPages, 'users');
            }
        } else {
            showMessage(response.message || '加载用户列表失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载用户列表失败', 'error');
        document.getElementById('usersTableBody').innerHTML = 
            '<tr><td colspan="4" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染用户表格
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
        return;
    }

    // 检查当前用户是否为超级管理员
    // 由于后端已经根据角色过滤了用户列表，普通管理员只能看到普通用户
    // 所以这里所有显示的用户都是可以管理的
    const isSuperAdmin = api.isSuperAdmin();
    
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id || '-'}</td>
            <td>${user.username || '-'}</td>
            <td>${formatDate(user.createDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">编辑</button>
                    <button class="btn btn-sm btn-info" onclick="manageUserRoles('${user.id}', '${user.username}')">角色管理</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}', '${user.username}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 添加/编辑用户
 */
async function editUser(id = null) {
    let userData = {};
    if (id) {
        try {
            const response = await api.getUserById(id);
            // 兼容两种响应格式：Result格式（code字段）和Map格式（success字段）
            if (response.code === 200 || response.success === true) {
                userData = response.data || {};
            } else {
                showMessage(response.message || '加载用户信息失败', 'error');
                return;
            }
        } catch (error) {
            showMessage('加载用户信息失败: ' + error.message, 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('用户名', 'username', 'text', userData.username || '', { required: true, placeholder: '请输入用户名' }).outerHTML}
        ${createFormField('密码', 'password', 'password', '', { required: !id, placeholder: id ? '留空则不修改' : '请输入密码' }).outerHTML}
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="userForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑用户' : '新增用户', formHTML, '');
    
    const formEl = modal.querySelector('#userForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }

    // 如果编辑模式，确保表单字段已填充数据（使用fillFormData确保所有字段都被填充）
    if (id && userData) {
        fillFormData(formEl, userData);
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);
        
        // 编辑时密码可选
        if (id && !data.password) {
            delete data.password;
        }

        // 验证必填项
        if (!id && !data.password) {
            showMessage('密码不能为空', 'error');
            return;
        }
        if (!data.username || !data.username.trim()) {
            showMessage('用户名不能为空', 'error');
            return;
        }

        // 显示确认模态框
        const confirmed = await showConfirmModal(
            id ? '确认更新' : '确认创建',
            id ? `确定要更新用户 "${data.username}" 吗？` : `确定要创建用户 "${data.username}" 吗？`
        );
        
        if (!confirmed) {
            return;
        }

        try {
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            let response;
            if (id) {
                response = await api.updateUser(id, data);
            } else {
                response = await api.createUser(data);
            }

            // 兼容两种响应格式
            const isSuccess = response.code === 200 || (response.success === true);
            
            if (isSuccess) {
                showMessage(response.message || (id ? '更新成功' : '创建成功'), 'success');
                closeModal();
                loadUsers(currentPage);
                // 如果当前在日志页面，刷新日志列表
                if (typeof refreshLogsIfVisible === 'function') {
                    refreshLogsIfVisible();
                } else if (typeof window.refreshLogsIfVisible === 'function') {
                    window.refreshLogsIfVisible();
                }
            } else {
                showMessage(response.message || '操作失败', 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        } catch (error) {
            showMessage(error.message || '操作失败', 'error');
            const submitBtn = formEl.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = id ? '更新' : '创建';
            }
        }
    });
}

/**
 * 删除用户
 */
async function deleteUser(id, username) {
    const confirmed = await showConfirmModal(
        '确认删除',
        `确定要删除用户 "${username}" 吗？此操作不可恢复。`
    );
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await api.deleteUser(id);
        // 兼容两种响应格式
        const isSuccess = response.code === 200 || (response.success === true);
        if (isSuccess) {
            showMessage('删除成功', 'success');
            loadUsers(currentPage);
            // 如果当前在日志页面，刷新日志列表
            if (typeof refreshLogsIfVisible === 'function') {
                refreshLogsIfVisible();
            } else if (typeof window.refreshLogsIfVisible === 'function') {
                window.refreshLogsIfVisible();
            }
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 初始化用户管理
 */
function initUsers() {
    loadUsers(currentPage);
    bindUserSearchEvents();
}

/**
 * 绑定用户搜索事件
 */
function bindUserSearchEvents() {
    const searchBtn = document.getElementById('searchUsersBtn');
    const resetBtn = document.getElementById('resetUsersBtn');
    const searchInput = document.getElementById('userSearchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const keyword = searchInput ? searchInput.value.trim() : '';
            currentPage = 1;
            loadUsers(1, keyword);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            userSearchKeyword = '';
            currentPage = 1;
            loadUsers(1, '');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                currentPage = 1;
                loadUsers(1, keyword);
            }
        });
    }
}

/**
 * 管理用户角色
 */
async function manageUserRoles(userId, username) {
    try {
        // 获取所有可用角色
        const rolesResponse = await api.getRoles();
        if (rolesResponse.code !== 200) {
            showMessage(rolesResponse.message || '获取角色列表失败', 'error');
            return;
        }
        const allRoles = rolesResponse.data || [];
        
        // 获取用户当前角色
        const userRolesResponse = await api.getUserRoleDetails(userId);
        if (userRolesResponse.code !== 200) {
            showMessage(userRolesResponse.message || '获取用户角色失败', 'error');
            return;
        }
        const userRoles = userRolesResponse.data || [];
        const userRoleIds = userRoles.map(r => r.id);
        
        // 检查当前用户权限
        const isSuperAdmin = api.isSuperAdmin();
        
        // 过滤可分配的角色（普通管理员只能分配USER角色）
        const availableRoles = isSuperAdmin 
            ? allRoles.filter(r => r.roleCode !== 'SUPER_ADMIN') // 超级管理员不能通过界面分配SUPER_ADMIN
            : allRoles.filter(r => r.roleCode === 'USER');
        
        // 创建角色管理表单 - 使用多选列表样式
        const roleOptions = availableRoles.map(role => {
            const isChecked = userRoleIds.includes(role.id);
            return `
                <div class="role-option-item" style="padding: 8px; border: 1px solid #ddd; margin-bottom: 8px; border-radius: 4px; cursor: pointer; background: ${isChecked ? '#e7f3ff' : '#fff'};" 
                     onclick="toggleRoleSelection('${role.id}', this)">
                    <label style="cursor: pointer; margin: 0; display: flex; align-items: center;">
                        <input type="checkbox" value="${role.id}" ${isChecked ? 'checked' : ''} 
                               data-role-code="${role.roleCode}" 
                               onchange="updateSelectedRolesList()" 
                               style="margin-right: 8px;">
                        <div style="flex: 1;">
                            <strong>${role.roleName}</strong> <span class="text-muted">(${role.roleCode})</span>
                            ${role.description ? `<br><small class="text-muted">${role.description}</small>` : ''}
                        </div>
                    </label>
                </div>
            `;
        }).join('');
        
        // 已选角色列表
        const selectedRolesList = userRoles.map(role => `
            <span class="selected-role-item" data-role-id="${role.id}" style="display: inline-block; padding: 4px 8px; margin: 4px; background: #007bff; color: white; border-radius: 4px; font-size: 12px;">
                ${role.roleName} (${role.roleCode})
                <span onclick="removeSelectedRole('${role.id}', '${role.roleName}')" style="margin-left: 4px; cursor: pointer;">×</span>
            </span>
        `).join('');

        const formContent = `
            <form id="userRoleForm">
                <div class="form-group" style="margin-bottom: 20px;">
                    <label style="font-size: 16px; font-weight: bold;">用户：<strong>${username}</strong></label>
                </div>
                <div class="form-group" style="margin-bottom: 20px;">
                    <label>已选角色：</label>
                    <div id="selectedRolesList" style="min-height: 50px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; margin-bottom: 12px;">
                        ${selectedRolesList || '<span class="text-muted">暂无角色</span>'}
                    </div>
                </div>
                <div class="form-group">
                    <label style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">选择角色（可多选）：</label>
                    <div style="margin-bottom: 12px;">
                        <div class="filter-bar" style="margin-bottom: 12px;">
                            <div class="filter-item">
                                <label>搜索：</label>
                                <input type="text" id="roleSearchInput" class="form-control" placeholder="输入角色名称或代码" style="width: 200px;">
                            </div>
                            <div class="filter-item">
                                <button type="button" class="btn btn-primary" id="searchRolesBtn">查询</button>
                                <button type="button" class="btn btn-secondary" id="resetRolesBtn">重置</button>
                            </div>
                        </div>
                        <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                            <table class="data-table" id="roleTable">
                                <thead>
                                    <tr>
                                        <th style="width: 50px;">
                                            <input type="checkbox" id="selectAllRoles" onchange="toggleSelectAllRoles(this)">
                                        </th>
                                        <th>角色名称</th>
                                        <th>角色代码</th>
                                        <th>描述</th>
                                    </tr>
                                </thead>
                                <tbody id="roleTableBody">
                                    <tr><td colspan="4" class="loading">加载中...</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div id="rolePagination" style="margin-top: 12px; text-align: center;">
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
        
        const modal = createModal('管理用户角色', formContent, '', null, 'xlarge');
        
        // 将可用角色和用户角色存储到模态框中，供后续函数使用
        modal.dataset.availableRoles = JSON.stringify(availableRoles);
        modal.dataset.filteredRoles = JSON.stringify(availableRoles); // 初始化过滤后的角色列表
        modal.dataset.userRoles = JSON.stringify(userRoles);
        modal.dataset.userId = userId;
        modal.dataset.username = username;
        modal.dataset.rolePage = '1';
        modal.dataset.initialRoleIds = JSON.stringify(userRoleIds); // 存储初始选中的角色ID
        modal.dataset.selectedRoleIds = JSON.stringify(userRoleIds); // 存储所有选中的角色ID（跨页）
        
        // 初始化角色列表（第一页）
        renderRoleTable(1, modal);
        
        // 初始化已选角色列表
        updateSelectedRolesList();
        
        // 绑定查询和重置事件
        bindRoleSearchEvents(modal);
        
        // 绑定表单提交事件
        const formEl = modal.querySelector('#userRoleForm');
        if (formEl) {
            formEl.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                // 获取所有选中的角色ID（从模态框的dataset中获取，包括所有页面）
                const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
                
                if (selectedRoleIds.length === 0) {
                    showMessage('请至少选择一个角色', 'error');
                    return;
                }
                
                // 检查权限
                if (!isSuperAdmin) {
                    const selectedRoles = availableRoles.filter(r => selectedRoleIds.includes(r.id));
                    const hasNonUserRole = selectedRoles.some(r => r.roleCode !== 'USER');
                    if (hasNonUserRole) {
                        showMessage('您只能为用户分配普通用户角色', 'error');
                        return;
                    }
                }
                
                const confirmed = await showConfirmModal(
                    '确认分配',
                    `确定要为用户"${username}"分配选中的 ${selectedRoleIds.length} 个角色吗？`
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
                    
                    const response = await api.assignRoles(userId, selectedRoleIds);
                    if (response.code === 200) {
                        showMessage('角色分配成功', 'success');
                        // 刷新用户列表
                        loadUsers(currentPage);
                        closeModal();
                    } else {
                        showMessage(response.message || '角色分配失败', 'error');
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.textContent = originalText;
                        }
                    }
                } catch (error) {
                    showMessage(error.message || '角色分配失败', 'error');
                    const submitBtn = formEl.querySelector('button[type="submit"]');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = '保存';
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('管理用户角色失败:', error);
        showMessage(error.message || '管理用户角色失败', 'error');
    }
}

/**
 * 切换角色选择
 */
function toggleRoleSelection(roleId, checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
    const index = selectedRoleIds.indexOf(roleId);
    
    if (checkbox.checked) {
        if (index === -1) {
            selectedRoleIds.push(roleId);
        }
    } else {
        if (index > -1) {
            selectedRoleIds.splice(index, 1);
        }
    }
    
    modal.dataset.selectedRoleIds = JSON.stringify(selectedRoleIds);
    
    // 更新全选复选框状态
    const filteredRoles = JSON.parse(modal.dataset.filteredRoles || modal.dataset.availableRoles || '[]');
    const rolePageSize = 15;
    const currentPage = parseInt(modal.dataset.rolePage || '1');
    const start = (currentPage - 1) * rolePageSize;
    const end = start + rolePageSize;
    const pageRoles = filteredRoles.slice(start, end);
    
    const selectAllCheckbox = document.getElementById('selectAllRoles');
    if (selectAllCheckbox && pageRoles.length > 0) {
        const allChecked = pageRoles.every(role => selectedRoleIds.includes(role.id));
        const someChecked = pageRoles.some(role => selectedRoleIds.includes(role.id));
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    // 更新已选角色列表
    updateSelectedRolesList();
}

/**
 * 渲染角色表格
 */
function renderRoleTable(page = 1, modalElement = null) {
    // 优先使用传入的模态框元素，否则查找当前显示的模态框
    let modal = modalElement;
    if (!modal) {
        modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    }
    if (!modal) {
        // 尝试通过表单查找模态框
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const availableRolesStr = modal.dataset.availableRoles;
    if (!availableRolesStr) {
        console.error('模态框中没有角色数据');
        return;
    }
    
    const availableRoles = JSON.parse(availableRolesStr);
    console.log('渲染角色表格，总角色数:', availableRoles.length, '当前页:', page);
    
    if (!Array.isArray(availableRoles)) {
        console.error('角色数据格式错误，不是数组:', availableRoles);
        return;
    }
    
    const rolePageSize = 15;
    
    // 获取搜索关键词
    const searchInput = document.getElementById('roleSearchInput');
    const keyword = searchInput ? searchInput.value.trim() : '';
    
    // 过滤角色
    let filteredRoles = availableRoles;
    if (keyword) {
        filteredRoles = availableRoles.filter(role => 
            (role.roleName && role.roleName.toLowerCase().includes(keyword.toLowerCase())) ||
            (role.roleCode && role.roleCode.toLowerCase().includes(keyword.toLowerCase()))
        );
    }
    
    // 更新过滤后的角色列表
    modal.dataset.filteredRoles = JSON.stringify(filteredRoles);
    
    // 分页
    const totalPages = Math.ceil(filteredRoles.length / rolePageSize);
    const start = (page - 1) * rolePageSize;
    const end = start + rolePageSize;
    const pageRoles = filteredRoles.slice(start, end);
    
    console.log('当前页角色数:', pageRoles.length, '过滤后总数:', filteredRoles.length);
    
    // 获取已选中的角色ID
    const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
    
    // 渲染表格
    const tbody = document.getElementById('roleTableBody');
    if (!tbody) {
        console.error('未找到表格tbody元素');
        return;
    }
    
    if (pageRoles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = pageRoles.map(role => {
            const isChecked = selectedRoleIds.includes(role.id);
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="role-checkbox" value="${role.id}" 
                               ${isChecked ? 'checked' : ''} 
                               onchange="toggleRoleSelection('${role.id}', this)">
                    </td>
                    <td>${escapeHtml(role.roleName || '-')}</td>
                    <td>${escapeHtml(role.roleCode || '-')}</td>
                    <td>${escapeHtml(role.description || '-')}</td>
                </tr>
            `;
        }).join('');
    }
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAllRoles');
    if (selectAllCheckbox && pageRoles.length > 0) {
        const allChecked = pageRoles.every(role => selectedRoleIds.includes(role.id));
        const someChecked = pageRoles.some(role => selectedRoleIds.includes(role.id));
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    // 更新分页控件
    updateRolePagination(page, totalPages, filteredRoles.length);
    
    // 更新已选角色列表
    updateSelectedRolesList();
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
 * 绑定角色查询事件
 */
function bindRoleSearchEvents(modal) {
    // 使用setTimeout确保DOM完全渲染
    setTimeout(() => {
        const searchBtn = document.getElementById('searchRolesBtn');
        const resetBtn = document.getElementById('resetRolesBtn');
        const searchInput = document.getElementById('roleSearchInput');
        
        if (searchBtn) {
            // 移除旧的事件监听器（通过克隆节点）
            const newSearchBtn = searchBtn.cloneNode(true);
            searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
            newSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (modal) {
                    modal.dataset.rolePage = '1';
                    renderRoleTable(1, modal);
                } else {
                    renderRoleTable(1);
                }
            });
        }
        
        if (resetBtn) {
            // 移除旧的事件监听器（通过克隆节点）
            const newResetBtn = resetBtn.cloneNode(true);
            resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
            newResetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (searchInput) searchInput.value = '';
                if (modal) {
                    modal.dataset.rolePage = '1';
                    renderRoleTable(1, modal);
                } else {
                    renderRoleTable(1);
                }
            });
        }
        
        // 支持回车键搜索
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (modal) {
                        modal.dataset.rolePage = '1';
                        renderRoleTable(1, modal);
                    } else {
                        renderRoleTable(1);
                    }
                }
            });
        }
    }, 100);
}

/**
 * 全选/取消全选角色
 */
function toggleSelectAllRoles(checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const filteredRoles = JSON.parse(modal.dataset.filteredRoles || modal.dataset.availableRoles || '[]');
    const rolePageSize = 15;
    const currentPage = parseInt(modal.dataset.rolePage || '1');
    const start = (currentPage - 1) * rolePageSize;
    const end = start + rolePageSize;
    const pageRoles = filteredRoles.slice(start, end);
    
    const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
    
    if (checkbox.checked) {
        // 全选当前页
        pageRoles.forEach(role => {
            if (!selectedRoleIds.includes(role.id)) {
                selectedRoleIds.push(role.id);
            }
        });
    } else {
        // 取消全选当前页
        pageRoles.forEach(role => {
            const index = selectedRoleIds.indexOf(role.id);
            if (index > -1) {
                selectedRoleIds.splice(index, 1);
            }
        });
    }
    
    modal.dataset.selectedRoleIds = JSON.stringify(selectedRoleIds);
    
    // 更新表格
    renderRoleTable(currentPage, modal);
}

/**
 * 更新角色分页控件
 */
function updateRolePagination(currentPage, totalPages, total = 0) {
    const paginationEl = document.getElementById('rolePagination');
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = total > 0 ? `<span style="color: #6c757d;">共 ${total} 条记录</span>` : '';
        return;
    }
    
    let paginationHTML = '<div style="display: flex; justify-content: center; align-items: center; gap: 8px;">';
    
    // 上一页按钮
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeRolePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    
    // 页码按钮
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeRolePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button type="button" class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changeRolePage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeRolePage(${totalPages})">${totalPages}</button>`;
    }
    
    // 下一页按钮
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeRolePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    
    paginationHTML += `<span style="margin-left: 16px; color: #6c757d;">共 ${total} 条记录，${totalPages} 页</span>`;
    paginationHTML += '</div>';
    
    paginationEl.innerHTML = paginationHTML;
}

/**
 * 切换角色分页
 */
function changeRolePage(page) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    modal.dataset.rolePage = page.toString();
    renderRoleTable(page, modal);
}

/**
 * 更新已选角色列表显示
 */
function updateSelectedRolesList() {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) return;
    
    // 从模态框的dataset中获取已选中的角色ID
    const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
    const availableRoles = JSON.parse(modal.dataset.availableRoles || '[]');
    const selectedRoles = availableRoles.filter(r => selectedRoleIds.includes(r.id));
    
    // 更新已选角色列表
    const selectedListEl = document.getElementById('selectedRolesList');
    if (selectedListEl) {
        if (selectedRoles.length === 0) {
            selectedListEl.innerHTML = '<span class="text-muted">暂无角色</span>';
        } else {
            selectedListEl.innerHTML = selectedRoles.map(role => `
                <span class="selected-role-item" data-role-id="${role.id}" style="display: inline-block; padding: 4px 8px; margin: 4px; background: #007bff; color: white; border-radius: 4px; font-size: 12px;">
                    ${role.roleName} (${role.roleCode})
                    <span onclick="removeSelectedRole('${role.id}', '${role.roleName}')" style="margin-left: 4px; cursor: pointer;">×</span>
                </span>
            `).join('');
        }
    }
}

/**
 * 移除已选角色（从列表中移除）
 */
function removeSelectedRole(roleId, roleName) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('userRoleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedRoleIds = JSON.parse(modal.dataset.selectedRoleIds || '[]');
    const index = selectedRoleIds.indexOf(roleId);
    
    if (index > -1) {
        selectedRoleIds.splice(index, 1);
        modal.dataset.selectedRoleIds = JSON.stringify(selectedRoleIds);
        
        // 更新当前页面的复选框状态
        const checkbox = document.querySelector(`#roleTableBody input[type="checkbox"][value="${roleId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // 更新全选复选框状态
        const filteredRoles = JSON.parse(modal.dataset.filteredRoles || modal.dataset.availableRoles || '[]');
        const rolePageSize = 15;
        const currentPage = parseInt(modal.dataset.rolePage || '1');
        const start = (currentPage - 1) * rolePageSize;
        const end = start + rolePageSize;
        const pageRoles = filteredRoles.slice(start, end);
        
        const selectAllCheckbox = document.getElementById('selectAllRoles');
        if (selectAllCheckbox && pageRoles.length > 0) {
            const allChecked = pageRoles.every(role => selectedRoleIds.includes(role.id));
            const someChecked = pageRoles.some(role => selectedRoleIds.includes(role.id));
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        }
        
        // 更新已选角色列表
        updateSelectedRolesList();
    }
}

/**
 * 从模态框中移除用户角色（调用API）
 */
async function removeUserRoleFromModal(userId, roleId, roleName, username) {
    const confirmed = await showConfirmModal(
        '确认移除',
        `确定要移除用户"${username}"的角色"${roleName}"吗？`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await api.removeUserRole(userId, roleId);
        if (response.code === 200) {
            showMessage('角色移除成功', 'success');
            // 重新打开角色管理模态框
            closeModal();
            setTimeout(() => {
                manageUserRoles(userId, username);
            }, 300);
        } else {
            showMessage(response.message || '角色移除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '角色移除失败', 'error');
    }
}

// 导出供全局使用
window.initUsers = initUsers;
window.loadUsers = loadUsers;
window.currentPage = currentPage;
window.pageSize = pageSize;
window.userSearchKeyword = userSearchKeyword;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.manageUserRoles = manageUserRoles;
window.removeUserRoleFromModal = removeUserRoleFromModal;
window.toggleRoleSelection = toggleRoleSelection;
window.updateSelectedRolesList = updateSelectedRolesList;
window.removeSelectedRole = removeSelectedRole;
window.changeRolePage = changeRolePage;
window.updateRolePagination = updateRolePagination;
window.toggleSelectAllRoles = toggleSelectAllRoles;
window.renderRoleTable = renderRoleTable;
window.bindRoleSearchEvents = bindRoleSearchEvents;
window.escapeHtml = escapeHtml;


/**
 * 权限管理模块
 */

let permissions = [];
let currentPermissionPage = 1;
let permissionPageSize = 15;
let permissionSearchKeyword = '';

/**
 * 初始化权限管理
 */
function initPermissions() {
    loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
    bindPermissionEvents();
}

/**
 * 绑定权限管理事件
 */
function bindPermissionEvents() {
    const addBtn = document.getElementById('addPermissionBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            editPermission();
        });
    }
    
    // 绑定查询和重置事件
    const searchBtn = document.getElementById('searchPermissionsBtn');
    const resetBtn = document.getElementById('resetPermissionsBtn');
    const searchInput = document.getElementById('permissionSearchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            permissionSearchKeyword = searchInput ? searchInput.value.trim() : '';
            currentPermissionPage = 1;
            loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            permissionSearchKeyword = '';
            currentPermissionPage = 1;
            loadPermissions(currentPermissionPage, permissionPageSize, '');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                permissionSearchKeyword = searchInput.value.trim();
                currentPermissionPage = 1;
                loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
            }
        });
    }
}

/**
 * 加载权限列表
 */
async function loadPermissions(page = 1, size = 15, keyword = '') {
    try {
        const response = await api.getPermissions(page, size, keyword);
        if (response.code === 200) {
            const pageData = response.data;
            permissions = pageData.records || [];
            renderPermissionsTable(permissions);
            
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
                paginationId: 'permissionsPagination',
                pageType: 'permissions',
                onPageChange: (newPage) => {
                    currentPermissionPage = newPage;
                    loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
                },
                onSizeChange: (newSize) => {
                    permissionPageSize = newSize;
                    currentPermissionPage = 1;
                    loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
                },
                onPageJump: (targetPage) => {
                    currentPermissionPage = targetPage;
                    loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
                }
            });
        } else {
            showMessage(response.message || '加载权限列表失败', 'error');
        }
    } catch (error) {
        console.error('加载权限列表失败:', error);
        showMessage(error.message || '加载权限列表失败', 'error');
        const tbody = document.getElementById('permissionsTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载失败</td></tr>';
        }
    }
}

/**
 * 渲染权限表格
 */
function renderPermissionsTable(permissionList) {
    const tbody = document.getElementById('permissionsTableBody');
    if (!tbody) return;
    
    if (permissionList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
        return;
    }
    
    tbody.innerHTML = permissionList.map(permission => {
        const enabled = permission.enabled !== false;
        const enabledText = enabled ? '启用' : '禁用';
        const enabledClass = enabled ? 'badge-success' : 'badge-secondary';
        
        return `
            <tr>
                <td>${escapeHtml(permission.pathPattern || '-')}</td>
                <td>${escapeHtml(permission.httpMethod || '-')}</td>
                <td>${escapeHtml(permission.requiredRoles || '-')}</td>
                <td>${escapeHtml(permission.description || '-')}</td>
                <td><span class="badge ${enabledClass}">${enabledText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="editPermission('${permission.id}')">编辑</button>
                        <button class="btn btn-sm btn-danger" onclick="deletePermission('${permission.id}')">删除</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 编辑权限
 */
async function editPermission(id = null) {
    let permissionData = null;
    
    if (id) {
        try {
            // 从列表中查找权限数据
            permissionData = permissions.find(p => p.id === id);
            if (!permissionData) {
                showMessage('权限不存在', 'error');
                return;
            }
        } catch (error) {
            console.error('获取权限数据失败:', error);
            showMessage('获取权限数据失败', 'error');
            return;
        }
    }
    
    const formContent = `
        <form id="permissionForm">
            <div class="form-group">
                <label for="pathPattern">路径模式 <span class="text-danger">*</span></label>
                <input type="text" id="pathPattern" class="form-control" 
                       value="${permissionData ? escapeHtml(permissionData.pathPattern || '') : ''}" 
                       placeholder="例如: /api/admin/**" required>
            </div>
            <div class="form-group">
                <label for="httpMethod">HTTP方法</label>
                <select id="httpMethod" class="form-control">
                    <option value="">全部方法</option>
                    <option value="GET" ${permissionData && permissionData.httpMethod === 'GET' ? 'selected' : ''}>GET</option>
                    <option value="POST" ${permissionData && permissionData.httpMethod === 'POST' ? 'selected' : ''}>POST</option>
                    <option value="PUT" ${permissionData && permissionData.httpMethod === 'PUT' ? 'selected' : ''}>PUT</option>
                    <option value="DELETE" ${permissionData && permissionData.httpMethod === 'DELETE' ? 'selected' : ''}>DELETE</option>
                    <option value="PATCH" ${permissionData && permissionData.httpMethod === 'PATCH' ? 'selected' : ''}>PATCH</option>
                </select>
            </div>
            <div class="form-group">
                <label for="requiredRoles">所需角色 <span class="text-danger">*</span></label>
                <input type="text" id="requiredRoles" class="form-control" 
                       value="${permissionData ? escapeHtml(permissionData.requiredRoles || '') : ''}" 
                       placeholder="例如: ADMIN,USER (多个角色用逗号分隔)" required>
                <small class="form-text text-muted">多个角色用逗号分隔，例如: ADMIN,USER,SUPER_ADMIN</small>
            </div>
            <div class="form-group">
                <label for="description">描述</label>
                <textarea id="description" class="form-control" rows="3" 
                          placeholder="权限描述">${permissionData ? escapeHtml(permissionData.description || '') : ''}</textarea>
            </div>
            <div class="form-group" style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 6px; border: 1px solid #dee2e6;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <label for="enabled" style="font-weight: 500; color: #212529; margin-bottom: 4px; display: block;">启用状态</label>
                        <small class="form-text text-muted" style="display: block; margin-top: 4px;">禁用后，此权限将不会生效</small>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="enabled" ${permissionData === null || permissionData.enabled !== false ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
                <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
            </div>
        </form>
    `;
    
    const modal = createModal(id ? '编辑权限' : '新增权限', formContent, '', null, 'medium');
    
    // 绑定表单提交事件
    const formEl = modal.querySelector('#permissionForm');
    if (formEl) {
        formEl.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const pathPattern = document.getElementById('pathPattern').value.trim();
            const httpMethod = document.getElementById('httpMethod').value.trim();
            const requiredRoles = document.getElementById('requiredRoles').value.trim();
            const description = document.getElementById('description').value.trim();
            const enabled = document.getElementById('enabled').checked;
            
            if (!pathPattern) {
                showMessage('路径模式不能为空', 'error');
                return;
            }
            
            if (!requiredRoles) {
                showMessage('所需角色不能为空', 'error');
                return;
            }
            
            const confirmed = await showConfirmModal(
                id ? '确认更新' : '确认创建',
                `确定要${id ? '更新' : '创建'}权限吗？`
            );
            
            if (!confirmed) {
                return;
            }
            
            try {
                const submitBtn = formEl.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : (id ? '更新' : '创建');
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = id ? '更新中...' : '创建中...';
                }
                
                let response;
                if (id) {
                    response = await api.updatePermission(id, {
                        pathPattern,
                        httpMethod: httpMethod || null,
                        requiredRoles,
                        description: description || null,
                        enabled
                    });
                } else {
                    response = await api.createPermission({
                        pathPattern,
                        httpMethod: httpMethod || null,
                        requiredRoles,
                        description: description || null,
                        enabled
                    });
                }
                
                if (response.code === 200) {
                    showMessage(id ? '权限更新成功' : '权限创建成功', 'success');
                    closeModal();
                    loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
                } else {
                    showMessage(response.message || (id ? '权限更新失败' : '权限创建失败'), 'error');
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            } catch (error) {
                console.error(id ? '更新权限失败:' : '创建权限失败:', error);
                showMessage((id ? '更新权限失败: ' : '创建权限失败: ') + (error.message || '未知错误'), 'error');
                const submitBtn = formEl.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = id ? '更新' : '创建';
                }
            }
        });
    }
}

/**
 * 删除权限
 */
async function deletePermission(id) {
    const permission = permissions.find(p => p.id === id);
    if (!permission) {
        showMessage('权限不存在', 'error');
        return;
    }
    
    const confirmed = await showConfirmModal(
        '确认删除',
        `确定要删除权限"${permission.pathPattern}"吗？此操作不可恢复。`
    );
    
    if (!confirmed) {
        return;
    }
    
    try {
        const response = await api.deletePermission(id);
        if (response.code === 200) {
            showMessage('权限删除成功', 'success');
            loadPermissions(currentPermissionPage, permissionPageSize, permissionSearchKeyword);
        } else {
            showMessage(response.message || '权限删除失败', 'error');
        }
    } catch (error) {
        console.error('删除权限失败:', error);
        showMessage('删除权限失败: ' + (error.message || '未知错误'), 'error');
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

// 导出供全局使用
window.initPermissions = initPermissions;
window.editPermission = editPermission;
window.deletePermission = deletePermission;
window.loadPermissions = loadPermissions;
window.currentPermissionPage = currentPermissionPage;
window.permissionPageSize = permissionPageSize;
window.permissionSearchKeyword = permissionSearchKeyword;
window.escapeHtml = escapeHtml;


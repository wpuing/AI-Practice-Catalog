/**
 * 安全配置管理模块
 */

/**
 * 加载白名单列表
 */
async function loadWhitelist() {
    try {
        const response = await api.getWhitelist();
        if (response.code === 200) {
            const whitelist = response.data || [];
            renderWhitelistTable(whitelist);
        } else {
            showMessage(response.message || '加载白名单失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载白名单失败', 'error');
        document.getElementById('whitelistTableBody').innerHTML = 
            '<tr><td colspan="3" class="loading">加载失败</td></tr>';
    }
}

/**
 * 加载权限列表
 */
async function loadPermissions() {
    try {
        const response = await api.getPermissions();
        if (response.code === 200) {
            const permissions = response.data || [];
            renderPermissionsTable(permissions);
        } else {
            showMessage(response.message || '加载权限列表失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载权限列表失败', 'error');
        document.getElementById('permissionTableBody').innerHTML = 
            '<tr><td colspan="4" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染白名单表格
 */
function renderWhitelistTable(whitelist) {
    const tbody = document.getElementById('whitelistTableBody');
    if (!tbody) return;

    if (whitelist.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = whitelist.map(item => `
        <tr>
            <td>${item.pathPattern || item.path || '-'}</td>
            <td>${item.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editWhitelist('${item.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteWhitelist('${item.id}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 渲染权限表格
 */
function renderPermissionsTable(permissions) {
    const tbody = document.getElementById('permissionTableBody');
    if (!tbody) return;

    if (permissions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = permissions.map(permission => `
        <tr>
            <td>${permission.pathPattern || permission.permissionName || '-'}</td>
            <td>${permission.requiredRoles || permission.permissionCode || '-'}</td>
            <td>${permission.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editPermission('${permission.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deletePermission('${permission.id}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 编辑白名单
 */
async function editWhitelist(id = null) {
    // 加载现有数据
    let whitelistData = {};
    if (id) {
        try {
            const response = await api.getWhitelist();
            if (response.code === 200) {
                const list = response.data || [];
                whitelistData = list.find(item => item.id === id) || {};
            }
        } catch (error) {
            showMessage('加载白名单信息失败', 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('路径', 'pathPattern', 'text', whitelistData.pathPattern || whitelistData.path || '', { required: true, placeholder: '例如：/api/public/**' }).outerHTML}
        ${createFormField('描述', 'description', 'textarea', whitelistData.description || '', { placeholder: '请输入描述信息' }).outerHTML}
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="whitelistForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑白名单' : '新增白名单', formHTML, '');
    
    const formEl = modal.querySelector('#whitelistForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);

        // 显示确认模态框
        const confirmed = await showConfirmModal(
            id ? '确认更新' : '确认创建',
            id ? `确定要更新白名单 "${data.pathPattern || data.path}" 吗？` : `确定要创建白名单 "${data.pathPattern || data.path}" 吗？`
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
                response = await api.updateWhitelist(id, data);
            } else {
                response = await api.createWhitelist(data);
            }

            // 兼容两种响应格式
            const isSuccess = response.code === 200 || (response.success === true);
            if (isSuccess) {
                showMessage(id ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadWhitelist();
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
 * 删除白名单
 */
async function deleteWhitelist(id) {
    const confirmed = await showConfirmModal(
        '确认删除',
        '确定要删除这条白名单吗？此操作不可恢复。'
    );
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await api.deleteWhitelist(id);
        // 兼容两种响应格式
        const isSuccess = response.code === 200 || (response.success === true);
        if (isSuccess) {
            showMessage('删除成功', 'success');
            loadWhitelist();
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 编辑权限
 */
async function editPermission(id = null) {
    let permissionData = {};
    if (id) {
        try {
            const response = await api.getPermissions();
            if (response.code === 200) {
                const list = response.data || [];
                permissionData = list.find(item => item.id === id) || {};
            }
        } catch (error) {
            showMessage('加载权限信息失败', 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('路径模式', 'pathPattern', 'text', permissionData.pathPattern || permissionData.permissionName || '', { required: true, placeholder: '例如：/api/admin/**' }).outerHTML}
        ${createFormField('所需角色', 'requiredRoles', 'text', permissionData.requiredRoles || permissionData.permissionCode || '', { required: true, placeholder: '例如：ADMIN,USER（多个角色用逗号分隔）' }).outerHTML}
        ${createFormField('HTTP方法', 'httpMethod', 'text', permissionData.httpMethod || '', { placeholder: '例如：GET,POST（可选，留空表示所有方法）' }).outerHTML}
        ${createFormField('描述', 'description', 'textarea', permissionData.description || '', { placeholder: '请输入描述信息' }).outerHTML}
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="permissionForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑权限' : '新增权限', formHTML, '');
    
    const formEl = modal.querySelector('#permissionForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);

        // 显示确认模态框
        const confirmed = await showConfirmModal(
            id ? '确认更新' : '确认创建',
            id ? `确定要更新权限 "${data.pathPattern || data.permissionName}" 吗？` : `确定要创建权限 "${data.pathPattern || data.permissionName}" 吗？`
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
                response = await api.updatePermission(id, data);
            } else {
                response = await api.createPermission(data);
            }

            // 兼容两种响应格式
            const isSuccess = response.code === 200 || (response.success === true);
            if (isSuccess) {
                showMessage(id ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadPermissions();
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
 * 删除权限
 */
async function deletePermission(id) {
    const confirmed = await showConfirmModal(
        '确认删除',
        '确定要删除这条权限吗？此操作不可恢复。'
    );
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await api.deletePermission(id);
        // 兼容两种响应格式
        const isSuccess = response.code === 200 || (response.success === true);
        if (isSuccess) {
            showMessage('删除成功', 'success');
            loadPermissions();
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 初始化安全配置管理
 */
function initSecurity() {
    // 标签页切换
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            
            // 更新按钮状态
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // 更新内容显示
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tab}Tab`).classList.add('active');
            
            // 加载对应数据
            if (tab === 'whitelist') {
                loadWhitelist();
            } else if (tab === 'permission') {
                loadPermissions();
            }
        });
    });

    // 初始加载白名单
    loadWhitelist();
}

// 导出供全局使用
window.editWhitelist = editWhitelist;
window.deleteWhitelist = deleteWhitelist;
window.editPermission = editPermission;
window.deletePermission = deletePermission;


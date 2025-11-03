/**
 * 角色管理模块
 */

/**
 * 加载角色列表
 */
async function loadRoles() {
    try {
        const response = await api.getRoles();
        if (response.code === 200) {
            const roles = response.data || [];
            renderRolesTable(roles);
        } else {
            showMessage(response.message || '加载角色列表失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载角色列表失败', 'error');
        document.getElementById('rolesTableBody').innerHTML = 
            '<tr><td colspan="4" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染角色表格
 */
function renderRolesTable(roles) {
    const tbody = document.getElementById('rolesTableBody');
    if (!tbody) return;

    if (roles.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = roles.map(role => `
        <tr>
            <td>${role.roleName || '-'}</td>
            <td>${role.roleCode || '-'}</td>
            <td>${role.description || '-'}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editRole('${role.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRole('${role.id}', '${role.roleName}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 添加/编辑角色
 */
async function editRole(id = null) {
    let roleData = {};
    if (id) {
        try {
            const response = await api.getRoles();
            if (response.code === 200) {
                const roles = response.data || [];
                roleData = roles.find(r => r.id === id) || {};
            }
        } catch (error) {
            showMessage('加载角色信息失败', 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('角色名称', 'roleName', 'text', roleData.roleName || '', { required: true, placeholder: '请输入角色名称' }).outerHTML}
        ${createFormField('角色代码', 'roleCode', 'text', roleData.roleCode || '', { required: true, placeholder: '请输入角色代码（英文大写）' }).outerHTML}
        ${createFormField('描述', 'description', 'textarea', roleData.description || '', { placeholder: '请输入描述信息' }).outerHTML}
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="roleForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑角色' : '新增角色', formHTML, '');
    
    const formEl = modal.querySelector('#roleForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);

        try {
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            let response;
            if (id) {
                response = await api.updateRole(id, data);
            } else {
                response = await api.createRole(data);
            }

            if (response.code === 200) {
                showMessage(id ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadRoles();
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
 * 删除角色
 */
async function deleteRole(id, roleName) {
    if (!confirm(`确定要删除角色 "${roleName}" 吗？`)) {
        return;
    }

    try {
        const response = await api.deleteRole(id);
        if (response.code === 200) {
            showMessage('删除成功', 'success');
            loadRoles();
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 初始化角色管理
 */
function initRoles() {
    // 事件绑定已通过事件委托在home.js中统一处理
    // 这里只需要加载数据
    loadRoles();
}

// 导出供全局使用
window.initRoles = initRoles;

// 导出供全局使用
window.editRole = editRole;
window.deleteRole = deleteRole;


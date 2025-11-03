/**
 * 用户管理模块
 */

let currentPage = 1;
const pageSize = 10;

/**
 * 加载用户列表
 */
async function loadUsers(page = 1) {
    try {
        const response = await api.getUsers(page, pageSize);
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
            renderPagination(total, page, 'users');
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

    tbody.innerHTML = users.map(user => `
        <tr>
            <td>${user.id || '-'}</td>
            <td>${user.username || '-'}</td>
            <td>${formatDate(user.createTime)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editUser('${user.id}')">编辑</button>
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
            if (response.code === 200) {
                userData = response.data || {};
            }
        } catch (error) {
            showMessage('加载用户信息失败', 'error');
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
    if (!confirm(`确定要删除用户 "${username}" 吗？`)) {
        return;
    }

    try {
        const response = await api.deleteUser(id);
        if (response.code === 200) {
            showMessage('删除成功', 'success');
            loadUsers(currentPage);
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
    // 事件绑定已通过事件委托在home.js中统一处理
    // 这里只需要加载数据
    loadUsers(currentPage);
}

// 导出供全局使用
window.initUsers = initUsers;

// 导出供全局使用
window.editUser = editUser;
window.deleteUser = deleteUser;


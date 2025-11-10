/**
 * 角色管理模块
 */

let roleSearchKeyword = ''; // 角色搜索关键词

/**
 * 加载角色列表
 */
async function loadRoles(keyword = roleSearchKeyword) {
    try {
        roleSearchKeyword = keyword || '';
        const response = await api.getRoles(keyword);
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
    let roleMenuIds = [];
    
    if (id) {
        try {
            // 直接通过ID获取角色信息
            const response = await api.getRoleById(id);
            if (response.code === 200 && response.data) {
                roleData = response.data;
                console.log('获取到的角色信息:', roleData);
            } else {
                showMessage(response.message || '角色不存在', 'error');
                return;
            }
            
            // 获取角色的菜单权限
            const menuIdsResponse = await api.getMenuIdsByRoleId(id);
            if (menuIdsResponse.code === 200) {
                roleMenuIds = menuIdsResponse.data || [];
                console.log('获取到的菜单权限ID:', roleMenuIds);
            } else {
                console.warn('获取菜单权限失败:', menuIdsResponse.message);
                // 不阻止继续，只是警告
            }
        } catch (error) {
            console.error('加载角色信息异常:', error);
            showMessage('加载角色信息失败: ' + (error.message || '未知错误'), 'error');
            return;
        }
    }

    // 获取所有启用的菜单
    let allMenus = [];
    try {
        const menusResponse = await api.getEnabledMenus();
        if (menusResponse.code === 200) {
            allMenus = menusResponse.data || [];
            console.log('获取到的菜单列表:', allMenus);
        } else {
            console.warn('获取菜单列表失败:', menusResponse.message);
        }
    } catch (error) {
        console.error('获取菜单列表异常:', error);
        showMessage('获取菜单列表失败: ' + (error.message || '未知错误'), 'error');
    }
    
    if (allMenus.length === 0) {
        console.warn('菜单列表为空');
    }

    // 调试：打印角色数据
    console.log('准备创建表单，角色数据:', roleData);
    console.log('角色名称:', roleData.roleName);
    console.log('角色代码:', roleData.roleCode);
    console.log('描述:', roleData.description);
    
    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
                ${createFormField('角色名称', 'roleName', 'text', roleData.roleName || '', { required: true, placeholder: '请输入角色名称' }).outerHTML}
            </div>
            <div>
                ${createFormField('角色代码', 'roleCode', 'text', roleData.roleCode || '', { required: true, placeholder: '请输入角色代码（英文大写）' }).outerHTML}
            </div>
        </div>
        <div style="margin-bottom: 20px;">
            ${createFormField('描述', 'description', 'textarea', roleData.description || '', { placeholder: '请输入描述信息' }).outerHTML}
        </div>
        <div class="form-group">
            <label style="font-size: 16px; font-weight: bold; margin-bottom: 12px;">菜单权限：</label>
            <div id="selectedMenusList" style="min-height: 50px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: #f8f9fa; margin-bottom: 12px;">
                <span class="text-muted">已选菜单将显示在这里</span>
            </div>
            <div style="margin-bottom: 12px;">
                <div class="filter-bar" style="margin-bottom: 12px;">
                    <div class="filter-item">
                        <label>搜索：</label>
                        <input type="text" id="menuSearchInput" class="form-control" placeholder="输入菜单名称或代码" style="width: 200px;">
                    </div>
                    <div class="filter-item">
                        <button type="button" class="btn btn-primary" id="searchMenusBtn">查询</button>
                        <button type="button" class="btn btn-secondary" id="resetMenusBtn">重置</button>
                    </div>
                </div>
                <div class="table-container" style="max-height: 400px; overflow-y: auto;">
                    <table class="data-table" id="menuTable">
                        <thead>
                            <tr>
                                <th style="width: 50px;">
                                    <input type="checkbox" id="selectAllMenus" onchange="toggleSelectAllMenus(this)">
                                </th>
                                <th>菜单名称</th>
                                <th>菜单代码</th>
                                <th>路径</th>
                                <th>图标</th>
                                <th>描述</th>
                            </tr>
                        </thead>
                        <tbody id="menuTableBody">
                            <tr><td colspan="6" class="loading">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="menuPagination" style="margin-top: 12px; text-align: center;">
                    <!-- 分页控件将在这里动态渲染 -->
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="roleForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑角色' : '新增角色', formHTML, '', null, 'xlarge');
    
    // 存储菜单数据到模态框
    modal.dataset.allMenus = JSON.stringify(allMenus);
    modal.dataset.filteredMenus = JSON.stringify(allMenus); // 初始化过滤后的菜单列表
    modal.dataset.roleId = id || '';
    modal.dataset.menuPage = '1';
    modal.dataset.initialMenuIds = JSON.stringify(roleMenuIds); // 存储初始选中的菜单ID
    modal.dataset.selectedMenuIds = JSON.stringify(roleMenuIds); // 存储所有选中的菜单ID（跨页）
    
    const formEl = modal.querySelector('#roleForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }
    
    // 验证表单字段是否正确填充
    if (id) {
        const roleNameInput = formEl.querySelector('#roleName');
        const roleCodeInput = formEl.querySelector('#roleCode');
        const descriptionInput = formEl.querySelector('#description');
        
        console.log('表单字段值检查:');
        console.log('角色名称输入框值:', roleNameInput ? roleNameInput.value : '未找到');
        console.log('角色代码输入框值:', roleCodeInput ? roleCodeInput.value : '未找到');
        console.log('描述输入框值:', descriptionInput ? descriptionInput.value : '未找到');
        
        // 如果表单字段没有正确填充，手动填充
        if (roleNameInput && !roleNameInput.value && roleData.roleName) {
            roleNameInput.value = roleData.roleName;
            console.log('手动填充角色名称:', roleData.roleName);
        }
        if (roleCodeInput && !roleCodeInput.value && roleData.roleCode) {
            roleCodeInput.value = roleData.roleCode;
            console.log('手动填充角色代码:', roleData.roleCode);
        }
        if (descriptionInput && !descriptionInput.value && roleData.description) {
            descriptionInput.value = roleData.description;
            console.log('手动填充描述:', roleData.description);
        }
    }

    // 初始化菜单列表（第一页）
    renderMenuTable(1, modal);
    
    // 初始化已选菜单列表
    updateSelectedMenusList();
    
    // 绑定查询和重置事件
    bindMenuSearchEvents(modal);

    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);
        
        // 获取所有选中的菜单ID（从模态框的dataset中获取，包括所有页面）
        const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');

        // 显示确认模态框
        const confirmed = await showConfirmModal(
            id ? '确认更新' : '确认创建',
            id ? `确定要更新角色 "${data.roleName || data.roleCode}" 吗？` : `确定要创建角色 "${data.roleName || data.roleCode}" 并分配 ${selectedMenuIds.length} 个菜单权限吗？`
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
                // 更新角色
                response = await api.updateRole(id, data);
                // 如果更新成功，更新菜单权限
                if (response.code === 200) {
                    const assignResponse = await api.assignMenusToRole(id, selectedMenuIds);
                    if (assignResponse.code !== 200) {
                        showMessage('角色更新成功，但菜单权限分配失败: ' + assignResponse.message, 'warning');
                    }
                }
            } else {
                // 创建角色并分配菜单权限
                response = await api.createRole(data);
                // 如果创建成功，分配菜单权限
                if (response.code === 200 && response.data && response.data.id) {
                    const roleId = response.data.id;
                    if (selectedMenuIds.length > 0) {
                        const assignResponse = await api.assignMenusToRole(roleId, selectedMenuIds);
                        if (assignResponse.code !== 200) {
                            showMessage('角色创建成功，但菜单权限分配失败: ' + assignResponse.message, 'warning');
                        }
                    }
                }
            }

            // 兼容两种响应格式
            const isSuccess = response.code === 200 || (response.success === true);
            if (isSuccess) {
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
 * 渲染菜单表格
 */
function renderMenuTable(page = 1, modalElement = null) {
    // 优先使用传入的模态框元素，否则查找当前显示的模态框
    let modal = modalElement;
    if (!modal) {
        modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    }
    if (!modal) {
        // 尝试通过表单查找模态框
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const allMenusStr = modal.dataset.allMenus;
    if (!allMenusStr) {
        console.error('模态框中没有菜单数据');
        return;
    }
    
    const allMenus = JSON.parse(allMenusStr);
    console.log('渲染菜单表格，总菜单数:', allMenus.length, '当前页:', page);
    
    if (!Array.isArray(allMenus)) {
        console.error('菜单数据格式错误，不是数组:', allMenus);
        return;
    }
    
    const menuPageSize = 15;
    
    // 获取搜索关键词
    const searchInput = document.getElementById('menuSearchInput');
    const keyword = searchInput ? searchInput.value.trim() : '';
    
    // 过滤菜单
    let filteredMenus = allMenus;
    if (keyword) {
        filteredMenus = allMenus.filter(menu => 
            (menu.menuName && menu.menuName.toLowerCase().includes(keyword.toLowerCase())) ||
            (menu.menuCode && menu.menuCode.toLowerCase().includes(keyword.toLowerCase()))
        );
    }
    
    // 更新过滤后的菜单列表
    modal.dataset.filteredMenus = JSON.stringify(filteredMenus);
    
    // 分页
    const totalPages = Math.ceil(filteredMenus.length / menuPageSize);
    const start = (page - 1) * menuPageSize;
    const end = start + menuPageSize;
    const pageMenus = filteredMenus.slice(start, end);
    
    console.log('当前页菜单数:', pageMenus.length, '过滤后总数:', filteredMenus.length);
    
    // 获取已选中的菜单ID
    const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');
    
    // 渲染表格
    const tbody = document.getElementById('menuTableBody');
    if (!tbody) {
        console.error('未找到表格tbody元素');
        return;
    }
    
    if (pageMenus.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
    } else {
        tbody.innerHTML = pageMenus.map(menu => {
            const isChecked = selectedMenuIds.includes(menu.id);
            return `
                <tr>
                    <td>
                        <input type="checkbox" class="menu-checkbox" value="${menu.id}" 
                               ${isChecked ? 'checked' : ''} 
                               onchange="toggleMenuSelection('${menu.id}', this)">
                    </td>
                    <td>${escapeHtml(menu.menuName || '-')}</td>
                    <td>${escapeHtml(menu.menuCode || '-')}</td>
                    <td>${escapeHtml(menu.path || '-')}</td>
                    <td>${escapeHtml(menu.icon || '-')}</td>
                    <td>${escapeHtml(menu.description || '-')}</td>
                </tr>
            `;
        }).join('');
    }
    
    // 更新全选复选框状态
    const selectAllCheckbox = document.getElementById('selectAllMenus');
    if (selectAllCheckbox && pageMenus.length > 0) {
        const allChecked = pageMenus.every(menu => selectedMenuIds.includes(menu.id));
        const someChecked = pageMenus.some(menu => selectedMenuIds.includes(menu.id));
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    // 更新分页控件
    updateMenuPagination(page, totalPages, filteredMenus.length);
    
    // 更新已选菜单列表
    updateSelectedMenusList();
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
 * 绑定菜单查询事件
 */
function bindMenuSearchEvents(modal) {
    // 使用setTimeout确保DOM完全渲染
    setTimeout(() => {
        const searchBtn = document.getElementById('searchMenusBtn');
        const resetBtn = document.getElementById('resetMenusBtn');
        const searchInput = document.getElementById('menuSearchInput');
        
        if (searchBtn) {
            // 移除旧的事件监听器（通过克隆节点）
            const newSearchBtn = searchBtn.cloneNode(true);
            searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
            newSearchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (modal) {
                    modal.dataset.menuPage = '1';
                    renderMenuTable(1, modal);
                } else {
                    renderMenuTable(1);
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
                    modal.dataset.menuPage = '1';
                    renderMenuTable(1, modal);
                } else {
                    renderMenuTable(1);
                }
            });
        }
        
        // 支持回车键搜索
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (modal) {
                        modal.dataset.menuPage = '1';
                        renderMenuTable(1, modal);
                    } else {
                        renderMenuTable(1);
                    }
                }
            });
        }
    }, 100);
}

/**
 * 全选/取消全选菜单
 */
function toggleSelectAllMenus(checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const filteredMenus = JSON.parse(modal.dataset.filteredMenus || modal.dataset.allMenus || '[]');
    const menuPageSize = 15;
    const currentPage = parseInt(modal.dataset.menuPage || '1');
    const start = (currentPage - 1) * menuPageSize;
    const end = start + menuPageSize;
    const pageMenus = filteredMenus.slice(start, end);
    
    const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');
    
    if (checkbox.checked) {
        // 全选当前页
        pageMenus.forEach(menu => {
            if (!selectedMenuIds.includes(menu.id)) {
                selectedMenuIds.push(menu.id);
            }
        });
    } else {
        // 取消全选当前页
        pageMenus.forEach(menu => {
            const index = selectedMenuIds.indexOf(menu.id);
            if (index > -1) {
                selectedMenuIds.splice(index, 1);
            }
        });
    }
    
    modal.dataset.selectedMenuIds = JSON.stringify(selectedMenuIds);
    
    // 更新表格
    renderMenuTable(currentPage, modal);
}

/**
 * 切换菜单选择
 */
function toggleMenuSelection(menuId, checkbox) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');
    const index = selectedMenuIds.indexOf(menuId);
    
    if (checkbox.checked) {
        if (index === -1) {
            selectedMenuIds.push(menuId);
        }
    } else {
        if (index > -1) {
            selectedMenuIds.splice(index, 1);
        }
    }
    
    modal.dataset.selectedMenuIds = JSON.stringify(selectedMenuIds);
    
    // 更新全选复选框状态
    const filteredMenus = JSON.parse(modal.dataset.filteredMenus || modal.dataset.allMenus || '[]');
    const menuPageSize = 15;
    const currentPage = parseInt(modal.dataset.menuPage || '1');
    const start = (currentPage - 1) * menuPageSize;
    const end = start + menuPageSize;
    const pageMenus = filteredMenus.slice(start, end);
    
    const selectAllCheckbox = document.getElementById('selectAllMenus');
    if (selectAllCheckbox && pageMenus.length > 0) {
        const allChecked = pageMenus.every(menu => selectedMenuIds.includes(menu.id));
        const someChecked = pageMenus.some(menu => selectedMenuIds.includes(menu.id));
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = someChecked && !allChecked;
    }
    
    // 更新已选菜单列表
    updateSelectedMenusList();
}

/**
 * 更新菜单分页控件
 */
function updateMenuPagination(currentPage, totalPages, total = 0) {
    const paginationEl = document.getElementById('menuPagination');
    if (!paginationEl) return;
    
    if (totalPages <= 1) {
        paginationEl.innerHTML = total > 0 ? `<span style="color: #6c757d;">共 ${total} 条记录</span>` : '';
        return;
    }
    
    let paginationHTML = '<div style="display: flex; justify-content: center; align-items: center; gap: 8px;">';
    
    // 上一页按钮
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeMenuPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>上一页</button>`;
    
    // 页码按钮
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeMenuPage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `<button type="button" class="btn btn-sm ${i === currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="changeMenuPage(${i})">${i}</button>`;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span style="padding: 0 8px;">...</span>`;
        }
        paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeMenuPage(${totalPages})">${totalPages}</button>`;
    }
    
    // 下一页按钮
    paginationHTML += `<button type="button" class="btn btn-sm btn-secondary" onclick="changeMenuPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>下一页</button>`;
    
    paginationHTML += `<span style="margin-left: 16px; color: #6c757d;">共 ${total} 条记录，${totalPages} 页</span>`;
    paginationHTML += '</div>';
    
    paginationEl.innerHTML = paginationHTML;
}

/**
 * 切换菜单分页
 */
function changeMenuPage(page) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    modal.dataset.menuPage = page.toString();
    renderMenuTable(page, modal);
}

/**
 * 更新已选菜单列表显示
 */
function updateSelectedMenusList() {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) return;
    
    // 从模态框的dataset中获取已选中的菜单ID
    const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');
    const allMenus = JSON.parse(modal.dataset.allMenus || '[]');
    const selectedMenus = allMenus.filter(m => selectedMenuIds.includes(m.id));
    
    // 更新已选菜单列表
    const selectedListEl = document.getElementById('selectedMenusList');
    if (selectedListEl) {
        if (selectedMenus.length === 0) {
            selectedListEl.innerHTML = '<span class="text-muted">已选菜单将显示在这里</span>';
        } else {
            selectedListEl.innerHTML = selectedMenus.map(menu => `
                <span class="selected-menu-item" data-menu-id="${menu.id}" style="display: inline-block; padding: 4px 8px; margin: 4px; background: #28a745; color: white; border-radius: 4px; font-size: 12px;">
                    ${menu.menuName} (${menu.menuCode})
                    <span onclick="removeSelectedMenu('${menu.id}')" style="margin-left: 4px; cursor: pointer;">×</span>
                </span>
            `).join('');
        }
    }
}

/**
 * 移除已选菜单（从列表中移除）
 */
function removeSelectedMenu(menuId) {
    let modal = document.querySelector('.modal.active') || document.querySelector('.modal.show');
    if (!modal) {
        const form = document.getElementById('roleForm');
        if (form) {
            modal = form.closest('.modal');
        }
    }
    if (!modal) {
        console.error('未找到模态框');
        return;
    }
    
    const selectedMenuIds = JSON.parse(modal.dataset.selectedMenuIds || '[]');
    const index = selectedMenuIds.indexOf(menuId);
    
    if (index > -1) {
        selectedMenuIds.splice(index, 1);
        modal.dataset.selectedMenuIds = JSON.stringify(selectedMenuIds);
        
        // 更新当前页面的复选框状态
        const checkbox = document.querySelector(`#menuTableBody input[type="checkbox"][value="${menuId}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        
        // 更新全选复选框状态
        const filteredMenus = JSON.parse(modal.dataset.filteredMenus || modal.dataset.allMenus || '[]');
        const menuPageSize = 15;
        const currentPage = parseInt(modal.dataset.menuPage || '1');
        const start = (currentPage - 1) * menuPageSize;
        const end = start + menuPageSize;
        const pageMenus = filteredMenus.slice(start, end);
        
        const selectAllCheckbox = document.getElementById('selectAllMenus');
        if (selectAllCheckbox && pageMenus.length > 0) {
            const allChecked = pageMenus.every(menu => selectedMenuIds.includes(menu.id));
            const someChecked = pageMenus.some(menu => selectedMenuIds.includes(menu.id));
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        }
        
        // 更新已选菜单列表
        updateSelectedMenusList();
    }
}

/**
 * 删除角色
 */
async function deleteRole(id, roleName) {
    const confirmed = await showConfirmModal(
        '确认删除',
        `确定要删除角色 "${roleName}" 吗？此操作不可恢复。`
    );
    
    if (!confirmed) {
        return;
    }

    try {
        const response = await api.deleteRole(id);
        // 兼容两种响应格式
        const isSuccess = response.code === 200 || (response.success === true);
        if (isSuccess) {
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
    bindRoleSearchEvents();
}

/**
 * 绑定角色搜索事件
 */
function bindRoleSearchEvents() {
    const searchBtn = document.getElementById('searchRolesBtn');
    const resetBtn = document.getElementById('resetRolesBtn');
    const searchInput = document.getElementById('roleSearchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const keyword = searchInput ? searchInput.value.trim() : '';
            loadRoles(keyword);
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (searchInput) {
                searchInput.value = '';
            }
            roleSearchKeyword = '';
            loadRoles('');
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const keyword = searchInput.value.trim();
                loadRoles(keyword);
            }
        });
    }
}

// 导出供全局使用
window.initRoles = initRoles;
window.editRole = editRole;
window.deleteRole = deleteRole;
window.toggleMenuSelection = toggleMenuSelection;
window.updateSelectedMenusList = updateSelectedMenusList;
window.removeSelectedMenu = removeSelectedMenu;
window.changeMenuPage = changeMenuPage;
window.updateMenuPagination = updateMenuPagination;
window.toggleSelectAllMenus = toggleSelectAllMenus;
window.renderMenuTable = renderMenuTable;
window.escapeHtml = escapeHtml;


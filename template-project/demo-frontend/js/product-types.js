/**
 * 商品类型管理模块
 */

let productTypesPage = 1;
const productTypesPageSize = 10;

/**
 * 加载商品类型列表
 */
async function loadProductTypes(page = 1) {
    try {
        const response = await api.getProductTypes(page, productTypesPageSize);
        if (response.code === 200) {
            const types = response.data.records || response.data.list || [];
            const total = response.data.total || types.length;
            
            renderProductTypesTable(types);
            renderPagination(total, page, 'product-types');
        } else {
            showMessage(response.message || '加载商品类型列表失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载商品类型列表失败', 'error');
        document.getElementById('productTypesTableBody').innerHTML = 
            '<tr><td colspan="6" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染商品类型表格
 */
function renderProductTypesTable(types) {
    const tbody = document.getElementById('productTypesTableBody');
    if (!tbody) return;

    if (types.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = types.map(type => `
        <tr>
            <td>${type.typeName || '-'}</td>
            <td>${type.typeCode || '-'}</td>
            <td>${type.description || '-'}</td>
            <td>${type.sortOrder || 0}</td>
            <td>
                <span class="badge ${type.enabled ? 'badge-success' : 'badge-danger'}">
                    ${type.enabled ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editProductType('${type.id}')">编辑</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProductType('${type.id}', '${type.typeName}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 添加/编辑商品类型
 */
async function editProductType(id = null) {
    let typeData = {};
    if (id) {
        try {
            const response = await api.getProductTypeById(id);
            if (response.code === 200) {
                typeData = response.data || {};
            }
        } catch (error) {
            showMessage('加载商品类型信息失败', 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('类型名称', 'typeName', 'text', typeData.typeName || '', { required: true, placeholder: '请输入类型名称' }).outerHTML}
        ${createFormField('类型代码', 'typeCode', 'text', typeData.typeCode || '', { required: true, placeholder: '请输入类型代码（英文大写）' }).outerHTML}
        ${createFormField('描述', 'description', 'textarea', typeData.description || '', { placeholder: '请输入描述信息' }).outerHTML}
        ${createFormField('排序', 'sortOrder', 'number', typeData.sortOrder || 0, { min: 0, placeholder: '排序数字，越小越靠前' }).outerHTML}
        ${createFormField('状态', 'enabled', 'select', typeData.enabled !== undefined ? typeData.enabled : true, { 
            options: [
                { value: 'true', text: '启用' },
                { value: 'false', text: '禁用' }
            ]
        }).outerHTML}
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            <button type="submit" class="btn btn-primary">${id ? '更新' : '创建'}</button>
        </div>
    `;

    const formHTML = `<form id="productTypeForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑商品类型' : '新增商品类型', formHTML, '');
    
    const formEl = modal.querySelector('#productTypeForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }
    
    // 处理enabled字段（select返回的是字符串）
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);
        data.enabled = data.enabled === 'true';
        data.sortOrder = parseInt(data.sortOrder) || 0;

        try {
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            let response;
            if (id) {
                response = await api.updateProductType(id, data);
            } else {
                response = await api.createProductType(data);
            }

            if (response.code === 200) {
                showMessage(id ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadProductTypes(productTypesPage);
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
 * 删除商品类型
 */
async function deleteProductType(id, typeName) {
    if (!confirm(`确定要删除商品类型 "${typeName}" 吗？`)) {
        return;
    }

    try {
        const response = await api.deleteProductType(id);
        if (response.code === 200) {
            showMessage('删除成功', 'success');
            loadProductTypes(productTypesPage);
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 初始化商品类型管理
 */
function initProductTypes() {
    // 事件绑定已通过事件委托在home.js中统一处理
    // 这里只需要加载数据
    loadProductTypes(productTypesPage);
}

// 导出供全局使用
window.initProductTypes = initProductTypes;

// 导出供全局使用
window.editProductType = editProductType;
window.deleteProductType = deleteProductType;


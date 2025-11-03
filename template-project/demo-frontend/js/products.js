/**
 * 商品管理模块
 */

let productsPage = 1;
const productsPageSize = 10;
let productTypeOptions = [];

/**
 * 加载商品列表
 */
async function loadProducts(page = 1) {
    try {
        const response = await api.getProducts(page, productsPageSize);
        if (response.code === 200) {
            const products = response.data.records || response.data.list || [];
            const total = response.data.total || products.length;
            
            renderProductsTable(products);
            renderPagination(total, page, 'products');
        } else {
            showMessage(response.message || '加载商品列表失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '加载商品列表失败', 'error');
        document.getElementById('productsTableBody').innerHTML = 
            '<tr><td colspan="7" class="loading">加载失败</td></tr>';
    }
}

/**
 * 加载商品类型选项（用于下拉框）
 */
async function loadProductTypeOptions() {
    try {
        const response = await api.getEnabledProductTypes();
        if (response.code === 200) {
            const types = response.data || [];
            productTypeOptions = types.map(type => ({
                value: type.id,
                text: `${type.typeName} (${type.typeCode})`
            }));
        }
    } catch (error) {
        console.error('加载商品类型失败:', error);
    }
}

/**
 * 渲染商品表格
 */
function renderProductsTable(products) {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = products.map(product => `
        <tr>
            <td>${product.productName || '-'}</td>
            <td>${product.productCode || '-'}</td>
            <td>${product.typeName || product.type?.typeName || '-'}</td>
            <td>¥${(product.price || 0).toFixed(2)}</td>
            <td>${product.stock || 0}</td>
            <td>
                <span class="badge ${product.enabled ? 'badge-success' : 'badge-danger'}">
                    ${product.enabled ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="editProduct('${product.id}')">编辑</button>
                    <button class="btn btn-sm btn-secondary" onclick="updateProductStock('${product.id}', '${product.productName}')">更新库存</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product.id}', '${product.productName}')">删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * 添加/编辑商品
 */
async function editProduct(id = null) {
    // 确保已加载商品类型选项
    if (productTypeOptions.length === 0) {
        await loadProductTypeOptions();
    }

    let productData = {};
    if (id) {
        try {
            const response = await api.getProductById(id);
            if (response.code === 200) {
                productData = response.data || {};
            }
        } catch (error) {
            showMessage('加载商品信息失败', 'error');
            return;
        }
    }

    // 创建表单内容（包含提交按钮在表单内部）
    const formContent = `
        ${createFormField('商品名称', 'productName', 'text', productData.productName || '', { required: true, placeholder: '请输入商品名称' }).outerHTML}
        ${createFormField('商品代码', 'productCode', 'text', productData.productCode || '', { required: true, placeholder: '请输入商品代码' }).outerHTML}
        ${createFormField('商品类型', 'typeId', 'select', productData.typeId || '', { 
            required: true,
            options: [{ value: '', text: '请选择类型' }, ...productTypeOptions]
        }).outerHTML}
        ${createFormField('价格', 'price', 'number', productData.price || 0, { required: true, min: 0, step: 0.01, placeholder: '请输入价格' }).outerHTML}
        ${createFormField('库存', 'stock', 'number', productData.stock || 0, { required: true, min: 0, placeholder: '请输入库存数量' }).outerHTML}
        ${createFormField('描述', 'description', 'textarea', productData.description || '', { placeholder: '请输入商品描述' }).outerHTML}
        ${createFormField('图片URL', 'imageUrl', 'text', productData.imageUrl || '', { placeholder: '请输入图片URL（可选）' }).outerHTML}
        ${createFormField('状态', 'enabled', 'select', productData.enabled !== undefined ? productData.enabled : true, { 
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

    const formHTML = `<form id="productForm">${formContent}</form>`;
    const modal = createModal(id ? '编辑商品' : '新增商品', formHTML, '');
    
    const formEl = modal.querySelector('#productForm');
    if (!formEl) {
        showMessage('表单创建失败', 'error');
        return;
    }
    
    formEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = getFormData(formEl);
        data.enabled = data.enabled === 'true';
        data.price = parseFloat(data.price) || 0;
        data.stock = parseInt(data.stock) || 0;
        
        if (!data.imageUrl) {
            delete data.imageUrl;
        }

        try {
            const submitBtn = formEl.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            let response;
            if (id) {
                response = await api.updateProduct(id, data);
            } else {
                response = await api.createProduct(data);
            }

            if (response.code === 200) {
                showMessage(id ? '更新成功' : '创建成功', 'success');
                closeModal();
                loadProducts(productsPage);
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
 * 更新商品库存
 */
async function updateProductStock(id, productName) {
    const stock = prompt(`请输入 "${productName}" 的新库存数量：`, '0');
    if (stock === null) return;

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
        showMessage('请输入有效的库存数量', 'error');
        return;
    }

    try {
        // 先获取商品信息
        const productRes = await api.getProductById(id);
        if (productRes.code !== 200) {
            showMessage('获取商品信息失败', 'error');
            return;
        }

        // 更新库存
        const productData = productRes.data;
        productData.stock = stockNum;
        
        const response = await api.updateProduct(id, productData);
        if (response.code === 200) {
            showMessage('库存更新成功', 'success');
            loadProducts(productsPage);
        } else {
            showMessage(response.message || '更新库存失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '更新库存失败', 'error');
    }
}

/**
 * 删除商品
 */
async function deleteProduct(id, productName) {
    if (!confirm(`确定要删除商品 "${productName}" 吗？`)) {
        return;
    }

    try {
        const response = await api.deleteProduct(id);
        if (response.code === 200) {
            showMessage('删除成功', 'success');
            loadProducts(productsPage);
        } else {
            showMessage(response.message || '删除失败', 'error');
        }
    } catch (error) {
        showMessage(error.message || '删除失败', 'error');
    }
}

/**
 * 初始化商品管理
 */
async function initProducts() {
    // 事件绑定已通过事件委托在home.js中统一处理
    // 这里只需要加载数据
    await loadProductTypeOptions();
    loadProducts(productsPage);
}

// 导出供全局使用
window.initProducts = initProducts;

// 导出供全局使用
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateProductStock = updateProductStock;


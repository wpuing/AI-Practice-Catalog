/**
 * 商品管理页面
 */

import { createMainLayout } from '@layouts/MainLayout.js';
import productService from '@services/product-service.js';
import { createTable, createPagination } from '@components/Table.js';
import { createModal, showModal, hideModal, initModal } from '@components/Modal.js';
import { formatDate, formatCurrency } from '@utils/format.js';
import logger from '@utils/logger.js';
import { PAGINATION_CONFIG } from '@config/index.js';

let currentPage = 1;
let pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
let searchKeyword = '';
let products = [];
let total = 0;

export default async function ProductManagementPage() {
  const html = `
    <div class="page-container">
      <div class="page-header">
        <h1>商品管理</h1>
        <p>管理系统商品信息</p>
      </div>
      
      <div class="page-content">
        <div class="card">
          <div class="card-header">
            <h2>商品列表</h2>
            <button class="btn btn-primary" id="addProductBtn">添加商品</button>
          </div>
          
          <div class="card-body">
            <div class="search-bar">
              <div class="form-group" style="flex: 1; min-width: 300px;">
                <input 
                  type="text" 
                  class="form-input" 
                  id="searchInput" 
                  placeholder="搜索商品名称、编码或描述"
                  value="${searchKeyword}"
                />
              </div>
              <button class="btn btn-primary" id="searchBtn">搜索</button>
              <button class="btn btn-secondary" id="resetBtn">重置</button>
            </div>
            
            <div id="productTableContainer">
              <div class="table-loading">加载中...</div>
            </div>
            
            <div id="paginationContainer"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return {
    html: createMainLayout(html),
    init: initProductManagement
  };
}

async function initProductManagement() {
  await loadProducts();
  bindEvents();
}

async function loadProducts() {
  try {
    const container = document.getElementById('productTableContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="table-loading">加载中...</div>';
    
    const params = {
      pageNum: currentPage,
      pageSize: pageSize
    };
    
    if (searchKeyword) {
      params.keyword = searchKeyword;
    }
    
    const result = await productService.getProducts(params);
    products = result.list || [];
    total = result.total || 0;
    
    renderTable();
    renderPagination();
  } catch (error) {
    logger.error('Failed to load products', error);
    const container = document.getElementById('productTableContainer');
    if (container) {
      let errorMessage = '加载失败';
      if (error.status === 404) {
        errorMessage = '后端服务未找到，请检查服务是否已启动';
      } else if (error.message) {
        errorMessage = `加载失败：${error.message}`;
      }
      container.innerHTML = `<div class="table-empty">${errorMessage}</div>`;
    }
  }
}

function renderTable() {
  const container = document.getElementById('productTableContainer');
  if (!container) return;
  
  const columns = [
    { key: 'productName', title: '商品名称' },
    { key: 'productCode', title: '商品编码' },
    { 
      key: 'category', 
      title: '分类',
      render: (value) => {
        // 如果category是32位ID格式（只包含小写字母和数字），则不显示
        if (value && /^[a-z0-9]{32}$/.test(value)) {
          return '-';
        }
        return value || '-';
      }
    },
    { 
      key: 'price', 
      title: '价格',
      render: (value) => formatCurrency(value || 0)
    },
    { key: 'stock', title: '库存' },
    { 
      key: 'status', 
      title: '状态',
      render: (value) => {
        return value === 1 
          ? '<span style="color: var(--success-color);">上架</span>'
          : '<span style="color: var(--text-secondary);">下架</span>';
      }
    },
    { 
      key: 'createDate', 
      title: '创建时间',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: '操作',
      width: '200px',
      render: (_, row) => `
        <button class="btn btn-text btn-small" data-action="edit" data-id="${row.id}">编辑</button>
        <button class="btn btn-text btn-small" data-action="delete" data-id="${row.id}" style="color: var(--error-color);">删除</button>
      `
    }
  ];
  
  container.innerHTML = createTable(columns, products, {
    emptyText: '暂无商品数据',
    rowKey: 'id'
  });
  
  // 绑定操作按钮事件
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (action === 'edit') {
        showEditModal(id);
      } else if (action === 'delete') {
        handleDelete(id);
      }
    });
  });
}

function renderPagination() {
  const container = document.getElementById('paginationContainer');
  if (!container) return;
  
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = createPagination(currentPage, totalPages, pageSize, (page) => {
    currentPage = page;
    loadProducts();
  });
}

function bindEvents() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetBtn');
  const addProductBtn = document.getElementById('addProductBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchKeyword = searchInput?.value?.trim() || '';
      currentPage = 1;
      loadProducts();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchKeyword = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchKeyword = '';
      if (searchInput) searchInput.value = '';
      currentPage = 1;
      loadProducts();
    });
  }
  
  if (addProductBtn) {
    addProductBtn.addEventListener('click', () => {
      showEditModal(null);
    });
  }
}

function showEditModal(productId) {
  const product = productId ? products.find(p => p.id === productId) : null;
  const isEdit = !!product;
  
  const formHtml = `
    <form id="productForm">
      <div class="form-group">
        <label class="required">商品名称</label>
        <input 
          type="text" 
          class="form-input" 
          id="productNameInput" 
          name="productName"
          value="${product?.productName || ''}"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="required">商品编码</label>
        <input 
          type="text" 
          class="form-input" 
          id="productCodeInput" 
          name="productCode"
          value="${product?.productCode || ''}"
          required
        />
      </div>
      
      <div class="form-group">
        <label>分类</label>
        <input 
          type="text" 
          class="form-input" 
          id="categoryInput" 
          name="category"
          value="${product?.category || ''}"
        />
      </div>
      
      <div class="form-group">
        <label class="required">价格</label>
        <input 
          type="number" 
          class="form-input" 
          id="priceInput" 
          name="price"
          value="${product?.price || ''}"
          step="0.01"
          min="0"
          required
        />
      </div>
      
      <div class="form-group">
        <label class="required">库存</label>
        <input 
          type="number" 
          class="form-input" 
          id="stockInput" 
          name="stock"
          value="${product?.stock || ''}"
          min="0"
          required
        />
      </div>
      
      <div class="form-group">
        <label>描述</label>
        <textarea 
          class="form-textarea" 
          id="descriptionInput" 
          name="description"
        >${product?.description || ''}</textarea>
      </div>
      
      <div class="form-group">
        <label class="required">状态</label>
        <select class="form-select" id="statusSelect" name="status" required>
          <option value="1" ${product?.status === 1 ? 'selected' : ''}>上架</option>
          <option value="0" ${product?.status === 0 ? 'selected' : ''}>下架</option>
        </select>
      </div>
      
      <div id="formError" class="form-error" style="display: none;"></div>
    </form>
  `;
  
  const footer = `
    <button class="btn btn-secondary" id="cancelBtn">取消</button>
    <button class="btn btn-primary" id="saveBtn">保存</button>
  `;
  
  const modalHtml = createModal(
    isEdit ? '编辑商品' : '添加商品',
    formHtml,
    footer
  );
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  showModal('commonModal');
  
  initModal('commonModal', () => {
    const modal = document.getElementById('commonModal');
    if (modal) modal.remove();
  });
  
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('productForm');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await handleSave(productId);
    });
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      hideModal('commonModal');
      const modal = document.getElementById('commonModal');
      if (modal) modal.remove();
    });
  }
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSave(productId);
    });
  }
}

async function handleSave(productId) {
  const form = document.getElementById('productForm');
  const errorDiv = document.getElementById('formError');
  
  if (!form) return;
  
  const formData = new FormData(form);
  const data = {
    productName: formData.get('productName')?.trim(),
    productCode: formData.get('productCode')?.trim(),
    category: formData.get('category')?.trim() || null,
    price: parseFloat(formData.get('price')) || 0,
    stock: parseInt(formData.get('stock')) || 0,
    description: formData.get('description')?.trim() || null,
    status: parseInt(formData.get('status')) || 1
  };
  
  if (!data.productName) {
    showError('请输入商品名称');
    return;
  }
  
  if (!data.productCode) {
    showError('请输入商品编码');
    return;
  }
  
  try {
    if (productId) {
      await productService.updateProduct(productId, data);
    } else {
      await productService.createProduct(data);
    }
    
    hideModal('commonModal');
    const modal = document.getElementById('commonModal');
    if (modal) modal.remove();
    
    await loadProducts();
  } catch (error) {
    showError(error.message || '保存失败');
  }
  
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }
}

async function handleDelete(productId) {
  if (!confirm('确定要删除该商品吗？')) {
    return;
  }
  
  try {
    await productService.deleteProduct(productId);
    await loadProducts();
  } catch (error) {
    alert('删除失败：' + (error.message || '未知错误'));
  }
}

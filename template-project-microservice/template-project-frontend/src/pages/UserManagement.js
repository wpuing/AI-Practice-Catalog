/**
 * 用户管理页面
 */

import { createMainLayout } from '@layouts/MainLayout.js';
import userService from '@services/user-service.js';
import { createTable, createPagination } from '@components/Table.js';
import { createModal, showModal, hideModal, initModal } from '@components/Modal.js';
import { formatDate } from '@utils/format.js';
import logger from '@utils/logger.js';
import { PAGINATION_CONFIG } from '@config/index.js';

let currentPage = 1;
let pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
let searchKeyword = '';
let users = [];
let total = 0;

export default async function UserManagementPage() {
  const html = `
    <div class="page-container">
      <div class="page-header">
        <h1>用户管理</h1>
        <p>管理系统用户信息</p>
      </div>
      
      <div class="page-content">
        <div class="card">
          <div class="card-header">
            <h2>用户列表</h2>
            <button class="btn btn-primary" id="addUserBtn">添加用户</button>
          </div>
          
          <div class="card-body">
            <div class="search-bar">
              <div class="form-group" style="flex: 1; min-width: 300px;">
                <input 
                  type="text" 
                  class="form-input" 
                  id="searchInput" 
                  placeholder="搜索用户名、邮箱或手机号"
                  value="${searchKeyword}"
                />
              </div>
              <button class="btn btn-primary" id="searchBtn">搜索</button>
              <button class="btn btn-secondary" id="resetBtn">重置</button>
            </div>
            
            <div id="userTableContainer">
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
    init: initUserManagement
  };
}

async function initUserManagement() {
  await loadUsers();
  bindEvents();
}

async function loadUsers() {
  try {
    const container = document.getElementById('userTableContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="table-loading">加载中...</div>';
    
    const params = {
      pageNum: currentPage,
      pageSize: pageSize
    };
    
    if (searchKeyword) {
      params.keyword = searchKeyword;
    }
    
    const result = await userService.getUsers(params);
    users = result.list || [];
    total = result.total || 0;
    
    renderTable();
    renderPagination();
  } catch (error) {
    logger.error('Failed to load users', error);
    const container = document.getElementById('userTableContainer');
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
  const container = document.getElementById('userTableContainer');
  if (!container) return;
  
  const columns = [
    { key: 'username', title: '用户名' },
    { key: 'email', title: '邮箱' },
    { key: 'phone', title: '手机号' },
    { 
      key: 'status', 
      title: '状态',
      render: (value) => {
        return value === 1 
          ? '<span style="color: var(--success-color);">启用</span>'
          : '<span style="color: var(--text-secondary);">禁用</span>';
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
  
  container.innerHTML = createTable(columns, users, {
    emptyText: '暂无用户数据',
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
    loadUsers();
  });
}

function bindEvents() {
  // 搜索
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetBtn');
  const addUserBtn = document.getElementById('addUserBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchKeyword = searchInput?.value?.trim() || '';
      currentPage = 1;
      loadUsers();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchKeyword = searchInput.value.trim();
        currentPage = 1;
        loadUsers();
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchKeyword = '';
      if (searchInput) searchInput.value = '';
      currentPage = 1;
      loadUsers();
    });
  }
  
  if (addUserBtn) {
    addUserBtn.addEventListener('click', () => {
      showEditModal(null);
    });
  }
}

function showEditModal(userId) {
  const user = userId ? users.find(u => u.id === userId) : null;
  const isEdit = !!user;
  
  const formHtml = `
    <form id="userForm">
      <div class="form-group">
        <label class="required">用户名</label>
        <input 
          type="text" 
          class="form-input" 
          id="usernameInput" 
          name="username"
          value="${user?.username || ''}"
          ${isEdit ? 'readonly' : ''}
          required
        />
      </div>
      
      ${!isEdit ? `
        <div class="form-group">
          <label class="required">密码</label>
          <input 
            type="password" 
            class="form-input" 
            id="passwordInput" 
            name="password"
            required
          />
        </div>
      ` : ''}
      
      <div class="form-group">
        <label>邮箱</label>
        <input 
          type="email" 
          class="form-input" 
          id="emailInput" 
          name="email"
          value="${user?.email || ''}"
        />
      </div>
      
      <div class="form-group">
        <label>手机号</label>
        <input 
          type="tel" 
          class="form-input" 
          id="phoneInput" 
          name="phone"
          value="${user?.phone || ''}"
        />
      </div>
      
      <div class="form-group">
        <label class="required">状态</label>
        <select class="form-select" id="statusSelect" name="status" required>
          <option value="1" ${user?.status === 1 ? 'selected' : ''}>启用</option>
          <option value="0" ${user?.status === 0 ? 'selected' : ''}>禁用</option>
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
    isEdit ? '编辑用户' : '添加用户',
    formHtml,
    footer
  );
  
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  showModal('commonModal');
  
  initModal('commonModal', () => {
    const modal = document.getElementById('commonModal');
    if (modal) modal.remove();
  });
  
  // 绑定保存事件
  const saveBtn = document.getElementById('saveBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const form = document.getElementById('userForm');
  
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await handleSave(userId);
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
      await handleSave(userId);
    });
  }
}

async function handleSave(userId) {
  const form = document.getElementById('userForm');
  const errorDiv = document.getElementById('formError');
  
  if (!form) return;
  
  const formData = new FormData(form);
  const data = {
    username: formData.get('username')?.trim(),
    email: formData.get('email')?.trim() || null,
    phone: formData.get('phone')?.trim() || null,
    status: parseInt(formData.get('status')) || 1
  };
  
  if (!data.username) {
    showError('请输入用户名');
    return;
  }
  
  if (!userId && !formData.get('password')) {
    showError('请输入密码');
    return;
  }
  
  if (!userId) {
    data.password = formData.get('password');
  }
  
  try {
    if (userId) {
      await userService.updateUser(userId, data);
    } else {
      await userService.createUser(data);
    }
    
    hideModal('commonModal');
    const modal = document.getElementById('commonModal');
    if (modal) modal.remove();
    
    await loadUsers();
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

async function handleDelete(userId) {
  if (!confirm('确定要删除该用户吗？')) {
    return;
  }
  
  try {
    await userService.deleteUser(userId);
    await loadUsers();
  } catch (error) {
    alert('删除失败：' + (error.message || '未知错误'));
  }
}

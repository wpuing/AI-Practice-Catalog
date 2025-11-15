/**
 * 文件管理页面
 */

import { createMainLayout } from '@layouts/MainLayout.js';
import fileService from '@services/file-service.js';
import { createTable, createPagination } from '@components/Table.js';
import { formatDate, formatFileSize } from '@utils/format.js';
import logger from '@utils/logger.js';
import { PAGINATION_CONFIG } from '@config/index.js';

let currentPage = 1;
let pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
let searchKeyword = '';
let files = [];
let total = 0;

export default async function FileManagementPage() {
  const html = `
    <div class="page-container">
      <div class="page-header">
        <h1>文件管理</h1>
        <p>管理系统文件</p>
      </div>
      
      <div class="page-content">
        <div class="card">
          <div class="card-header">
            <h2>文件列表</h2>
            <div>
              <input 
                type="file" 
                id="fileInput" 
                style="display: none;"
                multiple
              />
              <button class="btn btn-primary" id="uploadBtn">上传文件</button>
            </div>
          </div>
          
          <div class="card-body">
            <div class="search-bar">
              <div class="form-group" style="flex: 1; min-width: 300px;">
                <input 
                  type="text" 
                  class="form-input" 
                  id="searchInput" 
                  placeholder="搜索文件名"
                  value="${searchKeyword}"
                />
              </div>
              <button class="btn btn-primary" id="searchBtn">搜索</button>
              <button class="btn btn-secondary" id="resetBtn">重置</button>
            </div>
            
            <div id="fileTableContainer">
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
    init: initFileManagement
  };
}

async function initFileManagement() {
  await loadFiles();
  bindEvents();
}

async function loadFiles() {
  try {
    const container = document.getElementById('fileTableContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="table-loading">加载中...</div>';
    
    const params = {
      pageNum: currentPage,
      pageSize: pageSize
    };
    
    if (searchKeyword) {
      params.keyword = searchKeyword;
    }
    
    const result = await fileService.getFiles(params);
    files = result.list || [];
    total = result.total || 0;
    
    renderTable();
    renderPagination();
  } catch (error) {
    logger.error('Failed to load files', error);
    const container = document.getElementById('fileTableContainer');
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
  const container = document.getElementById('fileTableContainer');
  if (!container) return;
  
  const columns = [
    { key: 'fileName', title: '文件名' },
    { key: 'fileType', title: '文件类型' },
    { 
      key: 'fileSize', 
      title: '文件大小',
      render: (value) => formatFileSize(value || 0)
    },
    { key: 'uploadUser', title: '上传用户' },
    { 
      key: 'uploadDate', 
      title: '上传时间',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      title: '操作',
      width: '250px',
      render: (_, row) => `
        <button class="btn btn-text btn-small" data-action="preview" data-id="${row.id}">预览</button>
        <button class="btn btn-text btn-small" data-action="download" data-id="${row.id}" data-filename="${row.fileName || ''}">下载</button>
        <button class="btn btn-text btn-small" data-action="delete" data-id="${row.id}" style="color: var(--error-color);">删除</button>
      `
    }
  ];
  
  container.innerHTML = createTable(columns, files, {
    emptyText: '暂无文件数据',
    rowKey: 'id'
  });
  
  // 绑定操作按钮事件
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      const filename = btn.getAttribute('data-filename');
      
      if (action === 'preview') {
        previewFile(id);
      } else if (action === 'download') {
        downloadFile(id, filename);
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
    loadFiles();
  });
}

function bindEvents() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const fileInput = document.getElementById('fileInput');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchKeyword = searchInput?.value?.trim() || '';
      currentPage = 1;
      loadFiles();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchKeyword = searchInput.value.trim();
        currentPage = 1;
        loadFiles();
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchKeyword = '';
      if (searchInput) searchInput.value = '';
      currentPage = 1;
      loadFiles();
    });
  }
  
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      fileInput?.click();
    });
  }
  
  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 0) {
        await handleUpload(selectedFiles);
        fileInput.value = '';
      }
    });
  }
}

async function handleUpload(files) {
  for (const file of files) {
    try {
      await fileService.uploadFile(file, (progress) => {
        console.log(`上传进度: ${progress}%`);
      });
    } catch (error) {
      alert(`文件 ${file.name} 上传失败：${error.message || '未知错误'}`);
    }
  }
  
  await loadFiles();
}

function previewFile(id) {
  const previewUrl = fileService.getPreviewUrl(id);
  window.open(previewUrl, '_blank');
}

async function downloadFile(id, filename) {
  try {
    await fileService.downloadFile(id, filename);
  } catch (error) {
    alert('下载失败：' + (error.message || '未知错误'));
  }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该文件吗？')) {
    return;
  }
  
  try {
    await fileService.deleteFile(id);
    await loadFiles();
  } catch (error) {
    alert('删除失败：' + (error.message || '未知错误'));
  }
}

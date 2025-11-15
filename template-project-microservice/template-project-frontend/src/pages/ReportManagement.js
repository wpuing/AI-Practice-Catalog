/**
 * 报表管理页面
 */

import { createMainLayout } from '@layouts/MainLayout.js';
import reportService from '@services/report-service.js';
import { createTable, createPagination } from '@components/Table.js';
import { createModal, showModal, hideModal, initModal } from '@components/Modal.js';
import { formatDate } from '@utils/format.js';
import logger from '@utils/logger.js';
import { PAGINATION_CONFIG } from '@config/index.js';

let currentPage = 1;
let pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE;
let searchKeyword = '';
let reports = [];
let total = 0;

export default async function ReportManagementPage() {
  const html = `
    <div class="page-container">
      <div class="page-header">
        <h1>报表管理</h1>
        <p>查看和管理系统报表</p>
      </div>
      
      <div class="page-content">
        <div class="card">
          <div class="card-header">
            <h2>报表列表</h2>
            <button class="btn btn-primary" id="generateReportBtn">生成报表</button>
          </div>
          
          <div class="card-body">
            <div class="search-bar">
              <div class="form-group" style="flex: 1; min-width: 300px;">
                <input 
                  type="text" 
                  class="form-input" 
                  id="searchInput" 
                  placeholder="搜索报表名称或类型"
                  value="${searchKeyword}"
                />
              </div>
              <button class="btn btn-primary" id="searchBtn">搜索</button>
              <button class="btn btn-secondary" id="resetBtn">重置</button>
            </div>
            
            <div id="reportTableContainer">
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
    init: initReportManagement
  };
}

async function initReportManagement() {
  await loadReports();
  bindEvents();
}

async function loadReports() {
  try {
    const container = document.getElementById('reportTableContainer');
    if (!container) return;
    
    container.innerHTML = '<div class="table-loading">加载中...</div>';
    
    const params = {
      pageNum: currentPage,
      pageSize: pageSize
    };
    
    if (searchKeyword) {
      params.keyword = searchKeyword;
    }
    
    const result = await reportService.getReports(params);
    console.log('ReportManagement.loadReports - result:', result);
    
    reports = result.list || [];
    total = result.total || 0;
    
    console.log('ReportManagement.loadReports - reports:', reports);
    console.log('ReportManagement.loadReports - total:', total);
    
    renderTable();
    renderPagination();
  } catch (error) {
    logger.error('Failed to load reports', error);
    const container = document.getElementById('reportTableContainer');
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
  const container = document.getElementById('reportTableContainer');
  if (!container) {
    console.error('ReportManagement.renderTable - container not found');
    return;
  }
  
  console.log('ReportManagement.renderTable - reports:', reports);
  console.log('ReportManagement.renderTable - reports.length:', reports.length);
  
  const columns = [
    { key: 'reportName', title: '报表名称' },
    { key: 'reportType', title: '报表类型' },
    { key: 'templateName', title: '模板名称' },
    { 
      key: 'status', 
      title: '状态',
      render: (value) => {
        const statusMap = {
          'PENDING': '<span style="color: var(--warning-color);">待生成</span>',
          'GENERATING': '<span style="color: var(--info-color);">生成中</span>',
          'COMPLETED': '<span style="color: var(--success-color);">已完成</span>',
          'FAILED': '<span style="color: var(--error-color);">失败</span>'
        };
        return statusMap[value] || value;
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
      width: '250px',
      render: (_, row) => `
        <button class="btn btn-text btn-small" data-action="view" data-id="${row.id}">查看</button>
        <button class="btn btn-text btn-small" data-action="export" data-id="${row.id}">导出</button>
        <button class="btn btn-text btn-small" data-action="delete" data-id="${row.id}" style="color: var(--error-color);">删除</button>
      `
    }
  ];
  
  container.innerHTML = createTable(columns, reports, {
    emptyText: '暂无报表数据',
    rowKey: 'id'
  });
  
  // 绑定操作按钮事件
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const id = btn.getAttribute('data-id');
      if (action === 'view') {
        viewReport(id);
      } else if (action === 'export') {
        exportReport(id);
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
    loadReports();
  });
}

function bindEvents() {
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  const resetBtn = document.getElementById('resetBtn');
  const generateReportBtn = document.getElementById('generateReportBtn');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      searchKeyword = searchInput?.value?.trim() || '';
      currentPage = 1;
      loadReports();
    });
  }
  
  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        searchKeyword = searchInput.value.trim();
        currentPage = 1;
        loadReports();
      }
    });
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchKeyword = '';
      if (searchInput) searchInput.value = '';
      currentPage = 1;
      loadReports();
    });
  }
  
  if (generateReportBtn) {
    generateReportBtn.addEventListener('click', () => {
      showGenerateModal();
    });
  }
}

async function showGenerateModal() {
  try {
    const templates = await reportService.getTemplates();
    
    const formHtml = `
      <form id="reportForm">
        <div class="form-group">
          <label class="required">报表名称</label>
          <input 
            type="text" 
            class="form-input" 
            id="reportNameInput" 
            name="reportName"
            required
          />
        </div>
        
        <div class="form-group">
          <label class="required">选择模板</label>
          <select class="form-select" id="templateSelect" name="templateId" required>
            <option value="">请选择模板</option>
            ${templates.map(t => `<option value="${t.id}">${t.name || t.templateName}</option>`).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label>报表类型</label>
          <input 
            type="text" 
            class="form-input" 
            id="reportTypeInput" 
            name="reportType"
            placeholder="如：销售报表、库存报表等"
          />
        </div>
        
        <div class="form-group">
          <label>描述</label>
          <textarea 
            class="form-textarea" 
            id="descriptionInput" 
            name="description"
          ></textarea>
        </div>
        
        <div id="formError" class="form-error" style="display: none;"></div>
      </form>
    `;
    
    const footer = `
      <button class="btn btn-secondary" id="cancelBtn">取消</button>
      <button class="btn btn-primary" id="generateBtn">生成</button>
    `;
    
    const modalHtml = createModal('生成报表', formHtml, footer);
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    showModal('commonModal');
    
    initModal('commonModal', () => {
      const modal = document.getElementById('commonModal');
      if (modal) modal.remove();
    });
    
    const generateBtn = document.getElementById('generateBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('reportForm');
    
    if (generateBtn) {
      generateBtn.addEventListener('click', async () => {
        await handleGenerate();
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
        await handleGenerate();
      });
    }
  } catch (error) {
    alert('加载模板失败：' + (error.message || '未知错误'));
  }
}

async function handleGenerate() {
  const form = document.getElementById('reportForm');
  const errorDiv = document.getElementById('formError');
  
  if (!form) return;
  
  const formData = new FormData(form);
  const reportName = formData.get('reportName')?.trim();
  const templateId = formData.get('templateId');
  const reportType = formData.get('reportType')?.trim() || null;
  const description = formData.get('description')?.trim() || null;
  
  if (!reportName) {
    showError('请输入报表名称');
    return;
  }
  
  if (!templateId) {
    showError('请选择模板');
    return;
  }
  
  try {
    const params = {
      reportName,
      reportType,
      description
    };
    
    await reportService.generateReport(templateId, params);
    
    hideModal('commonModal');
    const modal = document.getElementById('commonModal');
    if (modal) modal.remove();
    
    await loadReports();
  } catch (error) {
    showError(error.message || '生成失败');
  }
  
  function showError(message) {
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
    }
  }
}

async function viewReport(id) {
  try {
    const report = await reportService.getReportById(id);
    const content = `
      <div style="padding: 20px;">
        <h3>${report.reportName || '报表详情'}</h3>
        <p><strong>类型：</strong>${report.reportType || '-'}</p>
        <p><strong>状态：</strong>${report.status || '-'}</p>
        <p><strong>创建时间：</strong>${formatDate(report.createDate)}</p>
        ${report.description ? `<p><strong>描述：</strong>${report.description}</p>` : ''}
        <div style="margin-top: 20px;">
          <p>报表内容预览功能开发中...</p>
        </div>
      </div>
    `;
    
    const footer = `
      <button class="btn btn-secondary" id="closeBtn">关闭</button>
    `;
    
    const modalHtml = createModal('报表详情', content, footer);
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    showModal('commonModal');
    
    initModal('commonModal', () => {
      const modal = document.getElementById('commonModal');
      if (modal) modal.remove();
    });
    
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        hideModal('commonModal');
        const modal = document.getElementById('commonModal');
        if (modal) modal.remove();
      });
    }
  } catch (error) {
    alert('加载报表详情失败：' + (error.message || '未知错误'));
  }
}

async function exportReport(id) {
  try {
    await reportService.exportReport(id, 'excel');
    alert('报表导出成功');
  } catch (error) {
    alert('导出失败：' + (error.message || '未知错误'));
  }
}

async function handleDelete(id) {
  if (!confirm('确定要删除该报表吗？')) {
    return;
  }
  
  try {
    await reportService.deleteReport(id);
    await loadReports();
  } catch (error) {
    alert('删除失败：' + (error.message || '未知错误'));
  }
}

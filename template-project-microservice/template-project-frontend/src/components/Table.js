/**
 * 表格组件工具函数
 */

export function createTable(columns, data = [], options = {}) {
  const {
    emptyText = '暂无数据',
    loading = false,
    rowKey = 'id',
    onRowClick = null
  } = options;

  if (loading) {
    return `
      <div class="table-container">
        <div class="table-loading">加载中...</div>
      </div>
    `;
  }

  if (!data || data.length === 0) {
    return `
      <div class="table-container">
        <div class="table-empty">${emptyText}</div>
      </div>
    `;
  }

  const thead = `
    <thead>
      <tr>
        ${columns.map(col => `<th style="${col.width ? `width: ${col.width}` : ''}">${col.title}</th>`).join('')}
      </tr>
    </thead>
  `;

  const tbody = `
    <tbody>
      ${data.map((row, index) => {
        const rowData = rowKey ? row[rowKey] : index;
        const clickAttr = onRowClick ? `data-row-id="${rowData}" class="table-row-clickable"` : '';
        return `
          <tr ${clickAttr}>
            ${columns.map(col => {
              const value = col.render ? col.render(row[col.key], row, index) : (row[col.key] ?? '');
              return `<td>${value}</td>`;
            }).join('')}
          </tr>
        `;
      }).join('')}
    </tbody>
  `;

  const table = `
    <div class="table-container">
      <table class="table">
        ${thead}
        ${tbody}
      </table>
    </div>
  `;

  // 如果有行点击事件，添加事件监听
  if (onRowClick) {
    setTimeout(() => {
      document.querySelectorAll('.table-row-clickable').forEach(row => {
        row.addEventListener('click', (e) => {
          const rowId = row.getAttribute('data-row-id');
          const rowData = data.find(item => (rowKey ? item[rowKey] : data.indexOf(item)).toString() === rowId);
          if (rowData) {
            onRowClick(rowData, e);
          }
        });
      });
    }, 0);
  }

  return table;
}

export function createPagination(current, total, pageSize, onPageChange) {
  const totalPages = Math.ceil(total / pageSize);
  
  if (totalPages <= 1) {
    return '';
  }

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  const pagination = `
    <div class="pagination">
      <button class="pagination-btn" ${current === 1 ? 'disabled' : ''} data-page="${current - 1}">
        上一页
      </button>
      ${pages.map(page => `
        <button class="pagination-btn ${page === current ? 'active' : ''}" data-page="${page}">
          ${page}
        </button>
      `).join('')}
      <button class="pagination-btn" ${current === totalPages ? 'disabled' : ''} data-page="${current + 1}">
        下一页
      </button>
      <span class="pagination-info">共 ${total} 条，每页 ${pageSize} 条</span>
    </div>
  `;

  // 添加事件监听
  setTimeout(() => {
    document.querySelectorAll('.pagination-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page'));
        if (page && page !== current && page >= 1 && page <= totalPages) {
          onPageChange(page);
        }
      });
    });
  }, 0);

  return pagination;
}

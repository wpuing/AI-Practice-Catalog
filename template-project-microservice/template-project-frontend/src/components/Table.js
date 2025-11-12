/**
 * 表格组件
 */

export function Table({
  columns = [],
  data = [],
  loading = false,
  emptyText = '暂无数据',
  onRowClick = null,
  className = ''
}) {
  const table = document.createElement('div');
  table.className = `table-container ${className}`.trim();

  if (loading) {
    table.innerHTML = '<div class="table-loading">加载中...</div>';
    return table;
  }

  if (data.length === 0) {
    table.innerHTML = `<div class="table-empty">${emptyText}</div>`;
    return table;
  }

  const tableElement = document.createElement('table');
  tableElement.className = 'table';

  // 表头
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  columns.forEach(column => {
    const th = document.createElement('th');
    th.textContent = column.title || column.key;
    if (column.width) {
      th.style.width = column.width;
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  tableElement.appendChild(thead);

  // 表体
  const tbody = document.createElement('tbody');
  data.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    if (onRowClick) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => onRowClick(row, rowIndex));
    }

    columns.forEach(column => {
      const td = document.createElement('td');
      const value = row[column.key];
      
      if (column.render) {
        td.innerHTML = column.render(value, row, rowIndex);
      } else {
        td.textContent = value || '';
      }
      
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
  tableElement.appendChild(tbody);

  table.appendChild(tableElement);
  return table;
}

export default Table;


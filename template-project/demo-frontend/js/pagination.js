/**
 * 通用分页控件模块
 * 提供统一的分页控件渲染功能
 */

/**
 * 渲染通用分页控件
 * @param {Object} options - 分页选项
 * @param {number} options.total - 总记录数
 * @param {number} options.current - 当前页码
 * @param {number} options.size - 每页显示数量
 * @param {number} options.pages - 总页数（可选，会自动计算）
 * @param {string} options.paginationId - 分页容器ID
 * @param {string} options.pageType - 页面类型（users, products, product-types等）
 * @param {Function} options.onPageChange - 页码改变回调函数 (page) => void
 * @param {Function} options.onSizeChange - 每页数量改变回调函数 (size) => void
 * @param {number} options.defaultSize - 默认每页显示数量
 */
function renderCommonPagination(options) {
    const {
        total = 0,
        current = 1,
        size = 15,
        pages: providedPages,
        paginationId,
        pageType,
        onPageChange,
        onSizeChange,
        defaultSize = 15
    } = options;

    const pagination = document.getElementById(paginationId);
    if (!pagination) {
        console.warn(`未找到分页容器: ${paginationId}`);
        return;
    }

    // 计算总页数
    const pages = providedPages || Math.ceil(total / size) || 1;

    let html = '<div class="pagination-wrapper">';
    
    // 左侧：总记录数和每页显示选择器
    html += '<div class="pagination-info-left">';
    html += `<span>共 ${total} 条记录</span>`;
    html += '<span style="margin: 0 12px;">|</span>';
    html += '<span>每页显示：</span>';
    html += `<select class="pagination-size-select" onchange="window.handlePageSizeChange('${pageType}', this.value)">`;
    const sizeOptions = [10, 15, 20, 30, 50, 80, 100, 150, 200, 500];
    sizeOptions.forEach(opt => {
        html += `<option value="${opt}" ${size === opt ? 'selected' : ''}>${opt}</option>`;
    });
    html += '</select>';
    html += '</div>';
    
    // 分页控件
    html += '<div class="pagination-controls">';
    
    // 首页
    if (current > 1) {
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', 1)" title="首页">«</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="首页">«</button>`;
    }
    
    // 上一页
    if (current > 1) {
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', ${current - 1})" title="上一页">‹</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="上一页">‹</button>`;
    }

    // 页码显示逻辑：显示当前页前后各2页
    let startPage = Math.max(1, current - 2);
    let endPage = Math.min(pages, current + 2);
    
    // 如果当前页在开头，显示前5页
    if (current <= 3) {
        startPage = 1;
        endPage = Math.min(5, pages);
    }
    // 如果当前页在结尾，显示后5页
    if (current >= pages - 2) {
        startPage = Math.max(1, pages - 4);
        endPage = pages;
    }
    
    // 显示第一页和省略号
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', 1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // 显示页码按钮
    for (let i = startPage; i <= endPage; i++) {
        if (i === current) {
            html += `<button class="pagination-btn active">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', ${i})">${i}</button>`;
        }
    }
    
    // 显示最后一页和省略号
    if (endPage < pages) {
        if (endPage < pages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', ${pages})">${pages}</button>`;
    }

    // 下一页
    if (current < pages) {
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', ${current + 1})" title="下一页">›</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="下一页">›</button>`;
    }
    
    // 末页
    if (current < pages) {
        html += `<button class="pagination-btn" onclick="window.handlePageChange('${pageType}', ${pages})" title="末页">»</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="末页">»</button>`;
    }
    
    html += '</div>';
    
    // 跳转输入框
    html += '<div class="pagination-jump">';
    html += `<span>共 ${pages} 页，跳转到</span>`;
    html += `<input type="number" class="pagination-input" id="${paginationId}_jump" min="1" max="${pages}" value="${current}">`;
    html += `<span>页</span>`;
    html += `<button class="pagination-jump-btn" onclick="window.handlePageJump('${pageType}', '${paginationId}_jump')">确定</button>`;
    html += '</div>';
    
    html += '</div>';
    pagination.innerHTML = html;
    
    // 绑定跳转输入框回车事件
    const jumpInput = document.getElementById(paginationId + '_jump');
    if (jumpInput) {
        jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                window.handlePageJump(pageType, paginationId + '_jump');
            }
        });
    }
}

/**
 * 处理页码改变
 */
function handlePageChange(pageType, page) {
    switch (pageType) {
        case 'users':
            if (typeof window.currentPage !== 'undefined') {
                window.currentPage = page;
            }
            if (typeof window.loadUsers === 'function') {
                window.loadUsers(page);
            } else if (typeof loadUsers === 'function') {
                loadUsers(page);
            }
            break;
        case 'products':
            if (typeof window.productsPage !== 'undefined') {
                window.productsPage = page;
            }
            if (typeof window.loadProducts === 'function') {
                window.loadProducts(page);
            } else if (typeof loadProducts === 'function') {
                loadProducts(page);
            }
            break;
        case 'product-types':
            if (typeof window.productTypesPage !== 'undefined') {
                window.productTypesPage = page;
            }
            if (typeof window.loadProductTypes === 'function') {
                window.loadProductTypes(page);
            } else if (typeof loadProductTypes === 'function') {
                loadProductTypes(page);
            }
            break;
        case 'logs':
            if (typeof window.currentLogPage !== 'undefined') {
                window.currentLogPage = page;
            }
            if (typeof window.loadLogs === 'function') {
                window.loadLogs(page);
            }
            break;
        default:
            console.warn(`未知的页面类型: ${pageType}`);
    }
}

/**
 * 处理每页数量改变
 */
function handlePageSizeChange(pageType, newSize) {
    const size = parseInt(newSize) || 15;
    
    switch (pageType) {
        case 'users':
            if (typeof window.pageSize !== 'undefined') {
                window.pageSize = size;
            }
            if (typeof window.currentPage !== 'undefined') {
                window.currentPage = 1;
            }
            if (typeof window.loadUsers === 'function') {
                window.loadUsers(1);
            } else if (typeof loadUsers === 'function') {
                loadUsers(1);
            }
            break;
        case 'products':
            if (typeof window.productsPageSize !== 'undefined') {
                window.productsPageSize = size;
            }
            if (typeof window.productsPage !== 'undefined') {
                window.productsPage = 1;
            }
            if (typeof window.loadProducts === 'function') {
                window.loadProducts(1);
            } else if (typeof loadProducts === 'function') {
                loadProducts(1);
            }
            break;
        case 'product-types':
            if (typeof window.productTypesPageSize !== 'undefined') {
                window.productTypesPageSize = size;
            }
            if (typeof window.productTypesPage !== 'undefined') {
                window.productTypesPage = 1;
            }
            if (typeof window.loadProductTypes === 'function') {
                window.loadProductTypes(1);
            } else if (typeof loadProductTypes === 'function') {
                loadProductTypes(1);
            }
            break;
        case 'logs':
            if (typeof window.logPageSize !== 'undefined') {
                window.logPageSize = size;
            }
            if (typeof window.currentLogPage !== 'undefined') {
                window.currentLogPage = 1;
            }
            if (typeof window.loadLogs === 'function') {
                window.loadLogs(1);
            }
            break;
        default:
            console.warn(`未知的页面类型: ${pageType}`);
    }
}

/**
 * 处理页码跳转
 */
function handlePageJump(pageType, inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const targetPage = parseInt(input.value);
    const maxPage = parseInt(input.max) || 1;
    
    if (isNaN(targetPage) || targetPage < 1) {
        showMessage('请输入有效的页码', 'error');
        return;
    }
    
    if (targetPage > maxPage) {
        showMessage(`页码不能超过 ${maxPage}`, 'error');
        return;
    }
    
    handlePageChange(pageType, targetPage);
}

// 导出供全局使用
window.renderCommonPagination = renderCommonPagination;
window.handlePageChange = handlePageChange;
window.handlePageSizeChange = handlePageSizeChange;
window.handlePageJump = handlePageJump;


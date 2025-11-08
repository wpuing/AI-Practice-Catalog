/**
 * 日志管理模块
 */

let currentLogPage = 1;
let logPageSize = 15; // 默认15条

/**
 * 初始化日志管理
 */
function initLogs() {
    loadLogs(1);
    bindLogEvents();
}

/**
 * 绑定日志管理事件
 */
function bindLogEvents() {
    // 移除旧的事件监听器，避免重复绑定
    const searchBtn = document.getElementById('searchLogsBtn');
    const resetBtn = document.getElementById('resetLogsBtn');
    const exportBtn = document.getElementById('exportLogsBtn');

    // 查询按钮 - 使用cloneNode方式重新绑定
    if (searchBtn) {
        const newSearchBtn = searchBtn.cloneNode(true);
        searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
        newSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('查询按钮被点击');
            currentLogPage = 1;
            loadLogs(1);
        });
    }

    // 重置按钮 - 使用cloneNode方式重新绑定
    if (resetBtn) {
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        newResetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('重置按钮被点击');
            const moduleFilter = document.getElementById('logModuleFilter');
            const operationTypeFilter = document.getElementById('logOperationTypeFilter');
            const usernameFilter = document.getElementById('logUsernameFilter');
            
            if (moduleFilter) moduleFilter.value = '';
            if (operationTypeFilter) operationTypeFilter.value = '';
            if (usernameFilter) usernameFilter.value = '';
            
            currentLogPage = 1;
            loadLogs(1);
        });
    }

    // 导出按钮 - 使用cloneNode方式重新绑定
    if (exportBtn) {
        const newExportBtn = exportBtn.cloneNode(true);
        exportBtn.parentNode.replaceChild(newExportBtn, exportBtn);
        newExportBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                newExportBtn.disabled = true;
                newExportBtn.textContent = '导出中...';
                
                const module = document.getElementById('logModuleFilter')?.value || '';
                const operationType = document.getElementById('logOperationTypeFilter')?.value || '';
                const username = document.getElementById('logUsernameFilter')?.value || '';

                await api.exportLogs(module || null, operationType || null, username || null);
                showMessage('导出成功', 'success');
            } catch (error) {
                console.error('导出日志失败:', error);
                showMessage(error.message || '导出失败', 'error');
            } finally {
                newExportBtn.disabled = false;
                newExportBtn.textContent = '导出日志';
            }
        });
    }

    // 使用事件委托作为备选方案（只绑定一次）
    if (!window.logsEventDelegateBound) {
        document.addEventListener('click', function(e) {
            // 检查点击的是按钮本身，或者是按钮内的元素
            const clickedButton = e.target.closest('#searchLogsBtn') ||
                                  e.target.closest('#resetLogsBtn') ||
                                  (e.target.id === 'searchLogsBtn' ? e.target : null) ||
                                  (e.target.id === 'resetLogsBtn' ? e.target : null);

            if (clickedButton && clickedButton.id === 'searchLogsBtn') {
                e.preventDefault();
                e.stopPropagation();
                console.log('查询按钮被点击（事件委托）');
                currentLogPage = 1;
                loadLogs(1);
            } else if (clickedButton && clickedButton.id === 'resetLogsBtn') {
                e.preventDefault();
                e.stopPropagation();
                console.log('重置按钮被点击（事件委托）');
                const moduleFilter = document.getElementById('logModuleFilter');
                const operationTypeFilter = document.getElementById('logOperationTypeFilter');
                const usernameFilter = document.getElementById('logUsernameFilter');
                
                if (moduleFilter) moduleFilter.value = '';
                if (operationTypeFilter) operationTypeFilter.value = '';
                if (usernameFilter) usernameFilter.value = '';
                
                currentLogPage = 1;
                loadLogs(1);
            }
        }, { capture: true });
        window.logsEventDelegateBound = true;
    }
}

/**
 * 加载日志列表
 */
async function loadLogs(page) {
    try {
        currentLogPage = page;
        
        const module = document.getElementById('logModuleFilter')?.value || '';
        const operationType = document.getElementById('logOperationTypeFilter')?.value || '';
        const username = document.getElementById('logUsernameFilter')?.value || '';

        const response = await api.getLogs(
            page,
            logPageSize,
            module || null,
            operationType || null,
            username || null
        );

        if (response.code === 200 && response.data) {
            // 确保正确传递分页数据
            const pageData = response.data;
            
            // 调试：打印完整的响应数据
            console.log('完整响应数据:', response);
            console.log('response.data:', pageData);
            console.log('response.data类型:', typeof pageData);
            console.log('response.data的keys:', Object.keys(pageData || {}));
            
            // MyBatis-Plus Page对象序列化后的字段名可能是：records, total, size, current, pages
            let total = 0;
            let current = 1;
            let size = logPageSize;
            let pages = 1;
            let records = [];
            
            if (pageData) {
                // 首先尝试获取records数组（这是最可靠的标识）
                if (Array.isArray(pageData.records)) {
                    records = pageData.records;
                } else if (Array.isArray(pageData.list)) {
                    records = pageData.list;
                }
                
                // 然后尝试获取total（优先检查）
                if (typeof pageData.total === 'number') {
                    total = pageData.total;
                } else if (typeof pageData.totalCount === 'number') {
                    total = pageData.totalCount;
                } else if (typeof pageData.totalElements === 'number') {
                    total = pageData.totalElements;
                }
                
                // 获取current/page
                if (typeof pageData.current === 'number') {
                    current = pageData.current;
                } else if (typeof pageData.page === 'number') {
                    current = pageData.page;
                } else if (typeof pageData.number === 'number') {
                    current = pageData.number + 1; // Spring Data的number从0开始
                }
                
                // 获取size
                if (typeof pageData.size === 'number') {
                    size = pageData.size;
                } else if (typeof pageData.pageSize === 'number') {
                    size = pageData.pageSize;
                }
                
                // 获取pages
                if (typeof pageData.pages === 'number') {
                    pages = pageData.pages;
                } else if (typeof pageData.totalPages === 'number') {
                    pages = pageData.totalPages;
                } else if (total > 0 && size > 0) {
                    pages = Math.ceil(total / size);
                }
                
                console.log('解析结果 - total:', total, 'current:', current, 'size:', size, 'pages:', pages, 'records长度:', records.length);
                
                // 如果还是没有获取到total，但有records，尝试其他方式
                if (total === 0 && records.length > 0) {
                    // 检查是否有其他字段包含总数信息
                    console.warn('total为0，尝试其他方式获取');
                }
            }
            
            // 如果total仍然是0，但有records，说明后端分页插件可能未配置或缓存有问题
            // 临时方案：如果有records，至少显示当前页的记录数，并提示用户可能需要清除缓存
            if (total === 0 && records.length > 0) {
                console.warn('total为0但records不为空，可能是后端分页插件未配置或Redis缓存问题');
                console.warn('尝试从pageData的所有可能字段获取total');
                // 尝试所有可能的字段名
                const possibleTotalFields = ['total', 'totalCount', 'totalElements', 'count', 'totalRecords'];
                for (const field of possibleTotalFields) {
                    if (typeof pageData[field] === 'number' && pageData[field] > 0) {
                        total = pageData[field];
                        console.log(`从字段 ${field} 获取到total:`, total);
                        break;
                    }
                }
                // 如果还是0，使用records.length作为临时显示（不准确，但比0好）
                // 注意：这只是临时方案，实际总数可能更多
                if (total === 0) {
                    console.warn('无法获取准确总数，使用当前页记录数作为临时显示:', records.length);
                    // 如果当前页记录数等于每页大小，说明可能还有更多数据
                    // 但至少显示当前页的记录数，而不是0
                    total = records.length;
                    // 如果当前页记录数等于每页大小，说明可能还有更多数据，显示"至少X条"
                    if (records.length === size && current === 1) {
                        // 第一页且记录数等于每页大小，说明至少还有更多数据
                        // 但无法确定总数，所以显示"至少X条"
                        console.warn('当前页记录数等于每页大小，实际总数可能更多');
                    }
                }
            }
            
            // 构建标准化的分页数据对象
            const normalizedPageData = {
                total: total,
                current: current,
                size: size,
                pages: pages,
                records: records
            };
            
            // 调试：打印分页数据
            console.log('最终分页数据:', normalizedPageData);
            console.log('total值:', total, '类型:', typeof total);
            
            renderLogTable(normalizedPageData);
            // 使用通用分页控件
            if (typeof renderCommonPagination === 'function') {
                renderCommonPagination({
                    total: total,
                    current: current,
                    size: size,
                    pages: pages,
                    paginationId: 'logPagination',
                    pageType: 'logs',
                    defaultSize: logPageSize
                });
            } else {
                // 降级使用旧的分页控件
                renderLogPagination(normalizedPageData);
            }
        } else {
            showMessage(response.message || '加载日志列表失败', 'error');
            document.getElementById('logTableBody').innerHTML = 
                '<tr><td colspan="7" class="loading">加载失败</td></tr>';
        }
    } catch (error) {
        console.error('加载日志列表失败:', error);
        showMessage(error.message || '加载日志列表失败', 'error');
        document.getElementById('logTableBody').innerHTML = 
            '<tr><td colspan="7" class="loading">加载失败</td></tr>';
    }
}

/**
 * 渲染日志表格
 */
function renderLogTable(pageData) {
    const tbody = document.getElementById('logTableBody');
    const logs = pageData.records || [];

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading">暂无数据</td></tr>';
        return;
    }

    tbody.innerHTML = logs.map(log => {
        const operationTime = log.operationTime ? 
            new Date(log.operationTime).toLocaleString('zh-CN') : '-';
        const operationTypeText = getOperationTypeText(log.operationType);
        const operationTypeClass = getOperationTypeClass(log.operationType);

        return `
            <tr>
                <td>${operationTime}</td>
                <td>${log.username || '-'}</td>
                <td>${log.module || '-'}</td>
                <td><span class="badge badge-${operationTypeClass}">${operationTypeText}</span></td>
                <td>${log.operationDesc || '-'}</td>
                <td>${log.ipAddress || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewLogDetail('${log.id}')">详情</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * 渲染分页（常见分页控件样式）
 */
function renderLogPagination(pageData) {
    const pagination = document.getElementById('logPagination');
    // 确保从响应中正确获取总数
    const total = pageData.total || 0;
    const current = pageData.current || pageData.page || 1;
    const size = pageData.size || logPageSize;
    const pages = pageData.pages || Math.ceil(total / size) || 1;

    if (!pagination) {
        console.warn('未找到分页容器: logPagination');
        return;
    }

    let html = '<div class="pagination-wrapper">';
    
    // 左侧：总记录数和每页显示选择器
    html += '<div class="pagination-info-left">';
    html += `<span>共 ${total} 条记录</span>`;
    html += '<span style="margin: 0 12px;">|</span>';
    html += '<span>每页显示：</span>';
    html += `<select id="logPageSizeSelect" class="pagination-size-select" onchange="changeLogPageSize(this.value)">`;
    html += `<option value="10" ${logPageSize === 10 ? 'selected' : ''}>10</option>`;
    html += `<option value="15" ${logPageSize === 15 ? 'selected' : ''}>15</option>`;
    html += `<option value="20" ${logPageSize === 20 ? 'selected' : ''}>20</option>`;
    html += `<option value="30" ${logPageSize === 30 ? 'selected' : ''}>30</option>`;
    html += `<option value="50" ${logPageSize === 50 ? 'selected' : ''}>50</option>`;
    html += `<option value="80" ${logPageSize === 80 ? 'selected' : ''}>80</option>`;
    html += `<option value="100" ${logPageSize === 100 ? 'selected' : ''}>100</option>`;
    html += `<option value="150" ${logPageSize === 150 ? 'selected' : ''}>150</option>`;
    html += `<option value="200" ${logPageSize === 200 ? 'selected' : ''}>200</option>`;
    html += `<option value="500" ${logPageSize === 500 ? 'selected' : ''}>500</option>`;
    html += '</select>';
    html += '</div>';
    
    // 分页控件
    html += '<div class="pagination-controls">';
    
    // 首页
    if (current > 1) {
        html += `<button class="pagination-btn" onclick="window.loadLogs(1)" title="首页">«</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="首页">«</button>`;
    }
    
    // 上一页
    if (current > 1) {
        html += `<button class="pagination-btn" onclick="window.loadLogs(${current - 1})" title="上一页">‹</button>`;
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
        html += `<button class="pagination-btn" onclick="window.loadLogs(1)">1</button>`;
        if (startPage > 2) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
    }
    
    // 显示页码按钮
    for (let i = startPage; i <= endPage; i++) {
        if (i === current) {
            html += `<button class="pagination-btn active">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="window.loadLogs(${i})">${i}</button>`;
        }
    }
    
    // 显示最后一页和省略号
    if (endPage < pages) {
        if (endPage < pages - 1) {
            html += `<span class="pagination-ellipsis">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="window.loadLogs(${pages})">${pages}</button>`;
    }

    // 下一页
    if (current < pages) {
        html += `<button class="pagination-btn" onclick="window.loadLogs(${current + 1})" title="下一页">›</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="下一页">›</button>`;
    }
    
    // 末页
    if (current < pages) {
        html += `<button class="pagination-btn" onclick="window.loadLogs(${pages})" title="末页">»</button>`;
    } else {
        html += `<button class="pagination-btn disabled" disabled title="末页">»</button>`;
    }
    
    html += '</div>';
    
    // 跳转输入框
    html += '<div class="pagination-jump">';
    html += `<span>共 ${pages} 页，跳转到</span>`;
    html += `<input type="number" id="logPageJumpInput" class="pagination-input" min="1" max="${pages}" value="${current}">`;
    html += `<span>页</span>`;
    html += `<button class="pagination-jump-btn" onclick="jumpToLogPage()">确定</button>`;
    html += '</div>';
    
    html += '</div>';
    pagination.innerHTML = html;
    
    // 绑定跳转输入框回车事件
    const jumpInput = document.getElementById('logPageJumpInput');
    if (jumpInput) {
        jumpInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                jumpToLogPage();
            }
        });
    }
}

/**
 * 跳转到指定页码
 */
function jumpToLogPage() {
    const input = document.getElementById('logPageJumpInput');
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
    
    window.loadLogs(targetPage);
}

/**
 * 改变每页显示数量
 */
function changeLogPageSize(newSize) {
    logPageSize = parseInt(newSize) || 15;
    currentLogPage = 1;
    loadLogs(1);
}

/**
 * 查看日志详情
 */
async function viewLogDetail(logId) {
    try {
        const response = await api.getLogById(logId);
        
        if (response.code === 200 && response.data) {
            const log = response.data;
            
            const detailContent = `
                <div style="padding: 20px;">
                    <h3 style="margin-bottom: 20px; color: var(--primary-color);">日志详情</h3>
                    <div style="line-height: 2;">
                        <p><strong>日志ID:</strong> ${log.id || '-'}</p>
                        <p><strong>用户ID:</strong> ${log.userId || '-'}</p>
                        <p><strong>用户名:</strong> ${log.username || '-'}</p>
                        <p><strong>操作类型:</strong> ${getOperationTypeText(log.operationType)}</p>
                        <p><strong>模块:</strong> ${log.module || '-'}</p>
                        <p><strong>操作描述:</strong> ${log.operationDesc || '-'}</p>
                        <p><strong>请求方法:</strong> ${log.requestMethod || '-'}</p>
                        <p><strong>请求URL:</strong> ${log.requestUrl || '-'}</p>
                        <p><strong>请求参数:</strong></p>
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto;">${formatJson(log.requestParams)}</pre>
                        <p><strong>响应结果:</strong></p>
                        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; max-height: 200px; overflow-y: auto;">${formatJson(log.responseResult)}</pre>
                        <p><strong>IP地址:</strong> ${log.ipAddress || '-'}</p>
                        <p><strong>用户代理:</strong> ${log.userAgent || '-'}</p>
                        <p><strong>操作时间:</strong> ${log.operationTime ? new Date(log.operationTime).toLocaleString('zh-CN') : '-'}</p>
                        <p><strong>创建时间:</strong> ${log.createTime ? new Date(log.createTime).toLocaleString('zh-CN') : '-'}</p>
                    </div>
                </div>
            `;

            createModal('日志详情', detailContent, '');
        } else {
            showMessage(response.message || '获取日志详情失败', 'error');
        }
    } catch (error) {
        console.error('获取日志详情失败:', error);
        showMessage(error.message || '获取日志详情失败', 'error');
    }
}

/**
 * 获取操作类型文本
 */
function getOperationTypeText(operationType) {
    const map = {
        'CREATE': '新增',
        'UPDATE': '修改',
        'DELETE': '删除',
        'QUERY': '查询',
        'UNKNOWN': '未知'
    };
    return map[operationType] || operationType;
}

/**
 * 获取操作类型样式类
 */
function getOperationTypeClass(operationType) {
    const map = {
        'CREATE': 'success',
        'UPDATE': 'info',
        'DELETE': 'danger',
        'QUERY': 'secondary',
        'UNKNOWN': 'secondary'
    };
    return map[operationType] || 'secondary';
}

/**
 * 格式化JSON字符串
 */
function formatJson(jsonString) {
    if (!jsonString) return '-';
    try {
        const obj = JSON.parse(jsonString);
        return JSON.stringify(obj, null, 2);
    } catch (e) {
        return jsonString;
    }
}

/**
 * 如果日志页面可见，则刷新日志列表
 */
function refreshLogsIfVisible() {
    const logsPage = document.getElementById('logs');
    if (logsPage && logsPage.classList.contains('active')) {
        console.log('检测到日志页面可见，刷新日志列表');
        // 延迟一点刷新，确保后端日志已保存
        // 刷新时回到第一页，确保能看到最新日志
        setTimeout(() => {
            currentLogPage = 1;
            if (typeof loadLogs === 'function') {
                loadLogs(1);
            } else if (typeof window.loadLogs === 'function') {
                window.loadLogs(1);
            }
        }, 800); // 增加延迟时间，确保后端日志已保存
    }
}

// 导出供全局使用（确保在脚本加载时就导出）
window.loadLogs = loadLogs;
window.viewLogDetail = viewLogDetail;
window.refreshLogsIfVisible = refreshLogsIfVisible;
window.initLogs = initLogs; // 导出initLogs函数
window.jumpToLogPage = jumpToLogPage; // 导出跳转函数
window.changeLogPageSize = changeLogPageSize; // 导出改变每页显示数量函数


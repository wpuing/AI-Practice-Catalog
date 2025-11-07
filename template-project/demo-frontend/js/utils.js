/**
 * 工具函数
 */

/**
 * 创建模态框
 */
function createModal(title, content, footer = '') {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal()">×</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
            ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    const container = document.getElementById('modalContainer') || document.body;
    container.appendChild(modal);
    return modal;
}

/**
 * 关闭模态框
 */
function closeModal() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.remove());
}

/**
 * 创建表单字段
 */
function createFormField(label, name, type = 'text', value = '', options = {}) {
    const field = document.createElement('div');
    field.className = 'form-group';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    labelEl.setAttribute('for', name);
    
    let input;
    if (type === 'textarea') {
        input = document.createElement('textarea');
        input.rows = options.rows || 3;
    } else if (type === 'select') {
        input = document.createElement('select');
        if (options.options) {
            options.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.value;
                option.textContent = opt.text;
                if (opt.value === value) option.selected = true;
                input.appendChild(option);
            });
        }
    } else {
        input = document.createElement('input');
        input.type = type;
    }
    
    input.id = name;
    input.name = name;
    if (type !== 'select' && value !== undefined) {
        input.value = value;
    }
    
    if (options.placeholder) input.placeholder = options.placeholder;
    if (options.required) input.required = true;
    if (options.min !== undefined) input.min = options.min;
    if (options.max !== undefined) input.max = options.max;
    if (options.step !== undefined) input.step = options.step;
    
    field.appendChild(labelEl);
    field.appendChild(input);
    
    return field;
}

/**
 * 获取表单数据
 */
function getFormData(formElement) {
    const formData = new FormData(formElement);
    const data = {};
    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

/**
 * 填充表单数据
 */
function fillFormData(formElement, data) {
    Object.keys(data).forEach(key => {
        const input = formElement.querySelector(`[name="${key}"]`);
        if (input) {
            if (input.type === 'checkbox') {
                input.checked = !!data[key];
            } else {
                input.value = data[key] || '';
            }
        }
    });
}

/**
 * 显示确认模态框
 * @param {string} title - 标题
 * @param {string} message - 消息内容
 * @returns {Promise<boolean>} - 返回用户选择（true=确认，false=取消）
 */
function showConfirmModal(title, message) {
    return new Promise((resolve) => {
        const modalId = 'confirmModal_' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal active';
        
        const handleConfirm = () => {
            const modalEl = document.getElementById(modalId);
            if (modalEl) {
                modalEl.remove();
            }
            resolve(true);
        };
        
        const handleCancel = () => {
            const modalEl = document.getElementById(modalId);
            if (modalEl) {
                modalEl.remove();
            }
            resolve(false);
        };
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" id="${modalId}_close">×</button>
                </div>
                <div class="modal-body">
                    <p style="margin: 0; font-size: 14px; color: var(--text-primary); line-height: 1.6;">${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" id="${modalId}_cancel">取消</button>
                    <button type="button" class="btn btn-primary" id="${modalId}_confirm">确认</button>
                </div>
            </div>
        `;
        
        // 绑定事件
        setTimeout(() => {
            const closeBtn = document.getElementById(modalId + '_close');
            const cancelBtn = document.getElementById(modalId + '_cancel');
            const confirmBtn = document.getElementById(modalId + '_confirm');
            
            if (closeBtn) closeBtn.addEventListener('click', handleCancel);
            if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
            if (confirmBtn) confirmBtn.addEventListener('click', handleConfirm);
        }, 0);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        });

        const container = document.getElementById('modalContainer') || document.body;
        container.appendChild(modal);
    });
}


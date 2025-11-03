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


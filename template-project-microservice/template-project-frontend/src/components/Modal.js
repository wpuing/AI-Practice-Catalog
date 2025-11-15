/**
 * 模态框组件
 */

export function createModal(title, content, footer = '') {
  return `
    <div class="modal" id="commonModal">
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" id="modalCloseBtn">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    </div>
  `;
}

export function showModal(modalId = 'commonModal') {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

export function hideModal(modalId = 'commonModal') {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
}

export function initModal(modalId = 'commonModal', onClose = null) {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  // 点击遮罩层关闭
  const overlay = modal.querySelector('.modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      hideModal(modalId);
      if (onClose) onClose();
    });
  }

  // 点击关闭按钮
  const closeBtn = modal.querySelector('.modal-close, #modalCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      hideModal(modalId);
      if (onClose) onClose();
    });
  }

  // ESC键关闭
  const handleEsc = (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      hideModal(modalId);
      if (onClose) onClose();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}

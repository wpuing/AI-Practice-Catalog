/**
 * 模态框组件
 */

export function Modal({
  title = '',
  content = '',
  show = false,
  onClose = () => {},
  onConfirm = null,
  confirmText = '确定',
  cancelText = '取消',
  showCancel = true
}) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  if (show) {
    modal.classList.add('show');
  }

  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">${title}</h3>
        <button class="modal-close" aria-label="关闭">×</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
      <div class="modal-footer">
        ${showCancel ? `<button class="btn btn-secondary modal-cancel">${cancelText}</button>` : ''}
        ${onConfirm ? `<button class="btn btn-primary modal-confirm">${confirmText}</button>` : ''}
      </div>
    </div>
  `;

  const overlay = modal.querySelector('.modal-overlay');
  const closeBtn = modal.querySelector('.modal-close');
  const cancelBtn = modal.querySelector('.modal-cancel');
  const confirmBtn = modal.querySelector('.modal-confirm');

  const close = () => {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
      onClose();
    }, 300);
  };

  overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (cancelBtn) cancelBtn.addEventListener('click', close);
  if (confirmBtn && onConfirm) {
    confirmBtn.addEventListener('click', () => {
      onConfirm();
      close();
    });
  }

  return modal;
}

export default Modal;


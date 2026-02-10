/* ============================================================================
   UTILITY FUNCTIONS — Extracted from app.js (Phase 3.2)
   ============================================================================ */

function safeSetInnerHTMLById(id, html) {
  let el = document.getElementById(id);
  if (!el) {
    console.warn(`Element with id="${id}" not found. Creating one automatically.`);
    el = document.createElement('div');
    el.id = id;
    document.body.appendChild(el);
  }
  el.innerHTML = html;
  return true;
}

function showLoading(message = 'Loading...') {}
function hideLoading() {}

// ── Toast Notification System ──
function _getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info', duration = 4000) {
  const container = _getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icons = { success: '✓', error: '✗', info: 'ℹ', sync: '🔄' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span class="toast-msg">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    toast.addEventListener('transitionend', () => toast.remove());
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

function showError(message) {
  console.error('Error:', message);
  showToast(message, 'error', 5000);
}

function showSuccess(message) {
  console.log('Success:', message);
  showToast(message, 'success');
}

function closeModal() {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = '';
  }
}

// Expose globally
window.showToast = showToast;
window.closeModal = closeModal;

/* ============================================================================
   UTILITY FUNCTIONS — Extracted from app.js (Phase 3.2)
   ============================================================================ */

/**
 * Escape HTML special characters to prevent XSS when interpolating
 * user data into innerHTML template literals.
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

const MAX_TOASTS = 5;

function showToast(message, type = 'info', duration = 4000) {
  const container = _getToastContainer();

  // Cap concurrent toasts — remove oldest if at limit
  while (container.children.length >= MAX_TOASTS) {
    container.firstChild.remove();
  }

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
  showToast(message, 'success');
}

function closeModal() {
  const modalRoot = document.getElementById('modal-root');
  if (modalRoot) {
    modalRoot.innerHTML = '';
  }
}

// ── Header Date/Time Clock ──
function startHeaderClock() {
  const dateEl = document.getElementById('utility-date');
  const timeEl = document.getElementById('utility-time');
  if (!dateEl && !timeEl) return;

  function update() {
    const now = new Date();
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
      });
    }
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit'
      });
    }
  }

  update();
  setInterval(update, 1000); // Update every second for live clock
}

// Start clock when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startHeaderClock);
} else {
  startHeaderClock();
}

// ── Ingredient Normalization (mirrors backend/utils/normalize.py) ──
// Must stay in sync with the Python version so frontend key lookups
// match backend-generated reserved_ingredients keys.

const UNIT_ALIASES = {
  // Weight
  oz: 'ounce', ounces: 'ounce',
  lb: 'pound', lbs: 'pound', pounds: 'pound',
  g: 'gram', grams: 'gram',
  kg: 'kilogram', kilograms: 'kilogram',
  // Volume
  tsp: 'teaspoon', teaspoons: 'teaspoon',
  tbsp: 'tablespoon', tbs: 'tablespoon', tablespoons: 'tablespoon',
  c: 'cup', cups: 'cup',
  pt: 'pint', pints: 'pint',
  qt: 'quart', quarts: 'quart',
  gal: 'gallon', gallons: 'gallon',
  ml: 'milliliter', milliliters: 'milliliter',
  l: 'liter', liters: 'liter',
  // Count
  ea: 'each',
  pc: 'piece', pcs: 'piece', pieces: 'piece',
  doz: 'dozen', dozens: 'dozen',
  // Other
  pkg: 'package', packages: 'package',
  cans: 'can', bottles: 'bottle', bunches: 'bunch',
  cloves: 'clove', slices: 'slice', stalks: 'stalk',
  sprigs: 'sprig', heads: 'head', bags: 'bag',
  boxes: 'box', jars: 'jar'
};

function normalizeUnit(unit) {
  if (!unit) return '';
  const lower = unit.trim().toLowerCase();
  return UNIT_ALIASES[lower] || lower;
}

function normalizeName(name) {
  if (!name) return '';
  let lower = name.trim().toLowerCase();
  if (lower.length > 3 && lower.endsWith('s') && !lower.endsWith('ss')) {
    if (lower.endsWith('ies')) {
      lower = lower.slice(0, -3) + 'y';
    } else if (lower.endsWith('oes')) {
      lower = lower.slice(0, -2);
    } else if (lower.endsWith('ves')) {
      lower = lower.slice(0, -3) + 'f';
    } else {
      lower = lower.slice(0, -1);
    }
  }
  return lower;
}

function normalizeKey(name, unit) {
  return `${normalizeName(name)}|${normalizeUnit(unit)}`;
}

// Expose globally
window.showToast = showToast;
window.closeModal = closeModal;
window.normalizeKey = normalizeKey;

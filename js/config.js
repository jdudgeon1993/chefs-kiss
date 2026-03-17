/**
 * Peachy Pantry Configuration - Python Age 5.0
 *
 * Frontend and API are served from the same domain.
 */

// API lives on the same origin as the frontend
const BACKEND_URL = window.location.origin;

// Base path for GitHub Pages (e.g., '/chefs-kiss' for username.github.io/chefs-kiss/)
// Set to '' if deployed at root domain. Auto-detected from <base> or script path.
const BASE_PATH = (function() {
  // Try to detect from the path of this script (config.js is always at /js/config.js)
  const scripts = document.querySelectorAll('script[src*="config.js"]');
  for (const s of scripts) {
    const src = s.getAttribute('src');
    if (src && src.includes('config.js')) {
      // src might be "js/config.js" (relative) or "/chefs-kiss/js/config.js" (absolute)
      // If relative, resolve against current page location
      const url = new URL(src, window.location.href);
      // pathname will be like "/chefs-kiss/js/config.js" — strip "/js/config.js"
      const path = url.pathname.replace(/\/js\/config\.js$/, '');
      return path || '';
    }
  }
  return '';
})();

window.CONFIG = { BACKEND_URL, API_BASE: `${BACKEND_URL}/api`, BASE_PATH };

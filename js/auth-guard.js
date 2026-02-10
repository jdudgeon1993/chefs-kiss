// Auth Guard — Redirect to login if not authenticated
// Loaded on all section pages (recipes, pantry, shopping, meals)
(function() {
  const token = localStorage.getItem('auth_token');
  const isDemo = localStorage.getItem('demo-mode') === 'true';
  if (!token && !isDemo) {
    // Use CONFIG.BASE_PATH if available (set by config.js which loads first)
    const base = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
    window.location.href = base + '/index.html';
  }
})();

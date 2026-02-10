// Auth Guard — Redirect to login if not authenticated
// Loaded on all section pages (recipes, pantry, shopping, meals)
(function() {
  const token = localStorage.getItem('auth_token');
  const isDemo = localStorage.getItem('demo-mode') === 'true';
  if (!token && !isDemo) {
    window.location.href = '/index.html';
  }
})();

// Auth Guard — Redirect to login if not authenticated
// Loaded on all section pages (recipes, pantry, shopping, meals)
(function() {
  const token = localStorage.getItem('auth_token');
  const isDemo = localStorage.getItem('demo-mode') === 'true' || new URLSearchParams(window.location.search).get('demo') === 'true';
  const base = (window.CONFIG && window.CONFIG.BASE_PATH) || '';

  // No token and not demo → redirect to landing
  if (!token && !isDemo) {
    window.location.href = base + '/';
    return;
  }

  // Token exists — check if JWT is expired
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        // JWT uses base64url (- and _ instead of + and /); atob needs standard base64
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        // exp is in seconds, Date.now() is milliseconds
        if (payload.exp && payload.exp < Date.now() / 1000) {
          // Token expired — try refresh before redirecting
          const refreshToken = localStorage.getItem('auth_refresh_token');
          if (refreshToken) {
            // Mark for refresh — api.js will handle the actual refresh on first call
            localStorage.setItem('auth_token_needs_refresh', 'true');
          } else {
            // No refresh token — clear and redirect
            localStorage.removeItem('auth_token');
            localStorage.removeItem('active_household_id');
            window.location.href = base + '/';
          }
        }
      }
    } catch (e) {
      // Malformed token — clear and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('active_household_id');
      window.location.href = base + '/';
    }
  }
})();

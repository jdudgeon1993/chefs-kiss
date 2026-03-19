/**
 * Peachy Pantry API Client
 *
 * Thin wrapper around fetch() for the Python backend.
 */

// Get API base URL from config (update config.js with your Railway URL!)
const API_BASE = window.CONFIG?.API_BASE || 'http://localhost:8000/api';

class API {
  static getToken() {
    return localStorage.getItem('auth_token');
  }

  static setToken(token) {
    localStorage.setItem('auth_token', token);
    localStorage.removeItem('auth_token_needs_refresh');
  }

  static clearToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_token_needs_refresh');
  }

  static getRefreshToken() {
    return localStorage.getItem('auth_refresh_token');
  }

  static setRefreshToken(token) {
    if (token) {
      localStorage.setItem('auth_refresh_token', token);
    }
  }

  /**
   * Check if the current access token is expired or about to expire.
   * Returns true if token needs refreshing (expired or < 5 min remaining).
   */
  static isTokenExpiring() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // JWT uses base64url (- and _ instead of + and /); atob needs standard base64
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64));
      if (!payload.exp) return false;
      // Refresh if less than 5 minutes remaining
      return payload.exp - (Date.now() / 1000) < 300;
    } catch {
      return false;
    }
  }

  /**
   * Refresh the access token using the stored refresh token.
   * Returns true if successful, false if refresh failed.
   */
  static async refreshAccessToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (!response.ok) {
        this.clearToken();
        return false;
      }

      const data = await response.json();
      if (data.access_token) {
        this.setToken(data.access_token);
      }
      if (data.refresh_token) {
        this.setRefreshToken(data.refresh_token);
      }
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  static getActiveHouseholdId() {
    return localStorage.getItem('active_household_id');
  }

  static setActiveHouseholdId(id) {
    localStorage.setItem('active_household_id', id);
  }

  /**
   * Make API call
   */
  static async call(endpoint, options = {}) {
    // Auto-refresh token if expired or about to expire (skip auth endpoints to avoid loops)
    if (!endpoint.includes('/auth/') && (this.isTokenExpiring() || localStorage.getItem('auth_token_needs_refresh'))) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed && !localStorage.getItem('demo-mode')) {
        const base = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
        window.location.href = base + '/';
        throw new Error('Session expired');
      }
    }

    const token = this.getToken();
    const householdId = this.getActiveHouseholdId();

    const headers = {
      ...options.headers
    };
    // Only send Authorization when we have a token (empty header can cause 400s)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!options.rawBody) {
      headers['Content-Type'] = 'application/json';
    }
    if (householdId) {
      headers['X-Household-Id'] = householdId;
    }

    // Mark local write for Realtime debounce (skip GET requests)
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && typeof window.markLocalWrite === 'function') {
      window.markLocalWrite();
    }

    const fetchOptions = { ...options, headers };
    delete fetchOptions.rawBody;

    const response = await fetch(`${API_BASE}${endpoint}`, fetchOptions);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));

      // 401 — attempt one refresh before giving up
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the original request with the new token
          const retryHeaders = {
            ...headers,
            'Authorization': `Bearer ${this.getToken()}`
          };
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, { ...options, headers: retryHeaders });
          if (retryResponse.ok) return retryResponse.json();
        }
        // Refresh failed or retry failed — redirect to login
        this.clearToken();
        const base = (window.CONFIG && window.CONFIG.BASE_PATH) || '';
        window.location.href = base + '/';
        throw new Error('Session expired');
      }

      // error.detail may be a string or structured object like {message: "...", missing: [...]}
      const detail = error.detail;
      const message = typeof detail === 'object' && detail !== null
        ? detail.message || JSON.stringify(detail)
        : detail || response.statusText;
      throw new Error(message);
    }

    return response.json();
  }

  // ===== AUTHENTICATION =====

  static async signOut() {
    const rt = this.getRefreshToken();
    await this.call('/auth/signout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rt || null })
    });
    this.clearToken();
    localStorage.removeItem('active_household_id');
  }

  static async getCurrentUser() {
    return this.call('/auth/me');
  }

  static async getMyCode() {
    return this.call('/auth/my-code');
  }

  static async regenerateCode() {
    return this.call('/auth/regenerate-code', { method: 'POST' });
  }

  // ===== PANTRY =====

  static async getUnits() {
    return this.call('/pantry/units');
  }

  // ===== HOUSEHOLDS =====

  static async getMyHouseholds() {
    return this.call('/households/');
  }

  static async getHouseholdMembers() {
    return this.call('/households/members');
  }

  static async createInvite(expiresHours = 48) {
    return this.call('/households/invite', {
      method: 'POST',
      body: JSON.stringify({ expires_hours: expiresHours })
    });
  }

  static async getActiveInvite() {
    return this.call('/households/invite');
  }

  static async acceptInvite(code) {
    return this.call('/households/invite/accept', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  static async leaveHousehold(householdId) {
    return this.call('/households/leave', {
      method: 'POST',
      body: JSON.stringify({ household_id: householdId })
    });
  }

  static async renameHousehold(householdId, name) {
    return this.call(`/households/${householdId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    });
  }
}

// Export for use in other files
window.API = API;

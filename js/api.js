/**
 * Chef's Kiss API Client - Python Age 5.0
 *
 * Simple wrapper around fetch() that talks to Python backend.
 * Replaces ALL Supabase SDK calls.
 *
 * JavaScript's job: Make the site breathe.
 * Python's job: Make it think.
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
      const payload = JSON.parse(atob(token.split('.')[1]));
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
        window.location.href = base + '/index.html';
        throw new Error('Session expired');
      }
    }

    const token = this.getToken();
    const householdId = this.getActiveHouseholdId();

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers
    };
    if (householdId) {
      headers['X-Household-Id'] = householdId;
    }

    // Mark local write for Realtime debounce (skip GET requests)
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'GET' && typeof window.markLocalWrite === 'function') {
      window.markLocalWrite();
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

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
        window.location.href = base + '/index.html';
        throw new Error('Session expired');
      }

      throw new Error(error.detail || response.statusText);
    }

    return response.json();
  }

  // ===== AUTHENTICATION =====

  static async signUp(email, password) {
    const data = await this.call('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    if (data.session?.refresh_token) {
      this.setRefreshToken(data.session.refresh_token);
    }
    if (data.household_id) {
      this.setActiveHouseholdId(data.household_id);
    }

    return data;
  }

  static async signIn(email, password) {
    const data = await this.call('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.session?.access_token) {
      this.setToken(data.session.access_token);
    }
    if (data.session?.refresh_token) {
      this.setRefreshToken(data.session.refresh_token);
    }
    if (data.household_id) {
      this.setActiveHouseholdId(data.household_id);
    }

    return data;
  }

  static async signOut() {
    await this.call('/auth/signout', { method: 'POST' });
    this.clearToken();
    localStorage.removeItem('active_household_id');
  }

  static async getCurrentUser() {
    return this.call('/auth/me');
  }

  // ===== PANTRY =====

  static async getPantry() {
    return this.call('/pantry/');
  }

  static async getUnits() {
    return this.call('/pantry/units');
  }

  static async addPantryItem(item) {
    return this.call('/pantry/', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  static async updatePantryItem(id, item) {
    return this.call(`/pantry/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
  }

  static async deletePantryItem(id) {
    return this.call(`/pantry/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== RECIPES =====

  static async getRecipes() {
    return this.call('/recipes/');
  }

  static async searchRecipes(params) {
    const query = new URLSearchParams();
    if (params.q) query.append('q', params.q);
    if (params.tags) params.tags.forEach(tag => query.append('tags', tag));
    if (params.ready_only) query.append('ready_only', 'true');
    if (params.has_ingredients) params.has_ingredients.forEach(ing => query.append('has_ingredients', ing));

    return this.call(`/recipes/search?${query}`);
  }

  static async getRecipe(id) {
    return this.call(`/recipes/${id}`);
  }

  static async addRecipe(recipe) {
    return this.call('/recipes/', {
      method: 'POST',
      body: JSON.stringify(recipe)
    });
  }

  static async updateRecipe(id, recipe) {
    return this.call(`/recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recipe)
    });
  }

  static async deleteRecipe(id) {
    return this.call(`/recipes/${id}`, {
      method: 'DELETE'
    });
  }

  static async getScaledRecipe(id, multiplier) {
    return this.call(`/recipes/${id}/scaled?multiplier=${multiplier}`);
  }

  // ===== MEAL PLANS =====

  static async getMealPlans() {
    return this.call('/meal-plans/');
  }

  static async addMealPlan(meal) {
    return this.call('/meal-plans/', {
      method: 'POST',
      body: JSON.stringify(meal)
    });
  }

  static async updateMealPlan(id, meal) {
    return this.call(`/meal-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(meal)
    });
  }

  static async deleteMealPlan(id) {
    return this.call(`/meal-plans/${id}`, {
      method: 'DELETE'
    });
  }

  static async validateCanCook(mealId) {
    return this.call(`/meal-plans/${mealId}/validate`, {
      method: 'POST'
    });
  }

  static async markMealCooked(mealId, force = false) {
    return this.call(`/meal-plans/${mealId}/cook?force=${force}`, {
      method: 'POST'
    });
  }

  // ===== SHOPPING LIST =====

  static async getShoppingList() {
    return this.call('/shopping-list/');
  }

  static async regenerateShoppingList() {
    return this.call('/shopping-list/regenerate', {
      method: 'POST'
    });
  }

  static async addManualShoppingItem(item) {
    return this.call('/shopping-list/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  static async updateShoppingItem(id, update) {
    return this.call(`/shopping-list/items/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(update)
    });
  }

  static async deleteManualShoppingItem(id) {
    return this.call(`/shopping-list/items/${id}`, {
      method: 'DELETE'
    });
  }

  static async clearCheckedItems() {
    return this.call('/shopping-list/clear-checked', {
      method: 'POST'
    });
  }

  static async addCheckedToPantry() {
    return this.call('/shopping-list/add-checked-to-pantry', {
      method: 'POST'
    });
  }

  // ===== ALERTS & SUGGESTIONS =====

  static async getExpiringItems(days = 3) {
    return this.call(`/alerts/expiring?days=${days}`);
  }

  static async getExpiringSuggestions() {
    return this.call('/alerts/suggestions/use-expiring');
  }

  static async getReadyRecipes() {
    return this.call('/alerts/suggestions/ready-to-cook');
  }

  static async getPantryHealth() {
    return this.call('/alerts/pantry-health');
  }

  static async getDashboard() {
    return this.call('/alerts/dashboard');
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
}

// Export for use in other files
window.API = API;

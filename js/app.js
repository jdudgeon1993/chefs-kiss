// ===== DASHBOARD MODULE =====
const Dashboard = {
  container: null,

  init() {
    // Try to find the dashboard container
    this.container = document.getElementById('dashboard');

    // If not found, create it automatically
    if (!this.container) {
      console.warn('Dashboard container not found during init. Creating automatically.');
      this.container = document.createElement('div');
      this.container.id = 'dashboard';
      document.body.appendChild(this.container);
    }

    // Bind buttons (if any)
    this.bindButtons();
  },

  bindButtons() {
    if (!this.container) return;

    // Example: dashboard refresh button
    const refreshBtn = this.container.querySelector('#dashboard-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.load();
      });
    }

    // Add more button bindings here as needed
  },

  async load() {
    if (!this.container) return;

    // Show loading message immediately
    safeSetInnerHTMLById('dashboard', '<p>Loading dashboard...</p>');

    try {
      // Make sure endpoint matches your backend
      const data = await API.call('/alerts/dashboard');

      const pantryCount = data?.pantry_count ?? 0;
      const recipeCount = data?.recipe_count ?? 0;

      const html = `
        <p>Pantry: ${pantryCount}</p>
        <p>Recipes: ${recipeCount}</p>
      `;

      safeSetInnerHTMLById('dashboard', html);

      // Re-bind buttons in case the container content changed
      this.bindButtons();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      safeSetInnerHTMLById('dashboard', '<p>Unable to load dashboard</p>');
    }
  }
};

/* ============================================================================
   AUTHENTICATION
============================================================================ */

async function checkAuth() {
  const token = API.getToken();
  if (!token) {
    return false;
  }

  try {
    // Verify token with /auth/me endpoint
    const data = await API.call('/auth/me');
    // Ensure household_id is in localStorage for Realtime and API headers
    if (data.household_id) {
      API.setActiveHouseholdId(data.household_id);
    }
    return true;
  } catch (error) {
    console.log('Authentication check failed, clearing token:', error.message);
    API.clearToken();
    return false;
  }
}

/* ============================================================================
   PANTRY FUNCTIONS
============================================================================ */

async function loadPantry() {
  try {
    showLoading();
    const response = await API.call('/pantry/');
    // Backend returns {pantry_items: [...], shopping_list: [...]}
    const items = response.pantry_items || response || [];
    renderPantryList(items);
  } catch (error) {
    showError('Failed to load pantry');
    console.error('Pantry load error:', error);
  } finally {
    hideLoading();
  }
}

function renderPantryList(items) {
  if (!items || items.length === 0) {
    window.pantry = [];
    const container = document.getElementById('pantry-display');
    if (container) {
      container.innerHTML = '<p class="empty-state">No pantry items yet. Add your first item!</p>';
    }
    return;
  }

  // Transform backend data format to frontend format
  // Backend uses: min_threshold, quantity, expiration_date
  // Frontend expects: min, totalQty, locations with qty/expiry
  const transformedItems = items.map(item => {
    // Transform locations
    const locations = (item.locations || []).map(loc => ({
      id: loc.id,
      location: loc.location || loc.location_name || 'Unknown',
      qty: loc.quantity || loc.qty || 0,
      expiry: loc.expiration_date || loc.expiry || null
    }));

    // Calculate total quantity from locations
    const totalQty = locations.reduce((sum, loc) => sum + (loc.qty || 0), 0);

    return {
      id: item.id,
      name: item.name,
      category: item.category || 'Other',
      unit: item.unit || 'unit',
      min: item.min_threshold || item.min || 0,
      totalQty: totalQty,
      locations: locations
    };
  });

  // Store transformed items globally for other scripts to access
  window.pantry = transformedItems;

  // The actual rendering is done by the pantry ledger script in pantry.js
  const container = document.getElementById('pantry-display');
  if (container) {
    container.setAttribute('data-updated', Date.now());
  }
}

/* ============================================================================
   RECIPE FUNCTIONS
============================================================================ */

async function loadRecipes(searchQuery = '') {
  try {
    showLoading();
    const endpoint = searchQuery ? `/recipes/search?q=${encodeURIComponent(searchQuery)}` : '/recipes/';
    const response = await API.call(endpoint);
    // Backend returns {recipes: [...], ready_to_cook: [...]}
    const recipes = response.recipes || response || [];
    renderRecipeList(recipes);
  } catch (error) {
    showError('Failed to load recipes');
    console.error('Recipe load error:', error);
  } finally {
    hideLoading();
  }
}

async function addRecipe(recipeData) {
  try {
    showLoading();
    const newRecipe = await API.call('/recipes/', {
      method: 'POST',
      body: JSON.stringify(recipeData)
    });

    await loadRecipes();
    showSuccess('Recipe added!');
    return newRecipe;
  } catch (error) {
    showError('Failed to add recipe');
  } finally {
    hideLoading();
  }
}

async function updateRecipe(recipeId, recipeData) {
  try {
    showLoading();
    await API.call(`/recipes/${recipeId}`, {
      method: 'PUT',
      body: JSON.stringify(recipeData)
    });

    await loadRecipes();
    showSuccess('Recipe updated!');
  } catch (error) {
    showError('Failed to update recipe');
  } finally {
    hideLoading();
  }
}

async function deleteRecipe(recipeId) {
  if (!confirm('Delete this recipe?')) return;

  try {
    showLoading();
    await API.call(`/recipes/${recipeId}`, {
      method: 'DELETE'
    });

    await loadRecipes();
    showSuccess('Recipe deleted!');
  } catch (error) {
    showError('Failed to delete recipe');
  } finally {
    hideLoading();
  }
}

function renderRecipeList(recipes) {
  if (!recipes || recipes.length === 0) {
    window.recipes = [];
    const container = document.getElementById('recipes-grid');
    if (container) {
      container.innerHTML = '<p class="empty-state">No recipes yet. Add your first recipe!</p>';
    }
    return;
  }

  // Transform backend data format to frontend format
  // Backend uses: photo_url, quantity (in ingredients)
  // Frontend expects: photo, qty (in ingredients), servings, cookTime, category, isFavorite
  const transformedRecipes = recipes.map(recipe => {
    // Transform ingredients
    const ingredients = (recipe.ingredients || []).map(ing => ({
      name: ing.name || '',
      qty: ing.quantity || ing.qty || 0,
      unit: ing.unit || ''
    }));

    return {
      id: recipe.id,
      name: recipe.name || 'Untitled Recipe',
      servings: recipe.servings || recipe.yield || 4,
      cookTime: recipe.cook_time || recipe.cookTime || recipe.time || '30min',
      category: recipe.category || 'Uncategorized',
      photo: recipe.photo_url || recipe.photo || '',
      tags: recipe.tags || [],
      isFavorite: recipe.is_favorite || recipe.isFavorite || false,
      instructions: recipe.instructions || recipe.method || '',
      ingredients: ingredients
    };
  });

  // Store transformed recipes globally (needed by meals page for recipe names)
  window.recipes = transformedRecipes;

  // Signal the recipe grid observer to re-render by touching a data attribute.
  // The actual rendering is handled by renderRecipesGrid() in recipes.js.
  const container = document.getElementById('recipes-grid');
  if (container) {
    container.setAttribute('data-updated', Date.now());
  }
}

/* ============================================================================
   RESERVED INGREDIENTS CALCULATION
============================================================================ */

/**
 * Calculate ingredients reserved by upcoming meal plans.
 * Returns object mapping "name|unit" keys to reserved quantities.
 */
function calculateReservedIngredients() {
  const reserved = {};

  if (!window.planner || !window.recipes) {
    return reserved;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Iterate through planner (object with date keys)
  Object.keys(window.planner).forEach(dateKey => {
    // Parse date at noon to avoid timezone issues
    const mealDate = new Date(dateKey + 'T12:00:00');
    mealDate.setHours(0, 0, 0, 0);

    // Skip past dates
    if (mealDate < today) return;

    const meals = window.planner[dateKey];
    if (!Array.isArray(meals)) return;

    meals.forEach(meal => {
      // Skip cooked meals
      if (meal.cooked) return;

      // Find the recipe
      const recipe = window.recipes.find(r =>
        r.id === meal.recipeId || r.id === meal.recipe_id
      );
      if (!recipe || !recipe.ingredients) return;

      // Add each ingredient to reserved
      const multiplier = meal.servingMultiplier || meal.serving_multiplier || 1;
      recipe.ingredients.forEach(ing => {
        const key = `${(ing.name || '').toLowerCase()}|${(ing.unit || '').toLowerCase()}`;
        const qty = (ing.qty || ing.quantity || 0) * multiplier;
        reserved[key] = (reserved[key] || 0) + qty;
      });
    });
  });

  return reserved;
}

// Expose globally for pantry ledger script
window.calculateReservedIngredients = calculateReservedIngredients;

/* ============================================================================
   MEAL PLAN FUNCTIONS
============================================================================ */

async function loadMealPlans() {
  try {
    showLoading();
    const response = await API.call('/meal-plans/');
    // Backend returns {meal_plans: [...], reserved_ingredients: {...}}
    const meals = response.meal_plans || response || [];

    // Transform meal plans array to object grouped by date
    // Backend: [{ id, date, recipe_id, cooked, ... }]
    // Frontend expects: { '2026-01-19': [{ id, recipeId, mealType, cooked }] }
    const plannerByDate = {};
    meals.forEach(meal => {
      // Get date string (backend uses 'date' or 'planned_date')
      const dateStr = meal.date || meal.planned_date;
      if (!dateStr) return;

      // Normalize date format to YYYY-MM-DD
      const dateKey = typeof dateStr === 'string' ? dateStr.split('T')[0] : dateStr;

      if (!plannerByDate[dateKey]) {
        plannerByDate[dateKey] = [];
      }

      plannerByDate[dateKey].push({
        id: meal.id,
        recipeId: meal.recipe_id || meal.recipeId,
        mealType: meal.meal_type || meal.mealType || 'Dinner',
        cooked: meal.cooked || meal.is_cooked || false,
        servingMultiplier: meal.serving_multiplier || meal.servingMultiplier || 1
      });
    });

    // Store globally for meal planning script
    window.planner = plannerByDate;
    renderMealCalendar(meals);

    // Reload calendar if available
    if (window.reloadCalendar) {
      window.reloadCalendar();
    }
  } catch (error) {
    showError('Failed to load meal plans');
    console.error('Meal plans load error:', error);
    window.planner = {};
  } finally {
    hideLoading();
  }
}

async function addMealPlan(mealData) {
  try {
    showLoading();
    const newMeal = await API.call('/meal-plans/', {
      method: 'POST',
      body: JSON.stringify(mealData)
    });

    await Promise.all([loadMealPlans(), loadShoppingList()]);
    showSuccess('Meal added to calendar!');
    return newMeal;
  } catch (error) {
    showError('Failed to add meal');
  } finally {
    hideLoading();
  }
}

async function updateMealPlan(mealId, mealData) {
  try {
    showLoading();
    await API.call(`/meal-plans/${mealId}`, {
      method: 'PUT',
      body: JSON.stringify(mealData)
    });

    await Promise.all([loadMealPlans(), loadShoppingList()]);
    showSuccess('Meal updated!');
  } catch (error) {
    showError('Failed to update meal');
  } finally {
    hideLoading();
  }
}

async function deleteMealPlan(mealId) {
  if (!confirm('Remove this meal from calendar?')) return;

  try {
    showLoading();
    await API.call(`/meal-plans/${mealId}`, {
      method: 'DELETE'
    });

    await Promise.all([loadMealPlans(), loadShoppingList()]);
    showSuccess('Meal removed!');
  } catch (error) {
    showError('Failed to remove meal');
  } finally {
    hideLoading();
  }
}

async function cookMeal(mealId) {
  if (!confirm('Mark this meal as cooked?')) return;

  try {
    showLoading();
    await API.call(`/meal-plans/${mealId}/cook`, {
      method: 'POST'
    });

    await Promise.all([loadMealPlans(), loadPantry(), loadShoppingList()]);
    showSuccess('Meal marked as cooked!');
  } catch (error) {
    showError('Failed to cook meal');
  } finally {
    hideLoading();
  }
}

function renderMealCalendar(meals) {
  const container = document.getElementById('meal-calendar');
  if (!container) return;

  if (!meals || meals.length === 0) {
    container.innerHTML = '<p class="empty-state">No meals planned yet. Start planning!</p>';
    return;
  }

  // Group by date
  const byDate = {};
  meals.forEach(meal => {
    if (!byDate[meal.date]) byDate[meal.date] = [];
    byDate[meal.date].push(meal);
  });

  let html = '';
  for (const [date, dateMeals] of Object.entries(byDate).sort()) {
    html += `
      <div class="calendar-day">
        <h3 class="day-date">${new Date(date).toLocaleDateString()}</h3>
        <div class="day-meals">
          ${dateMeals.map(meal => `
            <div class="meal-item ${meal.cooked ? 'cooked' : ''}" data-id="${meal.id}">
              <div class="meal-info">
                <span class="meal-type">${meal.meal_type || 'Dinner'}</span>
                <span class="meal-recipe">${meal.recipe_name || 'Recipe'}</span>
              </div>
              <div class="meal-actions">
                ${!meal.cooked ? `<button onclick="cookMeal(${meal.id})" class="btn-cook">Cook</button>` : '<span class="cooked-badge">✓ Cooked</span>'}
                <button onclick="deleteMealPlan(${meal.id})" class="btn-icon">🗑️</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

/* ============================================================================
   SHOPPING LIST FUNCTIONS
============================================================================ */

async function loadShoppingList() {
  try {
    showLoading();
    const shoppingData = await API.call('/shopping-list/');
    // Backend returns {shopping_list: [...], total_items: ..., checked_items: ...}
    const list = shoppingData.shopping_list || shoppingData;
    renderShoppingList(list);

    // Notify focus mode (or any listener) that shopping list updated
    window.dispatchEvent(new CustomEvent('shopping-list-updated', { detail: list }));
  } catch (error) {
    showError('Failed to load shopping list');
    console.error('Shopping list load error:', error);
  } finally {
    hideLoading();
  }
}

async function refreshShoppingList() {
  try {
    await loadShoppingList();
    showToast('Shopping list refreshed', 'sync', 2000);
  } catch (error) {
    showError('Failed to refresh shopping list');
  }
}

async function addManualItem(itemData) {
  try {
    showLoading();
    await API.call('/shopping-list/items', {
      method: 'POST',
      body: JSON.stringify(itemData)
    });

    await loadShoppingList();
    showSuccess('Item added to shopping list!');
  } catch (error) {
    showError('Failed to add item');
  } finally {
    hideLoading();
  }
}

async function checkShoppingItem(itemId, checked) {
  try {
    await API.call(`/shopping-list/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ checked })
    });

    await loadShoppingList();
  } catch (error) {
    showError('Failed to update item');
  }
}

async function deleteShoppingItem(itemId) {
  try {
    await API.call(`/shopping-list/items/${itemId}`, {
      method: 'DELETE'
    });

    await loadShoppingList();
    showSuccess('Item removed!');
  } catch (error) {
    showError('Failed to remove item');
  }
}

async function clearCheckedItems() {
  if (!confirm('Clear all checked items?')) return;

  try {
    showLoading();
    await API.call('/shopping-list/clear-checked', {
      method: 'POST'
    });

    await loadShoppingList();
    showSuccess('Checked items cleared!');
  } catch (error) {
    showError('Failed to clear items');
  } finally {
    hideLoading();
  }
}

async function addCheckedToPantry() {
  // Use the checkout modal instead of confirm prompt
  openCheckoutModal();
}

// Track checked state for auto-generated items (no IDs) in localStorage
function getLocalCheckedItems() {
  try {
    return JSON.parse(localStorage.getItem('checkedShoppingItems') || '{}');
  } catch {
    return {};
  }
}

function setLocalCheckedItem(itemKey, checked) {
  const checkedItems = getLocalCheckedItems();
  if (checked) {
    checkedItems[itemKey] = true;
  } else {
    delete checkedItems[itemKey];
  }
  localStorage.setItem('checkedShoppingItems', JSON.stringify(checkedItems));
}

function clearLocalCheckedItems() {
  localStorage.removeItem('checkedShoppingItems');
}

function renderShoppingList(items) {
  // Store items globally for checkout (must happen before container check)
  window.shoppingList = items || [];

  const container = document.getElementById('shopping-list');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p class="empty-state">Shopping list is empty!</p>';
    return;
  }

  // Get locally tracked checked items
  const localChecked = getLocalCheckedItems();

  // Group by category
  const byCategory = {};
  items.forEach(item => {
    const cat = item.category || 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];

    // Create unique key for items without IDs
    const itemKey = item.id || `${item.name}|${item.unit}`;
    // Check if item is checked (from backend or local)
    const isChecked = item.checked || localChecked[itemKey];

    byCategory[cat].push({ ...item, itemKey, isChecked });
  });

  let html = '';

  for (const [category, categoryItems] of Object.entries(byCategory)) {
    html += `
      <div class="shopping-category">
        <h3 class="category-title">${category}</h3>
        <div class="shopping-items">
          ${categoryItems.map((item, idx) => {
            // Escape special characters for use in attributes and onclick
            const safeItemKey = item.itemKey.replace(/'/g, "\\'").replace(/"/g, '&quot;');
            const itemIndex = idx;
            return `
            <div class="shopping-item ${item.isChecked ? 'checked' : ''}" data-key="${safeItemKey}" data-idx="${itemIndex}">
              <label class="shopping-checkbox">
                <input
                  type="checkbox"
                  ${item.isChecked ? 'checked' : ''}
                  onchange="toggleShoppingItem('${safeItemKey}', ${item.id ? `'${item.id}'` : 'null'}, this.checked)"
                >
                <span class="item-name">${item.name}</span>
                <span class="item-qty">${item.quantity} ${item.unit}</span>
              </label>
              ${item.source ? `<span class="item-source">${item.source}</span>` : ''}
              ${item.breakdown && item.breakdown.meals && item.breakdown.threshold ? `<span class="item-breakdown">${item.breakdown.meals} for meals, ${item.breakdown.threshold} to restock</span>` : ''}
              <div class="item-actions">
                <button onclick="editShoppingItem('${safeItemKey}', '${item.name}', ${item.quantity}, '${item.unit}', '${item.category || 'Other'}')" class="btn-icon" title="Edit">✏️</button>
                ${item.id ? `<button onclick="deleteShoppingItem('${item.id}')" class="btn-icon" title="Delete">🗑️</button>` : ''}
              </div>
            </div>
          `}).join('')}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

/**
 * Add a new item to shopping list
 */
async function addShoppingItem() {
  const input = document.getElementById('user-item-name');
  if (!input) return;

  const name = input.value.trim();
  if (!name) return;

  try {
    await API.call('/shopping-list/items', {
      method: 'POST',
      body: JSON.stringify({
        name: name,
        quantity: 1,
        unit: 'unit',
        category: 'Other'
      })
    });
    input.value = '';
    await loadShoppingList();
    showSuccess('Item added!');
  } catch (error) {
    console.error('Error adding item:', error);
    showError('Failed to add item');
  }
}

/**
 * Edit a shopping item
 */
function editShoppingItem(itemKey, name, quantity, unit, category) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const savedCategories = getSavedCategories();
  const categoryOptions = savedCategories.map(cat =>
    `<option value="${cat}" ${category === cat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content edit-shopping-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>Edit Shopping Item</h2>
        <form id="edit-shopping-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="edit-item-name" value="${name}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Quantity</label>
              <input type="number" id="edit-item-qty" value="${quantity}" step="0.1" min="0.1" required>
            </div>
            <div class="form-group">
              <label>Unit</label>
              <input type="text" id="edit-item-unit" value="${unit}" placeholder="lb, oz, etc">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="edit-item-category">
                ${categoryOptions}
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('edit-shopping-form');
  form.onsubmit = async (e) => {
    e.preventDefault();

    const newName = document.getElementById('edit-item-name').value.trim();
    const newQty = parseFloat(document.getElementById('edit-item-qty').value) || 1;
    const newUnit = document.getElementById('edit-item-unit').value.trim() || 'unit';
    const newCategory = document.getElementById('edit-item-category').value;

    if (!newName) { alert('Name is required'); return; }

    // Find the item to determine if it has a backend ID
    const items = window.shoppingList || [];
    const item = items.find(i => {
      const key = i.id || `${i.name}|${i.unit}`;
      return key === itemKey;
    });

    try {
      if (item && item.id) {
        // Manual item — update via API
        await API.call(`/shopping-list/items/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: newName, quantity: newQty, category: newCategory })
        });
      }
      closeModal();
      await loadShoppingList();
      showSuccess('Item updated!');
    } catch (error) {
      console.error('Error updating item:', error);
      showError('Failed to update item');
    }
  };
}

// Expose new functions globally
window.addShoppingItem = addShoppingItem;
window.editShoppingItem = editShoppingItem;

/**
 * Toggle shopping item checked state
 * For items with IDs: update backend
 * For auto-generated items: track locally
 */
async function toggleShoppingItem(itemKey, itemId, checked) {
  if (itemId) {
    // Manual item with ID - update backend
    try {
      await API.call(`/shopping-list/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ checked })
      });
    } catch (error) {
      console.error('Error updating item:', error);
      // Still track locally as fallback
      setLocalCheckedItem(itemKey, checked);
    }
  } else {
    // Auto-generated item - track locally
    setLocalCheckedItem(itemKey, checked);
  }

  // Update UI immediately
  const itemElement = document.querySelector(`[data-key="${itemKey}"]`);
  if (itemElement) {
    itemElement.classList.toggle('checked', checked);
  }
}

/**
 * Clear all checked items
 */
async function clearAllChecked() {
  if (!confirm('Clear all checked items from the list?')) return;

  try {
    // Clear backend manual items
    await API.call('/shopping-list/clear-checked', { method: 'POST' });
    // Clear local tracked items
    clearLocalCheckedItems();
    await loadShoppingList();
    showSuccess('Checked items cleared!');
  } catch (error) {
    showError('Failed to clear items');
  }
}

/**
 * Open checkout modal to confirm details before adding to pantry
 */
function openCheckoutModal() {
  const items = window.shoppingList || [];
  const localChecked = getLocalCheckedItems();

  // Get checked items
  const checkedItems = items.filter(item => {
    const itemKey = item.id || `${item.name}|${item.unit}`;
    return item.checked || localChecked[itemKey];
  });

  if (checkedItems.length === 0) {
    alert('Please check off items you want to add to pantry first.');
    return;
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  // Get saved locations and categories
  const savedLocations = getSavedLocations();
  const savedCategories = getSavedCategories();

  const locationOptions = savedLocations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  const categoryOptions = savedCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

  // Build item rows
  const itemsHTML = checkedItems.map((item, idx) => `
    <div class="checkout-item" data-idx="${idx}">
      <div class="checkout-item-header">
        <strong>${item.name}</strong>
        <span>${item.quantity} ${item.unit}</span>
      </div>
      <div class="checkout-item-fields">
        <div class="checkout-field">
          <label>Location</label>
          <select class="checkout-location">
            ${locationOptions}
          </select>
        </div>
        <div class="checkout-field">
          <label>Category</label>
          <select class="checkout-category">
            ${categoryOptions.replace(`value="${item.category}"`, `value="${item.category}" selected`)}
          </select>
        </div>
        <div class="checkout-field">
          <label>Quantity</label>
          <input type="number" class="checkout-qty" value="${item.quantity}" min="0.1" step="0.1">
        </div>
        <div class="checkout-field">
          <label>Expiration</label>
          <input type="date" class="checkout-expiry" value="">
        </div>
      </div>
    </div>
  `).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content checkout-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>🛒 Checkout - Add to Pantry</h2>
        <p class="help-text">Confirm details for each item before adding to your pantry.</p>

        <div class="checkout-items">
          ${itemsHTML}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="confirmCheckout()">Add All to Pantry</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Confirm checkout and add items to pantry
 */
async function confirmCheckout() {
  const items = window.shoppingList || [];
  const localChecked = getLocalCheckedItems();

  // Get checked items
  const checkedItems = items.filter(item => {
    const itemKey = item.id || `${item.name}|${item.unit}`;
    return item.checked || localChecked[itemKey];
  });

  // Collect form data
  const checkoutRows = document.querySelectorAll('.checkout-item');
  const itemsToAdd = [];

  checkoutRows.forEach((row, idx) => {
    if (idx >= checkedItems.length) return;

    const item = checkedItems[idx];
    const location = row.querySelector('.checkout-location').value;
    const category = row.querySelector('.checkout-category').value;
    const quantity = parseFloat(row.querySelector('.checkout-qty').value) || item.quantity;
    const expiry = row.querySelector('.checkout-expiry').value || null;

    itemsToAdd.push({
      name: item.name,
      unit: item.unit,
      category: category,
      quantity: quantity,
      location: location,
      expiration_date: expiry
    });
  });

  if (itemsToAdd.length === 0) {
    alert('No items to add.');
    return;
  }

  try {
    showLoading();

    // Fetch fresh pantry data to ensure we have the latest state
    // (window.pantry might be stale or empty if we're on the shopping page)
    try {
      const pantryResponse = await API.call('/pantry/');
      const freshPantry = (pantryResponse.pantry_items || pantryResponse || []).map(item => {
        const locations = (item.locations || []).map(loc => ({
          id: loc.id,
          location: loc.location || loc.location_name || 'Unknown',
          qty: loc.quantity || loc.qty || 0,
          expiry: loc.expiration_date || loc.expiry || null
        }));
        return {
          id: item.id,
          name: item.name,
          category: item.category || 'Other',
          unit: item.unit || 'unit',
          min: item.min_threshold || item.min || 0,
          totalQty: locations.reduce((sum, loc) => sum + (loc.qty || 0), 0),
          locations: locations
        };
      });
      window.pantry = freshPantry;
    } catch (err) {
      console.warn('Could not refresh pantry before checkout, using cached data:', err);
    }

    // Add each item to pantry
    for (const item of itemsToAdd) {
      // Check if item exists in pantry (case-insensitive name + unit match)
      const pantryItem = (window.pantry || []).find(p =>
        p.name.toLowerCase() === item.name.toLowerCase() &&
        p.unit.toLowerCase() === item.unit.toLowerCase()
      );

      if (pantryItem) {
        // Update existing item - add to locations
        const existingLocation = pantryItem.locations.find(l => l.location === item.location);
        let newLocations;

        if (existingLocation) {
          // Add to existing location quantity
          newLocations = pantryItem.locations.map(l => {
            if (l.location === item.location) {
              return {
                location: l.location,
                quantity: l.qty + item.quantity,
                expiration_date: item.expiration_date || l.expiry
              };
            }
            return { location: l.location, quantity: l.qty, expiration_date: l.expiry };
          });
        } else {
          // Add new location
          newLocations = [
            ...pantryItem.locations.map(l => ({
              location: l.location,
              quantity: l.qty,
              expiration_date: l.expiry
            })),
            {
              location: item.location,
              quantity: item.quantity,
              expiration_date: item.expiration_date
            }
          ];
        }

        await API.call(`/pantry/${pantryItem.id}`, {
          method: 'PUT',
          body: JSON.stringify({ locations: newLocations })
        });

        // Update in-memory pantry so subsequent items in this batch
        // see the updated state (prevents double-update or missed match)
        pantryItem.locations = newLocations.map(l => ({
          location: l.location,
          qty: l.quantity,
          expiry: l.expiration_date
        }));
        pantryItem.totalQty = newLocations.reduce((sum, l) => sum + (l.quantity || 0), 0);
      } else {
        // Create new pantry item
        const response = await API.call('/pantry/', {
          method: 'POST',
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            unit: item.unit,
            min_threshold: 0,
            locations: [{
              location: item.location,
              quantity: item.quantity,
              expiration_date: item.expiration_date
            }]
          })
        });

        // Add to in-memory pantry so subsequent items can find it
        if (window.pantry) {
          window.pantry.push({
            id: response?.id || null,
            name: item.name,
            category: item.category,
            unit: item.unit,
            min: 0,
            totalQty: item.quantity,
            locations: [{ location: item.location, qty: item.quantity, expiry: item.expiration_date }]
          });
        }
      }
    }

    // Clear checked items
    await API.call('/shopping-list/clear-checked', { method: 'POST' });
    clearLocalCheckedItems();

    closeModal();
    await loadPantry();
    await loadShoppingList();
    showSuccess(`Added ${itemsToAdd.length} items to pantry!`);
  } catch (error) {
    console.error('Checkout error:', error);
    showError('Failed to add items to pantry: ' + error.message);
  } finally {
    hideLoading();
  }
}

// Expose functions globally
window.toggleShoppingItem = toggleShoppingItem;
window.clearAllChecked = clearAllChecked;
window.openCheckoutModal = openCheckoutModal;
window.confirmCheckout = confirmCheckout;

/* ============================================================================
   ALERTS & DASHBOARD
============================================================================ */

async function loadDashboard() {
  try {
    const dashboard = await API.call('/alerts/dashboard');
    renderDashboard(dashboard);
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

async function loadExpiringItems() {
  try {
    const expiring = await API.call('/alerts/expiring');
    renderExpiringItems(expiring);
  } catch (error) {
    console.error('Failed to load expiring items:', error);
  }
}

function renderDashboard(data) {
  const container = document.getElementById('dashboard');
  if (!container) return;

  container.innerHTML = `
    <div class="dashboard-stats">
      <div class="stat-card">
        <h3>Pantry Items</h3>
        <p class="stat-number">${data.pantry_count || 0}</p>
      </div>
      <div class="stat-card">
        <h3>Recipes</h3>
        <p class="stat-number">${data.recipe_count || 0}</p>
      </div>
      <div class="stat-card">
        <h3>Upcoming Meals</h3>
        <p class="stat-number">${data.upcoming_meals || 0}</p>
      </div>
      <div class="stat-card">
        <h3>Shopping Items</h3>
        <p class="stat-number">${data.shopping_count || 0}</p>
      </div>
    </div>
    ${data.expiring_soon && data.expiring_soon.length > 0 ? `
      <div class="dashboard-alerts">
        <h3>⚠️ Items Expiring Soon</h3>
        <ul>
          ${data.expiring_soon.map(item => `
            <li>${item.item_name} - expires in ${item.expires_in_days} days</li>
          `).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

function renderExpiringItems(items) {
  const container = document.getElementById('expiring-items');
  if (!container) return;

  if (!items || items.length === 0) {
    container.innerHTML = '<p>No items expiring soon!</p>';
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="expiring-item ${item.is_expired ? 'expired' : ''}">
      <span class="item-name">${item.item_name}</span>
      <span class="item-expires">Expires: ${item.expires_on}</span>
      <span class="item-days">${item.expires_in_days} days</span>
    </div>
  `).join('');
}

/* ============================================================================
   VIEW MANAGEMENT
============================================================================ */

// App State
const AppState = {
  currentView: 'pantry',
  loading: false
};

function showView(viewName) {
  AppState.currentView = viewName;

  // Map view names to radio button IDs
  const radioMap = {
    'pantry': 'nav-pantry',
    'recipes': 'nav-recipes',
    'shopping': 'nav-shopping',
    'planner': 'nav-meal-planning',
    'meal-planning': 'nav-meal-planning',
    'onboarding': 'nav-onboarding'
  };

  const radioId = radioMap[viewName];
  if (radioId) {
    const radio = document.getElementById(radioId);
    if (radio) radio.checked = true;
  }

  // Load data for view
  switch(viewName) {
    case 'pantry':
      loadPantry();
      break;
    case 'recipes':
      loadRecipes();
      break;
    case 'planner':
    case 'meal-planning':
      loadMealPlans();
      break;
    case 'shopping':
      loadShoppingList();
      break;
  }
}

function showLandingPage() {
  const landing = document.getElementById('landing-page');
  const mainContent = document.querySelector('.main-content');
  const siteHeader = document.querySelector('.site-header');
  const sidebarNav = document.querySelector('.sidebar-nav');
  const bottomNav = document.querySelector('.bottom-nav');

  if (landing) landing.classList.add('show');
  if (mainContent) mainContent.style.display = 'none';
  if (siteHeader) siteHeader.style.display = 'none';
  if (sidebarNav) sidebarNav.style.display = 'none';
  if (bottomNav) bottomNav.style.display = 'none';

  document.body.classList.add('landing-active');
}

function showApp(section) {
  const landing = document.getElementById('landing-page');
  const mainContent = document.querySelector('.main-content');
  const siteHeader = document.querySelector('.site-header');
  const sidebarNav = document.querySelector('.sidebar-nav');
  const bottomNav = document.querySelector('.bottom-nav');

  if (landing) landing.classList.remove('show');
  if (mainContent) mainContent.style.display = 'block';
  if (siteHeader) siteHeader.style.display = 'flex';

  // Remove inline styles to let CSS media queries handle sidebar vs bottom nav
  // CSS shows sidebar on desktop (min-width: 768px) and bottom nav on mobile
  if (sidebarNav) sidebarNav.style.display = '';
  if (bottomNav) bottomNav.style.display = '';

  document.body.classList.remove('landing-active');
}

/* ============================================================================
   MODAL FUNCTIONS FOR INLINE SCRIPTS
============================================================================ */

/**
 * Open modal to edit a pantry item
 */
function openIngredientModal(item) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  // Get saved categories and locations for dropdowns
  const savedCategories = getSavedCategories();
  const savedLocations = getSavedLocations();

  const categoryOptions = savedCategories.map(cat =>
    `<option value="${cat}" ${item.category === cat ? 'selected' : ''}>${cat}</option>`
  ).join('');

  const locationOptions = savedLocations.map(loc =>
    `<option value="${loc}">${loc}</option>`
  ).join('');

  const locations = item.locations || [];
  // Only show location rows if item already has locations (editing) - otherwise start empty (adding)
  const locationsHTML = locations.length > 0 ? locations.map((loc, idx) => `
    <div class="location-row" data-idx="${idx}">
      <select class="loc-name">
        ${savedLocations.map(l => `<option value="${l}" ${loc.location === l ? 'selected' : ''}>${l}</option>`).join('')}
      </select>
      <input type="number" class="loc-qty" value="${loc.qty || loc.quantity || 0}" step="0.1" min="0" placeholder="Qty">
      <input type="date" class="loc-expiry" value="${loc.expiry || loc.expiration_date || ''}">
      <button type="button" class="btn-icon btn-remove" onclick="this.parentElement.remove()">×</button>
    </div>
  `).join('') : '<p class="help-text" style="margin:0.5rem 0;">Optional - add locations if you want to track where and how much.</p>';

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content ingredient-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>${item.id ? 'Edit' : 'Add'} Pantry Item</h2>
        <form id="ingredient-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="ing-name" value="${item.name || ''}" required list="ingredient-suggestions">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Category</label>
              <select id="ing-category">
                ${categoryOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Unit</label>
              <input type="text" id="ing-unit" value="${item.unit || ''}" placeholder="lb, oz, etc" list="unit-suggestions">
            </div>
            <div class="form-group">
              <label>Min Stock</label>
              <input type="number" id="ing-min" value="${item.min || 0}" step="0.1" min="0">
            </div>
          </div>
          <div class="form-group">
            <label>Locations & Quantities</label>
            <div id="locations-list">${locationsHTML}</div>
            <button type="button" class="btn-secondary btn-sm" onclick="addLocationRowWithDropdown()">+ Add Location</button>
          </div>
          <div class="form-actions">
            ${item.id ? '<button type="button" class="btn btn-danger" onclick="deleteIngredientFromModal(\'' + item.id + '\')">Delete</button>' : ''}
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('ingredient-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveIngredient(item.id);
  };
}

async function deleteIngredientFromModal(itemId) {
  if (!confirm('Delete this pantry item? This cannot be undone.')) return;

  try {
    await API.call(`/pantry/${itemId}`, { method: 'DELETE' });
    closeModal();
    showSuccess('Item deleted');
    await Promise.all([loadPantry(), loadShoppingList()]);
  } catch (error) {
    console.error('Error deleting item:', error);
    showError('Failed to delete item');
  }
}

function addLocationRowWithDropdown() {
  const list = document.getElementById('locations-list');
  if (!list) return;

  const savedLocations = getSavedLocations();
  const locationOptions = savedLocations.map(loc =>
    `<option value="${loc}">${loc}</option>`
  ).join('');

  const row = document.createElement('div');
  row.className = 'location-row';
  row.innerHTML = `
    <select class="loc-name">${locationOptions}</select>
    <input type="number" class="loc-qty" value="1" step="0.1" min="0" placeholder="Qty">
    <input type="date" class="loc-expiry">
    <button type="button" class="btn-icon btn-remove" onclick="this.parentElement.remove()">×</button>
  `;
  list.appendChild(row);
}


async function saveIngredient(itemId) {
  const name = document.getElementById('ing-name').value.trim();
  const category = document.getElementById('ing-category').value;
  const unit = document.getElementById('ing-unit').value.trim() || 'unit';
  const min = parseFloat(document.getElementById('ing-min').value) || 0;

  const locationRows = document.querySelectorAll('.location-row');
  const locations = [];
  locationRows.forEach(row => {
    const locNameEl = row.querySelector('.loc-name');
    // Handle both select and input elements
    const locName = locNameEl ? (locNameEl.value || '').trim() : '';
    const locQty = parseFloat(row.querySelector('.loc-qty')?.value) || 0;
    const locExpiry = row.querySelector('.loc-expiry')?.value || null;
    // Include location even if qty is 0 (means "unknown quantity")
    if (locName) {
      locations.push({ location: locName, quantity: locQty, expiration_date: locExpiry });
    }
  });

  if (!name) {
    alert('Please enter a name');
    return;
  }

  // Locations are now optional - item can exist without specifying where it is

  try {
    if (itemId) {
      await API.call(`/pantry/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, category, unit, min_threshold: min, locations })
      });
      showSuccess('Pantry item updated!');
    } else {
      await API.call('/pantry/', {
        method: 'POST',
        body: JSON.stringify({ name, category, unit, min_threshold: min, locations })
      });
      showSuccess('Pantry item added!');
    }
    closeModal();
    await Promise.all([loadPantry(), loadShoppingList()]);
  } catch (error) {
    console.error('Error saving ingredient:', error);
    showError('Failed to save: ' + error.message);
  }
}

/**
 * Open modal to quickly use/deplete an item
 */
function openQuickDepleteModal(item) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content quick-use-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>Use ${item.name}</h2>
        <p>Available: ${item.totalQty} ${item.unit}</p>
        <form id="quick-use-form">
          <div class="form-group">
            <label>Amount to use</label>
            <input type="number" id="use-amount" value="1" step="0.1" min="0.1" max="${item.totalQty}" required>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Use</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('quick-use-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('use-amount').value);
    await quickDepleteItem(item, amount);
  };
}

async function quickDepleteItem(item, amount) {
  if (amount > item.totalQty) {
    alert('Cannot use more than available');
    return;
  }

  // Deplete from first location with enough quantity
  const updatedLocations = [];
  let remaining = amount;

  for (const loc of item.locations) {
    if (remaining <= 0) {
      updatedLocations.push({ location: loc.location, quantity: loc.qty, expiration_date: loc.expiry });
    } else if (loc.qty >= remaining) {
      updatedLocations.push({ location: loc.location, quantity: loc.qty - remaining, expiration_date: loc.expiry });
      remaining = 0;
    } else {
      remaining -= loc.qty;
      // Don't add location if fully depleted
    }
  }

  try {
    await API.call(`/pantry/${item.id}`, {
      method: 'PUT',
      body: JSON.stringify({ locations: updatedLocations })
    });
    closeModal();
    showSuccess('Item used!');
    await Promise.all([loadPantry(), loadShoppingList()]);
  } catch (error) {
    console.error('Error depleting item:', error);
    showError('Failed to update: ' + error.message);
  }
}

/**
 * Open modal to add/edit a recipe
 */
function openRecipeModal(recipeId) {
  const recipe = recipeId ? window.recipes.find(r => r.id === recipeId) : { name: '', servings: 4, ingredients: [], instructions: '', tags: [], category: '' };
  if (!recipe && recipeId) {
    alert('Recipe not found');
    return;
  }

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const ingredientsHTML = (recipe.ingredients || []).map((ing, idx) => `
    <div class="ingredient-row" data-idx="${idx}">
      <input type="text" class="ing-name" value="${ing.name || ''}" placeholder="Ingredient" list="ingredient-suggestions">
      <input type="number" class="ing-qty" value="${ing.qty || 0}" step="0.1" min="0">
      <input type="text" class="ing-unit" value="${ing.unit || ''}" placeholder="unit" list="unit-suggestions">
    </div>
  `).join('') || '<div class="ingredient-row"><input type="text" class="ing-name" placeholder="Ingredient" list="ingredient-suggestions"><input type="number" class="ing-qty" value="1" step="0.1" min="0"><input type="text" class="ing-unit" placeholder="unit" list="unit-suggestions"></div>';

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content recipe-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>${recipeId ? 'Edit' : 'Add'} Recipe</h2>
        <form id="recipe-form">
          <div class="form-group">
            <label>Recipe Name</label>
            <input type="text" id="recipe-name" value="${recipe.name || ''}" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Servings</label>
              <input type="number" id="recipe-servings" value="${recipe.servings || 4}" min="1">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select id="recipe-category">
                ${[
                  'Breakfast', 'Brunch', 'Lunch', 'Dinner', 'Lunch & Dinner',
                  'Breakfast & Lunch', 'Appetizer', 'Side', 'Dessert',
                  'Snack', 'Beverage', 'Sauce & Dressing', 'Soup & Stew',
                  'Salad', 'Baked Goods', 'Meal Prep', 'Other'
                ].map(c =>
                  `<option value="${c}" ${(recipe.category || '') === c ? 'selected' : ''}>${c}</option>`
                ).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Tags (comma separated)</label>
              <input type="text" id="recipe-tags" value="${(recipe.tags || []).join(', ')}" placeholder="Italian, Quick, etc">
            </div>
          </div>
          <div class="form-group">
            <label>Ingredients</label>
            <div id="ingredients-list">${ingredientsHTML}</div>
            <button type="button" class="btn-secondary btn-sm" onclick="addIngredientRow()">+ Add Ingredient</button>
          </div>
          <div class="form-group">
            <label>Instructions</label>
            <textarea id="recipe-instructions" rows="5">${recipe.instructions || ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('recipe-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await saveRecipe(recipeId);
  };
}

function addIngredientRow() {
  const list = document.getElementById('ingredients-list');
  if (!list) return;
  const row = document.createElement('div');
  row.className = 'ingredient-row';
  row.innerHTML = '<input type="text" class="ing-name" placeholder="Ingredient" list="ingredient-suggestions"><input type="number" class="ing-qty" value="1" step="0.1" min="0"><input type="text" class="ing-unit" placeholder="unit" list="unit-suggestions">';
  list.appendChild(row);
}

async function saveRecipe(recipeId) {
  const name = document.getElementById('recipe-name').value.trim();
  const servings = parseInt(document.getElementById('recipe-servings').value) || 4;
  const category = document.getElementById('recipe-category').value;
  const tagsStr = document.getElementById('recipe-tags').value;
  const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
  const instructions = document.getElementById('recipe-instructions').value.trim();

  const ingredientRows = document.querySelectorAll('.ingredient-row');
  const ingredients = [];
  ingredientRows.forEach(row => {
    const ingName = row.querySelector('.ing-name').value.trim();
    const ingQty = parseFloat(row.querySelector('.ing-qty').value) || 0;
    const ingUnit = row.querySelector('.ing-unit').value.trim() || 'unit';
    if (ingName) {
      ingredients.push({ name: ingName, quantity: ingQty, unit: ingUnit });
    }
  });

  if (!name) {
    alert('Please enter a recipe name');
    return;
  }

  try {
    if (recipeId) {
      await API.call(`/recipes/${recipeId}`, {
        method: 'PUT',
        body: JSON.stringify({ name, servings, category, tags, instructions, ingredients })
      });
      showSuccess('Recipe updated!');
    } else {
      await API.call('/recipes/', {
        method: 'POST',
        body: JSON.stringify({ name, servings, category, tags, instructions, ingredients })
      });
      showSuccess('Recipe created!');
    }
    closeModal();
    await loadRecipes();
  } catch (error) {
    console.error('Error saving recipe:', error);
    showError('Failed to save recipe: ' + error.message);
  }
}

/**
 * Open modal for a specific day to schedule meals
 */
function openDayModal(dateKey) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const meals = (window.planner && window.planner[dateKey]) || [];
  const recipes = window.recipes || [];

  const mealsHTML = meals.map(meal => {
    const recipe = recipes.find(r => r.id === meal.recipeId);
    return `
      <div class="scheduled-meal-row">
        <span>${meal.mealType}: ${recipe ? recipe.name : 'Unknown Recipe'}</span>
        <button type="button" class="btn-sm btn-danger" onclick="removeMealFromDay('${dateKey}', '${meal.id}')">Remove</button>
      </div>
    `;
  }).join('') || '<p>No meals scheduled</p>';

  const recipeOptions = recipes.map(r => `<option value="${r.id}">${r.name}</option>`).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content day-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>${new Date(dateKey + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
        <div class="scheduled-meals">${mealsHTML}</div>
        <hr>
        <h3>Add Meal</h3>
        <form id="add-meal-form">
          <div class="form-row">
            <div class="form-group">
              <label>Recipe</label>
              <select id="meal-recipe" required>
                <option value="">Select recipe...</option>
                ${recipeOptions}
              </select>
            </div>
            <div class="form-group">
              <label>Meal Type</label>
              <select id="meal-type">
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner" selected>Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary">Add to Plan</button>
        </form>
      </div>
    </div>
  `;

  const form = document.getElementById('add-meal-form');
  form.onsubmit = async (e) => {
    e.preventDefault();
    await addMealToDay(dateKey);
  };
}

async function addMealToDay(dateKey) {
  const recipeId = document.getElementById('meal-recipe').value;
  const mealType = document.getElementById('meal-type').value;

  if (!recipeId) {
    alert('Please select a recipe');
    return;
  }

  try {
    await API.call('/meal-plans/', {
      method: 'POST',
      body: JSON.stringify({ date: dateKey, recipe_id: recipeId, serving_multiplier: 1 })
    });
    closeModal();
    await Promise.all([loadMealPlans(), loadShoppingList()]);
    showSuccess('Meal planned!');
  } catch (error) {
    console.error('Error adding meal:', error);
    showError('Failed to add meal: ' + error.message);
  }
}

async function removeMealFromDay(dateKey, mealId) {
  if (!confirm('Remove this meal?')) return;

  try {
    await API.call(`/meal-plans/${mealId}`, { method: 'DELETE' });
    closeModal();
    await Promise.all([loadMealPlans(), loadShoppingList()]);
    showSuccess('Meal removed!');
  } catch (error) {
    console.error('Error removing meal:', error);
    showError('Failed to remove: ' + error.message);
  }
}

/**
 * Open modal to cook a meal
 */
function openCookNowModal(recipe, dateKey, mealId) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const ingredientsHTML = (recipe.ingredients || []).map(ing => `
    <li>${ing.qty || ing.quantity} ${ing.unit} ${ing.name}</li>
  `).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content cook-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>Cook: ${recipe.name}</h2>
        <h3>Ingredients needed:</h3>
        <ul>${ingredientsHTML}</ul>
        <p>This will deduct ingredients from your pantry.</p>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="markMealCooked('${dateKey}', '${mealId}')">Mark as Cooked</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Mark a meal as cooked and deduct from pantry
 */
async function markMealCooked(dateKey, mealId) {
  try {
    await API.call(`/meal-plans/${mealId}/cook`, { method: 'POST' });
    closeModal();
    await Promise.all([loadMealPlans(), loadPantry(), loadShoppingList()]);
    showSuccess('Meal cooked! Ingredients deducted from pantry.');
  } catch (error) {
    console.error('Error marking meal as cooked:', error);
    showError('Failed to cook meal: ' + error.message);
  }
}

/**
 * Close any open modal
 */
// Expose functions globally for inline scripts
window.openIngredientModal = openIngredientModal;
window.deleteIngredientFromModal = deleteIngredientFromModal;
window.openQuickDepleteModal = openQuickDepleteModal;
window.openRecipeModal = openRecipeModal;
window.openDayModal = openDayModal;
window.openCookNowModal = openCookNowModal;
window.markMealCooked = markMealCooked;
window.addLocationRowWithDropdown = addLocationRowWithDropdown;
window.addIngredientRow = addIngredientRow;
window.removeMealFromDay = removeMealFromDay;

/* ============================================================================
   PAGE LOADER — progress bar + rotating captions
============================================================================ */

const PAGE_LOADER_CAPTIONS = {
  recipes: [
    'Flipping through the cookbook...',
    'Stirring up some ideas...',
    'Consulting the Chef...',
    'Whisking up something new...'
  ],
  pantry: [
    'Checking the back of the shelf...',
    'Counting the cans...',
    'Organizing the spice rack...',
    'Peeking in the crisper drawer...'
  ],
  meals: [
    'Consulting the calendar...',
    'Mapping out the deliciousness...',
    'Drafting the menu...',
    'Prepping for the week...'
  ],
  shopping: [
    'Checking the coupons...',
    'Grabbing the reusable bags...',
    'Writing it all down...',
    'Mapping the aisles...'
  ]
};

const PAGE_LOADER_MIN_DISPLAY_MS = 3500;

function updateLoaderProgress(percent) {
  const bar = document.getElementById('loader-bar');
  if (bar) bar.style.width = percent + '%';
}

function startCaptionRotation(section) {
  const captions = PAGE_LOADER_CAPTIONS[section] || PAGE_LOADER_CAPTIONS.pantry;
  const el = document.getElementById('loader-caption');
  if (!el || captions.length === 0) return () => {};

  let idx = Math.floor(Math.random() * captions.length);
  el.textContent = captions[idx];
  el.style.transition = 'opacity 0.15s ease';

  const interval = setInterval(() => {
    idx = (idx + 1) % captions.length;
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = captions[idx];
      el.style.opacity = '1';
    }, 150);
  }, 1800);

  return () => clearInterval(interval);
}

function dismissLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  loader.style.opacity = '0';
  loader.style.pointerEvents = 'none';
  setTimeout(() => loader.remove(), 200);
}

/* ============================================================================
   APP INITIALIZATION
============================================================================ */

async function loadApp() {
  const section = document.body.dataset.section || 'pantry';
  showApp(section);

  // Use the loader timer started in initApp() (includes auth check time)
  const loaderStart = window._loaderStart || Date.now();
  const stopCaptions = window._stopCaptions || startCaptionRotation(section);

  // Phase 1: Settings + Units (~40%)
  updateLoaderProgress(15);

  const settingsPromise = loadSettings().then(() => updateLoaderProgress(30));
  const unitsPromise = loadUnits().then(() => updateLoaderProgress(40));

  try {
    await Promise.all([settingsPromise, unitsPromise]);
  } catch (error) {
    console.error('Error loading settings/units:', error);
  }

  // Phase 2: Section data (~40-90%)
  updateLoaderProgress(50);

  try {
    switch (section) {
      case 'pantry':
        await loadPantry();
        updateLoaderProgress(90);
        break;
      case 'recipes':
        await loadRecipes();
        updateLoaderProgress(90);
        break;
      case 'meals':
        await Promise.all([
          loadRecipes().then(() => updateLoaderProgress(70)),
          loadMealPlans().then(() => updateLoaderProgress(85))
        ]);
        updateLoaderProgress(90);
        break;
      case 'shopping':
        // Load pantry data too — needed for checkout to match existing items
        await Promise.all([
          loadShoppingList().then(() => updateLoaderProgress(70)),
          loadPantry().then(() => updateLoaderProgress(85))
        ]);
        updateLoaderProgress(90);
        break;
    }
  } catch (error) {
    console.error('Error loading section data:', error);
  }

  // Phase 3: Finalize (90-100%)
  if (section === 'meals' && window.reloadCalendar) {
    window.reloadCalendar();
  }

  createUnitDatalist();
  createIngredientDatalist();
  wireUpButtons();
  initRealtime();
  setupVisibilityReload();
  AppState.currentView = section === 'meals' ? 'meal-planning' : section;

  updateLoaderProgress(100);

  // Enforce minimum display so the loader always feels intentional
  const elapsed = Date.now() - loaderStart;
  const remaining = Math.max(0, PAGE_LOADER_MIN_DISPLAY_MS - elapsed);

  setTimeout(() => {
    stopCaptions();
    dismissLoader();
  }, remaining);
}

/**
 * Wire up all button click handlers
 */
function wireUpButtons() {
  // New pantry entry button — toggles the bulk entry section
  const btnNewPantry = document.getElementById('btn-new-pantry-entry');
  if (btnNewPantry) {
    btnNewPantry.addEventListener('click', () => {
      const pantrySection = document.getElementById('pantry-section');
      const onboardingSection = document.getElementById('onboarding-section');
      if (pantrySection) pantrySection.classList.add('section-hidden');
      if (onboardingSection) onboardingSection.classList.add('section-visible');
      initBulkEntry();
    });
  }

  // FAB buttons (using onclick in HTML, but also wire here as backup)
  const fabAddRecipe = document.getElementById('fab-add-recipe');
  if (fabAddRecipe) {
    fabAddRecipe.addEventListener('click', () => openRecipeModal(null));
  }

  // Add custom shopping item
  const btnAddCustomItem = document.getElementById('btn-add-custom-item');
  const userItemName = document.getElementById('user-item-name');
  if (btnAddCustomItem && userItemName) {
    const addCustomItem = async () => {
      const name = userItemName.value.trim();
      if (name) {
        try {
          await API.call('/shopping-list/items', {
            method: 'POST',
            body: JSON.stringify({ name, quantity: 1, unit: 'unit', category: 'Other' })
          });
          userItemName.value = '';
          await loadShoppingList();
          showSuccess('Item added!');
        } catch (error) {
          console.error('Error adding shopping item:', error);
          showError('Failed to add item');
        }
      }
    };
    btnAddCustomItem.addEventListener('click', addCustomItem);
    userItemName.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addCustomItem();
    });
  }

  // Checkout button - use the checkout modal
  const btnCheckout = document.getElementById('btn-checkout');
  if (btnCheckout) {
    btnCheckout.addEventListener('click', openCheckoutModal);
  }

  // Exit bulk entry — return to pantry view
  const btnExitOnboarding = document.getElementById('btn-exit-onboarding');
  if (btnExitOnboarding) {
    btnExitOnboarding.addEventListener('click', () => {
      const pantrySection = document.getElementById('pantry-section');
      const onboardingSection = document.getElementById('onboarding-section');
      if (onboardingSection) onboardingSection.classList.remove('section-visible');
      if (pantrySection) pantrySection.classList.remove('section-hidden');
    });
  }

  // Bulk entry action buttons
  const btnAddRows = document.getElementById('btn-add-rows-live');
  if (btnAddRows) btnAddRows.addEventListener('click', () => addBulkRows(5));

  const btnClearAll = document.getElementById('btn-clear-all-live');
  if (btnClearAll) btnClearAll.addEventListener('click', clearBulkEntry);

  const btnSaveAll = document.getElementById('btn-save-all-items');
  if (btnSaveAll) btnSaveAll.addEventListener('click', saveBulkEntry);

  // Account button
  const btnAccount = document.getElementById('btn-account');
  if (btnAccount) {
    btnAccount.addEventListener('click', openAccountModal);
  }

  // Settings button
  const btnSettings = document.getElementById('btn-settings');
  if (btnSettings) {
    btnSettings.addEventListener('click', openSettingsModal);
  }

  // Nav click — navigate directly; the target page's inline loader handles the transition
  document.querySelectorAll('.sidebar-nav .nav-btn[href], .bottom-nav .nav-btn[href]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('active')) { e.preventDefault(); return; }
      // Let the browser navigate normally — the target page's inline
      // loader is visible immediately (before CSS/JS loads)
    });
  });

  // Prefetch other section pages so navigation feels instant
  const sections = ['recipes', 'pantry', 'shopping', 'meals'];
  const currentSection = document.body.dataset.section;
  const basePath = window.CONFIG?.BASE_PATH || '';
  sections.forEach(s => {
    if (s !== currentSection) {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `${basePath}/${s}/`;
      document.head.appendChild(link);
    }
  });
}



// Expose data-loading functions globally
window.loadPantry = loadPantry;
window.loadRecipes = loadRecipes;
window.loadShoppingList = loadShoppingList;
window.refreshShoppingList = refreshShoppingList;
window.loadMealPlans = loadMealPlans;
window.deleteRecipe = deleteRecipe;
window.updateRecipe = updateRecipe;

async function initApp() {
  console.log('🍳 Chef\'s Kiss - Python Age 5.0');
  console.log('Backend:', window.CONFIG?.API_BASE || 'http://localhost:8000/api');

  // Apply compact mode if enabled
  applyDisplayMode();

  // Detect if we're on a section page (multi-page architecture)
  const section = document.body.dataset.section;
  const isDemoMode = localStorage.getItem('demo-mode') === 'true';

  // Start loader captions immediately so the user sees activity during auth check
  if (section) {
    window._loaderStart = Date.now();
    window._stopCaptions = startCaptionRotation(section);
    updateLoaderProgress(5);
  }

  // Check if user is authenticated
  const isAuthenticated = await checkAuth();

  console.log('Authentication status:', isAuthenticated, section ? `(section: ${section})` : '(landing)');

  if (isAuthenticated) {
    await loadApp();
  } else if (isDemoMode && section) {
    if (window._stopCaptions) window._stopCaptions();
    dismissLoader();
    await loadDemoApp();
  } else if (section) {
    // Not authenticated on a section page — redirect to landing
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/index.html';
  } else {
    // On landing page — no loader needed
    dismissLoader();
    showLandingPage();
  }
}

/**
 * Load demo data from localStorage (no API calls)
 */
async function loadDemoApp() {
  const section = document.body.dataset.section || 'pantry';
  console.log('🎮 Loading demo mode from localStorage');
  showApp(section);

  try {
    window.pantry = JSON.parse(localStorage.getItem('pantry') || '[]');
    window.recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
    window.planner = JSON.parse(localStorage.getItem('planner') || '{}');
    window.shoppingList = [];
  } catch (e) {
    console.error('Error parsing demo data:', e);
    window.pantry = [];
    window.recipes = [];
    window.planner = {};
    window.shoppingList = [];
  }

  // Load settings defaults (no API call needed for demo)
  if (typeof loadSettings === 'function') {
    try { await loadSettings(); } catch (e) { /* ignore API errors in demo */ }
  }
  if (typeof createUnitDatalist === 'function') createUnitDatalist();
  if (typeof createIngredientDatalist === 'function') createIngredientDatalist();

  // Trigger renders by touching data attributes
  const pantryDisplay = document.getElementById('pantry-display');
  if (pantryDisplay) pantryDisplay.setAttribute('data-updated', Date.now());

  const recipesGrid = document.getElementById('recipes-grid');
  if (recipesGrid) recipesGrid.setAttribute('data-updated', Date.now());

  if (window.reloadCalendar) window.reloadCalendar();

  wireUpButtons();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
  });
} else {
  initApp();
}

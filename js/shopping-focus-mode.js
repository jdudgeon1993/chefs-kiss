/**
 * Shopping List Focus Mode - Python Age 5.0
 *
 * "The shopping list is what makes everything beat!"
 *
 * Focus mode: Full-screen shopping list for when you're at the store.
 * - Items grouped by category for easy store navigation
 * - Check off items as you shop
 * - Quick add items on the fly
 * - Edit items for more details
 * - Live sync via main app's realtime events (preserves local checked state)
 * - Checkout opens main app's checkout modal
 * - Clean, distraction-free interface
 */

class ShoppingFocusMode {
  constructor() {
    this.isActive = false;
    this.shoppingList = [];
    this.overlay = null;
    this._updateHandler = null;
    this.groupMode = 'category'; // 'category' or 'store'
  }

  /**
   * Enter focus mode
   */
  async enter() {
    if (this.isActive) return;

    this.isActive = true;

    // Load shopping list and merge local checked state
    await this.loadShoppingList();

    // Create overlay
    this.createOverlay();

    // Render list
    this.render();

    // Add keyboard shortcuts
    this.addKeyboardShortcuts();

    // Listen for shopping list updates from main app
    this.subscribeToUpdates();

    if (window.showToast) {
      window.showToast('Focus mode active', 'info', 2000);
    }
  }

  /**
   * Exit focus mode
   */
  exit() {
    if (!this.isActive) return;

    this.isActive = false;

    // Remove overlay
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }

    // Remove keyboard shortcuts
    this.removeKeyboardShortcuts();

    // Unsubscribe from updates
    this.unsubscribeFromUpdates();

    // Restore body scrolling
    document.body.style.overflow = '';

    // Trigger app refresh so main list reflects any changes
    if (window.loadShoppingList) {
      window.loadShoppingList();
    }
  }

  /**
   * Load shopping list from API and merge local checked state
   */
  async loadShoppingList() {
    try {
      const data = await API.call('/shopping-list/');
      this.shoppingList = data.shopping_list || [];
      this._mergeLocalCheckedState();
    } catch (error) {
      console.error('Failed to load shopping list:', error);
      this.shoppingList = [];
    }
  }

  /**
   * Merge localStorage checked state into the shopping list.
   * Auto-generated items (no backend ID) track checked state in localStorage
   * via the same mechanism as the main app.
   */
  _mergeLocalCheckedState() {
    if (typeof getLocalCheckedItems !== 'function') return;

    const localChecked = getLocalCheckedItems();
    this.shoppingList.forEach(item => {
      if (!item.id) {
        const itemKey = `${item.name}|${item.unit}`;
        if (localChecked[itemKey]) {
          item.checked = true;
        }
      }
    });
  }

  /**
   * Create focus mode overlay
   */
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'shopping-focus-mode';
    this.overlay.className = 'shopping-focus-overlay';

    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';
  }

  /**
   * Group items by category or store, sorted A-Z within each group
   */
  groupByCategory(items) {
    return this._groupItems(items, 'category');
  }

  groupByStore(items) {
    return this._groupItems(items, 'store');
  }

  _groupItems(items, mode) {
    const groups = {};

    items.forEach(item => {
      const key = mode === 'store'
        ? (item.preferred_store || 'No Store Set')
        : (item.category || 'Other');
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    // Sort items A-Z within each group
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort groups A-Z (put "No Store Set" last)
    const sortedGroups = {};
    Object.keys(groups).sort((a, b) => {
      if (mode === 'store') {
        if (a === 'No Store Set') return 1;
        if (b === 'No Store Set') return -1;
      }
      return a.localeCompare(b);
    }).forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }

  /**
   * Render shopping list
   */
  render() {
    if (!this.overlay) return;

    const unchecked = this.shoppingList.filter(item => !item.checked);
    const checked = this.shoppingList.filter(item => item.checked);

    const groupFn = this.groupMode === 'store' ? 'groupByStore' : 'groupByCategory';
    const uncheckedByCategory = this[groupFn](unchecked);
    const checkedByCategory = this[groupFn](checked);

    const progress = this.shoppingList.length > 0
      ? Math.round((checked.length / this.shoppingList.length) * 100)
      : 0;

    this.overlay.innerHTML = `
      <div class="focus-container">
        <!-- Header -->
        <div class="focus-header">
          <h1>Shopping List</h1>
          <div class="focus-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="progress-text">
              ${checked.length} of ${this.shoppingList.length} items checked
            </div>
          </div>

          <!-- Group Toggle -->
          <div class="focus-group-toggle" style="display:flex;gap:0.5rem;justify-content:center;margin:0.5rem 0;">
            <button class="focus-btn ${this.groupMode === 'category' ? 'primary' : 'secondary'}" style="padding:0.25rem 0.75rem;font-size:0.8rem;" onclick="window.shoppingFocus.setGroupMode('category')">By Category</button>
            <button class="focus-btn ${this.groupMode === 'store' ? 'primary' : 'secondary'}" style="padding:0.25rem 0.75rem;font-size:0.8rem;" onclick="window.shoppingFocus.setGroupMode('store')">By Store</button>
          </div>

          <!-- Quick Add -->
          <div class="focus-quick-add">
            <input
              type="text"
              id="focus-quick-add-input"
              placeholder="Quick add item..."
              class="focus-input"
            >
            <button class="focus-btn-add" onclick="window.shoppingFocus.quickAdd()">+</button>
          </div>
        </div>

        <!-- Shopping List Content -->
        <div class="focus-content">
          ${this.shoppingList.length === 0 ? `
            <div class="focus-empty">
              <div class="empty-icon">🛒</div>
              <h2>Your list is empty!</h2>
              <p>Add items using the input above.</p>
            </div>
          ` : ''}

          ${unchecked.length > 0 ? `
            <div class="focus-section">
              <h2>To Buy (${unchecked.length})</h2>
              ${Object.entries(uncheckedByCategory).map(([groupKey, items]) => `
                <div class="focus-category">
                  <div class="focus-category-header">${this.groupMode === 'store' ? '🏪' : this.getCategoryEmoji(groupKey)} ${groupKey}</div>
                  <div class="focus-items">
                    ${items.map(item => this.renderItem(item, false)).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${checked.length > 0 ? `
            <div class="focus-section checked-section">
              <h2>In Cart (${checked.length})</h2>
              ${Object.entries(checkedByCategory).map(([groupKey, items]) => `
                <div class="focus-category">
                  <div class="focus-category-header">${this.groupMode === 'store' ? '🏪' : this.getCategoryEmoji(groupKey)} ${groupKey}</div>
                  <div class="focus-items">
                    ${items.map(item => this.renderItem(item, true)).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <!-- Footer Actions -->
        <div class="focus-footer">
          ${checked.length > 0 ? `
            <button class="focus-btn primary" onclick="window.shoppingFocus.checkout()">
              Checkout (${checked.length})
            </button>
            <button class="focus-btn secondary" onclick="window.shoppingFocus.clearChecked()">
              Clear Checked
            </button>
          ` : ''}
          <button class="focus-btn exit" onclick="window.shoppingFocus.exit()">
            Exit Focus Mode
          </button>
        </div>
      </div>
    `;

    // Wire up quick add input
    const quickAddInput = document.getElementById('focus-quick-add-input');
    if (quickAddInput) {
      quickAddInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.quickAdd();
      });
      // Auto-focus the input
      setTimeout(() => quickAddInput.focus(), 100);
    }
  }

  /**
   * Switch group mode and re-render
   */
  setGroupMode(mode) {
    this.groupMode = mode;
    this.render();
  }

  /**
   * Get emoji for category
   */
  getCategoryEmoji(category) {
    const emojis = {
      'Meat': '🥩', 'Dairy': '🧈', 'Produce': '🥬', 'Pantry': '🫙',
      'Frozen': '🧊', 'Spices': '🌶️', 'Beverages': '🥤', 'Snacks': '🍿',
      'Grains': '🌾', 'Baking': '🧁', 'Canned Goods': '🥫', 'Condiments': '🫗',
      'Seafood': '🐟', 'Deli': '🥪', 'Other': '📦'
    };
    return emojis[category] || '📦';
  }

  /**
   * Build breakdown subtitle for an item (e.g. "3 for meals, 2 to restock")
   */
  _getBreakdownText(item) {
    if (!item.breakdown) return '';
    const parts = [];
    if (item.breakdown.meals) parts.push(`${item.breakdown.meals} for meals`);
    if (item.breakdown.threshold) parts.push(`${item.breakdown.threshold} to restock`);
    return parts.length > 1 ? parts.join(', ') : '';
  }

  /**
   * Render single shopping item
   */
  renderItem(item, isChecked) {
    const itemKey = item.id || `${item.name}|${item.unit}`;
    const safeKey = itemKey.replace(/'/g, "\\'");
    const breakdownText = this._getBreakdownText(item);

    return `
      <div class="focus-item ${isChecked ? 'checked' : ''}" data-item-key="${itemKey}">
        <label class="focus-item-checkbox">
          <input
            type="checkbox"
            ${isChecked ? 'checked' : ''}
            onchange="window.shoppingFocus.toggleItem('${safeKey}', this.checked)"
          >
          <span class="checkmark"></span>
        </label>
        <div class="focus-item-content" onclick="window.shoppingFocus.openEditModal('${safeKey}')">
          <div class="focus-item-name">${item.name}</div>
          <div class="focus-item-details">
            <span class="focus-item-qty">${item.quantity} ${item.unit}</span>
            ${item.source ? `<span class="focus-item-source">${item.source}</span>` : ''}
          </div>
          ${breakdownText ? `<div class="focus-item-breakdown">${breakdownText}</div>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Toggle item checked status
   * - Manual items (with ID): update backend via PATCH
   * - Auto-generated items (no ID): track in localStorage
   */
  async toggleItem(itemKey, checked) {
    try {
      // Find item
      const item = this.shoppingList.find(i =>
        (i.id && String(i.id) === String(itemKey)) ||
        `${i.name}|${i.unit}` === itemKey
      );

      if (!item) return;

      if (item.id) {
        // Manual item with ID — update backend
        await API.call(`/shopping-list/items/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ checked })
        });
      } else {
        // Auto-generated item — persist in localStorage (shared with main app)
        if (typeof setLocalCheckedItem === 'function') {
          setLocalCheckedItem(itemKey, checked);
        }
      }

      // Update local state
      item.checked = checked;

      // Re-render
      this.render();

    } catch (error) {
      console.error('Failed to toggle item:', error);
      if (window.showToast) window.showToast('Failed to update item', 'error');
    }
  }

  /**
   * Quick add item (name only, defaults for rest)
   */
  async quickAdd() {
    const input = document.getElementById('focus-quick-add-input');
    if (!input) return;

    const name = input.value.trim();
    if (!name) return;

    try {
      await API.call('/shopping-list/items', {
        method: 'POST',
        body: JSON.stringify({
          name,
          quantity: 1,
          unit: 'unit',
          category: 'Other'
        })
      });

      input.value = '';
      await this.loadShoppingList();
      this.render();

      // Notify main app so it stays in sync
      this._notifyMainApp();

      if (window.showToast) window.showToast('Item added!', 'success', 2000);

    } catch (error) {
      console.error('Failed to add item:', error);
      if (window.showToast) window.showToast('Failed to add item', 'error');
    }
  }

  /**
   * Dispatch event to keep main app in sync with focus mode changes
   */
  _notifyMainApp() {
    window.dispatchEvent(new CustomEvent('shopping-list-updated', {
      detail: this.shoppingList
    }));
  }

  /**
   * Open edit modal for item
   */
  openEditModal(itemKey) {
    const item = this.shoppingList.find(i =>
      (i.id && String(i.id) === String(itemKey)) ||
      `${i.name}|${i.unit}` === itemKey
    );

    if (!item) return;

    // Get categories from household settings or use defaults
    const categories = (window.householdSettings && window.householdSettings.categories) ||
      (typeof getSavedCategories === 'function' ? getSavedCategories() : null) ||
      ['Meat', 'Dairy', 'Produce', 'Pantry', 'Frozen', 'Spices', 'Beverages', 'Snacks', 'Other'];

    const modal = document.createElement('div');
    modal.className = 'focus-modal-overlay';
    modal.innerHTML = `
      <div class="focus-modal">
        <h3>Edit Item</h3>
        <div class="focus-modal-field">
          <label>Name</label>
          <input type="text" id="edit-item-name" value="${item.name}" class="focus-input">
        </div>
        <div class="focus-modal-row">
          <div class="focus-modal-field">
            <label>Quantity</label>
            <input type="number" id="edit-item-qty" value="${item.quantity}" min="0" step="0.5" class="focus-input">
          </div>
          <div class="focus-modal-field">
            <label>Unit</label>
            <input type="text" id="edit-item-unit" value="${item.unit}" class="focus-input" list="focus-unit-list">
            <datalist id="focus-unit-list">
              ${(window.cachedUnits || ['each', 'lb', 'oz', 'cup', 'gallon']).map(u => `<option value="${u}">`).join('')}
            </datalist>
          </div>
        </div>
        <div class="focus-modal-field">
          <label>Category</label>
          <select id="edit-item-category" class="focus-input">
            ${categories.map(c => `<option value="${c}" ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="focus-modal-actions">
          ${item.id ? `<button class="focus-btn danger" onclick="window.shoppingFocus.deleteItem('${item.id}')">Delete</button>` : ''}
          <button class="focus-btn secondary" onclick="window.shoppingFocus.closeEditModal()">Cancel</button>
          <button class="focus-btn primary" onclick="window.shoppingFocus.saveEdit('${itemKey.replace(/'/g, "\\'")}')">Save</button>
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeEditModal();
    });

    this.overlay.appendChild(modal);
  }

  /**
   * Close edit modal
   */
  closeEditModal() {
    const modal = this.overlay.querySelector('.focus-modal-overlay');
    if (modal) modal.remove();
  }

  /**
   * Save edited item
   */
  async saveEdit(itemKey) {
    const item = this.shoppingList.find(i =>
      (i.id && String(i.id) === String(itemKey)) ||
      `${i.name}|${i.unit}` === itemKey
    );

    if (!item) return;

    const name = document.getElementById('edit-item-name').value.trim();
    const quantity = parseFloat(document.getElementById('edit-item-qty').value) || 1;
    const unit = document.getElementById('edit-item-unit').value.trim() || 'unit';
    const category = document.getElementById('edit-item-category').value;

    if (!name) {
      if (window.showToast) window.showToast('Name is required', 'error');
      return;
    }

    try {
      if (item.id) {
        // Manual item — save to backend
        await API.call(`/shopping-list/items/${item.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name, quantity, category })
        });
      }

      // Update local state
      item.name = name;
      item.quantity = quantity;
      item.unit = unit;
      item.category = category;

      this.closeEditModal();
      this.render();
      this._notifyMainApp();

      if (window.showToast) window.showToast('Item updated!', 'success', 2000);

    } catch (error) {
      console.error('Failed to update item:', error);
      if (window.showToast) window.showToast('Failed to update item', 'error');
    }
  }

  /**
   * Delete item
   */
  async deleteItem(itemId) {
    if (!confirm('Delete this item?')) return;

    try {
      await API.call(`/shopping-list/items/${itemId}`, { method: 'DELETE' });

      this.closeEditModal();
      await this.loadShoppingList();
      this.render();
      this._notifyMainApp();

      if (window.showToast) window.showToast('Item deleted', 'success', 2000);

    } catch (error) {
      console.error('Failed to delete item:', error);
      if (window.showToast) window.showToast('Failed to delete item', 'error');
    }
  }

  /**
   * Clear checked items
   */
  async clearChecked() {
    if (!confirm('Remove all checked items from the list?')) return;

    try {
      // Clear backend manual checked items
      await API.call('/shopping-list/clear-checked', { method: 'POST' });
      // Clear localStorage checked items
      if (typeof clearLocalCheckedItems === 'function') {
        clearLocalCheckedItems();
      }

      await this.loadShoppingList();
      this.render();
      this._notifyMainApp();

      if (window.showToast) window.showToast('Checked items cleared!', 'success');

      // If list is now empty, prompt to exit
      if (this.shoppingList.length === 0) {
        this.promptExitIfEmpty();
      }

    } catch (error) {
      console.error('Failed to clear checked items:', error);
      if (window.showToast) window.showToast('Failed to clear items', 'error');
    }
  }

  /**
   * Checkout - opens the main app's checkout modal (with location/category/expiry fields)
   * then exits focus mode
   */
  checkout() {
    const checked = this.shoppingList.filter(item => item.checked);
    if (checked.length === 0) {
      if (window.showToast) window.showToast('Check off items first', 'info');
      return;
    }

    // Update window.shoppingList so the checkout modal picks up our checked state
    window.shoppingList = this.shoppingList;

    // Exit focus mode overlay (keep body scrolling locked briefly)
    this.isActive = false;
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.removeKeyboardShortcuts();
    this.unsubscribeFromUpdates();
    document.body.style.overflow = '';

    // Open the main app's checkout modal
    if (typeof openCheckoutModal === 'function') {
      openCheckoutModal();
    } else {
      if (window.showToast) window.showToast('Checkout not available', 'error');
    }
  }

  /**
   * Prompt user to exit if list is empty
   */
  promptExitIfEmpty() {
    setTimeout(() => {
      if (this.shoppingList.length === 0 && this.isActive) {
        if (confirm('Your shopping list is empty! Ready to exit focus mode?')) {
          this.exit();
        }
      }
    }, 500);
  }

  /**
   * Subscribe to shopping list updates from main app.
   * Preserves local checked state when merging incoming data.
   */
  subscribeToUpdates() {
    this._updateHandler = (event) => {
      if (!this.isActive) return;

      // Preserve our local checked state before overwriting
      const localCheckedState = {};
      this.shoppingList.forEach(item => {
        if (item.checked) {
          const key = item.id || `${item.name}|${item.unit}`;
          localCheckedState[key] = true;
        }
      });

      // Update list from event
      this.shoppingList = event.detail || [];

      // Re-apply local checked state + localStorage state
      this._mergeLocalCheckedState();
      this.shoppingList.forEach(item => {
        const key = item.id || `${item.name}|${item.unit}`;
        if (localCheckedState[key]) {
          item.checked = true;
        }
      });

      this.render();

      if (window.showToast) {
        window.showToast('List synced', 'sync', 2000);
      }
    };

    window.addEventListener('shopping-list-updated', this._updateHandler);
    console.log('Focus mode: Listening for shopping list updates');
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribeFromUpdates() {
    if (this._updateHandler) {
      window.removeEventListener('shopping-list-updated', this._updateHandler);
      this._updateHandler = null;
    }
  }

  /**
   * Add keyboard shortcuts
   */
  addKeyboardShortcuts() {
    this.keyHandler = (e) => {
      // ESC to exit
      if (e.key === 'Escape') {
        // If modal is open, close it instead of exiting
        const modal = this.overlay?.querySelector('.focus-modal-overlay');
        if (modal) {
          this.closeEditModal();
        } else {
          this.exit();
        }
      }
    };

    document.addEventListener('keydown', this.keyHandler);
  }

  /**
   * Remove keyboard shortcuts
   */
  removeKeyboardShortcuts() {
    if (this.keyHandler) {
      document.removeEventListener('keydown', this.keyHandler);
      this.keyHandler = null;
    }
  }
}

// Create global instance
window.shoppingFocus = new ShoppingFocusMode();

// Expose enter function for easy access
window.enterShoppingFocusMode = () => window.shoppingFocus.enter();

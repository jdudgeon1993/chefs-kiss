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
 * - Live sync via main app's realtime events
 * - Clean, distraction-free interface
 */

class ShoppingFocusMode {
  constructor() {
    this.isActive = false;
    this.shoppingList = [];
    this.overlay = null;
    this._updateHandler = null;
  }

  /**
   * Enter focus mode
   */
  async enter() {
    if (this.isActive) return;

    this.isActive = true;

    // Load shopping list
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

    // Trigger app refresh
    if (window.loadShoppingList) {
      window.loadShoppingList();
    }
  }

  /**
   * Load shopping list from API
   */
  async loadShoppingList() {
    try {
      const data = await API.call('/shopping-list/');
      this.shoppingList = data.shopping_list || [];
    } catch (error) {
      console.error('Failed to load shopping list:', error);
      this.shoppingList = [];
    }
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
   * Group items by category, sorted A-Z within each category
   */
  groupByCategory(items) {
    const groups = {};

    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });

    // Sort items A-Z within each category
    Object.keys(groups).forEach(cat => {
      groups[cat].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Sort categories A-Z
    const sortedGroups = {};
    Object.keys(groups).sort().forEach(cat => {
      sortedGroups[cat] = groups[cat];
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

    const uncheckedByCategory = this.groupByCategory(unchecked);
    const checkedByCategory = this.groupByCategory(checked);

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
              ${Object.entries(uncheckedByCategory).map(([category, items]) => `
                <div class="focus-category">
                  <div class="focus-category-header">${this.getCategoryEmoji(category)} ${category}</div>
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
              ${Object.entries(checkedByCategory).map(([category, items]) => `
                <div class="focus-category">
                  <div class="focus-category-header">${this.getCategoryEmoji(category)} ${category}</div>
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
   * Render single shopping item
   */
  renderItem(item, isChecked) {
    const itemKey = item.id || `${item.name}|${item.unit}`;
    const safeKey = itemKey.replace(/'/g, "\\'");

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
        </div>
      </div>
    `;
  }

  /**
   * Toggle item checked status
   */
  async toggleItem(itemKey, checked) {
    try {
      // Find item
      const item = this.shoppingList.find(i =>
        (i.id && String(i.id) === String(itemKey)) ||
        `${i.name}|${i.unit}` === itemKey
      );

      if (!item) return;

      // Update backend if it's a manual item with ID
      if (item.id) {
        await API.call(`/shopping-list/items/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ checked })
        });
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

      if (window.showToast) window.showToast('Item added!', 'success', 2000);

    } catch (error) {
      console.error('Failed to add item:', error);
      if (window.showToast) window.showToast('Failed to add item', 'error');
    }
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
          <button class="focus-btn primary" onclick="window.shoppingFocus.saveEdit('${itemKey}')">Save</button>
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
        await API.call(`/shopping-list/items/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name, quantity, unit, category })
        });
      }

      // Update local state
      item.name = name;
      item.quantity = quantity;
      item.unit = unit;
      item.category = category;

      this.closeEditModal();
      this.render();

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
      await API.call('/shopping-list/clear-checked', { method: 'POST' });
      await this.loadShoppingList();
      this.render();

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
   * Checkout - add checked items to pantry
   */
  async checkout() {
    const checked = this.shoppingList.filter(item => item.checked);
    if (checked.length === 0) return;

    if (!confirm(`Add ${checked.length} item(s) to your pantry?`)) return;

    try {
      await API.call('/shopping-list/checkout', { method: 'POST' });
      await this.loadShoppingList();
      this.render();

      if (window.showToast) window.showToast(`${checked.length} items added to pantry!`, 'success');

      // If list is now empty, prompt to exit
      if (this.shoppingList.length === 0) {
        this.promptExitIfEmpty();
      }

    } catch (error) {
      console.error('Failed to checkout:', error);
      if (window.showToast) window.showToast('Failed to checkout', 'error');
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
   * Subscribe to shopping list updates from main app
   * The main app handles all realtime complexity - we just listen for its updates
   */
  subscribeToUpdates() {
    this._updateHandler = (event) => {
      console.log('🛒 Focus mode received shopping-list-updated event', event.detail?.length, 'items');

      if (!this.isActive) {
        console.log('  ↳ Ignored - focus mode not active');
        return;
      }

      // Update our local list from the event data
      this.shoppingList = event.detail || [];
      console.log('  ↳ Updating focus mode list and re-rendering');
      this.render();

      if (window.showToast) {
        window.showToast('List synced', 'sync', 2000);
      }
    };

    window.addEventListener('shopping-list-updated', this._updateHandler);
    console.log('Focus mode: Subscribed to shopping-list-updated events');
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

// Pantry Ledger Table - Extracted from index.html
(function() {
  let collapsedCategories = new Set();
  let categoryEmojiMap = {}; // Cache for category emojis

  // Load category emojis from household settings
  function loadCategoryEmojis() {
    const emojis = (window.householdSettings && window.householdSettings.category_emojis) || {};
    categoryEmojiMap = { ...emojis };
  }

  async function initPantryLedger() {
    // Wait for window.pantry to be available
    if (!window.pantry) {
      setTimeout(initPantryLedger, 500);
      return;
    }

    // Load category emojis
    await loadCategoryEmojis();

    renderPantryLedger();
    setupPantrySearch();
    setupPantryFilters();
  }

  function renderPantryLedger() {
    const ledgerDisplay = document.getElementById('pantry-ledger-display');
    if (!ledgerDisplay) return;

    const searchInput = document.getElementById('pantry-search-ledger');
    const filterSelect = document.getElementById('filter-category-ledger');
    const sortSelect = document.getElementById('sort-pantry-ledger');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = filterSelect ? filterSelect.value : '';
    const sortBy = sortSelect ? sortSelect.value : 'alpha';

    // Apply filters
    let filtered = window.pantry || [];

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
      );
    }

    // Sort
    if (sortBy === 'alpha') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'lowStock') {
      filtered.sort((a, b) => {
        const aRatio = a.min > 0 ? a.totalQty / a.min : 999;
        const bRatio = b.min > 0 ? b.totalQty / b.min : 999;
        return aRatio - bRatio;
      });
    } else if (sortBy === 'expiring') {
      filtered.sort((a, b) => {
        const aExpiry = getEarliestExpiry(a);
        const bExpiry = getEarliestExpiry(b);
        if (aExpiry === null && bExpiry === null) return 0;
        if (aExpiry === null) return 1;
        if (bExpiry === null) return -1;
        return aExpiry - bExpiry;
      });
    } else if (sortBy === 'recent') {
      filtered = [...filtered].reverse();
    }

    if (filtered.length === 0) {
      ledgerDisplay.innerHTML = '<p style="text-align: center; opacity: 0.6; padding: 2rem;">No items to display</p>';
      return;
    }

    // Group by category - dynamically get unique categories from filtered items
    const categoriesInUse = [...new Set(filtered.map(item => item.category))];
    const grouped = {};
    categoriesInUse.forEach(cat => grouped[cat] = []);
    filtered.forEach(item => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    // Calculate reserved quantities
    const reserved = window.calculateReservedIngredients ? window.calculateReservedIngredients() : {};

    // Build single unified ledger table
    ledgerDisplay.innerHTML = '';

    // Create table container
    const tableContainer = document.createElement('div');
    tableContainer.className = 'ledger-table-container unified-ledger';

    // Store items for event listeners
    let allItems = [];

    let tableHTML = `
      <table class="ledger-table unified-ledger-table">
        <thead>
          <tr>
            <th class="ledger-col-category">CATEGORY</th>
            <th class="ledger-col-item">ITEM</th>
            <th class="ledger-col-qty">OH</th>
            <th class="ledger-col-qty">RS</th>
            <th class="ledger-col-qty">AVAIL</th>
            <th class="ledger-col-qty">MIN</th>
            <th class="ledger-col-locations">LOCATIONS</th>
            <th class="ledger-col-expiry">EXPIRY</th>
            <th class="ledger-col-actions">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
    `;

    // Render each category with header row and items
    categoriesInUse.forEach((category, catIndex) => {
      const items = grouped[category];
      if (items.length === 0) return;

      const categoryEmoji = getCategoryEmoji(category);
      const totalOH = items.reduce((sum, item) => sum + item.totalQty, 0);
      const lowStockCount = items.filter(item => {
        const key = `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`;
        const reservedQty = reserved[key] || 0;
        const available = item.totalQty - reservedQty;
        return available < item.min;
      }).length;
      const expiringCount = items.filter(item => {
        const days = getEarliestExpiry(item);
        return days !== null && days <= 7;
      }).length;

      let alerts = [];
      if (expiringCount > 0) alerts.push(`${expiringCount} expiring`);
      if (lowStockCount > 0) alerts.push(`${lowStockCount} low stock`);
      const alertsText = alerts.length > 0 ? ` • ${alerts.join(', ')}` : '';

      // Category header row
      tableHTML += `
        <tr class="ledger-category-divider">
          <td colspan="9" class="ledger-category-header-cell">
            <strong>${categoryEmoji} ${category}</strong>
            <span class="ledger-category-meta">(${items.length} items • Total OH: ${totalOH.toFixed(1)}${alertsText})</span>
          </td>
        </tr>
      `;

      // Render items for this category
      items.forEach((item, itemIndex) => {
        const itemGlobalIndex = allItems.length;
        allItems.push(item);

        const key = `${item.name.toLowerCase()}|${item.unit.toLowerCase()}`;
        const reservedQty = reserved[key] || 0;
        const available = item.totalQty - reservedQty;
        const isLowStock = available < item.min;

        // Location display
        const locationsList = item.locations.map(loc =>
          `${loc.location}: ${loc.qty}`
        ).join(', ');

        // Expiry display
        const expiryDays = getEarliestExpiry(item);
        let expiryHTML = '-';
        if (expiryDays !== null) {
          const isExpiringSoon = expiryDays <= 7;
          const expiryClass = isExpiringSoon ? 'expiry-warning' : '';
          expiryHTML = `<span class="${expiryClass}">${expiryDays} days</span>`;
        }

        const rowClass = itemIndex % 2 === 0 ? 'ledger-row-even' : 'ledger-row-odd';
        const lowStockClass = isLowStock ? 'ledger-row-low-stock' : '';

        tableHTML += `
          <tr class="ledger-data-row ${rowClass} ${lowStockClass}" data-item-index="${itemGlobalIndex}">
            <td class="ledger-col-category">${categoryEmoji}</td>
            <td class="ledger-col-item"><strong>${item.name}</strong> <span class="item-unit">(${item.unit})</span></td>
            <td class="ledger-col-qty">${item.totalQty.toFixed(1)}</td>
            <td class="ledger-col-qty">${reservedQty.toFixed(1)}</td>
            <td class="ledger-col-qty ${isLowStock ? 'low-stock-value' : ''}">${available.toFixed(1)}</td>
            <td class="ledger-col-qty">${item.min}</td>
            <td class="ledger-col-locations">${locationsList}</td>
            <td class="ledger-col-expiry">${expiryHTML}</td>
            <td class="ledger-col-actions">
              <button class="btn-ledger-action btn-quick-use" data-item-index="${itemGlobalIndex}" title="Quick Use">🔻</button>
              <button class="btn-ledger-action btn-edit-item" data-item-index="${itemGlobalIndex}" title="Edit">✏️</button>
            </td>
          </tr>
        `;
      });
    });

    tableHTML += `
        </tbody>
      </table>
    `;

    tableContainer.innerHTML = tableHTML;
    ledgerDisplay.appendChild(tableContainer);

    // Add event listeners to rows and buttons
    const rows = ledgerDisplay.querySelectorAll('.ledger-data-row');
    rows.forEach(row => {
      const itemIndex = parseInt(row.getAttribute('data-item-index'));
      const item = allItems[itemIndex];

      // Click row to edit (unless clicking a button)
      row.addEventListener('click', (e) => {
        if (!e.target.closest('button')) {
          if (window.openIngredientModal) {
            window.openIngredientModal(item);
          }
        }
      });
    });

    // Add button event listeners
    const editButtons = ledgerDisplay.querySelectorAll('.btn-edit-item');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemIndex = parseInt(btn.getAttribute('data-item-index'));
        const item = allItems[itemIndex];
        if (window.openIngredientModal) {
          window.openIngredientModal(item);
        }
      });
    });

    const quickUseButtons = ledgerDisplay.querySelectorAll('.btn-quick-use');
    quickUseButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const itemIndex = parseInt(btn.getAttribute('data-item-index'));
        const item = allItems[itemIndex];
        if (window.openQuickDepleteModal) {
          window.openQuickDepleteModal(item);
        }
      });
    });
  }

  function getEarliestExpiry(item) {
    let soonest = null;
    item.locations.forEach(loc => {
      if (loc.expiry) {
        const days = getDaysUntilExpiry(loc.expiry);
        if (days !== null && (soonest === null || days < soonest)) {
          soonest = days;
        }
      }
    });
    return soonest;
  }

  function getDaysUntilExpiry(expiryStr) {
    if (!expiryStr) return null;
    const expiry = new Date(expiryStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  function getCategoryEmoji(category) {
    // Try to get emoji from cached map (includes custom categories)
    if (categoryEmojiMap[category]) {
      return categoryEmojiMap[category];
    }

    // Fallback to default emojis for standard categories
    const emojis = {
      'Meat': '🥩',
      'Dairy': '🧈',
      'Produce': '🥬',
      'Pantry': '🫙',
      'Frozen': '🧊',
      'Spices': '🌶️',
      'Beverages': '🥤',
      'Snacks': '🍿',
      'Grains': '🌾',
      'Baking': '🧁',
      'Canned Goods': '🥫',
      'Condiments': '🫗',
      'Seafood': '🐟',
      'Deli': '🥪',
      'Other': '📦'
    };
    return emojis[category] || '📦';
  }

  function setupPantrySearch() {
    const searchInput = document.getElementById('pantry-search-ledger');
    if (searchInput) {
      searchInput.addEventListener('input', renderPantryLedger);
    }
  }

  function setupPantryFilters() {
    const filterSelect = document.getElementById('filter-category-ledger');
    const sortSelect = document.getElementById('sort-pantry-ledger');

    if (filterSelect) {
      filterSelect.addEventListener('change', renderPantryLedger);
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', renderPantryLedger);
    }
  }

  // Watch for pantry changes using MutationObserver
  let _pantryRenderInProgress = false;

  function setupPantryObserver() {
    const pantryDisplay = document.getElementById('pantry-display');
    if (!pantryDisplay) {
      setTimeout(setupPantryObserver, 500);
      return;
    }

    const observer = new MutationObserver(() => {
      if (_pantryRenderInProgress) return;
      _pantryRenderInProgress = true;
      try {
        renderPantryLedger();
      } finally {
        Promise.resolve().then(() => { _pantryRenderInProgress = false; });
      }
    });

    observer.observe(pantryDisplay, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true
    });
  }

  // Expose function to reload category emojis (called when categories are added/removed)
  window.reloadCategoryEmojis = async function() {
    await loadCategoryEmojis();
    renderPantryLedger();
  };

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initPantryLedger();
      setupPantryObserver();
    });
  } else {
    initPantryLedger();
    setupPantryObserver();
  }
})();

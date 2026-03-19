// Pantry Ledger Table — Mobile-first with expandable detail rows
(function() {
  let collapsedCategories = new Set(); // categories currently collapsed
  let _seenCategories = new Set();     // categories ever rendered; new ones start collapsed
  let expandedRowIndex = null; // Track which row's detail panel is open
  let categoryEmojiMap = {};

  // Local reference to normalizeKey (defined in utils.js).
  function _normalizeKey(name, unit) {
    if (typeof window.normalizeKey === 'function') return window.normalizeKey(name, unit);
    return `${(name || '').trim().toLowerCase()}|${(unit || '').trim().toLowerCase()}`;
  }

  function loadCategoryEmojis() {
    const emojis = (window.householdSettings && window.householdSettings.category_emojis) || {};
    categoryEmojiMap = { ...emojis };
  }

  async function initPantryLedger() {
    if (!window.pantry) {
      setTimeout(initPantryLedger, 500);
      return;
    }
    await loadCategoryEmojis();
    renderPantryLedger();
    setupPantrySearch();
    setupPantryFilters();
  }

  // Detect desktop (columns visible) vs mobile (detail panel needed)
  function isDesktop() {
    return window.matchMedia('(min-width: 900px)').matches;
  }

  function syncCategoryFilter() {
    const filterSelect = document.getElementById('filter-category-ledger');
    if (!filterSelect) return;

    const pantry = window.pantry || [];
    const categories = [...new Set(pantry.map(i => i.category).filter(Boolean))].sort();
    const current = filterSelect.value;

    // Rebuild options, preserving selection
    filterSelect.innerHTML = '<option value="">All categories</option>';
    categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      if (cat === current) opt.selected = true;
      filterSelect.appendChild(opt);
    });

    // If previously-selected category no longer exists, reset to "all"
    if (current && !categories.includes(current)) {
      filterSelect.value = '';
    }
  }

  function renderPantryLedger() {
    const ledgerDisplay = document.getElementById('pantry-ledger-display');
    if (!ledgerDisplay) return;

    syncCategoryFilter();

    const searchInput = document.getElementById('pantry-search-ledger');
    const filterSelect = document.getElementById('filter-category-ledger');
    const sortSelect = document.getElementById('sort-pantry-ledger');

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const selectedCategory = filterSelect ? filterSelect.value : '';
    const sortBy = sortSelect ? sortSelect.value : 'alpha';

    // Filter
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
        const aExp = getEarliestExpiry(a);
        const bExp = getEarliestExpiry(b);
        if (aExp === null && bExp === null) return 0;
        if (aExp === null) return 1;
        if (bExp === null) return -1;
        return aExp - bExp;
      });
    } else if (sortBy === 'recent') {
      filtered = [...filtered].reverse();
    }

    if (filtered.length === 0) {
      ledgerDisplay.innerHTML = '<p class="pantry-empty-state">No items to display</p>';
      return;
    }

    // Group by category
    const categoriesInUse = [...new Set(filtered.map(item => item.category))];
    const grouped = {};
    categoriesInUse.forEach(cat => grouped[cat] = []);
    filtered.forEach(item => {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    });

    const reserved = window.reservedIngredients || {};
    const esc = typeof escapeHTML === 'function' ? escapeHTML : (s) => String(s);

    ledgerDisplay.innerHTML = '';

    const tableContainer = document.createElement('div');
    tableContainer.className = 'ledger-table-container unified-ledger';

    let allItems = [];

    const totalCols = 9; // Always span all columns (hidden ones collapse via CSS)

    let tableHTML = `
      <table class="unified-ledger-table">
        <thead>
          <tr>
            <th class="ledger-col-emoji"></th>
            <th class="ledger-col-item">Item</th>
            <th class="ledger-col-oh">OH</th>
            <th class="ledger-col-re">RE</th>
            <th class="ledger-col-av">AV</th>
            <th class="ledger-col-min">Min</th>
            <th class="ledger-col-locations">Locations</th>
            <th class="ledger-col-expiry">Expiry</th>
            <th class="ledger-col-actions"></th>
          </tr>
        </thead>
        <tbody>
    `;

    categoriesInUse.forEach(category => {
      const items = grouped[category];
      if (items.length === 0) return;

      // Auto-collapse categories that appear for the first time
      if (!_seenCategories.has(category)) {
        _seenCategories.add(category);
        collapsedCategories.add(category);
      }

      const isCollapsed = collapsedCategories.has(category);
      const chevron = isCollapsed ? '▸' : '▾';
      const categoryEmoji = getCategoryEmoji(category);

      // Category summary stats
      const totalOH = items.reduce((sum, item) => sum + item.totalQty, 0);
      const totalAV = items.reduce((sum, item) => {
        const key = _normalizeKey(item.name, item.unit);
        return sum + Math.max(0, item.totalQty - (reserved[key] || 0));
      }, 0);

      tableHTML += `
        <tr class="ledger-category-divider" data-category-header="${esc(category)}">
          <td colspan="${totalCols}" class="ledger-category-header-cell">
            <span class="category-chevron">${chevron}</span>
            <strong>${categoryEmoji} ${esc(category)}</strong>
            <span class="ledger-category-meta">${items.length} items &bull; OH ${totalOH.toFixed(1)} &bull; AV ${totalAV.toFixed(1)}</span>
          </td>
        </tr>
      `;

      const hiddenAttr = isCollapsed ? 'style="display:none"' : '';

      items.forEach((item, itemIndex) => {
        const idx = allItems.length;
        allItems.push(item);

        const key = _normalizeKey(item.name, item.unit);
        const reservedQty = reserved[key] || 0;
        const available = item.totalQty - reservedQty;
        const isLowStock = available < item.min;
        const rowClass = itemIndex % 2 === 0 ? 'ledger-row-even' : 'ledger-row-odd';
        const lowStockClass = isLowStock ? 'ledger-row-low-stock' : '';

        // Location display (for desktop column)
        const locationsList = item.locations.map(loc =>
          `${esc(loc.location)}: ${loc.qty}`
        ).join(', ');

        // Expiry display
        const expiryDays = getEarliestExpiry(item);
        let expiryHTML = '-';
        if (expiryDays !== null) {
          const cls = expiryDays <= 3 ? 'expiry-critical' : expiryDays <= 7 ? 'expiry-warning' : '';
          expiryHTML = `<span class="${cls}">${expiryDays}d</span>`;
        }

        // Data row — 5 mobile columns + 4 desktop-only columns
        tableHTML += `
          <tr class="ledger-data-row ${rowClass} ${lowStockClass}" data-item-index="${idx}" data-category-row="${esc(category)}" ${hiddenAttr}>
            <td class="ledger-col-emoji">${categoryEmoji}</td>
            <td class="ledger-col-item">${esc(item.name)} <span class="item-unit">(${esc(item.unit)})</span></td>
            <td class="ledger-col-oh">${item.totalQty.toFixed(1)}</td>
            <td class="ledger-col-re">${reservedQty.toFixed(1)}</td>
            <td class="ledger-col-av ${isLowStock ? 'low-stock-value' : ''}">${available.toFixed(1)}</td>
            <td class="ledger-col-min">${item.min}</td>
            <td class="ledger-col-locations">${locationsList || '-'}</td>
            <td class="ledger-col-expiry">${expiryHTML}</td>
            <td class="ledger-col-actions">
              <button class="btn-ledger-action btn-quick-use" data-item-index="${idx}" title="Quick Use">🔻</button>
              <button class="btn-ledger-action btn-edit-item" data-item-index="${idx}" title="Edit">✏️</button>
            </td>
          </tr>
        `;

        // Expandable detail row (mobile only — hidden via CSS on desktop)
        // Hidden if either the category is collapsed or the row isn't expanded
        const isExpanded = !isCollapsed && expandedRowIndex === idx;
        tableHTML += `
          <tr class="ledger-detail-row" data-detail-for="${idx}" data-category-row="${esc(category)}" ${isExpanded ? '' : 'style="display:none"'}>
            <td colspan="${totalCols}">
              <div class="ledger-detail-panel">
                <div class="detail-chip">
                  <span class="detail-chip-label">Min</span>
                  <span class="detail-chip-value">${item.min}</span>
                </div>
                <div class="detail-chip">
                  <span class="detail-chip-label">Locations</span>
                  <span class="detail-chip-value">${locationsList || 'None'}</span>
                </div>
                <div class="detail-chip">
                  <span class="detail-chip-label">Expiry</span>
                  <span class="detail-chip-value">${expiryDays !== null ? expiryDays + ' days' : 'N/A'}</span>
                </div>
                <div class="detail-actions">
                  <button class="btn-ledger-action btn-quick-use" data-item-index="${idx}" title="Quick Use">🔻</button>
                  <button class="btn-ledger-action btn-edit-item" data-item-index="${idx}" title="Edit">✏️</button>
                </div>
              </div>
            </td>
          </tr>
        `;
      });
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
    ledgerDisplay.appendChild(tableContainer);

    // --- Event listeners ---
    wireEventListeners(ledgerDisplay, allItems);
  }

  function toggleCategory(container, category) {
    const nowCollapsed = !collapsedCategories.has(category);
    if (nowCollapsed) {
      collapsedCategories.add(category);
      // Also close any expanded detail row within this category
    } else {
      collapsedCategories.delete(category);
    }

    // Toggle all data and detail rows belonging to this category
    container.querySelectorAll(`[data-category-row]`).forEach(row => {
      if (row.getAttribute('data-category-row') !== category) return;
      if (nowCollapsed) {
        row.style.display = 'none';
      } else if (!row.classList.contains('ledger-detail-row')) {
        // Only show data rows; detail rows stay hidden until tapped
        row.style.display = '';
      }
    });

    // Update chevron
    const headerRow = container.querySelector(`[data-category-header="${CSS.escape(category)}"]`);
    if (headerRow) {
      const chevron = headerRow.querySelector('.category-chevron');
      if (chevron) chevron.textContent = nowCollapsed ? '▸' : '▾';
    }
  }

  function wireEventListeners(container, allItems) {
    // Category header click — collapse / expand
    container.querySelectorAll('.ledger-category-divider').forEach(headerRow => {
      headerRow.addEventListener('click', () => {
        const category = headerRow.getAttribute('data-category-header');
        if (category) toggleCategory(container, category);
      });
    });

    // Row tap: on mobile toggle detail panel, on desktop open modal
    container.querySelectorAll('.ledger-data-row').forEach(row => {
      const idx = parseInt(row.getAttribute('data-item-index'));
      const item = allItems[idx];

      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;

        if (isDesktop()) {
          if (window.openIngredientModal) window.openIngredientModal(item);
        } else {
          toggleDetailPanel(container, idx);
        }
      });
    });

    // Edit buttons
    container.querySelectorAll('.btn-edit-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-item-index'));
        if (window.openIngredientModal) window.openIngredientModal(allItems[idx]);
      });
    });

    // Quick-use buttons
    container.querySelectorAll('.btn-quick-use').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-item-index'));
        if (window.openQuickDepleteModal) window.openQuickDepleteModal(allItems[idx]);
      });
    });
  }

  function toggleDetailPanel(container, idx) {
    const detailRow = container.querySelector(`.ledger-detail-row[data-detail-for="${idx}"]`);
    if (!detailRow) return;

    // Close previously expanded row
    if (expandedRowIndex !== null && expandedRowIndex !== idx) {
      const prev = container.querySelector(`.ledger-detail-row[data-detail-for="${expandedRowIndex}"]`);
      if (prev) prev.style.display = 'none';
    }

    if (detailRow.style.display === 'none') {
      detailRow.style.display = '';
      expandedRowIndex = idx;
    } else {
      detailRow.style.display = 'none';
      expandedRowIndex = null;
    }
  }

  // --- Utility helpers ---

  function getEarliestExpiry(item) {
    let soonest = null;
    item.locations.forEach(loc => {
      if (loc.expiry) {
        const days = getDaysUntilExpiry(loc.expiry);
        if (days !== null && (soonest === null || days < soonest)) soonest = days;
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
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  }

  function getCategoryEmoji(category) {
    if (categoryEmojiMap[category]) return categoryEmojiMap[category];
    const emojis = {
      'Meat': '🥩', 'Dairy': '🧈', 'Produce': '🥬', 'Pantry': '🫙',
      'Frozen': '🧊', 'Spices': '🌶️', 'Beverages': '🥤', 'Snacks': '🍿',
      'Grains': '🌾', 'Baking': '🧁', 'Canned Goods': '🥫', 'Condiments': '🫗',
      'Seafood': '🐟', 'Deli': '🥪', 'Other': '📦'
    };
    return emojis[category] || '📦';
  }

  // --- Search & filter setup ---

  function setupPantrySearch() {
    const input = document.getElementById('pantry-search-ledger');
    if (!input) return;
    let debounceTimer;
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(renderPantryLedger, 200);
    });
  }

  function setupPantryFilters() {
    const filter = document.getElementById('filter-category-ledger');
    const sort = document.getElementById('sort-pantry-ledger');
    if (filter) filter.addEventListener('change', renderPantryLedger);
    if (sort) sort.addEventListener('change', renderPantryLedger);
  }

  // --- Data watcher for pantry changes (replaces fragile MutationObserver) ---
  function setupPantryDataWatcher() {
    let lastPantryRef = window.pantry;
    const interval = setInterval(() => {
      if (window.pantry && window.pantry !== lastPantryRef) {
        lastPantryRef = window.pantry;
        renderPantryLedger();
      }
    }, 1000);
    window.addEventListener('pagehide', () => clearInterval(interval));
  }

  // Expose for app.js
  window.renderPantryLedger = renderPantryLedger;

  window.reloadCategoryEmojis = async function() {
    await loadCategoryEmojis();
    renderPantryLedger();
  };

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initPantryLedger(); setupPantryDataWatcher(); });
  } else {
    initPantryLedger();
    setupPantryDataWatcher();
  }
})();

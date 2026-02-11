/* ============================================================================
   SETTINGS, ACCOUNT, UNITS, BULK ENTRY — Extracted from app.js (Phase 3.2)
   ============================================================================ */

/* ── Saved Locations & Categories ── */

const DEFAULT_LOCATIONS = ['Pantry', 'Refrigerator', 'Freezer', 'Cabinet', 'Counter'];
const DEFAULT_CATEGORIES = ['Meat', 'Dairy', 'Produce', 'Pantry', 'Frozen', 'Spices', 'Beverages', 'Snacks', 'Other'];

// Global settings cache (loaded from API)
window.householdSettings = {
  locations: DEFAULT_LOCATIONS,
  categories: DEFAULT_CATEGORIES,
  category_emojis: {}
};

async function loadSettings() {
  // Use cached settings immediately if available (avoids API call on page switch)
  const cached = sessionStorage.getItem('ck-settings');
  if (cached) {
    try {
      window.householdSettings = JSON.parse(cached);
      console.log('Settings loaded from cache');
      return;
    } catch (e) { /* fall through to API */ }
  }

  try {
    const response = await API.call('/settings/');
    window.householdSettings = {
      locations: response.locations || DEFAULT_LOCATIONS,
      categories: response.categories || DEFAULT_CATEGORIES,
      category_emojis: response.category_emojis || {}
    };
    sessionStorage.setItem('ck-settings', JSON.stringify(window.householdSettings));
    console.log('Settings loaded from API:', window.householdSettings);
  } catch (error) {
    console.warn('Failed to load settings from API, using defaults:', error);
  }
}

function applyDisplayMode() {
  const isCompact = localStorage.getItem('display_mode') === 'compact';
  document.body.classList.toggle('compact', isCompact);
}

function toggleDisplayMode() {
  const isCurrentlyCompact = document.body.classList.contains('compact');
  const newMode = isCurrentlyCompact ? 'comfortable' : 'compact';
  localStorage.setItem('display_mode', newMode);
  document.body.classList.toggle('compact', newMode === 'compact');
  return newMode;
}

function getDisplayMode() {
  return localStorage.getItem('display_mode') || 'comfortable';
}

function getSavedLocations() {
  return window.householdSettings.locations || DEFAULT_LOCATIONS;
}

function setSavedLocations(locations) {
  window.householdSettings.locations = locations;
}

function getSavedCategories() {
  return window.householdSettings.categories || DEFAULT_CATEGORIES;
}

function setSavedCategories(categories) {
  window.householdSettings.categories = categories;
}

/* ── Units ── */

window.cachedUnits = [];

async function loadUnits() {
  const cached = sessionStorage.getItem('ck-units');
  if (cached) {
    try {
      window.cachedUnits = JSON.parse(cached);
      console.log('Units loaded from cache:', window.cachedUnits.length);
      return;
    } catch (e) { /* fall through to API */ }
  }

  try {
    const response = await API.getUnits();
    window.cachedUnits = response.units || [];
    sessionStorage.setItem('ck-units', JSON.stringify(window.cachedUnits));
    console.log('Units loaded:', window.cachedUnits.length);
  } catch (error) {
    console.warn('Failed to load units, using defaults:', error);
    window.cachedUnits = ['each', 'lb', 'oz', 'cup', 'tbsp', 'tsp', 'gallon', 'g', 'kg', 'ml', 'bunch', 'can', 'bottle', 'bag', 'box'];
  }
}

function createUnitDatalist() {
  const existing = document.getElementById('unit-suggestions');
  if (existing) existing.remove();

  const datalist = document.createElement('datalist');
  datalist.id = 'unit-suggestions';
  datalist.innerHTML = window.cachedUnits.map(u => `<option value="${u}">`).join('');
  document.body.appendChild(datalist);
}

/* ── Bulk Pantry Entry ── */

function initBulkEntry() {
  const tbody = document.getElementById('bulk-entry-tbody-live');
  if (!tbody) return;
  if (tbody.children.length === 0) {
    addBulkRows(5);
  }
  updateBulkEntryCount();
}

function addBulkRows(count) {
  const tbody = document.getElementById('bulk-entry-tbody-live');
  if (!tbody) return;

  const locations = (window.householdSettings?.locations || ['Pantry', 'Refrigerator', 'Freezer', 'Cabinet', 'Counter']);
  const categories = (window.householdSettings?.categories || ['Meat', 'Dairy', 'Produce', 'Pantry', 'Frozen', 'Spices', 'Beverages', 'Snacks', 'Other']);

  const locOptions = locations.map(l => `<option value="${l}">${l}</option>`).join('');
  const catOptions = categories.map(c => `<option value="${c}">${c}</option>`).join('');

  for (let i = 0; i < count; i++) {
    const row = document.createElement('tr');
    row.className = 'bulk-entry-row';
    row.innerHTML = `
      <td><input type="text" class="bulk-name form-control" placeholder="Item name" /></td>
      <td><input type="number" class="bulk-qty form-control" placeholder="Qty" min="0" step="0.5" /></td>
      <td><input type="text" class="bulk-unit form-control" placeholder="unit" list="unit-suggestions" /></td>
      <td><select class="bulk-category form-control">${catOptions}</select></td>
      <td><select class="bulk-location form-control">${locOptions}</select></td>
      <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove();updateBulkEntryCount();">&times;</button></td>
    `;
    tbody.appendChild(row);
  }
  updateBulkEntryCount();
}

function clearBulkEntry() {
  const tbody = document.getElementById('bulk-entry-tbody-live');
  if (!tbody) return;
  tbody.innerHTML = '';
  addBulkRows(5);
}

function updateBulkEntryCount() {
  const countEl = document.getElementById('onboarding-item-count');
  if (!countEl) return;
  const rows = document.querySelectorAll('#bulk-entry-tbody-live .bulk-entry-row');
  let filled = 0;
  rows.forEach(row => {
    const name = row.querySelector('.bulk-name');
    if (name && name.value.trim()) filled++;
  });
  countEl.textContent = `${filled} items entered`;
}

async function saveBulkEntry() {
  const tbody = document.getElementById('bulk-entry-tbody-live');
  const btnText = document.getElementById('btn-save-text');
  if (!tbody) return;

  const rows = tbody.querySelectorAll('.bulk-entry-row');
  const items = [];

  rows.forEach(row => {
    const name = row.querySelector('.bulk-name')?.value.trim();
    if (!name) return;
    const qty = parseFloat(row.querySelector('.bulk-qty')?.value) || 0;
    const unit = row.querySelector('.bulk-unit')?.value.trim() || 'unit';
    const category = row.querySelector('.bulk-category')?.value || 'Other';
    const location = row.querySelector('.bulk-location')?.value || 'Pantry';

    items.push({ name, quantity: qty, unit, category, location });
  });

  if (items.length === 0) {
    showError('No items to save. Enter at least one item name.');
    return;
  }

  if (btnText) btnText.textContent = 'Saving...';

  let savedCount = 0;
  let errorCount = 0;

  for (const item of items) {
    try {
      await API.call('/pantry/', {
        method: 'POST',
        body: JSON.stringify({
          name: item.name,
          category: item.category,
          unit: item.unit,
          min_threshold: 0,
          locations: [{
            location: item.location,
            quantity: item.quantity
          }]
        })
      });
      savedCount++;
    } catch (e) {
      console.error(`Failed to save ${item.name}:`, e);
      errorCount++;
    }
  }

  if (btnText) btnText.textContent = 'Save & Add All Items';

  if (errorCount > 0) {
    showError(`Saved ${savedCount} items. ${errorCount} failed.`);
  } else {
    showSuccess(`${savedCount} items added to pantry!`);
    clearBulkEntry();
    loadPantry();
  }
}

/* ── Account & Household Management Modal ── */

async function openAccountModal() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content account-modal">
        <h2>Loading...</h2>
      </div>
    </div>
  `;

  let userInfo = null;
  let households = [];
  try {
    [userInfo, households] = await Promise.all([
      API.getCurrentUser().catch(() => null),
      API.getMyHouseholds().then(r => r.households).catch(() => [])
    ]);
  } catch (e) {
    console.error('Failed to load account info:', e);
  }

  const email = userInfo?.user?.email || 'Not available';
  const activeHid = API.getActiveHouseholdId() || userInfo?.household_id;
  const activeHousehold = households.find(h => h.id === activeHid);

  const householdOptions = households.map(h => {
    const isActive = h.id === activeHid;
    const label = `${h.name} (${h.role})`;
    return `<option value="${h.id}" ${isActive ? 'selected' : ''}>${label}</option>`;
  }).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content account-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">&times;</button>
        <h2>Account & Household</h2>

        <div class="account-section">
          <h3>Your Account</h3>
          <div class="account-info">
            <p><strong>Email:</strong> ${email}</p>
          </div>
        </div>

        ${households.length > 1 ? `
        <div class="account-section">
          <h3>Switch Household</h3>
          <select id="household-switcher" class="form-control" onchange="switchHousehold(this.value)">
            ${householdOptions}
          </select>
        </div>
        ` : `
        <div class="account-section">
          <h3>Household</h3>
          <p>${activeHousehold?.name || 'Your Household'} <span class="status-badge status-connected">${activeHousehold?.role || 'owner'}</span></p>
        </div>
        `}

        <div class="account-section">
          <h3>Members</h3>
          <div id="members-list"><p>Loading members...</p></div>
        </div>

        <div class="account-section">
          <h3>Invite a Member</h3>
          <p class="help-text">Generate a code to share with someone. They enter it here to join your household.</p>
          <div id="invite-section">
            <button class="btn btn-secondary" onclick="generateInviteCode()">Generate Invite Code</button>
          </div>
        </div>

        <div class="account-section">
          <h3>Join a Household</h3>
          <p class="help-text">Enter an invite code from someone to join their household.</p>
          <div style="display:flex;gap:8px;">
            <input type="text" id="accept-invite-input" class="form-control" placeholder="Enter invite code" style="flex:1;text-transform:uppercase;" maxlength="8" />
            <button class="btn btn-primary" onclick="acceptInviteCode()">Join</button>
          </div>
          <div id="accept-invite-status"></div>
        </div>

        <div class="account-section">
          <div class="data-actions" style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="exportData()">Export Data</button>
            <button class="btn btn-danger" onclick="handleLogout()">Sign Out</button>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-primary" onclick="closeModal()">Done</button>
        </div>
      </div>
    </div>
  `;

  loadMembersList();
  loadActiveInvite();
}

async function loadMembersList() {
  const container = document.getElementById('members-list');
  if (!container) return;

  try {
    const data = await API.getHouseholdMembers();
    if (!data.members || data.members.length === 0) {
      container.innerHTML = '<p>No members found.</p>';
      return;
    }

    container.innerHTML = data.members.map(m => {
      const roleClass = m.role === 'owner' ? 'status-connected' : 'status-badge';
      const youLabel = m.is_you ? ' (You)' : '';
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border-color, #333);">
        <span>Member${youLabel}</span>
        <span class="status-badge ${roleClass}">${m.role}</span>
      </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<p>Failed to load members.</p>';
  }
}

async function loadActiveInvite() {
  const container = document.getElementById('invite-section');
  if (!container) return;

  try {
    const data = await API.getActiveInvite();
    if (data.invite) {
      const expiresAt = new Date(data.invite.expires_at);
      const hoursLeft = Math.max(0, Math.round((expiresAt - Date.now()) / 3600000));
      container.innerHTML = `
        <div style="padding:12px;background:var(--card-bg, #1a1a2e);border-radius:8px;text-align:center;">
          <p style="margin:0 0 8px;opacity:0.7;">Active invite code:</p>
          <p style="font-size:1.5rem;font-weight:bold;letter-spacing:4px;margin:0 0 8px;">${data.invite.code}</p>
          <p style="margin:0;opacity:0.5;font-size:0.85rem;">Expires in ${hoursLeft}h</p>
          <button class="btn btn-secondary" style="margin-top:8px;" onclick="copyInviteCode('${data.invite.code}')">Copy Code</button>
        </div>
        <button class="btn btn-secondary" style="margin-top:8px;" onclick="generateInviteCode()">Generate New Code</button>
      `;
    }
  } catch (e) {
    // No active invite, keep the generate button
  }
}

async function generateInviteCode() {
  const container = document.getElementById('invite-section');
  if (!container) return;

  container.innerHTML = '<p>Generating...</p>';

  try {
    const data = await API.createInvite(48);
    container.innerHTML = `
      <div style="padding:12px;background:var(--card-bg, #1a1a2e);border-radius:8px;text-align:center;">
        <p style="margin:0 0 8px;opacity:0.7;">Share this code:</p>
        <p style="font-size:1.5rem;font-weight:bold;letter-spacing:4px;margin:0 0 8px;">${data.code}</p>
        <p style="margin:0;opacity:0.5;font-size:0.85rem;">Expires in ${data.expires_hours}h</p>
        <button class="btn btn-secondary" style="margin-top:8px;" onclick="copyInviteCode('${data.code}')">Copy Code</button>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `<p style="color:var(--danger-color,red);">Failed to generate code: ${e.message}</p>
      <button class="btn btn-secondary" onclick="generateInviteCode()">Try Again</button>`;
  }
}

function copyInviteCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showSuccess('Invite code copied!');
  }).catch(() => {
    prompt('Copy this invite code:', code);
  });
}

async function acceptInviteCode() {
  const input = document.getElementById('accept-invite-input');
  const statusEl = document.getElementById('accept-invite-status');
  if (!input || !statusEl) return;

  const code = input.value.trim();
  if (!code) {
    statusEl.innerHTML = '<p style="color:var(--danger-color,red);">Please enter a code.</p>';
    return;
  }

  statusEl.innerHTML = '<p>Joining...</p>';

  try {
    const data = await API.acceptInvite(code);
    statusEl.innerHTML = `<p style="color:var(--success-color,#4ade80);">${data.message}</p>`;
    input.value = '';

    API.setActiveHouseholdId(data.household_id);

    setTimeout(() => openAccountModal(), 1500);
    setTimeout(() => window.location.reload(), 2000);
  } catch (e) {
    statusEl.innerHTML = `<p style="color:var(--danger-color,red);">${e.message}</p>`;
  }
}

async function switchHousehold(householdId) {
  API.setActiveHouseholdId(householdId);
  showSuccess('Switching household...');
  setTimeout(() => window.location.reload(), 500);
}

function exportData() {
  const data = {
    pantry: window.pantry || [],
    recipes: window.recipes || [],
    planner: window.planner || {},
    exportDate: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chefs-kiss-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showSuccess('Data exported!');
}

async function handleLogout() {
  if (!confirm('Are you sure you want to sign out?')) return;

  try {
    cleanupRealtime();
    // Clear session cache so next login gets fresh data
    sessionStorage.clear();
    await API.signOut();
    // Navigate to landing page (multi-page architecture)
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/index.html';
  } catch (error) {
    console.error('Logout error:', error);
    showError('Failed to sign out');
  }
}

/* ── Settings Modal ── */

function openSettingsModal() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  const locations = getSavedLocations();
  const categories = getSavedCategories();

  const locationsHTML = locations.map((loc, idx) => `
    <div class="setting-item" data-idx="${idx}">
      <input type="text" value="${loc}" class="location-input">
      <button type="button" class="btn-icon btn-remove" onclick="removeLocation(${idx})">×</button>
    </div>
  `).join('');

  const emojis = (window.householdSettings && window.householdSettings.category_emojis) || {};
  const categoriesHTML = categories.map((cat, idx) => `
    <div class="setting-item" data-idx="${idx}">
      <button type="button" class="btn-emoji-pick" data-idx="${idx}" onclick="openEmojiPicker(this)" title="Pick icon">${emojis[cat] || getCategoryDefaultEmoji(cat)}</button>
      <input type="text" value="${cat}" class="category-input">
      <button type="button" class="btn-icon btn-remove" onclick="removeCategory(${idx})">×</button>
    </div>
  `).join('');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content settings-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">×</button>
        <h2>⚙️ Settings</h2>

        <div class="settings-section">
          <h3>Storage Locations</h3>
          <p class="help-text">Customize where you store items in your kitchen.</p>
          <div id="locations-list" class="settings-list">
            ${locationsHTML}
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="addLocation()">+ Add Location</button>
        </div>

        <div class="settings-section">
          <h3>Item Categories</h3>
          <p class="help-text">Organize your pantry and shopping list by category.</p>
          <div id="categories-list" class="settings-list">
            ${categoriesHTML}
          </div>
          <button type="button" class="btn btn-sm btn-secondary" onclick="addCategory()">+ Add Category</button>
        </div>

        <div class="settings-section">
          <h3>Expiration Alerts</h3>
          <div class="form-group">
            <label>Alert me about items expiring within:</label>
            <select id="setting-expiration-days">
              <option value="1" ${localStorage.getItem('expirationDays') === '1' ? 'selected' : ''}>1 day</option>
              <option value="3" ${localStorage.getItem('expirationDays') === '3' || !localStorage.getItem('expirationDays') ? 'selected' : ''}>3 days</option>
              <option value="5" ${localStorage.getItem('expirationDays') === '5' ? 'selected' : ''}>5 days</option>
              <option value="7" ${localStorage.getItem('expirationDays') === '7' ? 'selected' : ''}>7 days</option>
            </select>
          </div>
        </div>

        <div class="settings-section">
          <h3>Display</h3>
          <div class="form-group" style="display:flex;align-items:center;gap:1rem;">
            <label style="margin:0;">Layout density:</label>
            <button type="button" class="btn btn-sm ${getDisplayMode() === 'compact' ? 'btn-primary' : 'btn-secondary'}"
                    onclick="this.textContent = toggleDisplayMode() === 'compact' ? 'Compact' : 'Comfortable'; this.classList.toggle('btn-primary'); this.classList.toggle('btn-secondary');">
              ${getDisplayMode() === 'compact' ? 'Compact' : 'Comfortable'}
            </button>
          </div>
          <p class="help-text">Compact mode shows more content with less spacing.</p>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="resetSettingsToDefaults()">Reset to Defaults</button>
          <button type="button" class="btn btn-primary" onclick="saveSettings()">Save Settings</button>
        </div>
      </div>
    </div>
  `;
}

function addLocation() {
  const list = document.getElementById('locations-list');
  if (!list) return;
  const idx = list.children.length;
  const div = document.createElement('div');
  div.className = 'setting-item';
  div.dataset.idx = idx;
  div.innerHTML = `
    <input type="text" value="" class="location-input" placeholder="New location">
    <button type="button" class="btn-icon btn-remove" onclick="removeLocation(${idx})">×</button>
  `;
  list.appendChild(div);
  div.querySelector('input').focus();
}

function removeLocation(idx) {
  const list = document.getElementById('locations-list');
  if (!list) return;
  const item = list.querySelector(`[data-idx="${idx}"]`);
  if (item) item.remove();
}

const FOOD_EMOJI_OPTIONS = [
  '🥩','🧈','🥬','🫙','🧊','🌶️','🥤','🍿','🌾','🧁','🥫','🫗','🐟','🥪',
  '🍎','🥕','🥚','🍞','🧀','🍗','🥦','🌽','🍋','🫒','🍯','🥜','🍝','🍚',
  '🫘','🥥','🍫','🧃','🍵','☕','🧂','🫧','🛒','📦'
];

function getCategoryDefaultEmoji(category) {
  const defaults = {
    'Meat': '🥩', 'Dairy': '🧈', 'Produce': '🥬', 'Pantry': '🫙',
    'Frozen': '🧊', 'Spices': '🌶️', 'Beverages': '🥤', 'Snacks': '🍿',
    'Grains': '🌾', 'Baking': '🧁', 'Canned Goods': '🥫', 'Condiments': '🫗',
    'Seafood': '🐟', 'Deli': '🥪', 'Other': '📦'
  };
  return defaults[category] || '📦';
}

function openEmojiPicker(btn) {
  document.querySelectorAll('.emoji-picker-dropdown').forEach(el => el.remove());

  const picker = document.createElement('div');
  picker.className = 'emoji-picker-dropdown';
  picker.innerHTML = FOOD_EMOJI_OPTIONS.map(e =>
    `<button type="button" class="emoji-option" onclick="selectEmoji(this, '${e}')">${e}</button>`
  ).join('');
  btn.style.position = 'relative';
  btn.parentElement.style.position = 'relative';
  btn.parentElement.appendChild(picker);

  setTimeout(() => {
    document.addEventListener('click', function closePicker(e) {
      if (!picker.contains(e.target) && e.target !== btn) {
        picker.remove();
        document.removeEventListener('click', closePicker);
      }
    });
  }, 0);
}

function selectEmoji(optionBtn, emoji) {
  const settingItem = optionBtn.closest('.setting-item');
  const emojiBtn = settingItem.querySelector('.btn-emoji-pick');
  emojiBtn.textContent = emoji;
  settingItem.querySelector('.emoji-picker-dropdown').remove();
}

function addCategory() {
  const list = document.getElementById('categories-list');
  if (!list) return;
  const idx = list.children.length;
  const div = document.createElement('div');
  div.className = 'setting-item';
  div.dataset.idx = idx;
  div.innerHTML = `
    <button type="button" class="btn-emoji-pick" data-idx="${idx}" onclick="openEmojiPicker(this)" title="Pick icon">📦</button>
    <input type="text" value="" class="category-input" placeholder="New category">
    <button type="button" class="btn-icon btn-remove" onclick="removeCategory(${idx})">×</button>
  `;
  list.appendChild(div);
  div.querySelector('input').focus();
}

function removeCategory(idx) {
  const list = document.getElementById('categories-list');
  if (!list) return;
  const item = list.querySelector(`[data-idx="${idx}"]`);
  if (item) item.remove();
}

async function resetSettingsToDefaults() {
  if (!confirm('Reset all settings to defaults?')) return;

  try {
    showLoading();

    await API.call('/settings/', {
      method: 'PUT',
      body: JSON.stringify({
        locations: DEFAULT_LOCATIONS,
        categories: DEFAULT_CATEGORIES
      })
    });

    window.householdSettings.locations = DEFAULT_LOCATIONS;
    window.householdSettings.categories = DEFAULT_CATEGORIES;

    localStorage.setItem('expirationDays', '3');
    openSettingsModal();
    showSuccess('Settings reset to defaults');
  } catch (error) {
    console.error('Failed to reset settings:', error);
    showError('Failed to reset settings');
  } finally {
    hideLoading();
  }
}

async function saveSettings() {
  const locationInputs = document.querySelectorAll('.location-input');
  const locations = [];
  locationInputs.forEach(input => {
    const val = input.value.trim();
    if (val) locations.push(val);
  });

  const categoryItems = document.querySelectorAll('#categories-list .setting-item');
  const categories = [];
  const category_emojis = {};
  categoryItems.forEach(item => {
    const input = item.querySelector('.category-input');
    const emojiBtn = item.querySelector('.btn-emoji-pick');
    const val = input ? input.value.trim() : '';
    if (val) {
      categories.push(val);
      if (emojiBtn) {
        category_emojis[val] = emojiBtn.textContent.trim();
      }
    }
  });

  const expirationDays = document.getElementById('setting-expiration-days').value;

  if (locations.length === 0) {
    alert('You need at least one location.');
    return;
  }
  if (categories.length === 0) {
    alert('You need at least one category.');
    return;
  }

  try {
    showLoading();

    const response = await API.call('/settings/', {
      method: 'PUT',
      body: JSON.stringify({ locations, categories, category_emojis })
    });

    window.householdSettings.locations = response.locations || locations;
    window.householdSettings.categories = response.categories || categories;
    window.householdSettings.category_emojis = response.category_emojis || category_emojis;

    // Update cache so other pages pick up changes immediately
    sessionStorage.setItem('ck-settings', JSON.stringify(window.householdSettings));
    localStorage.setItem('expirationDays', expirationDays);

    closeModal();
    showSuccess('Settings saved!');

    if (window.reloadCategoryEmojis) {
      window.reloadCategoryEmojis();
    }
  } catch (error) {
    console.error('Failed to save settings:', error);
    showError('Failed to save settings');
  } finally {
    hideLoading();
  }
}

// Expose functions globally
window.addLocation = addLocation;
window.removeLocation = removeLocation;
window.addCategory = addCategory;
window.removeCategory = removeCategory;
window.openEmojiPicker = openEmojiPicker;
window.selectEmoji = selectEmoji;
window.getCategoryDefaultEmoji = getCategoryDefaultEmoji;
window.resetSettingsToDefaults = resetSettingsToDefaults;
window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.toggleDisplayMode = toggleDisplayMode;
window.getDisplayMode = getDisplayMode;
window.handleLogout = handleLogout;
window.openAccountModal = openAccountModal;
window.openSettingsModal = openSettingsModal;
window.generateInviteCode = generateInviteCode;
window.copyInviteCode = copyInviteCode;
window.acceptInviteCode = acceptInviteCode;
window.switchHousehold = switchHousehold;
window.exportData = exportData;
window.updateBulkEntryCount = updateBulkEntryCount;
window.loadUnits = loadUnits;

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
window.cachedIngredientNames = [];

async function loadUnits() {
  const cachedUnits = sessionStorage.getItem('ck-units');
  const cachedNames = sessionStorage.getItem('ck-ingredient-names');
  if (cachedUnits && cachedNames) {
    try {
      window.cachedUnits = JSON.parse(cachedUnits);
      window.cachedIngredientNames = JSON.parse(cachedNames);
      return;
    } catch (e) { /* fall through to API */ }
  }

  try {
    const response = await API.getUnits();
    window.cachedUnits = response.units || [];
    window.cachedIngredientNames = response.ingredient_names || [];
    sessionStorage.setItem('ck-units', JSON.stringify(window.cachedUnits));
    sessionStorage.setItem('ck-ingredient-names', JSON.stringify(window.cachedIngredientNames));
  } catch (error) {
    console.warn('Failed to load units, using defaults:', error);
    window.cachedUnits = ['each', 'lb', 'oz', 'cup', 'tbsp', 'tsp', 'gallon', 'g', 'kg', 'ml', 'bunch', 'can', 'bottle', 'bag', 'box'];
    window.cachedIngredientNames = [];
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

function createIngredientDatalist() {
  const existing = document.getElementById('ingredient-suggestions');
  if (existing) existing.remove();

  const datalist = document.createElement('datalist');
  datalist.id = 'ingredient-suggestions';
  datalist.innerHTML = window.cachedIngredientNames.map(n => `<option value="${n}">`).join('');
  document.body.appendChild(datalist);
}

function createStoreDatalist() {
  const existing = document.getElementById('store-suggestions');
  if (existing) existing.remove();

  // Build store list from pantry items
  const stores = new Set();
  if (window.pantry) {
    window.pantry.forEach(item => {
      if (item.preferredStore) stores.add(item.preferredStore);
    });
  }
  if (stores.size === 0) return;

  const datalist = document.createElement('datalist');
  datalist.id = 'store-suggestions';
  datalist.innerHTML = [...stores].sort().map(s => `<option value="${s}">`).join('');
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
      <td>
        <input type="text" class="bulk-name form-control" placeholder="Item name" list="ingredient-suggestions" />
        <div class="bulk-name-warning" style="display:none;"></div>
      </td>
      <td><input type="number" class="bulk-qty form-control" placeholder="Qty" min="0" step="0.5" /></td>
      <td><input type="text" class="bulk-unit form-control" placeholder="unit" list="unit-suggestions" /></td>
      <td><select class="bulk-category form-control">${catOptions}</select></td>
      <td><select class="bulk-location form-control">${locOptions}</select></td>
      <td><button class="btn btn-danger btn-sm" onclick="this.closest('tr').remove();updateBulkEntryCount();">&times;</button></td>
    `;
    tbody.appendChild(row);

    // Wire up duplicate detection on the name input
    const nameInput = row.querySelector('.bulk-name');
    nameInput.addEventListener('input', checkBulkDuplicate);
  }
  updateBulkEntryCount();
}

/**
 * Check if a bulk entry name already exists in the pantry.
 * Shows a warning on the row if duplicate found.
 */
function checkBulkDuplicate(e) {
  const input = e.target;
  const name = input.value.trim().toLowerCase();
  const warningEl = input.parentElement.querySelector('.bulk-name-warning');
  if (!warningEl) return;

  if (!name) {
    warningEl.style.display = 'none';
    input.classList.remove('bulk-name-duplicate');
    return;
  }

  // Check against current pantry
  const pantry = window.pantry || [];
  const match = pantry.find(p => p.name.toLowerCase() === name);

  if (match) {
    const locSummary = match.locations.map(l => `${l.qty} ${match.unit} in ${l.location}`).join(', ');
    warningEl.textContent = `Already in pantry: ${locSummary || match.totalQty + ' ' + match.unit}`;
    warningEl.style.display = 'block';
    input.classList.add('bulk-name-duplicate');
  } else {
    warningEl.style.display = 'none';
    input.classList.remove('bulk-name-duplicate');
  }
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

  // Check for duplicates against current pantry
  const pantry = window.pantry || [];
  const duplicates = items.filter(item =>
    pantry.some(p => p.name.toLowerCase() === item.name.toLowerCase())
  );

  if (duplicates.length > 0) {
    const names = duplicates.map(d => d.name).join(', ');
    const proceed = confirm(
      `These items already exist in your pantry:\n${names}\n\nThis will create duplicate entries. Continue?`
    );
    if (!proceed) return;
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

  // Clear ingredient names cache so it refreshes with the new items
  sessionStorage.removeItem('ck-ingredient-names');

  if (errorCount > 0) {
    showError(`Saved ${savedCount} items. ${errorCount} failed.`);
  } else {
    showSuccess(`${savedCount} items added to pantry!`);
    clearBulkEntry();
    loadPantry();
    // Refresh the ingredient suggestions with the new items
    try {
      const response = await API.getUnits();
      window.cachedIngredientNames = response.ingredient_names || [];
      sessionStorage.setItem('ck-ingredient-names', JSON.stringify(window.cachedIngredientNames));
      createIngredientDatalist();
    } catch (e) { /* non-critical */ }
  }
}

/* ── Account & Household Management Modal ── */

function _escapeHTML(str) {
  const p = document.createElement('p');
  p.textContent = str;
  return p.innerHTML;
}

function _getInitials(email) {
  if (!email) return '?';
  const local = email.split('@')[0];
  const parts = local.replace(/[._-]/g, ' ').split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return local.substring(0, 2).toUpperCase();
}

async function openAccountModal() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content account-modal">
        <div class="account-loading"><div class="account-loading-spinner"></div><p>Loading account...</p></div>
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
  const initials = _getInitials(email);
  const activeHid = API.getActiveHouseholdId() || userInfo?.household_id;
  const activeHousehold = households.find(h => h.id === activeHid);
  const isOwner = activeHousehold?.role === 'owner';

  const householdSwitcher = households.length > 1 ? `
    <div class="account-card">
      <div class="account-card-header">
        <span class="account-card-icon">🏠</span>
        <h3>Switch Kitchen</h3>
      </div>
      <div class="household-switcher-pills">
        ${households.map(h => `
          <button class="household-pill ${h.id === activeHid ? 'household-pill-active' : ''}" onclick="switchHousehold('${h.id}')">
            <span class="household-pill-name">${h.name}</span>
            <span class="household-pill-role">${h.role}</span>
          </button>
        `).join('')}
      </div>
    </div>
  ` : '';

  const householdName = activeHousehold?.name || 'Your Kitchen';
  const escapedName = householdName.replace(/'/g, '&#39;').replace(/"/g, '&quot;');

  modalRoot.innerHTML = `
    <div class="modal-overlay" onclick="closeModal()">
      <div class="modal-content account-modal" onclick="event.stopPropagation()">
        <button class="modal-close" onclick="closeModal()">&times;</button>

        <div class="account-profile-header">
          <div class="account-avatar">${initials}</div>
          <div class="account-profile-info">
            <p class="account-email">${email}</p>
            <span class="account-role-badge ${isOwner ? 'role-owner' : 'role-member'}">${activeHousehold?.role || 'owner'}</span>
          </div>
        </div>

        <div class="account-card">
          <div class="account-card-header">
            <span class="account-card-icon">🍳</span>
            <h3>${isOwner ? '<span id="household-name-display" class="household-name-editable" onclick="startEditHouseholdName()" title="Click to rename">' + escapedName + ' <span class="household-name-edit-icon">&#9998;</span></span>' : escapedName}</h3>
          </div>
          <div id="household-name-edit" class="household-name-edit" style="display:none;">
            <input type="text" id="household-name-input" class="form-control" value="${escapedName}" maxlength="60" />
            <div class="household-name-edit-actions">
              <button class="btn btn-sm btn-secondary" onclick="cancelEditHouseholdName()">Cancel</button>
              <button class="btn btn-sm btn-primary" onclick="saveHouseholdName()">Save</button>
            </div>
          </div>
          <div id="members-list" class="members-list">
            <div class="member-row member-row-loading"><span>Loading members...</span></div>
          </div>
        </div>

        ${householdSwitcher}

        <div class="account-card">
          <div class="account-access-options">
            <button class="account-access-btn" id="tab-household-share" onclick="showAccessTab('share')">Household Share</button>
            <button class="account-access-btn" id="tab-quick-access" onclick="showAccessTab('qa')">Quick Access</button>
          </div>

          <div id="access-panel-share" class="access-panel" style="display:none">
            <p class="help-text">Share this code so someone can join your kitchen.</p>
            <div id="invite-section">
              <button class="btn btn-secondary btn-full" onclick="generateInviteCode()">Generate Invite Code</button>
            </div>
          </div>

          <div id="access-panel-qa" class="access-panel" style="display:none">
            <p class="help-text">Use this 5-character code to sign in quickly from trusted devices.</p>
            <div class="qa-code-tap-area" onclick="toggleQuickCode()" role="button" tabindex="0" title="Tap to reveal your code">
              <span class="quick-access-code-display" id="qa-code-display">•••••</span>
              <span class="qa-code-tap-hint" id="qa-tap-hint">tap to reveal</span>
            </div>
            <div>
              <button class="btn btn-sm btn-secondary" onclick="regenerateQuickCode()">Regenerate Code</button>
            </div>
            <p class="help-text" style="margin-top:0.5rem;font-size:0.8rem;">Regenerating removes all trusted devices — every browser must re-verify once.</p>
          </div>
        </div>

        ${isOwner ? `
        <div class="account-join-section">
          <p class="account-join-label">Join a Kitchen</p>
          <div class="join-input-row">
            <input type="text" id="accept-invite-input" class="form-control invite-code-input" placeholder="ABCD1234" maxlength="8" autocapitalize="characters" autocorrect="off" spellcheck="false" />
            <button class="btn btn-primary" onclick="acceptInviteCode()">Join</button>
          </div>
          <div id="accept-invite-status"></div>
        </div>
        ` : `
        <div class="account-join-section">
          <p class="account-join-label">Kitchen Membership</p>
          <p class="help-text" style="margin-bottom:0.75rem;">You'll return to your own kitchen — your pantry and recipes will be right where you left them.</p>
          <button class="btn btn-danger btn-full" onclick="leaveCurrentHousehold()">Leave Kitchen</button>
        </div>
        `}

        <div class="account-footer-actions">
          <button class="btn btn-secondary btn-footer-action" onclick="exportData()">
            <span class="btn-icon-label">Export Data</span>
          </button>
          <button class="btn btn-danger btn-footer-action" onclick="handleLogout()">
            <span class="btn-icon-label">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  `;

  loadMembersList();
}

function showAccessTab(tab) {
  const sharePanel = document.getElementById('access-panel-share');
  const qaPanel = document.getElementById('access-panel-qa');
  const shareBtn = document.getElementById('tab-household-share');
  const qaBtn = document.getElementById('tab-quick-access');
  if (!sharePanel || !qaPanel) return;

  sharePanel.style.display = tab === 'share' ? '' : 'none';
  qaPanel.style.display = tab === 'qa' ? '' : 'none';
  shareBtn.classList.toggle('active', tab === 'share');
  qaBtn.classList.toggle('active', tab === 'qa');

  if (tab === 'share') loadActiveInvite();
}

async function toggleQuickCode() {
  const display = document.getElementById('qa-code-display');
  const hint = document.getElementById('qa-tap-hint');
  if (!display) return;

  if (display.dataset.revealed === 'true') {
    display.textContent = '•••••';
    display.dataset.revealed = 'false';
    if (hint) hint.textContent = 'tap to reveal';
    return;
  }

  if (hint) hint.textContent = 'loading…';
  try {
    const resp = await API.getMyCode();
    display.textContent = resp.quick_access_code;
    display.dataset.revealed = 'true';
    if (hint) hint.textContent = 'tap to hide';

    setTimeout(() => {
      if (display.dataset.revealed === 'true') {
        display.textContent = '•••••';
        display.dataset.revealed = 'false';
        if (hint) hint.textContent = 'tap to reveal';
      }
    }, 30000);
  } catch (e) {
    if (hint) hint.textContent = 'tap to reveal';
    showError('Could not load code. Please try again.');
  }
}

async function leaveCurrentHousehold() {
  const activeHid = API.getActiveHouseholdId();
  if (!activeHid) return;

  if (!confirm("Leave this kitchen?\n\nYou'll return to your own kitchen — your pantry and recipes will be right where you left them.")) return;

  try {
    await API.leaveHousehold(activeHid);
    localStorage.removeItem('active_household_id');
    sessionStorage.clear();
    showSuccess('Left kitchen. Returning to your own kitchen…');
    setTimeout(() => window.location.reload(), 1200);
  } catch (e) {
    showError(e.message || 'Failed to leave kitchen.');
  }
}

function startEditHouseholdName() {
  const display = document.getElementById('household-name-display');
  const edit = document.getElementById('household-name-edit');
  if (display) display.style.display = 'none';
  if (edit) {
    edit.style.display = '';
    const input = document.getElementById('household-name-input');
    if (input) { input.focus(); input.select(); }
  }
}

function cancelEditHouseholdName() {
  const display = document.getElementById('household-name-display');
  const edit = document.getElementById('household-name-edit');
  if (display) display.style.display = '';
  if (edit) edit.style.display = 'none';
}

async function saveHouseholdName() {
  const input = document.getElementById('household-name-input');
  if (!input) return;
  const name = input.value.trim();
  if (!name) return;

  const activeHid = API.getActiveHouseholdId();
  if (!activeHid) return;

  try {
    await API.renameHousehold(activeHid, name);
    showSuccess('Kitchen renamed!');
    openAccountModal();
  } catch (e) {
    showError('Failed to rename: ' + e.message);
  }
}

async function loadMembersList() {
  const container = document.getElementById('members-list');
  if (!container) return;

  try {
    const data = await API.getHouseholdMembers();
    if (!data.members || data.members.length === 0) {
      container.innerHTML = '<div class="member-row"><span class="member-name">No members yet</span></div>';
      return;
    }

    container.innerHTML = data.members.map(m => {
      const isOwner = m.role === 'owner';
      const youTag = m.is_you ? '<span class="member-you-tag">You</span>' : '';
      const roleIcon = isOwner ? '👑' : '👤';
      const displayName = _escapeHTML(m.email || `Member ${m.user_id.substring(0, 6)}`);
      return `<div class="member-row">
        <span class="member-avatar-sm">${roleIcon}</span>
        <span class="member-name">${displayName}${youTag}</span>
        <span class="account-role-badge ${isOwner ? 'role-owner' : 'role-member'}">${m.role}</span>
      </div>`;
    }).join('');
  } catch (e) {
    container.innerHTML = '<div class="member-row"><span class="member-name">Failed to load members</span></div>';
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
        <div class="invite-code-card">
          <p class="invite-code-label">Active invite code</p>
          <p class="invite-code-value">${data.invite.code}</p>
          <p class="invite-code-expires">Expires in ${hoursLeft}h</p>
          <div class="invite-code-actions">
            <button class="btn btn-secondary btn-sm" onclick="copyInviteCode('${data.invite.code}')">Copy</button>
            <button class="btn btn-secondary btn-sm" onclick="shareInviteCode('${data.invite.code}')">Share</button>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm btn-full" style="margin-top:0.5rem;" onclick="generateInviteCode()">Generate New Code</button>
      `;
    }
  } catch (e) {
    // No active invite, keep the generate button
  }
}

async function generateInviteCode() {
  const container = document.getElementById('invite-section');
  if (!container) return;

  container.innerHTML = '<div class="invite-code-card"><p class="invite-code-label">Generating...</p></div>';

  try {
    const data = await API.createInvite(48);
    container.innerHTML = `
      <div class="invite-code-card">
        <p class="invite-code-label">Share this code</p>
        <p class="invite-code-value">${data.code}</p>
        <p class="invite-code-expires">Expires in ${data.expires_hours}h</p>
        <div class="invite-code-actions">
          <button class="btn btn-secondary btn-sm" onclick="copyInviteCode('${data.code}')">Copy</button>
          <button class="btn btn-secondary btn-sm" onclick="shareInviteCode('${data.code}')">Share</button>
        </div>
      </div>
    `;
  } catch (e) {
    container.innerHTML = `
      <p class="invite-error">Failed to generate code: ${e.message}</p>
      <button class="btn btn-secondary btn-sm" onclick="generateInviteCode()">Try Again</button>
    `;
  }
}

function copyInviteCode(code) {
  navigator.clipboard.writeText(code).then(() => {
    showSuccess('Invite code copied!');
  }).catch(() => {
    prompt('Copy this invite code:', code);
  });
}

function shareInviteCode(code) {
  if (navigator.share) {
    navigator.share({
      title: "Peachy Pantry - Kitchen Invite",
      text: `Join my kitchen on Peachy Pantry! Use invite code: ${code}`
    }).catch(() => {});
  } else {
    copyInviteCode(code);
  }
}

async function acceptInviteCode() {
  const input = document.getElementById('accept-invite-input');
  const statusEl = document.getElementById('accept-invite-status');
  if (!input || !statusEl) return;

  const code = input.value.trim();
  if (!code) {
    statusEl.innerHTML = '<p class="invite-error">Please enter a code.</p>';
    return;
  }

  statusEl.innerHTML = '<p class="invite-status-msg">Joining...</p>';

  try {
    const data = await API.acceptInvite(code);
    statusEl.innerHTML = `<p class="invite-success">${data.message}</p>`;
    input.value = '';
    API.setActiveHouseholdId(data.household_id);
    setTimeout(() => window.location.reload(), 1500);
  } catch (e) {
    statusEl.innerHTML = `<p class="invite-error">${e.message}</p>`;
  }
}

async function switchHousehold(householdId) {
  API.setActiveHouseholdId(householdId);
  showSuccess('Switching kitchen...');
  setTimeout(() => window.location.reload(), 500);
}

async function revealQuickCode() {
  const display = document.getElementById('qa-code-display');
  const btn = document.getElementById('qa-reveal-btn');
  if (!display || !btn) return;

  if (btn.textContent === 'Hide') {
    display.textContent = '••••••';
    btn.textContent = 'Reveal';
    return;
  }

  btn.disabled = true;
  btn.textContent = '…';
  try {
    const resp = await API.getMyCode();
    display.textContent = resp.quick_access_code;
    btn.textContent = 'Hide';
    btn.disabled = false;

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (display.textContent !== '••••••') {
        display.textContent = '••••••';
        btn.textContent = 'Reveal';
      }
    }, 30000);
  } catch (e) {
    btn.textContent = 'Reveal';
    btn.disabled = false;
    showError('Could not load code. Please try again.');
  }
}

async function regenerateQuickCode() {
  if (!confirm('Regenerate your Quick Access code? All trusted devices will need to re-verify once.')) return;

  try {
    const resp = await API.regenerateCode();
    // Clear the local device token — this browser must re-verify too
    localStorage.removeItem('ck-device-token');
    showSuccess('New code: ' + resp.quick_access_code);
    openAccountModal();
  } catch (e) {
    showError('Failed to regenerate code. Please try again.');
  }
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
  a.download = `peachy-pantry-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);

  showSuccess('Data exported!');
}

async function handleLogout() {
  // In demo mode, just clear demo data and redirect
  if (localStorage.getItem('demo-mode') === 'true') {
    if (!confirm('Exit demo mode? All demo data will be cleared.')) return;
    localStorage.removeItem('demo-mode');
    localStorage.removeItem('pantry');
    localStorage.removeItem('recipes');
    localStorage.removeItem('planner');
    sessionStorage.clear();
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/';
    return;
  }

  if (!confirm('Are you sure you want to sign out?')) return;

  try {
    cleanupRealtime();
    // Clear session cache so next login gets fresh data
    sessionStorage.clear();
    await API.signOut();
    // Navigate to landing page (multi-page architecture)
    window.location.href = (window.CONFIG && window.CONFIG.BASE_PATH || '') + '/';
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
    showError('You need at least one location.');
    return;
  }
  if (categories.length === 0) {
    showError('You need at least one category.');
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
window.shareInviteCode = shareInviteCode;
window.acceptInviteCode = acceptInviteCode;
window.switchHousehold = switchHousehold;
window.showAccessTab = showAccessTab;
window.toggleQuickCode = toggleQuickCode;
window.leaveCurrentHousehold = leaveCurrentHousehold;
window.startEditHouseholdName = startEditHouseholdName;
window.cancelEditHouseholdName = cancelEditHouseholdName;
window.saveHouseholdName = saveHouseholdName;
window.exportData = exportData;
window.regenerateQuickCode = regenerateQuickCode;
window.updateBulkEntryCount = updateBulkEntryCount;
window.loadUnits = loadUnits;
window.createIngredientDatalist = createIngredientDatalist;

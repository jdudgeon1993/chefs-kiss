/* ============================================================================
   SUPABASE REALTIME SYNC — Extracted from app.js (Phase 3.2)
   ============================================================================ */

let _supabaseClient = null;
let _realtimeChannel = null;

// Reconnection state
let _reconnectAttempts = 0;
let _reconnectTimer = null;
let _wasDisconnected = false;
let _intentionalClose = false;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [2000, 4000, 8000, 16000, 30000];

// Track our own recent writes so we don't double-reload on our own changes
let _lastLocalWrite = 0;
const LOCAL_WRITE_DEBOUNCE = 2000; // ignore events within 2s of our own write

function markLocalWrite() {
  _lastLocalWrite = Date.now();
}

async function initRealtime() {
  try {
    // Use cached realtime config to avoid extra API call on page switches
    let config;
    const cachedConfig = sessionStorage.getItem('ck-realtime-config');
    if (cachedConfig) {
      config = JSON.parse(cachedConfig);
    } else {
      config = await API.call('/realtime/config');
      if (config && config.supabase_url) {
        sessionStorage.setItem('ck-realtime-config', JSON.stringify(config));
      }
    }
    if (!config || !config.supabase_url || !config.anon_key) {
      console.warn('Realtime not configured on backend.');
      return;
    }

    const { createClient } = window.supabase;
    if (!createClient) {
      console.warn('Supabase JS client not loaded.');
      return;
    }

    // Clean up any dead channel before re-subscribing
    if (_realtimeChannel && _supabaseClient) {
      try { _supabaseClient.removeChannel(_realtimeChannel); } catch (e) {}
      _realtimeChannel = null;
    }

    _supabaseClient = createClient(config.supabase_url, config.anon_key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const householdId = API.getActiveHouseholdId();
    if (!householdId) {
      console.warn('No active household for Realtime subscriptions.');
      return;
    }

    _intentionalClose = false;

    // Subscribe to all core tables for this household.
    // Note: pantry_locations has no household_id column so it is intentionally
    // excluded — pantry_items events cover all data consumers need.
    _realtimeChannel = _supabaseClient
      .channel(`household-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items', filter: `household_id=eq.${householdId}` }, (payload) => {
        handleRealtimeEvent('pantry', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes', filter: `household_id=eq.${householdId}` }, (payload) => {
        handleRealtimeEvent('recipes', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_plans', filter: `household_id=eq.${householdId}` }, (payload) => {
        handleRealtimeEvent('meals', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_list_manual', filter: `household_id=eq.${householdId}` }, (payload) => {
        handleRealtimeEvent('shopping', payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          _reconnectAttempts = 0;
          if (_reconnectTimer) {
            clearTimeout(_reconnectTimer);
            _reconnectTimer = null;
          }
          if (!sessionStorage.getItem('ck-realtime-connected')) {
            sessionStorage.setItem('ck-realtime-connected', '1');
            showToast('Live sync connected', 'success', 2000);
          } else if (_wasDisconnected) {
            showToast('Live sync restored', 'success', 2000);
          }
          _wasDisconnected = false;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime ${status} — scheduling reconnect`);
          _scheduleReconnect(status);
        } else if (status === 'CLOSED' && !_intentionalClose) {
          // Unexpected close (network drop, server-side timeout)
          console.warn('Realtime CLOSED unexpectedly — scheduling reconnect');
          _scheduleReconnect('CLOSED');
        }
      });

  } catch (error) {
    console.warn('Failed to initialize Realtime:', error);
    _scheduleReconnect('init-error');
  }
}

function _scheduleReconnect(reason) {
  // Remove the dead channel
  if (_realtimeChannel && _supabaseClient) {
    try { _supabaseClient.removeChannel(_realtimeChannel); } catch (e) {}
    _realtimeChannel = null;
  }

  if (_reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('Realtime: max reconnect attempts reached');
    if (!_wasDisconnected) {
      _wasDisconnected = true;
      showToast("Live sync offline — refresh the page if updates aren't appearing", 'error', 8000);
    }
    return;
  }

  const delay = RECONNECT_DELAYS[_reconnectAttempts] || 30000;
  _reconnectAttempts++;

  if (!_wasDisconnected) {
    _wasDisconnected = true;
    console.warn(`Realtime ${reason} — reconnecting in ${delay}ms (attempt ${_reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
  } else {
    console.warn(`Realtime reconnect attempt ${_reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);
  }

  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    initRealtime();
  }, delay);
}

// Debounce reload calls per section to avoid rapid-fire reloads
const _realtimeReloadTimers = {};

function handleRealtimeEvent(section, payload) {
  // Skip if this was our own write (within debounce window)
  if (Date.now() - _lastLocalWrite < LOCAL_WRITE_DEBOUNCE) return;

  // Debounce: if multiple events fire for the same section within 500ms, batch them
  if (_realtimeReloadTimers[section]) {
    clearTimeout(_realtimeReloadTimers[section]);
  }

  _realtimeReloadTimers[section] = setTimeout(() => {
    delete _realtimeReloadTimers[section];
    reloadSection(section, payload.eventType);
  }, 500);
}

async function reloadSection(section, eventType) {
  const actionLabel = eventType === 'DELETE' ? 'removed' : 'updated';
  try {
    switch (section) {
      case 'pantry':
        // Pantry changes affect shopping list (threshold items)
        await Promise.all([loadPantry(), loadShoppingList({ fromRealtime: true })]);
        showToast(`Pantry ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'recipes':
        await loadRecipes();
        showToast(`Recipes ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'meals':
        // Meal changes affect shopping list (ingredient needs) and pantry RS column
        await Promise.all([loadMealPlans(), loadShoppingList({ fromRealtime: true })]);
        if (window.renderPantryLedger) window.renderPantryLedger();
        showToast(`Meal plan ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'shopping':
        await loadShoppingList({ fromRealtime: true });
        showToast(`Shopping list ${actionLabel} by another user`, 'sync', 3000);
        break;
    }
  } catch (err) {
    console.error(`Failed to reload ${section}:`, err);
  }
}

function cleanupRealtime() {
  _intentionalClose = true;
  if (_reconnectTimer) {
    clearTimeout(_reconnectTimer);
    _reconnectTimer = null;
  }
  if (_realtimeChannel && _supabaseClient) {
    _supabaseClient.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
}

// ── Visibility Change Fallback ──
// Reload stale data when user switches back to the tab.
// Also re-initialises Realtime if the connection was lost while the tab was hidden.
let _lastVisibilityReload = 0;
const VISIBILITY_RELOAD_COOLDOWN = 30000; // 30s minimum between visibility reloads

function setupVisibilityReload() {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - _lastVisibilityReload < VISIBILITY_RELOAD_COOLDOWN) return;
    if (!API.getToken()) return;

    // If Realtime died while the tab was hidden, restart it now
    if (!_realtimeChannel && !_reconnectTimer) {
      _reconnectAttempts = 0;
      _wasDisconnected = false;
      initRealtime();
    }

    _lastVisibilityReload = Date.now();
    const section = document.body.dataset.section || 'pantry';
    try {
      switch (section) {
        case 'pantry':   await Promise.all([loadPantry(), loadMealPlans()]); if (window.renderPantryLedger) window.renderPantryLedger(); break;
        case 'recipes':  await loadRecipes(); break;
        case 'meals':    await Promise.all([loadRecipes(), loadMealPlans()]); break;
        case 'shopping': await loadShoppingList(); break;
      }
    } catch (err) {
      console.warn('Visibility reload failed:', err);
    }
  });
}

// Expose globally
window.markLocalWrite = markLocalWrite;

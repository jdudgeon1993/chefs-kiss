/* ============================================================================
   SUPABASE REALTIME SYNC
   ============================================================================ */

let _supabaseClient = null;
let _realtimeChannel = null;

// Reconnection state
let _reconnectAttempts = 0;
let _reconnectTimer = null;
let _wasDisconnected = false;
let _disconnectedAt = 0;
let _intentionalClose = false;
let _initInProgress = false;       // guard against concurrent initRealtime() calls
let _stableTimer = null;           // delays resetting _reconnectAttempts until connection proves stable
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_DELAYS = [2000, 4000, 8000, 16000, 30000];
// Only show "Live sync restored" toast if we were down for more than this long.
// Suppresses the noisy toast on mobile OS briefly killing the WebSocket.
const RESTORED_TOAST_MIN_OUTAGE_MS = 8000;
// Minimum gap between "restored" / "offline" status toasts to prevent spam.
const STATUS_TOAST_COOLDOWN_MS = 15000;
let _lastStatusToastAt = 0;

// Track our own recent writes so we don't double-reload on our own changes
let _lastLocalWrite = 0;
const LOCAL_WRITE_DEBOUNCE = 2000; // ignore events within 2s of our own write

function markLocalWrite() {
  _lastLocalWrite = Date.now();
}

async function initRealtime() {
  // Prevent concurrent init calls (e.g. reconnect timer + visibilitychange firing simultaneously)
  if (_initInProgress) return;
  _initInProgress = true;

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

    // Clean up any dead channel before re-subscribing.
    // IMPORTANT: set _intentionalClose = true first so the CLOSED callback that fires
    // asynchronously for the old channel does not trigger a second reconnect chain.
    if (_realtimeChannel && _supabaseClient) {
      _intentionalClose = true;
      try { _supabaseClient.removeChannel(_realtimeChannel); } catch (e) {}
      _realtimeChannel = null;
    }

    // Only create the Supabase client once — recreating it on every reconnect
    // triggers a "Multiple GoTrueClient instances" warning from the SDK.
    if (!_supabaseClient) {
      _supabaseClient = createClient(config.supabase_url, config.anon_key, {
        auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ck-realtime' }
      });
    }

    // ── CRITICAL: authenticate Realtime with the user's JWT ──────────────────
    // Without this, the Supabase channel subscribes as the anonymous role.
    // RLS policies block postgres_changes events for the anon role, so the
    // channel shows SUBSCRIBED but events are silently never delivered.
    const userToken = API.getToken();
    if (userToken) {
      _supabaseClient.realtime.setAuth(userToken);
    }
    // ─────────────────────────────────────────────────────────────────────────

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
          if (_reconnectTimer) {
            clearTimeout(_reconnectTimer);
            _reconnectTimer = null;
          }
          // Don't reset _reconnectAttempts immediately — wait 10s to confirm the
          // connection is stable. A flapping connection (SUBSCRIBED → CHANNEL_ERROR
          // within seconds) would otherwise reset the backoff counter every cycle,
          // defeating exponential backoff entirely.
          if (_stableTimer) clearTimeout(_stableTimer);
          _stableTimer = setTimeout(() => {
            _reconnectAttempts = 0;
            _stableTimer = null;
          }, 10000);

          const now = Date.now();
          if (!sessionStorage.getItem('ck-realtime-connected')) {
            sessionStorage.setItem('ck-realtime-connected', '1');
            showToast('Live sync connected', 'success', 2000);
            _lastStatusToastAt = now;
          } else if (_wasDisconnected && (now - _disconnectedAt) >= RESTORED_TOAST_MIN_OUTAGE_MS
                     && (now - _lastStatusToastAt) >= STATUS_TOAST_COOLDOWN_MS) {
            // Only announce "restored" if the outage was long enough to matter
            // and we haven't just shown another status toast (prevents spam on flap)
            showToast('Live sync restored', 'success', 2000);
            _lastStatusToastAt = now;
          }
          // Clear the smart banner if realtime was previously lost
          if (window._notifyRealtimeState) window._notifyRealtimeState(false);
          _wasDisconnected = false;
          _disconnectedAt = 0;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (_stableTimer) { clearTimeout(_stableTimer); _stableTimer = null; }
          console.warn(`Realtime ${status} — scheduling reconnect`);
          _scheduleReconnect(status);
        } else if (status === 'CLOSED' && !_intentionalClose) {
          if (_stableTimer) { clearTimeout(_stableTimer); _stableTimer = null; }
          console.warn('Realtime CLOSED unexpectedly — scheduling reconnect');
          _scheduleReconnect('CLOSED');
        }
      });

  } catch (error) {
    console.error('Failed to initialize Realtime:', error);
    _scheduleReconnect('init-error');
  } finally {
    _initInProgress = false;
  }
}

function _scheduleReconnect(reason) {
  if (!_wasDisconnected) {
    _wasDisconnected = true;
    _disconnectedAt = Date.now();
  }

  // Remove the dead channel
  if (_realtimeChannel && _supabaseClient) {
    try { _supabaseClient.removeChannel(_realtimeChannel); } catch (e) {}
    _realtimeChannel = null;
  }

  if (_reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.warn('Realtime: max reconnect attempts reached');
    if (window._notifyRealtimeState) window._notifyRealtimeState(true);
    return;
  }

  const delay = RECONNECT_DELAYS[_reconnectAttempts] || 30000;
  _reconnectAttempts++;
  console.warn(`Realtime ${reason} — reconnect attempt ${_reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

  _reconnectTimer = setTimeout(() => {
    _reconnectTimer = null;
    initRealtime();
  }, delay);
}

// Debounce reload calls per section to avoid rapid-fire reloads
const _realtimeReloadTimers = {};
const _realtimeLastPayloads = {};

function handleRealtimeEvent(section, payload) {
  // Skip if this was our own write (within debounce window)
  if (Date.now() - _lastLocalWrite < LOCAL_WRITE_DEBOUNCE) return;

  // Keep the latest payload so the toast can reference the changed record
  _realtimeLastPayloads[section] = payload;

  // Debounce: if multiple events fire for the same section within 500ms, batch them
  if (_realtimeReloadTimers[section]) {
    clearTimeout(_realtimeReloadTimers[section]);
  }

  _realtimeReloadTimers[section] = setTimeout(() => {
    const latestPayload = _realtimeLastPayloads[section];
    delete _realtimeReloadTimers[section];
    delete _realtimeLastPayloads[section];
    reloadSection(section, latestPayload.eventType, latestPayload.new || latestPayload.old);
  }, 500);
}

async function reloadSection(section, eventType, record) {
  const isDelete = eventType === 'DELETE';
  try {
    switch (section) {
      case 'pantry': {
        await Promise.all([loadPantry(), loadShoppingList({ fromRealtime: true })]);
        const name = record?.name;
        const msg = name
          ? (isDelete ? `${name} removed from the Pantry` : `${name} updated in the Pantry`)
          : (isDelete ? 'Pantry item removed' : 'Pantry updated');
        showToast(msg, 'sync', 3000);
        break;
      }
      case 'recipes': {
        await loadRecipes();
        // Refresh the meal calendar if open so recipe name changes are reflected
        if (window.reloadCalendar) window.reloadCalendar();
        const name = record?.name;
        const msg = name
          ? (isDelete ? `"${name}" removed from Recipes` : `"${name}" updated`)
          : (isDelete ? 'Recipe removed' : 'Recipes updated');
        showToast(msg, 'sync', 3000);
        break;
      }
      case 'meals': {
        await Promise.all([loadMealPlans(), loadShoppingList({ fromRealtime: true })]);
        if (window.renderPantryLedger) window.renderPantryLedger();
        const recipeId = record?.recipe_id;
        const recipe = recipeId ? (window.recipes || []).find(r => r.id === recipeId) : null;
        const msg = recipe
          ? (isDelete ? `${recipe.name} removed from the Meal Plan` : `${recipe.name} added to the Meal Plan`)
          : (isDelete ? 'Meal plan updated' : 'Meal plan updated');
        showToast(msg, 'sync', 3000);
        break;
      }
      case 'shopping': {
        await loadShoppingList({ fromRealtime: true });
        const name = record?.name;
        const msg = name
          ? (isDelete ? `${name} removed from the Shopping List` : `${name} added to the Shopping List`)
          : 'Shopping list updated';
        showToast(msg, 'sync', 3000);
        break;
      }
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

// ── Visibility Change Fallback ──────────────────────────────────────────────
// When the user returns to the tab, refresh stale data and restart Realtime
// if the connection was lost while the tab was hidden.
let _lastVisibilityReload = 0;
const VISIBILITY_RELOAD_COOLDOWN = 10000; // 10s — tightened from 30s
let _visibilityReloadSetup = false;

function setupVisibilityReload() {
  if (_visibilityReloadSetup) return;
  _visibilityReloadSetup = true;
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    if (!API.getToken()) return;

    // Restart Realtime if the channel died while we were away and no reconnect
    // is already queued (the pending timer will fire soon anyway if one exists)
    if (!_realtimeChannel && !_reconnectTimer) {
      _reconnectAttempts = 0;
      _wasDisconnected = false;
      _disconnectedAt = 0;
      initRealtime();
    }

    if (Date.now() - _lastVisibilityReload < VISIBILITY_RELOAD_COOLDOWN) return;
    _lastVisibilityReload = Date.now();

    // Eagerly pull fresh data so the user sees current state immediately
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

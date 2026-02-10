/* ============================================================================
   SUPABASE REALTIME SYNC — Extracted from app.js (Phase 3.2)
   ============================================================================ */

let _supabaseClient = null;
let _realtimeChannel = null;

// Track our own recent writes so we don't double-reload on our own changes
let _lastLocalWrite = 0;
const LOCAL_WRITE_DEBOUNCE = 2000; // ignore events within 2s of our own write

function markLocalWrite() {
  _lastLocalWrite = Date.now();
}

async function initRealtime() {
  try {
    const config = await API.call('/realtime/config');
    if (!config || !config.supabase_url || !config.anon_key) {
      console.warn('Realtime not configured on backend.');
      return;
    }

    const { createClient } = window.supabase;
    if (!createClient) {
      console.warn('Supabase JS client not loaded.');
      return;
    }

    _supabaseClient = createClient(config.supabase_url, config.anon_key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const householdId = API.getActiveHouseholdId();
    if (!householdId) {
      console.warn('No active household for Realtime subscriptions.');
      return;
    }

    // Subscribe to all core tables for this household
    _realtimeChannel = _supabaseClient
      .channel(`household-${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_items', filter: `household_id=eq.${householdId}` }, (payload) => {
        handleRealtimeEvent('pantry', payload);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pantry_locations' }, (payload) => {
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
        console.log('Realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime connected — live sync active');
          showToast('Live sync connected', 'success', 2000);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Realtime channel error - check Supabase Realtime settings');
          showToast('Live sync unavailable', 'error', 3000);
        }
      });

  } catch (error) {
    console.warn('Failed to initialize Realtime:', error);
  }
}

// Debounce reload calls per section to avoid rapid-fire reloads
const _realtimeReloadTimers = {};

function handleRealtimeEvent(section, payload) {
  console.log(`📡 Realtime event: ${section} - ${payload.eventType}`, payload);

  // Skip if this was our own write (within debounce window)
  if (Date.now() - _lastLocalWrite < LOCAL_WRITE_DEBOUNCE) {
    console.log('  ↳ Skipped (local write debounce)');
    return;
  }

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
        await Promise.all([loadPantry(), loadShoppingList()]);
        showToast(`Pantry ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'recipes':
        await loadRecipes();
        showToast(`Recipes ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'meals':
        // Meal changes affect shopping list (ingredient needs)
        await Promise.all([loadMealPlans(), loadShoppingList()]);
        showToast(`Meal plan ${actionLabel} by another user`, 'sync', 3000);
        break;
      case 'shopping':
        await loadShoppingList();
        showToast(`Shopping list ${actionLabel} by another user`, 'sync', 3000);
        break;
    }
  } catch (err) {
    console.error(`Failed to reload ${section}:`, err);
  }
}

function cleanupRealtime() {
  if (_realtimeChannel && _supabaseClient) {
    _supabaseClient.removeChannel(_realtimeChannel);
    _realtimeChannel = null;
  }
}

// ── Visibility Change Fallback ──
// Reload stale data when user switches back to the tab
let _lastVisibilityReload = 0;
const VISIBILITY_RELOAD_COOLDOWN = 30000; // 30s minimum between visibility reloads

function setupVisibilityReload() {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    if (Date.now() - _lastVisibilityReload < VISIBILITY_RELOAD_COOLDOWN) return;
    if (!API.getToken()) return;

    _lastVisibilityReload = Date.now();
    console.log('Tab visible — refreshing data');
    try {
      await Promise.all([loadPantry(), loadRecipes(), loadMealPlans(), loadShoppingList()]);
    } catch (err) {
      console.warn('Visibility reload failed:', err);
    }
  });
}

// Expose globally
window.markLocalWrite = markLocalWrite;

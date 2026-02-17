# Chef's Kiss - Code & UX Audit

**Auditor:** Senior Product Architect & Lead Developer Review
**Date:** 2026-02-17
**Codebase Size:** ~16,000 lines across Python backend + vanilla JS frontend
**Stack:** FastAPI / Supabase (PostgreSQL) / Redis / Vanilla JS / GitHub Pages

---

## The "Tough Love" Summary

Chef's Kiss has a solid architectural foundation — the `StateManager` centralized calculation engine, the database provider abstraction layer, and the multi-household data model are genuinely well-conceived for a home kitchen app. However, the application has a **critical relational integrity gap**: deleting a recipe does not cascade to or warn about meal plans that reference it, which means your meal planner and shopping list will silently break. The frontend is carrying too much duplicated business logic (reserved ingredient calculations exist in both Python and JavaScript), and the mobile experience — where 80% of real cooking happens — forces users through a horizontally-scrolling pantry table that is hostile to one-handed phone use. This is a capable prototype that needs targeted hardening before it can be trusted as a daily-driver kitchen tool.

---

## 1. Data Integrity & Relational Logic

### 1A. Recipe Deletion Breaks Meal Plans (Critical)

**Files:** `backend/routes/recipes.py:227-249`, `backend/state_manager.py:144-146`

When a recipe is deleted, the `meal_plans` table rows referencing that `recipe_id` become **orphaned**. The deletion route (`DELETE /api/recipes/{recipe_id}`) only deletes the recipe row itself — there is no cascade, no cleanup of `meal_plans`, and no warning to the user.

**What breaks:**
- `StateManager._calculate_reserved()` at line 144 calls `self._get_recipe(meal.recipe_id)` for each uncooked meal plan. If the recipe was deleted, it returns `None` and silently `continue`s — so the meal plan still appears in the UI but contributes zero reserved ingredients.
- The shopping list loses the shortfall for those meals. The user sees "Chicken Parmesan" on Tuesday's meal plan, but the shopping list doesn't include chicken or parmesan.
- The `validate_can_cook_meal()` method at line 386 returns `{"can_cook": False, "error": "Recipe not found"}` — an opaque error with no suggestion to fix it.

**Fix:** Before deleting a recipe, query `meal_plans` for any rows referencing that `recipe_id`. Either (a) block deletion with a clear error listing the affected meal dates, or (b) cascade-delete those meal plans and inform the user. Option (a) is safer for home cooks who might not realize the downstream effect.

### 1B. Pantry Depletion on Cook — No Transaction Boundary (High)

**File:** `backend/routes/meal_plans.py:194-256`

The `mark_meal_cooked` endpoint iterates ingredients and updates pantry locations one at a time inside the `update()` closure. If any single `update_location` call fails mid-loop (network blip, Supabase timeout), you get **partial depletion**: some ingredients are deducted, others aren't, and the meal is not yet marked as cooked (so the user might retry and double-deduct).

The Supabase Python SDK does not provide client-side transactions. The `update_and_invalidate` wrapper executes the function then invalidates cache, but there's no rollback mechanism.

**Mitigation:** Collect all location updates into a batch, then execute them. If using Supabase, consider using an RPC (stored procedure) that wraps all the location updates + meal status change in a single PostgreSQL transaction.

### 1C. Ingredient Matching is Fragile (Medium)

**Files:** `backend/state_manager.py:88-90`, `backend/state_manager.py:149`

Pantry-to-recipe matching uses a `(name.lower(), unit.lower())` tuple key. This means:
- "Chicken Breast" in the pantry will NOT match "chicken breast" in a recipe ingredient if there's a casing inconsistency (handled by `.lower()`, good).
- But "Chicken Breasts" (plural) will NOT match "Chicken Breast" (singular). There is no fuzzy matching, stemming, or alias system.
- "oz" vs "ounce" vs "ounces" are treated as completely different units. There is no unit normalization.

**Impact:** Users will have pantry items that appear "missing" from recipes when the naming is slightly inconsistent. The shopping list will tell them to buy "Chicken Breast" when they already have "Chicken Breasts" in the fridge.

**Fix:** Add a normalization layer: strip trailing 's' for simple plurals, map common unit aliases (`oz` → `ounce`, `tbsp` → `tablespoon`, `lb` → `pound`), and consider a Levenshtein distance check with a confidence threshold for pantry matching.

### 1D. Auto-Generated Shopping Items Cannot Be Checked Off on Backend (Medium)

**Files:** `backend/state_manager.py:154-262`, `js/app.js:594-614`

Auto-generated shopping items (from meal shortfall or threshold calculations) have no `id` — they exist only as computed output from `StateManager._calculate_shopping_list()`. When a user checks off "2 lbs Chicken" in the store, that checked state is stored **only in `localStorage`** on the client (`js/app.js:594-614`).

**What breaks:**
- If the user clears their browser data or switches phones, all auto-generated checked items reset.
- Household members on different devices cannot see what the shopper already has in their cart — the real-time sync only covers manual items.
- The `add-checked-to-pantry` endpoint at `shopping_list.py:196` checks `item.checked` which is only `True` for manual items. Auto-generated checked items won't be included unless the frontend manually tracks and sends them.

**Fix:** When a user checks an auto-generated item, the frontend should create a manual item as an override (this pattern partially exists in `editShoppingItem` at `app.js:828` but not in `toggleShoppingItem`). This way the checked state persists server-side and syncs across devices.

### 1E. Pickle-Based Redis Cache is a Security and Compatibility Risk (Medium)

**File:** `backend/state_manager.py:42, 477, 491`

The `StateManager` serializes full `HouseholdState` objects with `pickle.dumps()` and deserializes with `pickle.loads()`. Pickle deserialization of untrusted data is a known remote code execution vector. While the Redis data is generated internally, if an attacker gains write access to Redis (e.g., exposed Redis port, which is common in Railway misconfigurations), they can inject arbitrary Python objects.

Additionally, any change to the Pydantic model structure (adding/removing fields) will break deserialization of cached data, causing `UnpicklingError` exceptions that the `try/except` at line 478 silently swallows — leading to a full cache miss on every request until TTL expires.

**Fix:** Replace `pickle` with JSON serialization using Pydantic's `.model_dump()` / `.model_validate()`. This is safer and version-tolerant.

---

## 2. The "Mobile-First" Reality — UX Friction Points

### 2A. Pantry Table Requires Horizontal Scrolling on Mobile (Critical)

**File:** `css/shared.css:3031-3035`

```css
.unified-ledger-table {
  font-size: 0.75rem;
  min-width: 700px;    /* Forces horizontal scroll on any phone */
  table-layout: auto;
}
```

The pantry ledger is a 7-column table with a `min-width: 700px`. On a phone screen (320–414px wide), users must scroll horizontally to see expiration dates and action buttons. This is the **most-visited section** of a kitchen app, and it's essentially unusable with one hand while the other holds a grocery bag or stirs a pot.

**Fix:** On mobile, replace the table with a card-based layout. Each pantry item becomes a tappable card showing name, total quantity, and an expiry indicator. Tap to expand for location details. This is a common pattern in inventory apps (e.g., Paprika, AnyList).

### 2B. Modals Are the Only Way to Edit — Too Click-Heavy (High)

**Files:** `js/app.js:1328-1407` (pantry modal), `js/app.js:1571-1714` (recipe modal)

Every edit operation requires: tap item → modal opens → scroll modal → edit field → save → modal closes → list reloads. On a phone, modals that fill the screen are disorienting, and the user loses context of where they were in the list.

The recipe modal (`openRecipeModal`) is particularly heavy — it contains name, servings, category, tags, a dynamic ingredient list, instructions textarea, and photo upload. On a 5" phone, this is a scrollable form inside a scrollable overlay.

**Fix:** For quick operations (updating quantity, marking items), use inline editing or swipe actions. Reserve modals for complex creation flows. The `openQuickDepleteModal` at `app.js:1500` is a good start — extend this pattern to cover quick quantity adjustments directly from the pantry list.

### 2C. Touch Targets Under 44px in Multiple Places (Medium)

**File:** `css/shared.css:555-568`

```css
.shopping-remove, .shopping-edit {
  width: 24px;    /* Below Apple's 44px minimum */
  height: 24px;
}
```

The shopping list edit (pencil) and delete (trash) buttons are 24x24px. Apple's Human Interface Guidelines and WCAG recommend a minimum of 44x44px for touch targets. This is addressed for the generic `.btn` class at `shared.css:3134-3137` (`min-height: 44px`), but these specific icon buttons escape that rule because they're styled with explicit dimensions.

Other undersized targets:
- `.shopping-check` checkbox: 18x18px (`shared.css:516-521`)
- `.btn-remove` in location rows: no explicit size, inherits from `.btn-icon`
- `.ledger-col-actions .btn-ledger-action`: 36x36px on mobile (close but still under 44px)

### 2D. Header Consumes 120px on Mobile (Medium)

**File:** `css/shared.css:2878-2879`

```css
body {
  padding-top: 120px;
  padding-bottom: 70px;
}
```

On a 667px-tall iPhone SE screen, the fixed header (120px) + bottom nav (70px) = 190px of chrome. That leaves only **477px** of usable viewport — less than 72% of the screen. Add the shopping list header, add-item input, and group-by toggle, and the actual list content gets maybe 300px. The user sees roughly 3 shopping items at a time.

**Fix:** Collapse the header on scroll (common pattern: shrink to 50px showing only the brand and key actions). Alternatively, use a single-row compact header on mobile that hides the datetime display (already partially done at `shared.css:3572-3575` for screens < 400px, but the breakpoint should be 768px).

### 2E. Focus Mode is the Right Idea but Discovery is Poor (Low)

**File:** `js/shopping-focus-mode.js`, `css/shopping-focus-mode.css`

The shopping Focus Mode is well-implemented — large checkboxes, category grouping, distraction-free UI. But it's activated by a button that's below the fold on most phones because the header, add-item input, and group-by pills push it down. A user in a grocery store who has never seen the feature may never discover it.

**Fix:** Make Focus Mode the **default** view when the shopping list has > 0 items and the device is mobile. Show a small "Exit to full view" link. The detailed view becomes the secondary option for desktop/planning use.

---

## 3. Redundancy & Optimization

### 3A. Duplicated Reserved Ingredient Calculation (High)

**Files:** `backend/state_manager.py:126-152` vs `js/app.js:282-325`

The reserved ingredient calculation exists in two places:
- **Python** (`_calculate_reserved`): Authoritative server-side calculation
- **JavaScript** (`calculateReservedIngredients`): Client-side mirror for the pantry ledger display

These implementations can drift. The Python version uses `meal.serving_multiplier`, while the JS version checks both `meal.servingMultiplier` and `meal.serving_multiplier` (accommodating inconsistent data shapes). If the Python logic changes (e.g., adding a "partially cooked" state), the JS version won't know.

**Fix:** The backend already returns `reserved_ingredients` in the meal plan GET response. The frontend should consume that directly instead of recalculating. Remove `calculateReservedIngredients()` from `app.js` and have the pantry ledger script read from the API response data stored in `window.planner`.

### 3B. Every Mutation Returns Full State — Excessive Payload (Medium)

**Files:** All route files (`pantry.py`, `recipes.py`, `meal_plans.py`, `shopping_list.py`)

Every POST/PUT/DELETE endpoint follows this pattern:
```python
StateManager.update_and_invalidate(household_id, update)
state = StateManager.get_state(household_id)  # Full reload from DB
return {"pantry_items": [...], "shopping_list": [...], ...}
```

This means every single item check-off in the shopping list triggers:
1. A DB write
2. A cache invalidation
3. A full state reload (4 parallel DB queries)
4. Full recalculation of reserved ingredients, shopping list, and ready recipes
5. Serialization of the entire household state as JSON response

For a household with 200 pantry items, 50 recipes, and 14 meal plans, this is significant work for a checkbox toggle.

**Fix:** For simple mutations (checking a shopping item, toggling a favorite), return only the affected item and let the frontend optimistically update. Reserve full-state returns for operations that genuinely affect calculations (adding/removing meal plans, cooking meals, changing pantry quantities).

### 3C. Frontend Loads Pantry Data on the Shopping Page (Low)

**File:** `js/app.js:2046-2050`

```javascript
case 'shopping':
  await Promise.all([
    loadShoppingList().then(() => updateLoaderProgress(70)),
    loadPantry().then(() => updateLoaderProgress(85))
  ]);
```

The shopping page loads the full pantry just for the checkout modal's item-matching logic. But checkout is a rare action (once per shopping trip). Loading 200+ pantry items on every shopping page visit adds latency for a feature used once a week.

**Fix:** Lazy-load pantry data only when the checkout modal opens (which already has a fresh-fetch pattern at `app.js:1029-1051`). Remove the pantry preload from the shopping page init.

### 3D. No Request Deduplication — Multiple Tabs Hammer the API (Low)

**File:** `js/realtime.js:111-137`

When a realtime event fires, `reloadSection` calls `loadPantry()`, `loadShoppingList()`, etc. If the user has the pantry page and shopping page open in two tabs, a single pantry change triggers: Tab 1 reloads pantry + shopping, Tab 2 reloads pantry + shopping. That's 4 API calls from one DB change, each triggering a full state rebuild. With a household of 2-3 members, this multiplies further.

The 500ms debounce in `handleRealtimeEvent` helps within a single tab, but cross-tab coordination is absent.

---

## 4. Edge Case Failure Analysis

### 4A. Offline in the Grocery Store — Shopping List is Useless (Critical)

**Files:** `js/shopping-focus-mode.js:86-93`, `js/api.js:138`

There is **no service worker, no offline cache, and no IndexedDB fallback**. The shopping list is fetched fresh from the API on every page load (`ShoppingFocusMode.loadShoppingList` at line 86). If the user is in a concrete-walled grocery store with no signal:

- Opening the shopping page shows nothing (API call fails)
- Focus mode fails silently (`this.shoppingList = []` at line 93)
- Checking items off fails (PATCH calls to backend)
- Quick-adding a forgotten item fails

The `css/shared.css:116-141` defines an `.offline-banner` class, suggesting offline awareness was planned, but it's not wired up to any detection logic.

**Fix (minimum viable):** Cache the last-known shopping list in `localStorage` on every successful API response. On load, display cached data immediately, then attempt an API refresh in the background. For check-offs, queue mutations in `localStorage` and sync when connectivity returns. This is the "optimistic offline" pattern used by Todoist, Google Keep, and similar apps.

### 4B. Duplicate Items in Shopping List (Medium)

**File:** `backend/state_manager.py:170-262`

The `_calculate_shopping_list` method tracks duplicates via `added_keys` (a set of `name|unit` keys). This correctly prevents the same ingredient from appearing twice when it's needed for both meals and thresholds. However:

- If a user manually adds "Eggs, 1 dozen" and the auto-calculation also generates "Eggs, 1 dozen", the manual override suppresses the auto-generated version (via `manual_keys` at line 176-178). This is correct.
- But if the user manually adds "eggs, 1 dozen" (lowercase) and the pantry has "Eggs" (titlecase), the `manual_keys` check uses `.lower()` so this works.
- **The gap:** If a user adds "Egg, 1 dozen" (singular) manually and the recipe calls for "Eggs, 1 dozen" (plural), these are treated as different items. The shopping list shows both.

### 4C. Health Score Overflows for Large Pantries (Low)

**File:** `backend/state_manager.py:426-430`

```python
health_score = 100
health_score -= below_threshold * 10
health_score -= expiring_soon * 5
health_score = max(0, health_score)
```

If a household has 15 items below threshold, the score hits -50 before being clamped to 0. This is fine mathematically, but the scoring doesn't scale. A household with 200 items and 12 below threshold (6% non-compliant) gets the same "poor" rating as a household with 20 items and 12 below threshold (60% non-compliant). The score should be proportional to the pantry size.

### 4D. Token Stored in localStorage — XSS Exposure (Low)

**File:** `js/api.js:16-28`

Auth tokens and refresh tokens are stored in `localStorage`, which is accessible to any JavaScript running on the page. If an XSS vulnerability exists anywhere in the HTML rendering (and with `innerHTML` assignments throughout `app.js`, the surface area is large), an attacker can steal both tokens.

The app does use `safeSetInnerHTMLById` from `utils.js`, but many rendering functions in `app.js` directly assign to `.innerHTML` (e.g., `renderMealCalendar` at line 493, `renderDashboard` at line 1189, `editShoppingItem` at line 766).

---

## 5. Feature Gap Analysis — The Single Most Important Missing Feature

### Offline-First Shopping List with Sync

Based on the codebase's current architecture and its intended use case (home cooking, grocery shopping), the single most impactful missing feature is **an offline-capable shopping list with background sync**.

**Why this above all else:**
1. The shopping list is the one feature used **outside the home** where connectivity is unreliable.
2. The Focus Mode UI (`shopping-focus-mode.js`) is already well-designed for in-store use — it just needs to work without internet.
3. The `localStorage` checked-item tracking (`app.js:594-614`) proves the team already recognizes the need for client-side state — it just needs to be extended to the full list.
4. Every other feature (pantry management, recipe editing, meal planning) is done at home on WiFi. The shopping list is the one that must survive a dead zone.

**Implementation approach:**
- Use a Service Worker to cache the shopping page shell and its JS/CSS assets.
- On every successful `GET /shopping-list/`, write the response to IndexedDB.
- On page load, render from IndexedDB immediately; fetch API in background and merge.
- For mutations (check/uncheck, add item), write to a pending-mutations queue in IndexedDB. Process the queue when online.
- Add a visible sync indicator: "Last synced 3 min ago" / "Offline — changes will sync when connected".

---

## 6. Actionable Enhancements — Prioritized for Next Iteration

### Tier 1: Fix Before Real Users Touch It

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 1 | **Recipe deletion orphans meal plans** — add cascade check/delete | `routes/recipes.py:227-249`, add query to `meal_plans` table | Small |
| 2 | **Offline shopping list** — cache in localStorage/IndexedDB, queue mutations | `js/shopping-focus-mode.js`, new service worker | Medium |
| 3 | **Mobile pantry card view** — replace horizontal-scroll table with cards on < 768px | `css/shared.css:3023-3065`, `pantry/pantry.js` | Medium |

### Tier 2: Significant UX Improvements

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 4 | **Remove duplicated reserved calculation** — frontend should read from API response | `js/app.js:282-325` (delete), update pantry ledger to use server data | Small |
| 5 | **Touch target audit** — enforce 44px minimum on all interactive elements | `css/shared.css` (shopping buttons, checkboxes) | Small |
| 6 | **Ingredient name normalization** — plural stripping + unit alias map | New utility in `backend/`, update `state_manager.py` matching | Medium |
| 7 | **Compact mobile header** — collapse to single row on scroll | `css/shared.css:2877-2903` | Small |

### Tier 3: Robustness & Performance

| # | Issue | Files | Effort |
|---|-------|-------|--------|
| 8 | **Replace pickle with JSON serialization** in Redis cache | `backend/state_manager.py:477-496` | Small |
| 9 | **Partial-response mutations** — return only changed data for simple ops | All route files | Medium |
| 10 | **Wrap cook-meal depletion in DB transaction** | `routes/meal_plans.py:194-256`, new Supabase RPC | Medium |
| 11 | **Lazy-load pantry on shopping page** — only fetch for checkout | `js/app.js:2046-2050` | Small |
| 12 | **Proportional health score** — normalize by pantry size | `backend/state_manager.py:418-440` | Small |

---

*This audit prioritizes issues by real-world impact for home cooks. The codebase demonstrates strong architectural thinking — the StateManager pattern, provider abstraction, and multi-household model are above average for a personal project. The gaps identified are the kind that only surface under real daily use: spotty grocery store WiFi, one-handed phone operation with messy hands, and the accumulation of slightly-misspelled ingredients over months of family cooking.*

# Chef's Kiss — Code & UX Audit + Phased Implementation Plan

**Date:** 2026-02-17
**Stack:** FastAPI / Supabase (PostgreSQL) / Redis / Vanilla JS / GitHub Pages
**Philosophy:** HTML/CSS first. JavaScript makes the site breathe. Python makes it think.

---

## How This App Works (The Pipeline)

```
Pantry (Inventory) → Recipes (Cookbook) → Meals (Strategy) → Shopping (Output)
```

- **Pantry** is the foundation. It tracks what the household physically has — items, locations, quantities, expiration dates, minimum thresholds.
- **Recipes** is the cookbook. Browse, search, filter, favorite. Each recipe has ingredients that map to pantry items by `name|unit`.
- **Meals** is the strategy. A calendar where you assign recipes to dates. Planning a meal **reserves** pantry ingredients and **generates** shopping list entries for anything missing.
- **Shopping** is the output. Python calculates it automatically from three sources: meal shortfall, threshold replenishment, and manual items. Focus Mode is the in-store execution tool — activated when the user is ready to shop.

The `StateManager` in Python is the engine. Every data change invalidates cache, reloads from DB, and recalculates reserved ingredients, shopping lists, and ready-to-cook status. One source of truth.

---

## Phase 1 — Protect the Pipeline

**Why this phase first:** These are bugs that silently break the Inventory → Cookbook → Plan → Shop chain. A real user will hit these within the first week of daily use. None of these are features — they're holes in the existing logic.

---

### 1.1 Recipe Deletion Orphans Meal Plans

**The problem:** Deleting a recipe leaves `meal_plans` rows pointing at a `recipe_id` that no longer exists.

**What breaks downstream:**
- `StateManager._calculate_reserved()` (`state_manager.py:144`) looks up the recipe for each meal plan. Deleted recipe returns `None`, the meal is silently skipped. No ingredients get reserved for that meal.
- The shopping list loses the shortfall. User sees "Chicken Parm" on Tuesday's calendar but the shopping list doesn't include chicken or parmesan.
- `validate_can_cook_meal()` (`state_manager.py:386`) returns `"error": "Recipe not found"` — no explanation, no fix.
- The meal calendar (`meals.js:createDayCell`) renders the meal but can't find the recipe name, so it shows "Unknown Recipe."

**Where to fix:** `backend/routes/recipes.py:227-249`

**The fix:** Before `db.recipes.delete()`, query `meal_plans` for any uncooked rows referencing that `recipe_id`. If found, return a 409 Conflict with the list of affected dates. The frontend shows: *"This recipe is scheduled for Feb 20, Feb 24. Remove it from the meal plan first."*

This is Python-side only. The frontend `deleteRecipe()` in `app.js:210` already has a `confirm()` dialog and an error handler — just surface the backend message.

**Why not cascade-delete the meal plans?** Because a home cook might not realize "Delete recipe" means "also cancel Tuesday's dinner." Block and explain is safer.

---

### 1.2 Cook-Meal Depletion Has No Atomicity

**The problem:** `mark_meal_cooked` (`meal_plans.py:194-256`) depletes pantry locations one at a time in a loop. If a network error or Supabase timeout happens mid-loop, some ingredients are deducted but others aren't, and the meal isn't marked cooked.

**What breaks:**
- Partial depletion: 3 of 5 ingredients are deducted. Pantry is wrong.
- Meal stays `is_cooked: False`, so the user retries. Now those 3 ingredients get deducted *again*.
- The shopping list recalculates based on wrong pantry quantities.

**Where to fix:** `backend/routes/meal_plans.py:194-256`

**The fix:** Collect all location updates into a list first, then execute them. Better: create a Supabase RPC (PostgreSQL stored procedure) that takes `meal_id` as input and does all depletion + status change in a single database transaction. If any step fails, the whole thing rolls back.

Minimum viable: even without an RPC, restructure the `update()` closure to set `is_cooked: True` **first**, then deplete. If depletion partially fails, the meal is at least marked cooked (no double-deduct on retry) and the user can manually adjust quantities. This is the safer failure mode.

---

### 1.3 Ingredient Matching Breaks on Plurals and Unit Aliases

**The problem:** The entire pipeline connects Pantry ↔ Recipe ↔ Shopping via `name.lower() + "|" + unit.lower()` exact string matching (`state_manager.py:88-90, 149`).

**What breaks:**
- Pantry has "Chicken Breasts" (plural). Recipe calls for "Chicken Breast" (singular). No match. Shopping list says "buy Chicken Breast" even though the user has it.
- User enters "oz" in the recipe. Pantry item uses "ounce." No match. Same problem.
- Over months of family use, these mismatches accumulate. The shopping list gets noisy and untrustworthy. Users stop trusting the app and go back to pen and paper.

**Where to fix:** New utility in `backend/`, called from `state_manager.py`

**The fix:** Create a `normalize_ingredient(name, unit)` function:
1. **Unit alias map:** `{"oz": "ounce", "ounces": "ounce", "tbsp": "tablespoon", "tbs": "tablespoon", "lb": "pound", "lbs": "pound", "c": "cup"}` — normalize both sides before matching.
2. **Simple plural stripping:** If a name ends in "s" and the non-"s" version exists in the pantry, treat them as the same item. (Skip words ending in "ss" like "grass.")
3. Apply normalization in `_pantry_lookup` key generation and in `_calculate_reserved()` key generation.

This lives entirely in Python. No frontend changes. The shopping list just gets smarter.

---

### 1.4 Auto-Generated Shopping Items Only Track Checked State Locally

**The problem:** Auto-generated items (from meal shortfall / threshold) have no database `id`. When a user checks one off at the store, it's stored in `localStorage` only (`app.js:594-614`).

**What breaks:**
- Switch phones, clear browser data, or use a different browser → checked state gone.
- Household member on another device can't see what's already in the cart. Real-time sync only covers manual items.
- The checkout flow (`add-checked-to-pantry`) only sees `item.checked` for manual items. Auto-generated checked items silently get skipped.

**Where to fix:** `js/app.js:859-882` (`toggleShoppingItem`)

**The fix:** When the user checks an auto-generated item, instead of just writing to `localStorage`, create a manual item override via `POST /shopping-list/items`. The backend already supports this — `_calculate_shopping_list()` (`state_manager.py:176-178`) suppresses auto-generated items when a matching manual item exists. The pattern already works for the edit flow (`editShoppingItem` at `app.js:828`). Extend it to the toggle.

This means every checked item has a backend ID, syncs via real-time, and is visible to all household members.

---

## Phase 2 — Make the Shopping List Survive the Store

**Why this phase second:** Phases 1 protects the data pipeline. Phase 2 protects the one feature used outside the home. Every other section (Pantry, Recipes, Meals) is used at home on WiFi. The shopping list is used in grocery stores where connectivity is unreliable. If it doesn't work offline, the app fails at the moment it matters most.

---

### 2.1 Cache the Shopping List for Offline Use

**The problem:** There is no service worker, no IndexedDB, no `localStorage` cache of the list. Opening the shopping page with no signal shows nothing. Focus Mode sets `this.shoppingList = []` on API failure (`shopping-focus-mode.js:93`).

**The `.offline-banner` CSS class exists** (`shared.css:116-141`) but nothing wires it up.

**Where to fix:** `js/app.js` (shopping list loading), `js/shopping-focus-mode.js`, new file for offline logic

**The fix (minimum viable — no service worker needed):**

1. **Cache on success:** Every time `loadShoppingList()` gets a successful API response, write it to `localStorage`:
   ```javascript
   localStorage.setItem('cached-shopping-list', JSON.stringify(list));
   localStorage.setItem('cached-shopping-list-time', Date.now());
   ```

2. **Load from cache first:** On page load, immediately render from cache. Then attempt API fetch in background. If fetch succeeds, update the display. If it fails, the user still has the cached list.

3. **Queue mutations offline:** When a check-off or add fails (network error), store the mutation in `localStorage` as a pending queue. On next successful API contact, replay the queue.

4. **Wire up the offline banner:** Add `navigator.onLine` detection. Show the existing `.offline-banner` when offline. Show "Last synced X min ago" in the shopping header.

This is JavaScript-only. No Python changes. No service worker complexity. It covers 90% of the real-world grocery store scenario.

---

### 2.2 Focus Mode Should Surface the Offline Indicator

**The problem:** Focus Mode is the in-store tool. If the user is offline, Focus Mode needs to show it clearly — not just fail silently.

**Where to fix:** `js/shopping-focus-mode.js`

**The fix:** In `ShoppingFocusMode.enter()`, if cached data exists but the API call fails, render from cache and show a "Working offline" indicator in the focus header. This pairs with 2.1 — once the cache exists, Focus Mode reads from it as fallback.

---

## Phase 3 — Clean Up the Architecture

**Why this phase third:** These aren't bugs — they're violations of the HTML/CSS first, Python-thinks principle. Fixing these makes the codebase honest about where logic lives, and makes future development faster.

---

### 3.1 Remove the Duplicated Reserved Ingredient Calculation

**The problem:** The same calculation exists in Python (`state_manager.py:126-152`) and JavaScript (`app.js:282-325`). The Python version is authoritative. The JS version is a client-side mirror that can drift.

**Why it matters for the architecture:** JavaScript should not be doing Python's job. The backend already returns `reserved_ingredients` in the `GET /meal-plans/` response. The frontend should use that.

**Where to fix:** `js/app.js:282-325` (remove), `pantry/pantry.js` (update to read from API data)

**The fix:**
1. Store the `reserved_ingredients` from the meal plans API response in a `window.reservedIngredients` variable during `loadMealPlans()`.
2. Update `pantry.js` to read from `window.reservedIngredients` instead of calling `window.calculateReservedIngredients()`.
3. Delete `calculateReservedIngredients()` from `app.js`.

Now the reserved calculation lives in one place: Python. As it should.

---

### 3.2 Replace Pickle with JSON in Redis Cache

**The problem:** `state_manager.py:477,491` uses `pickle.dumps()` / `pickle.loads()`. Two issues:
1. **Security:** Pickle deserialization is a known RCE vector. If Redis is exposed (common Railway misconfiguration), an attacker can inject arbitrary Python objects.
2. **Brittleness:** Any change to Pydantic model fields breaks deserialization of cached data. The `try/except` swallows the error, causing a full cache miss on every request until TTL expires. Every deploy that changes models triggers 5 minutes of degraded performance.

**Where to fix:** `backend/state_manager.py:462-497`

**The fix:** Replace:
```python
pickle.dumps(state)  →  json.dumps(state.to_cache_dict())
pickle.loads(data)   →  HouseholdState.from_cache_dict(json.loads(data))
```

Add `to_cache_dict()` and `from_cache_dict()` methods to `HouseholdState` using Pydantic's `.model_dump()` / `.model_validate()`. JSON is safe, version-tolerant, and debuggable (you can inspect Redis keys directly).

---

### 3.3 Move Modal HTML to `<template>` Elements

**The problem:** `app.js` generates modal HTML with template literals — 80+ lines for the pantry modal (`openIngredientModal`), 130+ lines for the recipe modal (`openRecipeModal`), 50+ lines for checkout (`openCheckoutModal`). This is JavaScript doing HTML's job.

**Why it matters for the architecture:** The HTML/CSS-first principle says structure lives in HTML. JavaScript populates data. Right now, JavaScript is authoring structure.

**Where to fix:** Each section's `index.html`, `js/app.js`

**The fix:** Define modal shells as `<template>` elements in the HTML. JavaScript clones the template, populates data fields, and appends to `#modal-root`. This:
- Keeps HTML structure in HTML files where it belongs
- Makes modals inspectable in the browser without triggering JavaScript
- Reduces `app.js` line count significantly
- Makes CSS styling easier (you can see the full structure in the HTML)

This is a medium effort refactor — do it incrementally, one modal at a time.

---

## Phase 4 — CSS/UX Polish for Real Devices

**Why this phase fourth:** The app works correctly after Phases 1-3. Phase 4 makes it feel right on the devices people actually use. These are CSS-first fixes — no business logic changes.

---

### 4.1 Touch Targets: Enforce 44px Minimum

**The problem:** Several interactive elements are under Apple's 44px guideline:
- `.shopping-remove`, `.shopping-edit`: 24x24px (`shared.css:555-568`)
- `.shopping-check` checkbox: 18x18px (`shared.css:516-521`)
- `.btn-ledger-action`: 36x36px on mobile (`shared.css:3075-3078`)

**Where to fix:** `css/shared.css` — mobile media queries

**The fix:** In the `@media (max-width: 768px)` block, override these elements to minimum 44x44px. For checkboxes, increase the clickable area with padding while keeping the visual checkbox small. This is pure CSS — no JS changes.

---

### 4.2 Compact Mobile Header

**The problem:** On mobile, `body` has `padding-top: 120px` + `padding-bottom: 70px` = 190px of fixed chrome. On an iPhone SE (667px viewport), that's 28% of the screen gone before any content loads.

**The cause:** The header wraps on mobile because the brand name, datetime, and action buttons don't fit in one row. The 120px padding accommodates the wrapped header.

**Where to fix:** `css/shared.css:2877-2920`

**The fix:**
1. Hide `.header-datetime` on screens below 768px (currently hidden only below 400px at `shared.css:3572`).
2. Shrink `.header-brand` further on mobile or abbreviate to an icon/logo.
3. This lets the header stay single-row at 60-70px, recovering ~50px of content space.
4. Reduce `body` `padding-top` to 70px to match.

Pure CSS. The datetime is already low-priority information on mobile — the user's phone has a clock.

---

### 4.3 Pantry Mobile View — Evaluate Table vs. Cards

**Context I previously missed:** The pantry ledger is an inventory management tool. It's a table on purpose — it shows 7 columns of data that a home cook needs to see in context. The primary use case may be at the kitchen counter on a tablet, not on a phone.

**What I recommend now:** Don't blindly replace the table with cards. Instead:

1. **Check your analytics** (or your own usage) — are people opening the pantry on phones?
2. If yes: add a CSS-only card view for `< 768px` that shows Name, Total Qty, and an expiry indicator per card. Tap to expand. Keep the table for `>= 768px`.
3. If no (mostly tablet/desktop): keep the table but remove the `min-width: 700px` constraint on mobile. Let the table naturally compress — hide the "Reserved" and "Available" columns on mobile (they're expert-level detail) and let the remaining columns fit.

Either approach is CSS + minor `pantry.js` rendering logic. No Python changes.

---

## Phase 5 — Performance & Hardening (Before Scale)

**Why this phase last:** These are optimizations that don't affect correctness but matter when the household has 200+ pantry items or multiple family members using the app simultaneously. Do these before inviting beta users beyond your own household.

---

### 5.1 Partial Responses for Simple Mutations

**The problem:** Every POST/PUT/DELETE across all route files does:
```python
StateManager.update_and_invalidate(household_id, update)
state = StateManager.get_state(household_id)
return { full state dump }
```
Checking off one shopping item triggers 4 parallel DB queries + full recalculation.

**The fix:** For operations that don't affect calculations (checking a shopping item, toggling a recipe favorite, updating a tag), return only the affected item. The frontend already has the full list in memory — just update the one item client-side.

Reserve full-state returns for operations that genuinely change calculations: adding/deleting meal plans, cooking a meal, changing pantry quantities.

**Where to fix:** All route files, `js/app.js` (update handlers to do optimistic client-side updates)

---

### 5.2 Lazy-Load Pantry on Shopping Page

**The problem:** The shopping page loads the full pantry on init (`app.js:2046-2050`) just for the checkout modal. Checkout happens once per shopping trip.

**The fix:** Remove pantry from the shopping page's `loadApp()` switch case. The checkout flow already fetches fresh pantry data when it opens (`app.js:1029-1051`). Let that be the only fetch point.

**Where to fix:** `js/app.js:2046-2050`

---

### 5.3 Proportional Health Score

**The problem:** `state_manager.py:426-430` subtracts flat penalties per item. A household with 200 items and 12 below threshold (6%) gets the same "poor" score as one with 20 items and 12 below threshold (60%).

**The fix:** Normalize by pantry size:
```python
if total_items > 0:
    health_score -= (below_threshold / total_items) * 50
    health_score -= (expiring_soon / total_items) * 30
```

**Where to fix:** `backend/state_manager.py:418-440`

---

## Summary: The Five Phases

| Phase | Name | What It Protects | Items | Effort |
|-------|------|------------------|-------|--------|
| **1** | Protect the Pipeline | Data integrity across Pantry→Recipe→Meal→Shopping | 4 fixes | Small-Medium |
| **2** | Survive the Store | Shopping list works offline | 2 fixes | Medium |
| **3** | Clean the Architecture | HTML/CSS first, Python thinks, JS breathes | 3 fixes | Medium |
| **4** | CSS/UX Polish | Real-device usability | 3 fixes | Small |
| **5** | Performance & Hardening | Scale readiness | 3 fixes | Small-Medium |

**Phase 1 is non-negotiable** — these are data integrity bugs that will break trust.
**Phase 2 is the highest-impact feature gap** — the app fails at the moment it matters most.
**Phases 3-5 are quality and polish** — they make the app professional, not just functional.

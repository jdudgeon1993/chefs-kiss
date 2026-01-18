# Chef's Kiss - API Documentation

## Core Data Functions

### Pantry Management

#### `savePantry()`
Save pantry array to localStorage. Individual items sync to Supabase when modified.
- **Returns:** `void`
- **Note:** Call after any pantry array modifications

#### `getIngredient(id)`
Retrieve pantry item by UUID
- **Parameters:**
  - `id` (string): UUID of the pantry item
- **Returns:** `Object|undefined` - Pantry item or undefined if not found

#### `getTotalQty(ingredient)`
Calculate total quantity across all storage locations
- **Parameters:**
  - `ingredient` (Object): Pantry item with `locations` array
- **Returns:** `number` - Sum of quantities from all locations

#### `saveIngredient(existing)`
Save or update a pantry item with full validation
- **Parameters:**
  - `existing` (Object|null): Existing item to update, or null for new item
- **Returns:** `Promise<void>`
- **Validation:** Uses `window.validation.validatePantryItem()`
- **Side Effects:**
  - Updates localStorage via `savePantry()`
  - Syncs to Supabase if authenticated
  - Regenerates shopping list
  - Updates dashboard

#### `deleteIngredient(item)`
Delete pantry item with confirmation
- **Parameters:**
  - `item` (Object): Pantry item to delete
    - `item.id` (string): UUID
    - `item.name` (string): Display name
- **Returns:** `Promise<void>`
- **Side Effects:**
  - Removes from Supabase database
  - Updates shopping list
  - Re-renders pantry

### Recipe Management

#### `saveRecipes()`
Save recipes array to localStorage
- **Returns:** `void`
- **Note:** Individual recipes sync to Supabase when modified

#### `getRecipe(id)`
Retrieve recipe by UUID or name
- **Parameters:**
  - `id` (string): UUID or name of recipe
- **Returns:** `Object|undefined` - Recipe or undefined

#### `saveRecipe(existing)`
Save or update a recipe with full validation
- **Parameters:**
  - `existing` (Object|null): Existing recipe to update, or null for new
- **Returns:** `Promise<void>`
- **Validation:** Uses `window.validation.validateRecipe()`
- **Fields:**
  - `name` (string, max 100 chars): Recipe name
  - `servings` (number, 1-100): Number of servings
  - `instructions` (string, max 5000 chars): Cooking instructions
  - `ingredients` (Array<Object>): Ingredient list
  - `photo` (string): Photo URL from Supabase Storage
  - `tags` (Array<string>): Recipe tags
  - `isFavorite` (boolean): Favorite status

#### `deleteRecipe(recipe)`
Delete recipe with foreign key checks
- **Parameters:**
  - `recipe` (Object|string): Recipe object or ID
- **Returns:** `Promise<void>`
- **Error Handling:** Shows user-friendly message if recipe is in meal plan

### Meal Planning

#### `savePlanner()`
Save meal planner to localStorage and invalidate caches
- **Returns:** `void`
- **Side Effects:** Invalidates reserved ingredients cache

#### `addPlannedMeal(date, recipeId, mealType)`
Add a meal to the planner for a specific date
- **Parameters:**
  - `date` (string): Date in YYYY-MM-DD format
  - `recipeId` (string): UUID of recipe
  - `mealType` (string): 'breakfast'|'lunch'|'dinner'|'snack'
- **Returns:** `Promise<void>`
- **Side Effects:**
  - Syncs to Supabase `meal_plans` table
  - Updates calendar view
  - Regenerates shopping list

#### `markMealCooked(date, mealIndex)`
Mark a planned meal as cooked
- **Parameters:**
  - `date` (string): Date in YYYY-MM-DD format
  - `mealIndex` (number): Index in meals array for that date
- **Returns:** `Promise<void>`
- **Side Effects:**
  - Updates Supabase
  - Decrements pantry quantities for ingredients
  - Updates shopping list

### Shopping List

#### `generateShoppingList()`
Generate shopping list from pantry and meal plan
- **Returns:** `void`
- **Algorithm:**
  1. Calculate reserved ingredients from uncook meals
  2. Compare pantry stock vs reserved + minimum quantities
  3. Add deficit items to shopping list
  4. Add ingredients not in pantry at all
- **Performance:** Uses cached reserved ingredients calculation

#### `calculateReservedIngredients()`
Calculate ingredients reserved for planned meals (cached)
- **Returns:** `Object` - Map of `"name|unit"` keys to reserved quantities
- **Caching:** Results cached until planner changes
- **Performance:**
  - First call: O(n*m) where n=meals, m=ingredients per meal
  - Subsequent calls: O(1) from cache
- **Cache Invalidation:** Automatic via `savePlanner()`

### Dashboard Calculations

#### `calculateReadyRecipes()`
Find recipes that can be cooked with current pantry stock
- **Returns:** `Array<Object>` - Recipes with sufficient ingredients
- **Logic:** Checks pantry quantity (minus reserved) >= required quantity
- **Performance:** Uses cached reserved ingredients

#### `updateDashboard()`
Update dashboard metrics (ready recipes, low stock items)
- **Returns:** `void`
- **Side Effects:** Updates DOM with current counts

## Validation Functions (validation.js)

### `validatePantryItem(item)`
Validate and sanitize pantry item
- **Parameters:**
  - `item` (Object): Pantry item to validate
    - `item.name` (string): Item name
    - `item.totalQty` (number): Total quantity
    - `item.unit` (string): Unit of measurement
    - `item.category` (string, optional): Category name
    - `item.locations` (Array, optional): Location breakdown
- **Returns:** `{valid: boolean, error?: string, sanitized?: Object}`
- **Validation Rules:**
  - Name: Required, max 100 chars, HTML sanitized
  - Quantity: 0-99999, must be number
  - Unit: Max 20 chars, auto-standardized
  - Category: Max 50 chars, defaults to 'Uncategorized'

### `validateRecipe(recipe)`
Validate and sanitize recipe
- **Parameters:**
  - `recipe` (Object): Recipe to validate
- **Returns:** `{valid: boolean, error?: string, sanitized?: Object}`
- **Validation Rules:**
  - Name: Required, max 100 chars
  - Servings: 1-100
  - Instructions: Max 5000 chars
  - Ingredients: At least 1 required
  - Tags: Max 20 tags, each max 30 chars

### `sanitizeHTML(input)`
Remove HTML tags and dangerous characters
- **Parameters:**
  - `input` (string): String to sanitize
- **Returns:** `string` - Sanitized string
- **Protection:** Prevents XSS attacks

### `standardizeUnit(unit)`
Convert unit to standard abbreviation
- **Parameters:**
  - `unit` (string): Unit string (e.g., "pounds", "lbs", "lb")
- **Returns:** `string` - Standardized unit (e.g., "lb")
- **Mappings:** 60+ unit conversions defined

## Authentication (auth.js)

### `initAuth(retryCount)`
Initialize authentication with retry logic
- **Parameters:**
  - `retryCount` (number, default 0): Current retry attempt
- **Returns:** `Promise<void>`
- **Retry Logic:** Up to 3 attempts with exponential backoff
- **Error Handling:** Auto-clears localStorage on persistent AbortError

### `isAuthenticated()`
Check if user is authenticated
- **Returns:** `boolean`

### `getCurrentHouseholdId()`
Get current user's household ID
- **Returns:** `string|null` - UUID or null

## Database Functions (db.js)

### `savePantryItem(item)`
Save pantry item to Supabase
- **Parameters:**
  - `item` (Object): Validated pantry item
- **Returns:** `Promise<{success: boolean, error?: string}>`
- **Table:** `pantry_items`

### `saveRecipe(recipe)`
Save recipe to Supabase
- **Parameters:**
  - `recipe` (Object): Validated recipe
- **Returns:** `Promise<{success: boolean, error?: string}>`
- **Table:** `recipes`

### `saveMealPlan(mealPlan)`
Save meal plan entry to Supabase
- **Parameters:**
  - `mealPlan` (Object): Meal plan entry
- **Returns:** `Promise<{success: boolean, error?: string}>`
- **Table:** `meal_plans`

## Constants

### MAX_LENGTHS
- `ITEM_NAME`: 100
- `RECIPE_NAME`: 100
- `CATEGORY_NAME`: 50
- `LOCATION_NAME`: 50
- `UNIT`: 20
- `TAG`: 30
- `INSTRUCTIONS`: 5000
- `NOTES`: 1000

### QUANTITY_LIMITS
- `MIN`: 0
- `MAX`: 99999

## Common Patterns

### Adding an Item
```javascript
// Pantry item
const item = {
  name: "Flour",
  unit: "lbs",
  totalQty: 5,
  category: "Baking",
  locations: [
    { location: "Pantry", qty: 3 },
    { location: "Storage", qty: 2 }
  ]
};
await saveIngredient(null); // Opens modal, validates, saves
```

### Checking Stock
```javascript
const reserved = calculateReservedIngredients(); // Cached
const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
const reservedQty = reserved[key] || 0;
const available = item.totalQty - reservedQty;
```

### Error Handling
```javascript
try {
  await window.db.savePantryItem(item);
} catch (err) {
  handleSyncError(err, 'pantry item', true); // User-friendly message
}
```

## Performance Tips

1. **Use cached calculations:** `calculateReservedIngredients()` is cached
2. **Batch updates:** Modify arrays then call save functions once
3. **Avoid re-renders:** Only call `renderPantry()` after final changes
4. **Invalidate caches properly:** Call `savePlanner()` after planner changes

## Security Notes

1. **All user input is validated** via `validation.js`
2. **HTML is sanitized** to prevent XSS attacks
3. **RLS policies** protect data in Supabase
4. **Anon key is safe** for client-side use
5. **Unit standardization** prevents duplicate items

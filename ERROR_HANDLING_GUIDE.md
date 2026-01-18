# Error Handling Guide

## Standard Error Handling Patterns

### Pattern 1: Database Sync Errors (Recommended)

**Use `handleSyncError()` for all database sync operations:**

```javascript
// ✅ GOOD - User-friendly error handling
await window.db.savePantryItem(item).catch(err => {
  handleSyncError(err, 'pantry item', true); // Shows toast to user
});

// ❌ BAD - Silent failure
await window.db.savePantryItem(item).catch(err => {
  console.error('Error syncing:', err);
});
```

**handleSyncError() Parameters:**
- `err` (Error): The error object
- `itemType` (string): User-friendly item description ('pantry item', 'recipe', 'meal plan')
- `showNotification` (boolean): Whether to show toast notification to user

**handleSyncError() automatically handles:**
- Offline detection
- Timeout errors
- Foreign key violations
- Permission errors
- Generic fallback messages

### Pattern 2: User Input Validation

**Always validate before saving:**

```javascript
// ✅ GOOD - Validate first
const validationResult = window.validation.validatePantryItem(item);
if (!validationResult.valid) {
  showToast(`❌ ${validationResult.error}`);
  return;
}
const sanitized = validationResult.sanitized;
// Use sanitized values...

// ❌ BAD - No validation
if (!item.name) {
  alert("Name required"); // Also using alert instead of toast
  return;
}
```

### Pattern 3: User Notifications

**Use `showToast()` instead of `alert()`:**

```javascript
// ✅ GOOD - Non-blocking toast
showToast('✅ Recipe saved successfully');
showToast('❌ Failed to delete item');
showToast('⚠️ Item already exists');

// ❌ BAD - Blocking alert
alert('Recipe saved');
```

**Toast Icons:**
- ✅ Success operations
- ❌ Failures/errors
- ⚠️ Warnings
- 📡 Connectivity issues
- 🔧 System operations

### Pattern 4: Async Function Error Handling

**Standard try-catch pattern:**

```javascript
async function someOperation() {
  try {
    // Validate input first
    const validation = window.validation.validateInput(data);
    if (!validation.valid) {
      showToast(`❌ ${validation.error}`);
      return { success: false, error: validation.error };
    }

    // Perform operation
    const result = await performDatabaseOperation(validation.sanitized);

    // Success feedback
    showToast('✅ Operation successful');
    return { success: true, data: result };

  } catch (err) {
    // Handle specific error types
    if (err.code === '23503') {
      showToast('❌ Cannot delete: item is being used');
    } else if (!navigator.onLine) {
      showToast('📡 Offline: changes saved locally');
    } else {
      showToast('❌ Operation failed');
    }

    // Log for debugging
    console.error('Operation failed:', err);

    return { success: false, error: err.message };
  }
}
```

### Pattern 5: Graceful Degradation

**Handle offline mode gracefully:**

```javascript
// ✅ GOOD - Graceful degradation
if (window.db && window.auth && window.auth.isAuthenticated()) {
  await window.db.save(item).catch(err => {
    handleSyncError(err, 'item', true);
  });
} else {
  // Offline mode - save to localStorage only
  localStorage.setItem('items', JSON.stringify(items));
}

// ❌ BAD - Assumes online
await window.db.save(item); // Crashes if offline
```

## Error Type Reference

### Common Supabase Error Codes

- `23503`: Foreign key violation (e.g., deleting recipe that's in meal plan)
- `42501`: Permission denied (RLS policy violation)
- `23505`: Unique constraint violation
- `PGRST116`: No rows returned (not found)

### Error Messages - User-Friendly Versions

| Technical Error | User-Friendly Message |
|----------------|----------------------|
| `23503` | "Cannot delete: item is being used elsewhere" |
| `42501` | "Permission denied: check your household access" |
| `timeout` | "Operation timed out: will retry when online" |
| `offline` | "Offline: changes saved locally" |
| `AbortError` | "Connection interrupted: retrying..." |

## Migration Guide

### Step 1: Replace console.error with handleSyncError

**Before:**
```javascript
await window.db.savePantryItem(item).catch(err => {
  console.error('Error syncing pantry item to database:', err);
});
```

**After:**
```javascript
await window.db.savePantryItem(item).catch(err => {
  handleSyncError(err, 'pantry item', true);
});
```

### Step 2: Replace alert() with showToast()

**Before:**
```javascript
if (!name) {
  alert("Name is required");
  return;
}
```

**After:**
```javascript
if (!name) {
  showToast("❌ Name is required");
  return;
}
```

### Step 3: Add Validation

**Before:**
```javascript
if (!item.name) {
  showToast("❌ Name required");
  return;
}
// Save item...
```

**After:**
```javascript
const validation = window.validation.validatePantryItem(item);
if (!validation.valid) {
  showToast(`❌ ${validation.error}`);
  return;
}
// Use validation.sanitized...
```

## Best Practices

### DO ✅

1. **Always validate user input** before saving
2. **Use handleSyncError()** for database operations
3. **Show user-friendly messages** with showToast()
4. **Check for offline mode** before database operations
5. **Return consistent result objects** `{success, data?, error?}`
6. **Log errors to console** for debugging (in addition to user messages)
7. **Handle specific error codes** with appropriate messages

### DON'T ❌

1. **Don't use alert()** - blocks UI, poor UX
2. **Don't show technical errors** to users (error codes, stack traces)
3. **Don't fail silently** - always provide feedback
4. **Don't assume online** - check authentication state
5. **Don't skip validation** - security risk
6. **Don't ignore error types** - handle foreign keys, permissions, etc.

## Examples

### Complete Example: Save Pantry Item

```javascript
async function saveIngredient(existing) {
  // 1. Collect form data
  const rawData = collectFormData();

  // 2. Validate and sanitize
  const validation = window.validation.validatePantryItem(rawData);
  if (!validation.valid) {
    showToast(`❌ ${validation.error}`);
    return;
  }

  const sanitized = validation.sanitized;

  // 3. Update data structure
  if (existing) {
    Object.assign(existing, sanitized);
  } else {
    pantry.push({ id: uid(), ...sanitized });
  }

  // 4. Save to localStorage
  savePantry();

  // 5. Sync to database (if online)
  if (window.db && window.auth && window.auth.isAuthenticated()) {
    const item = existing || pantry[pantry.length - 1];

    // Mark as local change (prevent echo from realtime)
    if (window.realtime?.lastLocalUpdate) {
      window.realtime.lastLocalUpdate.pantry = Date.now();
    }

    await window.db.savePantryItem(item).catch(err => {
      handleSyncError(err, 'pantry item', true);
    });
  }

  // 6. Update UI
  renderPantry();
  generateShoppingList();
  updateDashboard();
  closeModal();

  // 7. Success feedback
  showToast('✅ Item saved');
}
```

### Complete Example: Delete with Foreign Key Check

```javascript
async function deleteRecipe(recipe) {
  // Handle both objects and IDs
  if (typeof recipe === 'string') {
    recipe = recipes.find(r => r.id === recipe) || { id: recipe, name: 'this recipe' };
  }

  // 1. Confirm with user
  if (!confirm(`Delete "${recipe.name}"?`)) {
    return;
  }

  // 2. Try database delete first
  if (window.db && window.auth && window.auth.isAuthenticated()) {
    try {
      // Mark as local change
      if (window.realtime?.lastLocalUpdate) {
        window.realtime.lastLocalUpdate.recipes = Date.now();
      }

      await window.db.deleteRecipe(recipe.id);
    } catch (err) {
      // Handle specific errors
      if (err.code === '23503') {
        showToast(`❌ Cannot delete "${recipe.name}" — it's in your meal plan`);
      } else if (!navigator.onLine) {
        showToast('📡 Cannot delete while offline');
      } else {
        showToast('❌ Delete failed');
      }

      console.error('Delete error:', err);
      return; // Don't delete locally if database failed
    }
  }

  // 3. Remove from local array
  recipes = recipes.filter(r => r.id !== recipe.id);
  window.recipes = recipes;
  saveRecipes();

  // 4. Clean up references
  removeMealPlanReferences(recipe.id);

  // 5. Update UI
  renderRecipes();
  generateShoppingList();
  closeModal();

  // 6. Success feedback
  showToast('✅ Recipe deleted');
}
```

## Testing Error Handling

### Manual Testing Checklist

- [ ] Test offline mode (disable network in DevTools)
- [ ] Test with invalid input (empty fields, special characters)
- [ ] Test with max length strings (100+ characters)
- [ ] Test deleting items in use (recipe in meal plan)
- [ ] Test with slow connection (throttle in DevTools)
- [ ] Test foreign key violations
- [ ] Test duplicate entries
- [ ] Verify toast notifications appear
- [ ] Verify no alert() dialogs
- [ ] Check console for errors

### Common Test Scenarios

1. **Offline Save**
   - Disconnect network
   - Add pantry item
   - Verify saved to localStorage
   - Verify user sees "Offline" indicator
   - Reconnect and verify sync

2. **Validation Failure**
   - Enter 500-character name
   - Verify blocked with friendly message
   - Verify no data saved

3. **Foreign Key Violation**
   - Add recipe to meal plan
   - Try to delete recipe
   - Verify friendly error message
   - Verify recipe NOT deleted

## Future Improvements

1. **Centralized Error Tracking**
   - Integrate Sentry or similar
   - Track error frequency
   - Alert on critical errors

2. **Retry Logic**
   - Auto-retry failed syncs
   - Queue offline operations
   - Batch sync when online

3. **Error Recovery**
   - Auto-recover from conflicts
   - Merge conflicting changes
   - Preserve user data

4. **Better Offline Support**
   - Service Worker
   - IndexedDB for large data
   - Background sync API

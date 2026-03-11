/* ============================================================================
   EMOJI MAPS — Shared category & recipe emoji lookups
   Eliminates duplication across pantry.js, meals.js, recipes.js,
   and shopping-focus-mode.js.
   ============================================================================ */

const CATEGORY_EMOJIS = {
  'Meat': '🥩', 'Dairy': '🧈', 'Produce': '🥬', 'Pantry': '🫙',
  'Frozen': '🧊', 'Spices': '🌶️', 'Beverages': '🥤', 'Snacks': '🍿',
  'Grains': '🌾', 'Baking': '🧁', 'Canned Goods': '🥫', 'Condiments': '🫗',
  'Seafood': '🐟', 'Deli': '🥪', 'Household': '🏠', 'Other': '📦'
};

const RECIPE_EMOJIS = {
  'dinner': '🍝', 'lunch': '🥗', 'breakfast': '🍳', 'brunch': '🥞',
  'dessert': '🍰', 'snack': '🍪', 'appetizer': '🥙', 'soup': '🍲',
  'salad': '🥗', 'pasta': '🍝', 'pizza': '🍕', 'burger': '🍔',
  'sandwich': '🥪', 'seafood': '🦞', 'chicken': '🍗', 'beef': '🥩',
  'pork': '🥓', 'vegetarian': '🥬', 'vegan': '🌱', 'bread': '🥖',
  'cake': '🎂', 'cookie': '🍪', 'side': '🥘', 'beverage': '🥤',
  'sauce': '🫗', 'baked': '🧁', 'meal prep': '📦', 'stew': '🍲'
};

/**
 * Get emoji for a pantry/shopping category.
 * Falls back to a custom categoryEmojiMap if defined (pantry page).
 */
function getCategoryEmoji(category) {
  if (typeof categoryEmojiMap !== 'undefined' && categoryEmojiMap[category]) {
    return categoryEmojiMap[category];
  }
  return CATEGORY_EMOJIS[category] || '📦';
}

/**
 * Get emoji for a recipe based on its category (fuzzy match).
 */
function getRecipeEmoji(recipe) {
  const category = (recipe.category || '').toLowerCase();
  for (const [key, emoji] of Object.entries(RECIPE_EMOJIS)) {
    if (category.includes(key)) return emoji;
  }
  return '🍽️';
}

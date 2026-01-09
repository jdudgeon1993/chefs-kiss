-- =====================================================
-- FIX: Schema mismatches between app and database
-- =====================================================

-- 1. Add missing 'notes' column to recipes table
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- 2. Check if meal_plans uses 'date' or 'planned_date'
-- If it's 'date', rename it to 'planned_date' to match app code
ALTER TABLE meal_plans
RENAME COLUMN date TO planned_date;

-- If the above fails (column already named correctly), run this instead:
-- ALTER TABLE meal_plans
-- ADD COLUMN IF NOT EXISTS planned_date DATE;

-- 3. Add tags column to recipes if missing
ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- =====================================================
-- Verify the schema matches
-- =====================================================

-- Check recipes columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'recipes'
ORDER BY ordinal_position;

-- Check meal_plans columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_plans'
ORDER BY ordinal_position;

-- Check pantry_items columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'pantry_items'
ORDER BY ordinal_position;

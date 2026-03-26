-- Peachy Pantry - Serving Multiplier Migration
-- Adds serving_multiplier column to meal_plans table
-- This enables per-meal scaling (×0.5 to ×4) that flows through to
-- shopping list reservations and pantry depletion when a meal is cooked.

ALTER TABLE meal_plans
  ADD COLUMN IF NOT EXISTS serving_multiplier FLOAT DEFAULT 1.0;

-- Backfill any existing rows that have NULL (shouldn't happen with DEFAULT, but safe)
UPDATE meal_plans
  SET serving_multiplier = 1.0
  WHERE serving_multiplier IS NULL;

-- ============================================
-- Verify migration
-- ============================================

SELECT 'Migration successful! serving_multiplier column added to meal_plans.' AS status
WHERE EXISTS (
  SELECT FROM information_schema.columns
  WHERE table_name = 'meal_plans'
    AND column_name = 'serving_multiplier'
);

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'meal_plans'
ORDER BY ordinal_position;

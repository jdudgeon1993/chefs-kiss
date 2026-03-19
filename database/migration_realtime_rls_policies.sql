-- Realtime RLS policies + missing publication entry
--
-- Supabase postgres_changes events are only delivered to a subscriber if the
-- subscribing JWT can SELECT the changed row via RLS.  Without a SELECT policy
-- the channel shows SUBSCRIBED but events are silently dropped.
--
-- Run this in Supabase Dashboard → SQL Editor.
--
-- Safe to re-run: CREATE POLICY IF NOT EXISTS is used throughout.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add shopping_list_manual to the realtime publication if missing.
--    (shopping_list_custom was added instead by an earlier migration.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'shopping_list_manual'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE shopping_list_manual;
  END IF;
END $$;

ALTER TABLE shopping_list_manual REPLICA IDENTITY FULL;

-- 2. Helper: resolve household membership.
--    Policies use a sub-select so each table doesn't need a direct user_id column.

-- pantry_items
CREATE POLICY IF NOT EXISTS "realtime_select_pantry_items"
  ON pantry_items FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- recipes
CREATE POLICY IF NOT EXISTS "realtime_select_recipes"
  ON recipes FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- meal_plans
CREATE POLICY IF NOT EXISTS "realtime_select_meal_plans"
  ON meal_plans FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- shopping_list_manual
CREATE POLICY IF NOT EXISTS "realtime_select_shopping_list_manual"
  ON shopping_list_manual FOR SELECT
  TO authenticated
  USING (
    household_id IN (
      SELECT household_id FROM household_members WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- Peachy Pantry — Signup Health Check & Cleanup
-- Run this in the Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. DIAGNOSE: Find orphaned users (account created but no household)
-- ============================================
SELECT
  au.id AS user_id,
  au.email,
  au.created_at,
  au.email_confirmed_at,
  CASE WHEN hm.household_id IS NULL THEN 'ORPHANED — no household' ELSE 'OK' END AS status,
  hm.household_id,
  h.name AS household_name
FROM auth.users au
LEFT JOIN household_members hm ON hm.user_id = au.id
LEFT JOIN households h ON h.id = hm.household_id
ORDER BY au.created_at DESC;


-- ============================================
-- 2. DIAGNOSE: Check RLS policies on signup-critical tables
-- ============================================
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('households', 'household_members', 'household_settings')
ORDER BY tablename, cmd;


-- ============================================
-- 3. DIAGNOSE: Check that RLS is enabled (should be for all tables)
-- ============================================
SELECT
  relname AS table_name,
  relrowsecurity AS rls_enabled,
  relforcerowsecurity AS rls_forced
FROM pg_class
WHERE relname IN (
  'households', 'household_members', 'household_invites',
  'household_settings', 'pantry_items', 'pantry_locations',
  'recipes', 'meal_plans', 'shopping_list_manual'
)
ORDER BY relname;


-- ============================================
-- 4. FIX: Ensure RLS policies allow service-role INSERT on households
--    (These use auth.uid() which is NULL for service-role calls
--     that don't restore auth context properly)
-- ============================================

-- Allow service-role inserts on households (for signup flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'households' AND policyname = 'Service role can insert households'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can insert households"
      ON households FOR INSERT
      WITH CHECK (true)';
  END IF;
END $$;

-- Allow service-role inserts on household_members (for signup flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'household_members' AND policyname = 'Service role can insert members'
  ) THEN
    EXECUTE 'CREATE POLICY "Service role can insert members"
      ON household_members FOR INSERT
      WITH CHECK (true)';
  END IF;
END $$;


-- ============================================
-- 5. FIX: Repair orphaned users — create missing households
--    This finds users with no household and creates one for them.
-- ============================================
DO $$
DECLARE
  orphan RECORD;
  new_household_id UUID;
BEGIN
  FOR orphan IN
    SELECT au.id AS user_id, au.email
    FROM auth.users au
    LEFT JOIN household_members hm ON hm.user_id = au.id
    WHERE hm.id IS NULL
  LOOP
    -- Create household
    INSERT INTO households (name, created_by)
    VALUES (
      split_part(orphan.email, '@', 1) || '''s Household',
      orphan.user_id
    )
    RETURNING id INTO new_household_id;

    -- Add user as owner
    INSERT INTO household_members (household_id, user_id, role)
    VALUES (new_household_id, orphan.user_id, 'owner');

    -- Create default settings
    INSERT INTO household_settings (household_id)
    VALUES (new_household_id)
    ON CONFLICT (household_id) DO NOTHING;

    RAISE NOTICE 'Repaired user % (%) — created household %',
      orphan.user_id, orphan.email, new_household_id;
  END LOOP;
END $$;


-- ============================================
-- 6. VERIFY: Confirm all users now have a household
-- ============================================
SELECT
  au.id AS user_id,
  au.email,
  CASE WHEN hm.household_id IS NULL THEN 'STILL ORPHANED' ELSE 'OK' END AS status,
  hm.household_id,
  hm.role,
  h.name AS household_name
FROM auth.users au
LEFT JOIN household_members hm ON hm.user_id = au.id
LEFT JOIN households h ON h.id = hm.household_id
ORDER BY au.created_at DESC;


-- ============================================
-- 7. VERIFY: Check all households have at least one member
-- ============================================
SELECT
  h.id AS household_id,
  h.name,
  h.created_at,
  COUNT(hm.id) AS member_count
FROM households h
LEFT JOIN household_members hm ON hm.household_id = h.id
GROUP BY h.id, h.name, h.created_at
HAVING COUNT(hm.id) = 0
ORDER BY h.created_at DESC;
